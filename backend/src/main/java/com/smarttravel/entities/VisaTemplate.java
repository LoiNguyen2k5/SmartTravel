package com.smarttravel.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visa_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisaTemplate extends BaseEntity {

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "country_code", nullable = false, length = 20)
    private String countryCode;

    @Column(name = "flag_emoji", length = 20)
    @Builder.Default
    private String flagEmoji = "🌍";

    @Column(name = "processing_days", nullable = false)
    @Builder.Default
    private Integer processingDays = 7;

    @Column(name = "buffer_days", nullable = false)
    @Builder.Default
    private Integer bufferDays = 3;

    @Column(name = "visa_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal visaFee = BigDecimal.ZERO;

    @Column(name = "consular_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal consularFee = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<VisaTemplateDocument> documents = new ArrayList<>();
}
