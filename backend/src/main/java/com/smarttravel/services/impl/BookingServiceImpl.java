package com.smarttravel.services.impl;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.entities.Booking;
import com.smarttravel.entities.Tour;
import com.smarttravel.entities.User;
import com.smarttravel.entities.Voucher;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.repositories.VoucherRepository;
import com.smarttravel.services.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", request.getTourId()));

        // 1. Kiểm tra quy định thời gian đặt trước (Advance Booking Cut-off)
        if (request.getDepartureDate() != null) {
            java.time.LocalDate today = java.time.LocalDate.now();
            long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(today, request.getDepartureDate());
            boolean isInternational = tour.getCategory() == com.smarttravel.enums.TourCategory.NUOC_NGOAI;
            int minLeadDays = isInternational ? 15 : 3;
            if (daysUntil < 0) {
                throw new BadRequestException("Chuyến đi đã qua ngày khởi hành (" + request.getDepartureDate() + "). Vui lòng chọn đợt khởi hành khác.");
            }
            if (daysUntil < minLeadDays) {
                String msg = isInternational 
                    ? "Đã hết hạn nhận hồ sơ Visa cho đợt khởi hành này (Tour quốc tế yêu cầu đặt trước tối thiểu 15 ngày làm việc)."
                    : "Đã đóng cổng nhận khách cho đợt khởi hành này (Tour trong nước yêu cầu đặt trước tối thiểu 3 ngày).";
                throw new BadRequestException(msg);
            }
        }

        BigDecimal adultPrice = tour.getPrice();
        BigDecimal childPrice = tour.getChildPrice() != null ? tour.getChildPrice() : adultPrice.multiply(new BigDecimal("0.7"));

        int numAdults = request.getNumberOfAdults() != null ? request.getNumberOfAdults() : 1;
        int numChildren = request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0;
        int totalGuests = numAdults + numChildren;

        // Verify and deduct available slots/seats for the tour
        if (tour.getRemainingSeats() != null) {
            if (tour.getRemainingSeats() < totalGuests) {
                throw new BadRequestException("Số chỗ còn lại của tour không đủ cho " + totalGuests + " khách (chỉ còn " + tour.getRemainingSeats() + " chỗ).");
            }
            tour.setRemainingSeats(tour.getRemainingSeats() - totalGuests);
            tourRepository.save(tour);
        }

        // 2. Tính tiền phụ thu phòng đơn (nếu khách chọn)
        BigDecimal surchargeAmount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(request.getSingleRoomSurcharge()) && request.getSingleRoomSurchargeAmount() != null) {
            surchargeAmount = request.getSingleRoomSurchargeAmount();
        }

        BigDecimal subtotal = adultPrice.multiply(BigDecimal.valueOf(numAdults))
                .add(childPrice.multiply(BigDecimal.valueOf(numChildren)))
                .add(surchargeAmount);

        BigDecimal discountAmount = BigDecimal.ZERO;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            discountAmount = validateAndCalculateVoucher(request.getVoucherCode().trim(), subtotal);
        }

        BigDecimal totalPrice = subtotal.subtract(discountAmount);
        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            totalPrice = BigDecimal.ZERO;
        }

        String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String qrContent = "SMARTTRAVEL-E-TICKET|" + bookingCode + "|" + tour.getTitle() + "|GUESTS:" + (numAdults + numChildren);

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .tour(tour)
                .numberOfAdults(numAdults)
                .numberOfChildren(numChildren)
                .adultPrice(adultPrice)
                .childPrice(childPrice)
                .voucherCode(request.getVoucherCode())
                .discountAmount(discountAmount)
                .totalPrice(totalPrice)
                .singleRoomSurcharge(Boolean.TRUE.equals(request.getSingleRoomSurcharge()))
                .singleRoomSurchargeAmount(surchargeAmount)
                .roomAllocation(request.getRoomAllocation())
                .status(BookingStatus.PAID) // Set to PAID upon successful checkout flow
                .contactName(request.getContactName() != null ? request.getContactName() : user.getFullName())
                .contactEmail(request.getContactEmail() != null ? request.getContactEmail() : user.getEmail())
                .contactPhone(request.getContactPhone() != null ? request.getContactPhone() : user.getPhone())
                .notes(request.getNote())
                .qrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + java.net.URLEncoder.encode(qrContent, java.nio.charset.StandardCharsets.UTF_8))
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Không thể hủy tour đã hoàn thành");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        // Restore remaining seats when booking is cancelled
        if (booking.getTour() != null && booking.getTour().getRemainingSeats() != null) {
            int guests = booking.getNumberOfAdults() + (booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0);
            Tour tour = booking.getTour();
            tour.setRemainingSeats(tour.getRemainingSeats() + guests);
            tourRepository.save(tour);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    @Override
    public BigDecimal validateAndCalculateVoucher(String voucherCode, BigDecimal originalTotal) {
        Voucher voucher = voucherRepository.findByCodeAndActiveTrue(voucherCode.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá '" + voucherCode + "' không tồn tại hoặc đã hết hạn."));

        if (voucher.getMinOrderValue() != null && originalTotal.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new BadRequestException("Mã giảm giá yêu cầu giá trị đơn hàng tối thiểu từ " + voucher.getMinOrderValue().longValue() + "đ");
        }

        if (voucher.getDiscountPercent() != null && voucher.getDiscountPercent() > 0) {
            return originalTotal.multiply(BigDecimal.valueOf(voucher.getDiscountPercent())).divide(BigDecimal.valueOf(100));
        }

        if (voucher.getDiscountAmount() != null) {
            return voucher.getDiscountAmount();
        }

        return BigDecimal.ZERO;
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .tourId(b.getTour() != null ? b.getTour().getId() : null)
                .tourTitle(b.getTour() != null ? b.getTour().getTitle() : null)
                .tourThumbnailUrl(b.getTour() != null ? b.getTour().getThumbnailUrl() : null)
                .tourCode(b.getTour() != null ? b.getTour().getTourCode() : null)
                .durationDays(b.getTour() != null ? b.getTour().getDurationDays() : null)
                .durationNights(b.getTour() != null ? b.getTour().getDurationNights() : null)
                .departureLocation(b.getTour() != null ? b.getTour().getDepartureLocation() : null)
                .userId(b.getUser() != null ? b.getUser().getId() : null)
                .userName(b.getUser() != null ? b.getUser().getFullName() : null)
                .numberOfAdults(b.getNumberOfAdults())
                .numberOfChildren(b.getNumberOfChildren())
                .adultPrice(b.getAdultPrice())
                .childPrice(b.getChildPrice())
                .voucherCode(b.getVoucherCode())
                .discountAmount(b.getDiscountAmount())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .contactName(b.getContactName())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .singleRoomSurcharge(b.getSingleRoomSurcharge())
                .singleRoomSurchargeAmount(b.getSingleRoomSurchargeAmount())
                .roomAllocation(b.getRoomAllocation())
                .qrCodeUrl(b.getQrCodeUrl())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
