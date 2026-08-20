package com.smarttravel.dto.request;

import com.smarttravel.enums.ItineraryVisibility;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryCreateRequest {
    @NotBlank
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal estimatedBudget;
    private ItineraryVisibility visibility = ItineraryVisibility.PRIVATE;
}
