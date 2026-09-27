package com.smarttravel.controllers;

import com.smarttravel.dto.request.VoucherRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.VoucherResponse;
import com.smarttravel.services.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Voucher Management", description = "APIs quản trị chương trình khuyến mãi và mã giảm giá toàn sàn dành cho Admin")
public class AdminVoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách mã giảm giá")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getAllVouchers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết mã giảm giá theo ID")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getVoucherById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới chương trình khuyến mãi / mã giảm giá")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherResponse created = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo mã giảm giá thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật mã giảm giá")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request) {
        VoucherResponse updated = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", updated));
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Bật / Tắt trạng thái kích hoạt của mã giảm giá")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleActive(@PathVariable Long id) {
        VoucherResponse toggled = voucherService.toggleVoucherActive(id);
        String msg = Boolean.TRUE.equals(toggled.getActive()) ? "Đã kích hoạt mã giảm giá" : "Đã tạm dừng mã giảm giá";
        return ResponseEntity.ok(ApiResponse.success(msg, toggled));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mã giảm giá")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
    }
}
