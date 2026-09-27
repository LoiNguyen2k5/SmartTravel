package com.smarttravel.controllers;

import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.VoucherResponse;
import com.smarttravel.services.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
@Tag(name = "Public Vouchers", description = "APIs xem danh sách mã khuyến mãi khả dụng và kiểm tra mã giảm giá")
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách các mã khuyến mãi đang có hiệu lực để khách hàng lựa chọn")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAvailableVouchers() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getActiveVouchers()));
    }

    @PostMapping("/validate")
    @Operation(summary = "Kiểm tra tính hợp lệ và tính toán số tiền giảm giá của mã voucher")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateVoucher(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) BigDecimal originalTotal,
            @RequestBody(required = false) Map<String, Object> body) {
        
        String inputCode = code;
        BigDecimal inputTotal = originalTotal;

        if (body != null) {
            if (inputCode == null && body.containsKey("code")) {
                inputCode = String.valueOf(body.get("code"));
            }
            if (inputTotal == null && body.containsKey("originalTotal")) {
                inputTotal = new BigDecimal(String.valueOf(body.get("originalTotal")));
            }
        }

        Map<String, Object> result = voucherService.validateAndCalculateVoucher(inputCode, inputTotal);
        return ResponseEntity.ok(ApiResponse.success("Mã giảm giá hợp lệ", result));
    }
}
