package com.smarttravel.services.impl;

import com.smarttravel.dto.request.TourCreateRequest;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.entities.Destination;
import com.smarttravel.entities.Review;
import com.smarttravel.entities.Tour;
import com.smarttravel.entities.User;
import com.smarttravel.entities.VisaTemplate;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.DestinationRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.repositories.VisaRequirementRepository;
import com.smarttravel.repositories.VisaTemplateRepository;
import com.smarttravel.services.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final VisaTemplateRepository visaTemplateRepository;
    private final VisaRequirementRepository visaRequirementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getAllActiveTours() {
        return mapToursToResponses(tourRepository.findByStatus(TourStatus.ACTIVE));
    }

    @Override
    @Transactional(readOnly = true)
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

        TourCategory category = request.getCategory() != null ? request.getCategory() : TourCategory.DOMESTIC;
        VisaTemplate visaTemplate = resolveVisaTemplateForCreate(request.getVisaTemplateId(), category, destination);

        Tour tour = Tour.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .childPrice(request.getChildPrice() != null ? request.getChildPrice() : request.getPrice().multiply(new BigDecimal("0.7")))
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .departureLocation(request.getDepartureLocation())
                .thumbnailUrl(request.getThumbnailUrl())
                .tourCode(request.getTourCode())
                .category(category)
                .includedServices(request.getIncludedServices())
                .excludedServices(request.getExcludedServices())
                .cancellationPolicy(request.getCancellationPolicy())
                .itineraryDetails(request.getItineraryDetails())
                .remainingSeats(request.getRemainingSeats() != null ? request.getRemainingSeats() : 20)
                .status(TourStatus.ACTIVE)
                .vendor(vendor)
                .destination(destination)
                .visaTemplate(visaTemplate)
                .build();

        Tour savedTour = tourRepository.save(tour);
        return mapToTourResponse(savedTour);
    }

    @Override
    @Transactional
    public TourResponse updateTour(Long id, TourCreateRequest request, String vendorEmail) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", id));

        User user = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_ADMIN);
        if (!isAdmin && (tour.getVendor() == null || !tour.getVendor().getId().equals(user.getId()))) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa tour này.");
        }

        if (request.getTitle() != null) tour.setTitle(request.getTitle());
        if (request.getDescription() != null) tour.setDescription(request.getDescription());
        if (request.getPrice() != null) tour.setPrice(request.getPrice());
        if (request.getChildPrice() != null) tour.setChildPrice(request.getChildPrice());
        if (request.getDurationDays() != null) tour.setDurationDays(request.getDurationDays());
        if (request.getDurationNights() != null) tour.setDurationNights(request.getDurationNights());
        if (request.getDepartureLocation() != null) tour.setDepartureLocation(request.getDepartureLocation());
        if (request.getThumbnailUrl() != null) tour.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getTourCode() != null) tour.setTourCode(request.getTourCode());
        if (request.getCategory() != null) tour.setCategory(request.getCategory());
        if (request.getIncludedServices() != null) tour.setIncludedServices(request.getIncludedServices());
        if (request.getExcludedServices() != null) tour.setExcludedServices(request.getExcludedServices());
        if (request.getCancellationPolicy() != null) tour.setCancellationPolicy(request.getCancellationPolicy());
        if (request.getItineraryDetails() != null) tour.setItineraryDetails(request.getItineraryDetails());
        if (request.getRemainingSeats() != null) tour.setRemainingSeats(request.getRemainingSeats());
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId()).orElse(null);
            tour.setDestination(destination);
        }

        if (Boolean.TRUE.equals(request.getClearVisaTemplate()) || tour.getCategory() == TourCategory.DOMESTIC) {
            tour.setVisaTemplate(null);
        } else if (request.getVisaTemplateId() != null) {
            VisaTemplate tpl = visaTemplateRepository.findById(request.getVisaTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("VisaTemplate", "id", request.getVisaTemplateId()));
            tour.setVisaTemplate(tpl);
        }

        Tour saved = tourRepository.save(tour);
        return mapToTourResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getToursByVendor(String vendorEmail) {
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", vendorEmail));

        return mapToursToResponses(tourRepository.findByVendorId(vendor.getId()));
    }

    @Override
    @Transactional(readOnly = true)
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

        return mapToursToResponses(tours);
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

    private VisaTemplate resolveVisaTemplateForCreate(Long visaTemplateId, TourCategory category, Destination destination) {
        if (category == TourCategory.DOMESTIC) {
            return null;
        }
        if (visaTemplateId != null) {
            return visaTemplateRepository.findById(visaTemplateId)
                    .orElseThrow(() -> new ResourceNotFoundException("VisaTemplate", "id", visaTemplateId));
        }
        if (destination != null && destination.getCountry() != null && !destination.getCountry().isBlank()) {
            String countryLower = destination.getCountry().trim().toLowerCase(Locale.ROOT);
            return visaTemplateRepository.findAllByOrderByCountryAsc().stream()
                    .filter(t -> t.getCountry() != null && (
                            t.getCountry().toLowerCase(Locale.ROOT).contains(countryLower)
                            || countryLower.contains(t.getCountry().toLowerCase(Locale.ROOT))))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    private List<TourResponse> mapToursToResponses(List<Tour> tours) {
        if (tours == null || tours.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> tourIds = tours.stream()
                .map(Tour::getId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        Set<Long> customVisaTourIds = tourIds.isEmpty()
                ? Collections.emptySet()
                : visaRequirementRepository.findTourIdsWithCustomRequirements(tourIds);
        return tours.stream()
                .map(tour -> mapToTourResponse(tour, tour.getId() != null && customVisaTourIds.contains(tour.getId())))
                .collect(Collectors.toList());
    }

    private TourResponse mapToTourResponse(Tour tour) {
        boolean hasCustomVisaReqs = tour.getId() != null && visaRequirementRepository.existsByTourId(tour.getId());
        return mapToTourResponse(tour, hasCustomVisaReqs);
    }

    private TourResponse mapToTourResponse(Tour tour, boolean hasCustomVisaReqs) {
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

        VisaTemplate tpl = tour.getVisaTemplate();
        boolean requiresVisa = tpl != null || hasCustomVisaReqs;
        String[] transportMeta = resolveTransportMetadata(tour, requiresVisa);

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
                .destinationCountry(tour.getDestination() != null ? tour.getDestination().getCountry() : null)
                .visaTemplateId(tpl != null ? tpl.getId() : null)
                .visaCountry(tpl != null ? tpl.getCountry() : null)
                .requiresVisa(requiresVisa)
                .visaFee(tpl != null ? tpl.getVisaFee() : null)
                .consularFee(tpl != null ? tpl.getConsularFee() : null)
                .visaProcessingDays(tpl != null ? tpl.getProcessingDays() : null)
                .visaBufferDays(tpl != null ? tpl.getBufferDays() : null)
                .averageRating(avgRating)
                .totalReviews(tour.getReviews() != null ? tour.getReviews().size() : 0)
                .ratingBreakdown(ratingBreakdown)
                .transportMode(transportMeta[0])
                .fromTerminalCode(transportMeta[1])
                .toTerminalCode(transportMeta[2])
                .airlineCarrier(transportMeta[3])
                .baggageAllowance(transportMeta[4])
                .airportMeetingPoint(transportMeta[5])
                .build();
    }

    private String[] resolveTransportMetadata(Tour tour, boolean requiresVisa) {
        String combined = ((tour.getTitle() != null ? tour.getTitle() : "") + " "
                + (tour.getIncludedServices() != null ? tour.getIncludedServices() : "") + " "
                + (tour.getDestination() != null && tour.getDestination().getName() != null ? tour.getDestination().getName() : ""))
                .toLowerCase(Locale.ROOT);
        boolean isInternational = tour.getCategory() == TourCategory.NUOC_NGOAI || requiresVisa;
        boolean isFlight = isInternational || combined.contains("máy bay") || combined.contains("bay khứ hồi")
                || combined.contains("hà nội") || combined.contains("sa pa") || combined.contains("hà giang")
                || combined.contains("đà nẵng") || combined.contains("phú quốc") || combined.contains("phú yên");

        String depLower = (tour.getDepartureLocation() != null ? tour.getDepartureLocation() : "TP.Hồ Chí Minh").toLowerCase(Locale.ROOT);
        String fromCode = depLower.contains("hà nội") ? (isFlight ? "HAN" : "HNO")
                : depLower.contains("đà nẵng") ? (isFlight ? "DAD" : "DNG")
                : (isFlight ? "SGN" : "HCM");

        String toCode = "DST";
        String carrier = isFlight ? "Vietnam Airlines" : "Xe Limousine / Universe VIP";
        String baggage = isFlight ? "07kg xách tay + 23kg hành lý ký gửi khứ hồi" : "Hành lý khoang xe tiêu chuẩn 25kg/khách";

        if (combined.contains("hàn quốc") || combined.contains("seoul")) {
            toCode = "ICN";
        } else if (combined.contains("nhật bản") || combined.contains("tokyo")) {
            toCode = "NRT";
        } else if (combined.contains("thái lan") || combined.contains("bangkok")) {
            toCode = "BKK";
            carrier = "Vietjet Air";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("singapore") || combined.contains("malaysia")) {
            toCode = "SIN";
        } else if (combined.contains("bali") || combined.contains("indonesia")) {
            toCode = "DPS";
            carrier = "Vietjet Air";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("ân thi") || combined.contains("phượng hoàng")) {
            toCode = "ENH";
            carrier = "Vietjet Air Charter";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("thượng hải") || combined.contains("ô trấn")) {
            toCode = "PVG";
        } else if (combined.contains("đà nẵng") || combined.contains("hội an")) {
            toCode = "DAD";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("phú quốc")) {
            toCode = "PQC";
            carrier = "Vietjet Air";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("phú yên") || combined.contains("quy nhơn")) {
            toCode = "TBB";
            baggage = "07kg xách tay + 20kg hành lý ký gửi khứ hồi";
        } else if (combined.contains("hà nội") || combined.contains("sa pa") || combined.contains("hà giang")) {
            toCode = "HAN";
        } else if (combined.contains("đà lạt")) {
            toCode = "DLI";
        } else if (combined.contains("miền tây") || combined.contains("cần thơ")) {
            toCode = "VCA";
        } else if (combined.contains("nam du")) {
            toCode = "NDU";
            carrier = "Xe giường nằm + Tàu cao tốc Superdong";
        } else if (combined.contains("châu đốc") || combined.contains("an giang")) {
            toCode = "AGI";
        } else if (combined.contains("vũng tàu")) {
            toCode = "VTU";
        } else if (combined.contains("chứa chan") || combined.contains("gia lào")) {
            toCode = "DNB";
        }

        String meetingPoint = isFlight
                ? (isInternational
                    ? "Cột số 10 – Ga đi Quốc tế Sân bay Tân Sơn Nhất trước giờ bay 03 tiếng"
                    : "Cột số 05 – Ga đi Quốc nội Sân bay Tân Sơn Nhất trước giờ bay 02 tiếng")
                : "Văn phòng SmartTravel – 190 Pasteur, Quận 3, TP.HCM trước giờ khởi hành 45 phút";

        return new String[]{
                isFlight ? "FLIGHT" : "LAND_SEA",
                fromCode,
                toCode,
                carrier,
                baggage,
                meetingPoint
        };
    }
}
