package com.smarttravel.dto.response;

import com.smarttravel.enums.ActivityCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItemDto {
    private Long id;
    private Long dayId;
    private String activityName;
    private String startTime;
    private String endTime;
    private BigDecimal estimatedCost;
    private ActivityCategory category;
    private Double latitude;
    private Double longitude;
    private String notes;
    private Integer sortOrder;
}
