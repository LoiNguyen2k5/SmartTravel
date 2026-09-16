package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long totalVendors;
    private long totalCustomers;
    private long totalActiveTours;
    private long totalPendingTours;
    private long totalBookings;
    private long successfulBookings;
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalPlatformCommission;
    private Double defaultCommissionRate;

    // Monthly revenue trend (e.g., {"2026-01": 15000000, "2026-02": 25000000})
    private Map<String, BigDecimal> monthlyRevenue;

    // Top trending destinations by booking/tour count
    private List<Map<String, Object>> topDestinations;

    // Recent 5-10 bookings for quick glance
    private List<BookingResponse> recentBookings;
}
