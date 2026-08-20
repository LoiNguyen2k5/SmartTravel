package com.smarttravel.controllers;

import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.services.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vendor")
@PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Vendor Portal", description = "APIs dành cho Nhà cung cấp Tour")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê bảng điều khiển Vendor")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVendorDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> stats = vendorService.getVendorDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/tours")
    @Operation(summary = "Lấy danh sách Tour do Vendor đăng tải")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getVendorTours(@AuthenticationPrincipal UserDetails userDetails) {
        List<TourResponse> tours = vendorService.getVendorTours(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(tours));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Lấy danh sách Đơn đặt tour thuộc quản lý của Vendor")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getVendorBookings(@AuthenticationPrincipal UserDetails userDetails) {
        List<BookingResponse> bookings = vendorService.getVendorBookings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
}
