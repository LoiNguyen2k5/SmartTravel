package com.smarttravel.services.impl;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.entities.*;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourScheduleStatus;
import com.smarttravel.enums.VisaApplicationStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ForbiddenException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.BookingService;
import com.smarttravel.services.EmailService;
import com.smarttravel.services.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherService voucherService;
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;
    private final VisaRequirementRepository visaRequirementRepository;
    private final VisaApplicationRepository visaApplicationRepository;
    private final VisaStatusLogRepository visaStatusLogRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", request.getTourId()));

        VisaTemplate visaTemplate = tour.getVisaTemplate();
        boolean hasCustomVisaReqs = tour.getId() != null && visaRequirementRepository.existsByTourId(tour.getId());
        boolean requiresVisa = visaTemplate != null || hasCustomVisaReqs;
        boolean isInternational = tour.getCategory() == TourCategory.NUOC_NGOAI;

        int visaProcessingDays = visaTemplate != null && visaTemplate.getProcessingDays() != null ? visaTemplate.getProcessingDays() : 10;
        int visaBufferDays = visaTemplate != null && visaTemplate.getBufferDays() != null ? visaTemplate.getBufferDays() : 3;
        int minLeadDays = requiresVisa ? (visaProcessingDays + visaBufferDays) : (isInternational ? 7 : 3);

        LocalDate departureDate = request.getDepartureDate();
        TourSchedule resolvedSchedule = null;
        if (request.getTourScheduleId() != null) {
            resolvedSchedule = tourScheduleRepository.findById(request.getTourScheduleId())
                    .orElseThrow(() -> new ResourceNotFoundException("TourSchedule", "id", request.getTourScheduleId()));
            if (resolvedSchedule.getTour() != null && !resolvedSchedule.getTour().getId().equals(tour.getId())) {
                throw new BadRequestException("Đợt khởi hành không thuộc tour đã chọn.");
            }
            if (departureDate == null) {
                departureDate = resolvedSchedule.getStartDate();
            }
        } else if (departureDate != null && tour.getId() != null) {
            resolvedSchedule = tourScheduleRepository.findFirstByTourIdAndStartDate(tour.getId(), departureDate)
                    .orElse(null);
        }

        if (resolvedSchedule != null) {
            TourScheduleStatus schStatus = resolvedSchedule.getStatus();
            if (schStatus == TourScheduleStatus.COMPLETED || schStatus == TourScheduleStatus.CANCELLED) {
                throw new BadRequestException("Đợt khởi hành này đã kết thúc hoặc đã bị hủy, không thể đặt thêm chỗ.");
            }
        }

        LocalDate visaDeadline = null;

        // 1. Kiểm tra quy định thời gian đặt trước theo cấu hình mẫu Visa thực tế (thay số 15 cứng)
        if (departureDate != null) {
            LocalDate today = LocalDate.now();
            long daysUntil = ChronoUnit.DAYS.between(today, departureDate);
            if (daysUntil < 0) {
                throw new BadRequestException("Chuyến đi đã qua ngày khởi hành (" + departureDate + "). Vui lòng chọn đợt khởi hành khác.");
            }
            if (daysUntil < minLeadDays) {
                String msg = requiresVisa
                        ? "Đã hết hạn nhận hồ sơ Visa cho đợt khởi hành này (Yêu cầu đặt trước tối thiểu " + minLeadDays + " ngày = " + visaProcessingDays + " ngày xử lý Lãnh sự + " + visaBufferDays + " ngày Đại lý sơ duyệt)."
                        : (isInternational
                            ? "Đã đóng cổng nhận khách cho đợt khởi hành quốc tế này (Yêu cầu đặt trước tối thiểu " + minLeadDays + " ngày)."
                            : "Đã đóng cổng nhận khách cho đợt khởi hành này (Tour trong nước yêu cầu đặt trước tối thiểu " + minLeadDays + " ngày).");
                throw new BadRequestException(msg);
            }
            if (requiresVisa) {
                visaDeadline = departureDate.minusDays(minLeadDays);
            }
        }

        BigDecimal adultPrice = tour.getPrice();
        BigDecimal childPrice = tour.getChildPrice() != null ? tour.getChildPrice() : adultPrice.multiply(new BigDecimal("0.7"));

        int numAdults = request.getNumberOfAdults() != null ? request.getNumberOfAdults() : 1;
        int numChildren = request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0;
        int totalGuests = numAdults + numChildren;

        // Verify and deduct available slots/seats for the schedule & tour
        if (resolvedSchedule != null) {
            int maxP = resolvedSchedule.getMaxParticipants() != null ? resolvedSchedule.getMaxParticipants() : 40;
            int currentBooked = resolvedSchedule.getBookedCount() != null ? resolvedSchedule.getBookedCount() : 0;
            int remainingOnSchedule = Math.max(0, maxP - currentBooked);
            if (remainingOnSchedule < totalGuests) {
                throw new BadRequestException("Đợt khởi hành này không đủ chỗ cho " + totalGuests + " khách (chỉ còn " + remainingOnSchedule + " chỗ).");
            }
            resolvedSchedule.setBookedCount(currentBooked + totalGuests);
            tourScheduleRepository.save(resolvedSchedule);
        }

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

        BigDecimal tourSubtotal = adultPrice.multiply(BigDecimal.valueOf(numAdults))
                .add(childPrice.multiply(BigDecimal.valueOf(numChildren)))
                .add(surchargeAmount);

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            discountAmount = validateAndCalculateVoucher(request.getVoucherCode().trim(), tourSubtotal);
        }

        // 3. Tính phí dịch vụ ủy quyền làm Visa (cộng vào totalPrice), tách riêng lệ phí lãnh sự (không cộng gộp)
        boolean visaOptIn = requiresVisa && Boolean.TRUE.equals(request.getVisaOptIn());
        BigDecimal visaFeeTotal = BigDecimal.ZERO;
        BigDecimal consularFeeTotal = BigDecimal.ZERO;
        if (visaOptIn && visaTemplate != null) {
            BigDecimal unitVisaFee = visaTemplate.getVisaFee() != null ? visaTemplate.getVisaFee() : BigDecimal.ZERO;
            BigDecimal unitConsularFee = visaTemplate.getConsularFee() != null ? visaTemplate.getConsularFee() : BigDecimal.ZERO;
            visaFeeTotal = unitVisaFee.multiply(BigDecimal.valueOf(totalGuests));
            consularFeeTotal = unitConsularFee.multiply(BigDecimal.valueOf(totalGuests));
        }

        BigDecimal totalPrice = tourSubtotal.subtract(discountAmount).add(visaFeeTotal);
        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            totalPrice = BigDecimal.ZERO;
        }

        boolean isDeposit = Boolean.TRUE.equals(request.getIsDeposit())
                || (request.getNote() != null && request.getNote().contains("DAT_COC_30"));

        BigDecimal depositAmount = BigDecimal.ZERO;
        BigDecimal remainingAmount = BigDecimal.ZERO;
        if (isDeposit) {
            depositAmount = request.getDepositAmount() != null && request.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                    ? request.getDepositAmount()
                    : totalPrice.multiply(new BigDecimal("0.3")).setScale(0, RoundingMode.HALF_UP);
            remainingAmount = totalPrice.subtract(depositAmount);
            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) remainingAmount = BigDecimal.ZERO;
        }

        String bookingCode = (request.getBookingCode() != null && !request.getBookingCode().trim().isEmpty())
                ? request.getBookingCode().trim().toUpperCase()
                : "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String qrContent = "SMARTTRAVEL-E-TICKET|" + bookingCode + "|" + tour.getTitle() + "|GUESTS:" + totalGuests;

        BookingStatus initialStatus = request.getStatus() != null ? request.getStatus() : BookingStatus.PENDING;

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .tour(tour)
                .tourSchedule(resolvedSchedule)
                .departureDate(departureDate)
                .numberOfAdults(numAdults)
                .numberOfChildren(numChildren)
                .adultPrice(adultPrice)
                .childPrice(childPrice)
                .voucherCode(request.getVoucherCode())
                .discountAmount(discountAmount)
                .totalPrice(totalPrice)
                .isDeposit(isDeposit)
                .depositAmount(depositAmount)
                .remainingAmount(remainingAmount)
                .singleRoomSurcharge(Boolean.TRUE.equals(request.getSingleRoomSurcharge()))
                .singleRoomSurchargeAmount(surchargeAmount)
                .roomAllocation(request.getRoomAllocation())
                .status(initialStatus)
                .contactName(request.getContactName() != null ? request.getContactName() : user.getFullName())
                .contactEmail(request.getContactEmail() != null ? request.getContactEmail() : user.getEmail())
                .contactPhone(request.getContactPhone() != null ? request.getContactPhone() : user.getPhone())
                .notes(request.getNote())
                .visaOptIn(visaOptIn)
                .visaFee(visaFeeTotal)
                .consularFee(consularFeeTotal)
                .visaDeadline(visaDeadline)
                .qrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + URLEncoder.encode(qrContent, StandardCharsets.UTF_8))
                .build();

        Booking saved = bookingRepository.save(booking);
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucherService.incrementUsedCount(request.getVoucherCode().trim());
        }

        // 4. Tự động tạo hồ sơ Visa (PENDING_DOCS) nếu khách đăng ký dịch vụ hỗ trợ Visa
        if (visaOptIn) {
            VisaApplication visaApp = VisaApplication.builder()
                    .booking(saved)
                    .status(VisaApplicationStatus.PENDING_DOCS)
                    .notes("Đã đăng ký dịch vụ ủy quyền làm Visa cùng đơn đặt tour. Vui lòng tải bản mềm giấy tờ trước hạn " + (visaDeadline != null ? visaDeadline : "quy định") + " để Đại lý sơ duyệt.")
                    .build();
            VisaApplication savedVisaApp = visaApplicationRepository.save(visaApp);
            visaStatusLogRepository.save(VisaStatusLog.builder()
                    .application(savedVisaApp)
                    .fromStatus(null)
                    .toStatus(VisaApplicationStatus.PENDING_DOCS)
                    .note("Tự động khởi tạo hồ sơ Visa khi khách chọn dịch vụ hỗ trợ Visa lúc đặt tour")
                    .actorEmail(user.getEmail())
                    .actorRole("CUSTOMER")
                    .build());
        }

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

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Không thể hủy tour đã check-in hoặc đã hoàn thành");
        }

        boolean wasCancelled = booking.getStatus() == BookingStatus.CANCELLED;
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        if (!wasCancelled) {
            restoreBookingSeats(booking);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BookingResponse checkInBooking(Long id, boolean collectRemainingDeposit, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (actorEmail != null && !actorEmail.isBlank()) {
            User actor = userRepository.findByEmail(actorEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", actorEmail));
            boolean isAdmin = actor.getRoles() != null && actor.getRoles().stream()
                    .anyMatch(r -> r.getName() == RoleEnum.ROLE_ADMIN);
            boolean isTourVendor = booking.getTour() != null
                    && booking.getTour().getVendor() != null
                    && booking.getTour().getVendor().getId().equals(actor.getId());
            if (!isAdmin && !isTourVendor) {
                throw new ForbiddenException("Bạn không có quyền check-in đơn đặt tour thuộc đại lý khác.");
            }
        }

        BookingStatus current = booking.getStatus();
        if (current == BookingStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đã bị hủy, không thể thực hiện check-in.");
        }
        if (current == BookingStatus.PENDING) {
            throw new BadRequestException("Đơn hàng chưa thanh toán, không thể thực hiện check-in.");
        }
        if (current == BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Đơn hàng đã được check-in trước đó.");
        }
        if (current == BookingStatus.COMPLETED) {
            throw new BadRequestException("Đơn hàng đã hoàn thành chuyến đi trước đó.");
        }

        if (current == BookingStatus.DEPOSITED) {
            if (!collectRemainingDeposit) {
                throw new BadRequestException("Khách hàng mới đặt cọc 30%. Vui lòng xác nhận đã thu đủ 70% còn lại trước khi Check-in.");
            }
            booking.setRemainingAmount(BigDecimal.ZERO);
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        BookingStatus previous = booking.getStatus();
        if (status == BookingStatus.CANCELLED && (previous == BookingStatus.CHECKED_IN || previous == BookingStatus.COMPLETED)) {
            throw new BadRequestException("Không thể hủy đơn đã check-in hoặc đã hoàn thành.");
        }

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);

        if (status == BookingStatus.CANCELLED && previous != BookingStatus.CANCELLED && previous != BookingStatus.REFUNDED) {
            restoreBookingSeats(booking);
        }

        return mapToResponse(updated);
    }

    private void restoreBookingSeats(Booking booking) {
        int guests = (booking.getNumberOfAdults() != null ? booking.getNumberOfAdults() : 0)
                + (booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0);
        if (guests <= 0) return;

        if (booking.getTour() != null && booking.getTour().getRemainingSeats() != null) {
            Tour tour = booking.getTour();
            tour.setRemainingSeats(tour.getRemainingSeats() + guests);
            tourRepository.save(tour);
        }

        TourSchedule schedule = booking.getTourSchedule();
        if (schedule == null && booking.getTour() != null && booking.getDepartureDate() != null) {
            schedule = tourScheduleRepository.findFirstByTourIdAndStartDate(
                    booking.getTour().getId(), booking.getDepartureDate()).orElse(null);
        }
        if (schedule != null && schedule.getBookedCount() != null) {
            schedule.setBookedCount(Math.max(0, schedule.getBookedCount() - guests));
            tourScheduleRepository.save(schedule);
        }
    }

    @Override
    public BigDecimal validateAndCalculateVoucher(String voucherCode, BigDecimal originalTotal) {
        Map<String, Object> result = voucherService.validateAndCalculateVoucher(voucherCode, originalTotal);
        Object discount = result.get("discountAmount");
        if (discount instanceof BigDecimal) {
            return (BigDecimal) discount;
        } else if (discount instanceof Number) {
            return BigDecimal.valueOf(((Number) discount).doubleValue());
        }
        return BigDecimal.ZERO;
    }

    private BookingResponse mapToResponse(Booking b) {
        Tour tour = b.getTour();
        VisaTemplate tpl = tour != null ? tour.getVisaTemplate() : null;
        boolean requiresVisa = tpl != null
                || (tour != null && tour.getId() != null && visaRequirementRepository.existsByTourId(tour.getId()))
                || Boolean.TRUE.equals(b.getVisaOptIn());

        LocalDate depDate = b.getDepartureDate();
        if (depDate == null && b.getTourSchedule() != null) {
            depDate = b.getTourSchedule().getStartDate();
        }

        LocalDate computedDeadline = b.getVisaDeadline();
        if (computedDeadline == null && requiresVisa && depDate != null) {
            int proc = tpl != null && tpl.getProcessingDays() != null ? tpl.getProcessingDays() : 10;
            int buf = tpl != null && tpl.getBufferDays() != null ? tpl.getBufferDays() : 3;
            computedDeadline = depDate.minusDays(proc + buf);
        }

        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .tourId(tour != null ? tour.getId() : null)
                .tourTitle(tour != null ? tour.getTitle() : null)
                .tourThumbnailUrl(tour != null ? tour.getThumbnailUrl() : null)
                .tourCode(tour != null ? tour.getTourCode() : null)
                .tourCategory(tour != null ? tour.getCategory() : null)
                .durationDays(tour != null ? tour.getDurationDays() : null)
                .durationNights(tour != null ? tour.getDurationNights() : null)
                .departureLocation(tour != null ? tour.getDepartureLocation() : null)
                .departureDate(depDate)
                .tourScheduleId(b.getTourSchedule() != null ? b.getTourSchedule().getId() : null)
                .endDate(b.getTourSchedule() != null ? b.getTourSchedule().getEndDate() : null)
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
                .isDeposit(b.getIsDeposit())
                .depositAmount(b.getDepositAmount())
                .remainingAmount(b.getRemainingAmount())
                .notes(b.getNotes())
                .vendorId(tour != null && tour.getVendor() != null ? tour.getVendor().getId() : null)
                .vendorName(tour != null && tour.getVendor() != null ? tour.getVendor().getFullName() : null)
                .qrCodeUrl(b.getQrCodeUrl())
                .requiresVisa(requiresVisa)
                .visaOptIn(b.getVisaOptIn())
                .visaFee(b.getVisaFee())
                .consularFee(b.getConsularFee())
                .visaDeadline(computedDeadline)
                .createdAt(b.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public String resendETicket(String bookingCode, String targetEmail) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new BadRequestException("Mã vé / đơn hàng không hợp lệ");
        }
        String cleanCode = bookingCode.trim().replaceAll("\\s+", "").toUpperCase();
        Booking booking = bookingRepository.findByBookingCode(cleanCode)
                .or(() -> !cleanCode.contains("-") && cleanCode.startsWith("BK") ? bookingRepository.findByBookingCode("BK-" + cleanCode.substring(2)) : Optional.empty())
                .or(() -> cleanCode.contains("-") ? bookingRepository.findByBookingCode(cleanCode.replace("-", "")) : Optional.empty())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", cleanCode));

        if (targetEmail != null && targetEmail.contains("@")) {
            booking.setContactEmail(targetEmail.trim());
            bookingRepository.save(booking);
        }

        try {
            if (booking.getTour() != null) {
                booking.getTour().getTitle();
                booking.getTour().getTourCode();
            }
            if (booking.getUser() != null) {
                booking.getUser().getFullName();
                booking.getUser().getEmail();
            }
            if (booking.getTourSchedule() != null) {
                booking.getTourSchedule().getStartDate();
            }
        } catch (Exception ignored) {}

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(booking.getPayment());
        emailService.sendETicketEmail(booking, payment);

        String destinationEmail = booking.getContactEmail();
        return "Đã gửi lại vé điện tử E-Ticket về hòm thư " + destinationEmail + " thành công! Quý khách vui lòng kiểm tra hộp thư đến (Inbox) hoặc Thư rác (Spam).";
    }

    @Override
    public void resendETicket(String bookingCode) {
        resendETicket(bookingCode, null);
    }

    @Override
    @Transactional
    public int resetBookings(String vendorEmail) {
        List<Booking> targets;
        if (vendorEmail == null) {
            targets = bookingRepository.findAll();
        } else {
            User vendor = userRepository.findByEmail(vendorEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));
            targets = bookingRepository.findByTourVendorId(vendor.getId());
        }

        for (Booking b : targets) {
            if (b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REFUNDED) {
                restoreBookingSeats(b);
            }
        }

        bookingRepository.deleteAll(targets);

        // Xóa mốc đã quyết toán của Vendor liên quan khi reset doanh thu về 0đ
        if (vendorEmail == null) {
            List<User> allUsers = userRepository.findAll();
            for (User u : allUsers) {
                if (u.getSettledGrossAmount() != null || u.getLastSettledAt() != null) {
                    u.setSettledGrossAmount(null);
                    u.setLastSettledAt(null);
                    userRepository.save(u);
                }
            }
        } else {
            userRepository.findByEmail(vendorEmail).ifPresent(v -> {
                v.setSettledGrossAmount(null);
                v.setLastSettledAt(null);
                userRepository.save(v);
            });
        }
        return targets.size();
    }
}
