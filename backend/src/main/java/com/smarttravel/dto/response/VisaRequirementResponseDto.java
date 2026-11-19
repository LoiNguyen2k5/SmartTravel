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
public class VisaRequirementResponseDto {
    private Long id;
    private Long tourId;
    private String documentName;
    private String description;
    private Boolean isMandatory;
    private BigDecimal visaFee;
    private BigDecimal consularFee;
    private Integer processingDays;
    private Integer bufferDays;
}
