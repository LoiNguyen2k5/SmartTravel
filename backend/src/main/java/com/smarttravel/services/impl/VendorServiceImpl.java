package com.smarttravel.services.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.entities.Booking;
import com.smarttravel.entities.User;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.TourService;
import com.smarttravel.services.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TourService tourService;

    private boolean isRevenueBooking(Booking b) {
        if (b == null || b.getStatus() == null) return false;
        return b.getStatus() == BookingStatus.CONFIRMED
                || b.getStatus() == BookingStatus.COMPLETED
                || b.getStatus() == BookingStatus.CHECKED_IN
                || b.getStatus() == BookingStatus.PAID
                || b.getStatus() == BookingStatus.DEPOSITED;
    }

    private BigDecimal getRecognizedRevenue(Booking b) {
        if (b == null || b.getTotalPrice() == null) return BigDecimal.ZERO;
        if (b.getStatus() == BookingStatus.DEPOSITED) {
            if (b.getDepositAmount() != null && b.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
                return b.getDepositAmount();
            }
            return b.getTotalPrice().multiply(new BigDecimal("0.30")).setScale(0, RoundingMode.HALF_UP);
        }
        return b.getTotalPrice();
    }

    @Override
    public Map<String, Object> getVendorDashboardStats(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        int totalTours = tourRepository.findByVendorId(vendor.getId()).size();
        List<Booking> vendorBookings = bookingRepository.findByTourVendorId(vendor.getId());

        BigDecimal totalRevenue = vendorBookings.stream()
                .filter(this::isRevenueBooking)
                .map(this::getRecognizedRevenue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean isSettled = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                && vendor.getSettledGrossAmount() != null
                && vendor.getSettledGrossAmount().compareTo(totalRevenue) >= 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTours", totalTours);
        stats.put("totalBookings", vendorBookings.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("isSettled", isSettled);
        stats.put("settledGrossAmount", vendor.getSettledGrossAmount() != null ? vendor.getSettledGrossAmount() : BigDecimal.ZERO);

        return stats;
    }

    @Override
    public Map<String, String> getVendorBusinessProfile(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));
        if (vendor.getVendorProfileJson() == null || vendor.getVendorProfileJson().isBlank()) {
            return new LinkedHashMap<>();
        }
        try {
            return OBJECT_MAPPER.readValue(vendor.getVendorProfileJson(), new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new LinkedHashMap<>();
        }
    }

    @Override
    @Transactional
    public Map<String, String> updateVendorBusinessProfile(String vendorEmail, Map<String, String> profileData) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));
        Map<String, String> sanitized = new LinkedHashMap<>();
        if (profileData != null) {
            for (Map.Entry<String, String> entry : profileData.entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    sanitized.put(entry.getKey().trim(), entry.getValue().trim());
                }
            }
        }
        try {
            vendor.setVendorProfileJson(OBJECT_MAPPER.writeValueAsString(sanitized));
            userRepository.save(vendor);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lưu hồ sơ doanh nghiệp đại lý", e);
        }
        return sanitized;
    }

    @Override
    public List<TourResponse> getVendorTours(String vendorEmail) {
        return tourService.getToursByVendor(vendorEmail);
    }

    @Override
    public List<BookingResponse> getVendorBookings(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        List<Booking> bookings = bookingRepository.findByTourVendorId(vendor.getId());
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse mapToBookingResponse(Booking b) {
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
                .isDeposit(b.getIsDeposit())
                .depositAmount(b.getDepositAmount())
                .remainingAmount(b.getRemainingAmount())
                .singleRoomSurcharge(b.getSingleRoomSurcharge())
                .singleRoomSurchargeAmount(b.getSingleRoomSurchargeAmount())
                .roomAllocation(b.getRoomAllocation())
                .notes(b.getNotes())
                .status(b.getStatus())
                .contactName(b.getContactName())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .vendorId(b.getTour() != null && b.getTour().getVendor() != null ? b.getTour().getVendor().getId() : null)
                .vendorName(b.getTour() != null && b.getTour().getVendor() != null ? b.getTour().getVendor().getFullName() : null)
                .qrCodeUrl(b.getQrCodeUrl())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
