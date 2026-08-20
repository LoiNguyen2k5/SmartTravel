package com.smarttravel.controllers;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.services.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management", description = "APIs đặt tour du lịch và quản lý đơn hàng")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Tạo đơn đặt tour mới")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Đặt tour thành công", booking));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Lấy lịch sử đặt tour của tôi")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        List<BookingResponse> bookings = bookingService.getMyBookings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn đặt tour")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.getBookingById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn đặt tour")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn thành công", booking));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn đặt tour")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam com.smarttravel.enums.BookingStatus status) {
        BookingResponse booking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", booking));
    }

    @PostMapping("/validate-voucher")
    @Operation(summary = "Kiểm tra mã giảm giá và tính tiền giảm")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateVoucher(
            @RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        BigDecimal originalTotal = new BigDecimal(payload.get("originalTotal").toString());
        BigDecimal discount = bookingService.validateAndCalculateVoucher(code, originalTotal);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "voucherCode", code,
                "discountAmount", discount,
                "finalTotal", originalTotal.subtract(discount)
        )));
    }
}
