package com.smarttravel.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "visa_template_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisaTemplateDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private VisaTemplate template;

    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_mandatory", nullable = false)
    @Builder.Default
    private Boolean isMandatory = true;
}
