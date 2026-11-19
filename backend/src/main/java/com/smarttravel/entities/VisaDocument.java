package com.smarttravel.entities;

import com.smarttravel.enums.VisaDocumentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visa_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisaDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private VisaApplication application;

    @Column(name = "requirement_id", nullable = false)
    private Long requirementId;

    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "stored_file_path", length = 500)
    private String storedFilePath;

    @Column(name = "file_purged", nullable = false)
    @Builder.Default
    private Boolean filePurged = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private VisaDocumentStatus status = VisaDocumentStatus.PENDING;

    @Column(name = "vendor_feedback", columnDefinition = "TEXT")
    private String vendorFeedback;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by", length = 150)
    private String reviewedBy;
}
