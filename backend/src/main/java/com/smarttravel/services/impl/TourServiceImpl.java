package com.smarttravel.services.impl;

import com.smarttravel.dto.request.TourCreateRequest;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.entities.Destination;
import com.smarttravel.entities.Review;
import com.smarttravel.entities.Tour;
import com.smarttravel.entities.User;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.DestinationRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    @Override
    public List<TourResponse> getAllActiveTours() {
        return tourRepository.findByStatus(TourStatus.ACTIVE).stream()
                .map(this::mapToTourResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", id));
        return mapToTourResponse(tour);
    }

    @Override
    @Transactional
    public TourResponse createTour(TourCreateRequest request, String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId())
                    .orElse(null);
        }

        Tour tour = Tour.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .departureLocation(request.getDepartureLocation())
                .thumbnailUrl(request.getThumbnailUrl())
                .status(TourStatus.ACTIVE)
                .vendor(vendor)
                .destination(destination)
                .build();

        Tour savedTour = tourRepository.save(tour);
        return mapToTourResponse(savedTour);
    }

    @Override
    public List<TourResponse> getToursByVendor(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        return tourRepository.findByVendorId(vendor.getId()).stream()
                .map(this::mapToTourResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TourResponse> searchTours(
            String departure,
            String destination,
            TourCategory category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String durationFilter) {

        Integer minDays = null;
        Integer maxDays = null;

        if ("1_DAY".equalsIgnoreCase(durationFilter)) {
            minDays = 1;
            maxDays = 1;
        } else if ("1_TO_3_DAYS".equalsIgnoreCase(durationFilter)) {
            minDays = 1;
            maxDays = 3;
        } else if ("OVER_3_DAYS".equalsIgnoreCase(durationFilter)) {
            minDays = 4;
            maxDays = 100;
        }

        List<Tour> tours = tourRepository.searchTours(
                departure != null && !departure.isEmpty() ? departure : null,
                destination != null && !destination.isEmpty() ? destination : null,
                category,
                minPrice,
                maxPrice,
                minDays,
                maxDays
        );

        return tours.stream().map(this::mapToTourResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTour(Long id, String vendorEmail) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", id));

        User user = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_ADMIN);
        if (!isAdmin && (tour.getVendor() == null || !tour.getVendor().getId().equals(user.getId()))) {
            throw new BadRequestException("Bạn không có quyền xóa tour này.");
        }

        try {
            tourRepository.delete(tour);
        } catch (Exception e) {
            tour.setStatus(TourStatus.INACTIVE);
            tourRepository.save(tour);
        }
    }

    private TourResponse mapToTourResponse(Tour tour) {
        double avgRating = 0.0;
        Map<Integer, Long> ratingBreakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingBreakdown.put(i, 0L);
        }

        if (tour.getReviews() != null && !tour.getReviews().isEmpty()) {
            avgRating = tour.getReviews().stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            for (Review r : tour.getReviews()) {
                int rVal = Math.min(5, Math.max(1, r.getRating()));
                ratingBreakdown.put(rVal, ratingBreakdown.get(rVal) + 1);
            }
        }

        return TourResponse.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .price(tour.getPrice())
                .childPrice(tour.getChildPrice() != null ? tour.getChildPrice() : tour.getPrice().multiply(new BigDecimal("0.7")))
                .durationDays(tour.getDurationDays())
                .durationNights(tour.getDurationNights())
                .departureLocation(tour.getDepartureLocation())
                .thumbnailUrl(tour.getThumbnailUrl())
                .tourCode(tour.getTourCode() != null ? tour.getTourCode() : "TOUR-" + tour.getId())
                .category(tour.getCategory() != null ? tour.getCategory() : TourCategory.DOMESTIC)
                .includedServices(tour.getIncludedServices())
                .excludedServices(tour.getExcludedServices())
                .cancellationPolicy(tour.getCancellationPolicy())
                .itineraryDetails(tour.getItineraryDetails())
                .remainingSeats(tour.getRemainingSeats() != null ? tour.getRemainingSeats() : 20)
                .viewCount(tour.getViewCount() != null ? tour.getViewCount() : 100)
                .status(tour.getStatus())
                .vendorId(tour.getVendor() != null ? tour.getVendor().getId() : null)
                .vendorName(tour.getVendor() != null ? tour.getVendor().getFullName() : null)
                .destinationId(tour.getDestination() != null ? tour.getDestination().getId() : null)
                .destinationName(tour.getDestination() != null ? tour.getDestination().getName() : null)
                .averageRating(avgRating)
                .totalReviews(tour.getReviews() != null ? tour.getReviews().size() : 0)
                .ratingBreakdown(ratingBreakdown)
                .build();
    }
}
