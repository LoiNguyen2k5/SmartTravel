package com.smarttravel.dto.response;

import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal childPrice;
    private Integer durationDays;
    private Integer durationNights;
    private String departureLocation;
    private String thumbnailUrl;
    private List<String> gallery;
    private String tourCode;
    private TourCategory category;
    private String includedServices;
    private String excludedServices;
    private String cancellationPolicy;
    private String itineraryDetails;
    private Integer remainingSeats;
    private Integer viewCount;
    private TourStatus status;
    private Long vendorId;
    private String vendorName;
    private Long destinationId;
    private String destinationName;
    private String destinationCountry;
    private Long visaTemplateId;
    private String visaCountry;
    private Boolean requiresVisa;
    private BigDecimal visaFee;
    private BigDecimal consularFee;
    private Integer visaProcessingDays;
    private Integer visaBufferDays;
    private Double averageRating;
    private Integer totalReviews;
    private Map<Integer, Long> ratingBreakdown;
    private String transportMode;
    private String fromTerminalCode;
    private String toTerminalCode;
    private String airlineCarrier;
    private String baggageAllowance;
    private String airportMeetingPoint;
}
