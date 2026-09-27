package com.smarttravel.dto.response;

import com.smarttravel.entities.Voucher;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {

    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VoucherResponse fromEntity(Voucher v) {
        if (v == null) return null;
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .title(v.getTitle())
                .description(v.getDescription())
                .discountPercent(v.getDiscountPercent())
                .discountAmount(v.getDiscountAmount())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .minOrderValue(v.getMinOrderValue())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .startDate(v.getStartDate())
                .expiryDate(v.getExpiryDate())
                .active(v.getActive())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
