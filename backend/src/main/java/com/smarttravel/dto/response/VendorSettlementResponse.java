package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorSettlementResponse {

    private Long vendorId;
    private String vendorName;
    private String vendorEmail;
    private String vendorPhone;
    private long totalTours;
    private long totalBookings;
    private BigDecimal totalGrossRevenue;
    private Double commissionRate;
    private BigDecimal platformFee;
    private BigDecimal netPayout;
    private String settlementStatus; // "PENDING", "SETTLED"
}
