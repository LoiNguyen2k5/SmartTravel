package com.smarttravel.services.impl;

import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.entities.Booking;
import com.smarttravel.entities.User;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.TourService;
import com.smarttravel.services.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TourService tourService;

    @Override
    public Map<String, Object> getVendorDashboardStats(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        int totalTours = tourRepository.findByVendorId(vendor.getId()).size();
        List<Booking> vendorBookings = bookingRepository.findByTourVendorId(vendor.getId());

        BigDecimal totalRevenue = vendorBookings.stream()
                .filter(b -> b.getTotalPrice() != null)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTours", totalTours);
        stats.put("totalBookings", vendorBookings.size());
        stats.put("totalRevenue", totalRevenue);

        return stats;
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
        if (bookings.isEmpty()) {
            bookings = bookingRepository.findAll();
        }

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
                .status(b.getStatus())
                .contactName(b.getContactName())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .qrCodeUrl(b.getQrCodeUrl())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
