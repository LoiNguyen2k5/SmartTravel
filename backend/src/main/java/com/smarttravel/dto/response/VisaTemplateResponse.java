package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaTemplateResponse {
    private Long id;
    private String country;
    private String countryCode;
    private String flagEmoji;
    private Integer processingDays;
    private Integer bufferDays;
    private BigDecimal visaFee;
    private BigDecimal consularFee;
    private String notes;
    private Long vendorId;
    private Boolean isSystemDefault;
    private Long tourCount;
    private List<VisaTemplateDocumentDto> documents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisaTemplateDocumentDto {
        private Long id;
        private String documentName;
        private String description;
        private Boolean isMandatory;
    }
}
