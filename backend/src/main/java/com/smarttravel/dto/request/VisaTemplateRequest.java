package com.smarttravel.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaTemplateRequest {

    @NotBlank(message = "Tên quốc gia không được để trống")
    private String country;

    @NotBlank(message = "Mã quốc gia không được để trống")
    private String countryCode;

    private String flagEmoji;

    @Min(1)
    @Builder.Default
    private Integer processingDays = 7;

    @Min(0)
    @Builder.Default
    private Integer bufferDays = 3;

    @Min(0)
    @Builder.Default
    private BigDecimal visaFee = BigDecimal.ZERO;

    @Min(0)
    @Builder.Default
    private BigDecimal consularFee = BigDecimal.ZERO;

    private String notes;

    @Builder.Default
    private List<VisaRequirementRequestDto> documents = new ArrayList<>();
}
