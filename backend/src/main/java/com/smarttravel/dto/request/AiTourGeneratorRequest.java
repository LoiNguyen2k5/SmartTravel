package com.smarttravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTourGeneratorRequest {

    @NotBlank(message = "Tên địa danh hoặc điểm đến không được để trống")
    private String destination;

    private Integer durationDays;
    private Integer durationNights;
    private String category; // "DOMESTIC" hoặc "NUOC_NGOAI"
    private String departureLocation;
    private String highlightKeywords;
    private String targetAudience;
}
