package com.smarttravel.controllers;

import com.smarttravel.dto.request.PaymentRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.PaymentResponse;
import com.smarttravel.services.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "APIs thanh toán trực tuyến cổng VNPay")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-vnpay")
    @Operation(summary = "Tạo URL thanh toán VNPay cho đơn đặt tour")
    public ResponseEntity<ApiResponse<PaymentResponse>> createVNPayPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PaymentResponse response = paymentService.createVNPayPayment(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tạo URL thanh toán VNPay thành công", response));
    }

    @GetMapping("/vnpay-callback")
    @Operation(summary = "Xử lý callback trả về từ cổng thanh toán VNPay")
    public ResponseEntity<ApiResponse<PaymentResponse>> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        PaymentResponse response = paymentService.processVNPayCallback(queryParams);
        return ResponseEntity.ok(ApiResponse.success("Xử lý thanh toán thành công", response));
    }

    @PostMapping(value = {"/sepay-webhook", "/webhook"})
    @Operation(summary = "Webhook tiếp nhận thông báo biến động số dư chuyển khoản thực tế (SePay / VietQR)")
    public ResponseEntity<Map<String, Object>> sepayWebhook(@RequestBody Map<String, Object> webhookData) {
        boolean processed = paymentService.processSepayWebhook(webhookData);
        Map<String, Object> response = new HashMap<>();
        response.put("success", processed);
        response.put("message", processed ? "Xử lý giao dịch thành công" : "Không tìm thấy mã đơn hàng hợp lệ");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-status/{bookingCode}")
    @Operation(summary = "Kiểm tra trạng thái thanh toán theo mã đơn hàng (phục vụ Polling tự động)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkStatus(@PathVariable String bookingCode) {
        Map<String, Object> status = paymentService.checkPaymentStatus(bookingCode);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/mark-paid/{bookingCode}")
    @Operation(summary = "Xác nhận đơn hàng đã thanh toán thành công (Test / Fallback)")
    public ResponseEntity<ApiResponse<Boolean>> markPaid(@PathVariable String bookingCode) {
        boolean ok = paymentService.markBookingAsPaid(bookingCode);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", ok));
    }
}

