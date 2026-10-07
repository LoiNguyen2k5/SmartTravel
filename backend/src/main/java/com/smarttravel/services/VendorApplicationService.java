package com.smarttravel.services;

import com.smarttravel.dto.request.VendorApplicationRequest;
import com.smarttravel.dto.request.VendorApplicationReviewRequest;
import com.smarttravel.dto.response.VendorApplicationResponse;
import com.smarttravel.enums.VendorApplicationStatus;

import java.util.List;

public interface VendorApplicationService {
    VendorApplicationResponse submitApplication(VendorApplicationRequest request, String userEmail);
    VendorApplicationResponse getMyApplication(String userEmail);
    List<VendorApplicationResponse> getAllApplications(VendorApplicationStatus status);
    VendorApplicationResponse getApplicationById(Long id);
    VendorApplicationResponse reviewApplication(Long applicationId, VendorApplicationReviewRequest request, String adminEmail);
    VendorApplicationResponse revokeVendor(Long applicationId, String adminEmail);
}
