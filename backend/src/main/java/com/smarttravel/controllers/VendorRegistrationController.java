package com.smarttravel.controllers;

import com.smarttravel.dto.request.VendorApplicationRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.VendorApplicationResponse;
import com.smarttravel.services.VendorApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vendor-applications")
@RequiredArgsConstructor
@Tag(name = "Vendor Registration", description = "APIs dành cho khách hàng nộp hồ sơ đăng ký trở thành đối tác bán tour (Vendor)")
public class VendorRegistrationController {

    private final VendorApplicationService vendorApplicationService;

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Khách hàng nộp hồ sơ đăng ký đại lý bán tour (Vendor Application)")
    public ResponseEntity<ApiResponse<VendorApplicationResponse>> submitApplication(
            @Valid @RequestBody VendorApplicationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        VendorApplicationResponse response = vendorApplicationService.submitApplication(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Nộp hồ sơ đăng ký đối tác thành công. Vui lòng chờ Ban Quản Trị xét duyệt.", response));
    }

    @GetMapping("/my-status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Kiểm tra trạng thái hồ sơ đăng ký của người dùng hiện tại")
    public ResponseEntity<ApiResponse<VendorApplicationResponse>> getMyApplication(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        VendorApplicationResponse response = vendorApplicationService.getMyApplication(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
