package com.smarttravel.services.impl;

import com.smarttravel.dto.request.TourModerationRequest;
import com.smarttravel.dto.response.*;
import com.smarttravel.entities.*;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.enums.PaymentStatus;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourStatus;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final DestinationRepository destinationRepository;

    private static final double DEFAULT_COMMISSION_RATE = 10.0; // 10%

    @Override
    public AdminStatsResponse getDashboardAnalytics() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalVendors = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_VENDOR))
                .count();
        long totalCustomers = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_USER))
                .count();

        long totalActiveTours = tourRepository.countByStatus(TourStatus.ACTIVE);
        long totalPendingTours = tourRepository.countByStatus(TourStatus.PENDING_APPROVAL);

        List<Booking> allBookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        long totalBookings = allBookings.size();
        List<Booking> successfulBookingsList = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
        long successfulBookings = successfulBookingsList.size();

        BigDecimal totalGrossRevenue = successfulBookingsList.stream()
                .map(Booking::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPlatformCommission = totalGrossRevenue
                .multiply(BigDecimal.valueOf(DEFAULT_COMMISSION_RATE / 100.0))
                .setScale(2, RoundingMode.HALF_UP);

        // Monthly revenue grouping (YYYY-MM)
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> monthlyRevenue = new TreeMap<>();
        for (Booking b : successfulBookingsList) {
            if (b.getCreatedAt() != null && b.getTotalPrice() != null) {
                String monthKey = b.getCreatedAt().format(monthFormatter);
                monthlyRevenue.put(monthKey, monthlyRevenue.getOrDefault(monthKey, BigDecimal.ZERO).add(b.getTotalPrice()));
            }
        }

        // Top destinations calculation
        List<Destination> destinations = destinationRepository.findAll();
        List<Map<String, Object>> topDestinations = destinations.stream()
                .map(d -> {
                    long tourCount = tourRepository.findAll().stream()
                            .filter(t -> t.getDestination() != null && t.getDestination().getId().equals(d.getId()))
                            .count();
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("name", d.getName());
                    map.put("city", d.getCity());
                    map.put("imageUrl", d.getImageUrl());
                    map.put("tourCount", tourCount);
                    return map;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("tourCount"), (Long) a.get("tourCount")))
                .limit(5)
                .collect(Collectors.toList());

        // Recent 6 bookings
        List<BookingResponse> recentBookings = allBookings.stream()
                .limit(6)
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalVendors(totalVendors)
                .totalCustomers(totalCustomers)
                .totalActiveTours(totalActiveTours)
                .totalPendingTours(totalPendingTours)
                .totalBookings(totalBookings)
                .successfulBookings(successfulBookings)
                .totalGrossRevenue(totalGrossRevenue)
                .totalPlatformCommission(totalPlatformCommission)
                .defaultCommissionRate(DEFAULT_COMMISSION_RATE)
                .monthlyRevenue(monthlyRevenue)
                .topDestinations(topDestinations)
                .recentBookings(recentBookings)
                .build();
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId, Boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEnabled(enabled != null ? enabled : !Boolean.TRUE.equals(user.getEnabled()));
        User updated = userRepository.save(user);

        Set<String> roleNames = updated.getRoles() != null
                ? updated.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
                : Set.of();

        return UserResponse.builder()
                .id(updated.getId())
                .fullName(updated.getFullName())
                .email(updated.getEmail())
                .phone(updated.getPhone())
                .avatarUrl(updated.getAvatarUrl())
                .enabled(updated.getEnabled())
                .createdAt(updated.getCreatedAt())
                .roles(roleNames)
                .build();
    }

    @Override
    @Transactional
    public TourResponse moderateTour(Long tourId, TourModerationRequest request) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));

        tour.setStatus(request.getStatus());
        Tour saved = tourRepository.save(tour);
        return mapToTourResponse(saved);
    }

    @Override
    public List<TourResponse> getAllToursForAdmin(TourStatus status) {
        List<Tour> tours;
        if (status != null) {
            tours = tourRepository.findByStatus(status);
        } else {
            tours = tourRepository.findAll();
        }
        return tours.stream().map(this::mapToTourResponse).collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> PaymentResponse.builder()
                        .id(p.getId())
                        .bookingId(p.getBooking() != null ? p.getBooking().getId() : null)
                        .bookingCode(p.getBooking() != null ? p.getBooking().getBookingCode() : null)
                        .transactionId(p.getTransactionId())
                        .amount(p.getAmount())
                        .paymentMethod(p.getPaymentMethod())
                        .paymentStatus(p.getPaymentStatus())
                        .paymentTime(p.getPaymentTime())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<VendorSettlementResponse> getVendorSettlements() {
        List<User> vendors = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_VENDOR))
                .collect(Collectors.toList());

        List<Booking> allBookings = bookingRepository.findAll();

        return vendors.stream().map(vendor -> {
            List<Tour> vendorTours = tourRepository.findByVendorId(vendor.getId());
            List<Booking> vendorBookings = allBookings.stream()
                    .filter(b -> b.getTour() != null && b.getTour().getVendor() != null && b.getTour().getVendor().getId().equals(vendor.getId()))
                    .collect(Collectors.toList());

            BigDecimal grossRevenue = vendorBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                    .map(Booking::getTotalPrice)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal platformFee = grossRevenue.multiply(BigDecimal.valueOf(DEFAULT_COMMISSION_RATE / 100.0))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal netPayout = grossRevenue.subtract(platformFee);

            return VendorSettlementResponse.builder()
                    .vendorId(vendor.getId())
                    .vendorName(vendor.getFullName())
                    .vendorEmail(vendor.getEmail())
                    .vendorPhone(vendor.getPhone())
                    .totalTours(vendorTours.size())
                    .totalBookings(vendorBookings.size())
                    .totalGrossRevenue(grossRevenue)
                    .commissionRate(DEFAULT_COMMISSION_RATE)
                    .platformFee(platformFee)
                    .netPayout(netPayout)
                    .settlementStatus("PENDING")
                    .build();
        }).collect(Collectors.toList());
    }

    private TourResponse mapToTourResponse(Tour tour) {
        return TourResponse.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .price(tour.getPrice())
                .childPrice(tour.getChildPrice())
                .durationDays(tour.getDurationDays())
                .durationNights(tour.getDurationNights())
                .departureLocation(tour.getDepartureLocation())
                .thumbnailUrl(tour.getThumbnailUrl())
                .tourCode(tour.getTourCode())
                .category(tour.getCategory())
                .includedServices(tour.getIncludedServices())
                .excludedServices(tour.getExcludedServices())
                .cancellationPolicy(tour.getCancellationPolicy())
                .itineraryDetails(tour.getItineraryDetails())
                .remainingSeats(tour.getRemainingSeats())
                .viewCount(tour.getViewCount())
                .status(tour.getStatus())
                .vendorId(tour.getVendor() != null ? tour.getVendor().getId() : null)
                .vendorName(tour.getVendor() != null ? tour.getVendor().getFullName() : null)
                .destinationId(tour.getDestination() != null ? tour.getDestination().getId() : null)
                .destinationName(tour.getDestination() != null ? tour.getDestination().getName() : null)
                .build();
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .tourId(booking.getTour() != null ? booking.getTour().getId() : null)
                .tourTitle(booking.getTour() != null ? booking.getTour().getTitle() : null)
                .tourThumbnailUrl(booking.getTour() != null ? booking.getTour().getThumbnailUrl() : null)
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .contactName(booking.getContactName())
                .contactEmail(booking.getContactEmail())
                .contactPhone(booking.getContactPhone())
                .numberOfAdults(booking.getNumberOfAdults())
                .numberOfChildren(booking.getNumberOfChildren())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .qrCodeUrl(booking.getQrCodeUrl())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
