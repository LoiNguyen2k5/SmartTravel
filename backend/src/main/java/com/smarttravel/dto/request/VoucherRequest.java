package com.smarttravel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    @NotBlank(message = "Tiêu đề voucher không được để trống")
    private String title;

    private String description;

    @Min(value = 1, message = "% giảm giá từ 1 đến 100")
    @Max(value = 100, message = "% giảm giá từ 1 đến 100")
    private Integer discountPercent;

    @Min(value = 0, message = "Số tiền giảm giá không được âm")
    private BigDecimal discountAmount;

    @Min(value = 0, message = "Mức giảm tối đa không được âm")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Giá trị đơn tối thiểu không được để trống")
    @Min(value = 0, message = "Giá trị đơn tối thiểu không được âm")
    private BigDecimal minOrderValue;

    @Min(value = 1, message = "Giới hạn sử dụng tối thiểu là 1")
    private Integer usageLimit;

    private LocalDate startDate;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDate expiryDate;

    private Boolean active;
}
