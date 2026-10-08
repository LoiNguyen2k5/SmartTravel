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
public class AiTourSummaryDto {
    private Long id;
    private String title;
    private String tourCode;
    private BigDecimal price;
    private String departureLocation;
    private Integer durationDays;
    private String thumbnailUrl;
}
