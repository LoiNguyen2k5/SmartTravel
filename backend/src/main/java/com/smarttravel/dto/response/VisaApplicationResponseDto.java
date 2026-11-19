package com.smarttravel.dto.response;

import com.smarttravel.enums.VisaApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaApplicationResponseDto {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private Long tourId;
    private String tourTitle;
    private LocalDate departureDate;
    private LocalDate visaDeadline;
    private Long templateId;
    private String country;
    private Integer processingDays;
    private Integer bufferDays;
    private BigDecimal visaFee;
    private BigDecimal consularFee;
    private String customerName;
    private String contactEmail;
    private String contactPhone;
    private VisaApplicationStatus status;
    private String notes;
    private String embassyReceiptCode;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;
    private List<VisaDocumentResponseDto> documents;
    private List<VisaStatusLogDto> statusLogs;
}
