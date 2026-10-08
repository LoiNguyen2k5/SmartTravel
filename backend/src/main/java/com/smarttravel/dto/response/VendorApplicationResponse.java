package com.smarttravel.dto.response;

import com.smarttravel.enums.VendorApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorApplicationResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String userPhone;
    private String businessName;
    private String taxCode;
    private String businessAddress;
    private String hotline;
    private String contactEmail;
    private String website;
    private String description;
    private String representativeName;
    private String businessLicenseUrl;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private VendorApplicationStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
