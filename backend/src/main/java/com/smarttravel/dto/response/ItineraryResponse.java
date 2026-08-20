package com.smarttravel.dto.response;

import com.smarttravel.enums.ItineraryVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal estimatedBudget;
    private BigDecimal totalCost;
    private ItineraryVisibility visibility;
    private String shareToken;
    private Long userId;
    private String userName;
    private List<ItineraryDayDto> days;
}
