package com.smarttravel.services.impl;

import com.smarttravel.dto.request.VoucherRequest;
import com.smarttravel.dto.response.VoucherResponse;
import com.smarttravel.entities.Voucher;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.VoucherRepository;
import com.smarttravel.services.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(VoucherResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getActiveVouchers() {
        LocalDate today = LocalDate.now();
        return voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(v -> v.getExpiryDate() == null || !today.isAfter(v.getExpiryDate()))
                .filter(v -> v.getStartDate() == null || !today.isBefore(v.getStartDate()))
                .filter(v -> v.getUsageLimit() == null || v.getUsedCount() < v.getUsageLimit())
                .map(VoucherResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));
        return VoucherResponse.fromEntity(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException("Mã giảm giá '" + normalizedCode + "' đã tồn tại trên hệ thống");
        }

        validateDiscountType(request);

        Voucher voucher = Voucher.builder()
                .code(normalizedCode)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .discountPercent(request.getDiscountPercent())
                .discountAmount(request.getDiscountAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 1000)
                .usedCount(0)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .expiryDate(request.getExpiryDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Voucher saved = voucherRepository.save(voucher);
        log.info("Created voucher: {}", saved.getCode());
        return VoucherResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (!voucher.getCode().equalsIgnoreCase(normalizedCode) && voucherRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException("Mã giảm giá '" + normalizedCode + "' đã được sử dụng");
        }

        validateDiscountType(request);

        voucher.setCode(normalizedCode);
        voucher.setTitle(request.getTitle().trim());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountPercent(request.getDiscountPercent());
        voucher.setDiscountAmount(request.getDiscountAmount());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        if (request.getUsageLimit() != null) {
            voucher.setUsageLimit(request.getUsageLimit());
        }
        if (request.getStartDate() != null) {
            voucher.setStartDate(request.getStartDate());
        }
        voucher.setExpiryDate(request.getExpiryDate());
        if (request.getActive() != null) {
            voucher.setActive(request.getActive());
        }

        Voucher updated = voucherRepository.save(voucher);
        log.info("Updated voucher: {}", updated.getCode());
        return VoucherResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public VoucherResponse toggleVoucherActive(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));
        voucher.setActive(!Boolean.TRUE.equals(voucher.getActive()));
        Voucher saved = voucherRepository.save(voucher);
        log.info("Toggled voucher {} active state to: {}", saved.getCode(), saved.getActive());
        return VoucherResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));
        voucherRepository.delete(voucher);
        log.info("Deleted voucher: {}", voucher.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> validateAndCalculateVoucher(String code, BigDecimal originalTotal) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Vui lòng cung cấp mã giảm giá.");
        }
        if (originalTotal == null || originalTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá trị đơn hàng không hợp lệ.");
        }

        String normalizedCode = code.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeAndActiveTrue(normalizedCode)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá '" + normalizedCode + "' không tồn tại hoặc đã bị vô hiệu hóa."));

        LocalDate today = LocalDate.now();
        if (voucher.getStartDate() != null && today.isBefore(voucher.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến ngày áp dụng (bắt đầu từ: " + voucher.getStartDate() + ").");
        }

        if (voucher.getExpiryDate() != null && today.isAfter(voucher.getExpiryDate())) {
            throw new BadRequestException("Mã giảm giá '" + normalizedCode + "' đã hết hạn vào ngày " + voucher.getExpiryDate() + ".");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá '" + normalizedCode + "' đã hết số lượt sử dụng tối đa.");
        }

        if (voucher.getMinOrderValue() != null && originalTotal.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderValue().longValue() + "đ để áp dụng mã này.");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (voucher.getDiscountPercent() != null && voucher.getDiscountPercent() > 0) {
            discount = originalTotal.multiply(BigDecimal.valueOf(voucher.getDiscountPercent())).divide(BigDecimal.valueOf(100));
            if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                if (discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                    discount = voucher.getMaxDiscountAmount();
                }
            }
        } else if (voucher.getDiscountAmount() != null && voucher.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discount = voucher.getDiscountAmount();
            if (discount.compareTo(originalTotal) > 0) {
                discount = originalTotal;
            }
        }

        BigDecimal finalTotal = originalTotal.subtract(discount).max(BigDecimal.ZERO);

        Map<String, Object> result = new HashMap<>();
        result.put("voucherCode", voucher.getCode());
        result.put("title", voucher.getTitle());
        result.put("discountAmount", discount);
        result.put("finalTotal", finalTotal);
        result.put("message", "Áp dụng mã giảm giá thành công!");
        return result;
    }

    @Override
    @Transactional
    public void incrementUsedCount(String code) {
        if (code == null || code.trim().isEmpty()) return;
        voucherRepository.findByCodeIgnoreCase(code.trim()).ifPresent(v -> {
            v.setUsedCount((v.getUsedCount() != null ? v.getUsedCount() : 0) + 1);
            voucherRepository.save(v);
            log.info("Incremented usedCount for voucher: {}", v.getCode());
        });
    }

    private void validateDiscountType(VoucherRequest request) {
        boolean hasPercent = request.getDiscountPercent() != null && request.getDiscountPercent() > 0;
        boolean hasAmount = request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0;
        if (!hasPercent && !hasAmount) {
            throw new BadRequestException("Phải thiết lập ít nhất 1 loại giảm giá: % giảm giá hoặc Số tiền giảm giá cố định");
        }
    }
}
