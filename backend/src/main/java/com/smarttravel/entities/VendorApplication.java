package com.smarttravel.entities;

import com.smarttravel.enums.VendorApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(name = "tax_code", nullable = false, length = 50)
    private String taxCode;

    @Column(name = "business_address", nullable = false, length = 255)
    private String businessAddress;

    @Column(name = "hotline", nullable = false, length = 20)
    private String hotline;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "representative_name", nullable = false, length = 100)
    private String representativeName;

    @Column(name = "business_license_url", columnDefinition = "LONGTEXT", nullable = false)
    private String businessLicenseUrl;

    @Column(name = "id_card_front_url", columnDefinition = "LONGTEXT", nullable = false)
    private String idCardFrontUrl;

    @Column(name = "id_card_back_url", columnDefinition = "LONGTEXT")
    private String idCardBackUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private VendorApplicationStatus status = VendorApplicationStatus.PENDING_REVIEW;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
