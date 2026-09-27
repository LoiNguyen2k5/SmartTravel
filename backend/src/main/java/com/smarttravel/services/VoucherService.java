package com.smarttravel.services;

import com.smarttravel.dto.request.VoucherRequest;
import com.smarttravel.dto.response.VoucherResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface VoucherService {
    List<VoucherResponse> getAllVouchers();
    List<VoucherResponse> getActiveVouchers();
    VoucherResponse getVoucherById(Long id);
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(Long id, VoucherRequest request);
    VoucherResponse toggleVoucherActive(Long id);
    void deleteVoucher(Long id);
    Map<String, Object> validateAndCalculateVoucher(String code, BigDecimal originalTotal);
    void incrementUsedCount(String code);
}
