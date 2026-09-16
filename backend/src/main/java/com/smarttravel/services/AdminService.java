package com.smarttravel.services;

import com.smarttravel.dto.request.TourModerationRequest;
import com.smarttravel.dto.response.AdminStatsResponse;
import com.smarttravel.dto.response.PaymentResponse;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.dto.response.VendorSettlementResponse;
import com.smarttravel.enums.TourStatus;

import java.util.List;

public interface AdminService {
    AdminStatsResponse getDashboardAnalytics();
    UserResponse toggleUserStatus(Long userId, Boolean enabled);
    TourResponse moderateTour(Long tourId, TourModerationRequest request);
    List<TourResponse> getAllToursForAdmin(TourStatus status);
    List<PaymentResponse> getAllPayments();
    List<VendorSettlementResponse> getVendorSettlements();
}
