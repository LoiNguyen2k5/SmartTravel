package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTourGeneratorResponse {
    private String title;
    private String tourCode;
    private String description;
    private BigDecimal suggestedPrice;
    private BigDecimal suggestedChildPrice;
    private String includedServices;
    private String excludedServices;
    private String cancellationPolicy;
    private String itineraryDetails;
}
