package com.smarttravel.controllers;

import com.smarttravel.dto.request.TourModerationRequest;
import com.smarttravel.dto.response.*;
import com.smarttravel.enums.TourStatus;
import com.smarttravel.services.AdminService;
import com.smarttravel.services.BookingService;
import com.smarttravel.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Portal", description = "APIs quản trị hệ thống toàn diện dành cho Admin")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final AdminService adminService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy dữ liệu thống kê tổng thể Dashboard & Analytics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardAnalytics()));
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy toàn bộ danh sách người dùng")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản người dùng (Blacklist/Active)")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean enabled
    ) {
        UserResponse response = adminService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái người dùng thành công", response));
    }

    @GetMapping("/tours")
    @Operation(summary = "Lấy danh sách Tour theo trạng thái phục vụ kiểm duyệt")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getTours(
            @RequestParam(required = false) TourStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllToursForAdmin(status)));
    }

    @PutMapping("/tours/{id}/moderation")
    @Operation(summary = "Kiểm duyệt Tour của Vendor (Phê duyệt / Từ chối)")
    public ResponseEntity<ApiResponse<TourResponse>> moderateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourModerationRequest request
    ) {
        TourResponse response = adminService.moderateTour(id, request);
        return ResponseEntity.ok(ApiResponse.success("Kiểm duyệt Tour thành công", response));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Lấy toàn bộ danh sách đặt tour toàn sàn")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }

    @GetMapping("/payments")
    @Operation(summary = "Theo dõi danh sách giao dịch thanh toán toàn sàn")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllPayments()));
    }

    @GetMapping("/settlements")
    @Operation(summary = "Đối soát doanh thu và phí hoa hồng của các Vendor")
    public ResponseEntity<ApiResponse<List<VendorSettlementResponse>>> getVendorSettlements() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getVendorSettlements()));
    }
}
