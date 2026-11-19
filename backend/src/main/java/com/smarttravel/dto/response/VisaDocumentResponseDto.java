package com.smarttravel.dto.response;

import com.smarttravel.enums.VisaDocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaDocumentResponseDto {
    private Long id;
    private Long requirementId;
    private String documentName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String fileUrl;
    private Boolean hasFile;
    private Boolean filePurged;
    private VisaDocumentStatus status;
    private String vendorFeedback;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
}
