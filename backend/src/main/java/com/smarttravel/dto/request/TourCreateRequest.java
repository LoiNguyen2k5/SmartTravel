package com.smarttravel.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourCreateRequest {

    @NotBlank(message = "Tên tour không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Giá tour không được để trống")
    @Min(value = 0, message = "Giá tour phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Số ngày tour không được để trống")
    @Min(value = 1, message = "Số ngày tour tối thiểu là 1")
    private Integer durationDays;

    @NotNull(message = "Số đêm tour không được để trống")
    @Min(value = 0, message = "Số đêm tour tối thiểu là 0")
    private Integer durationNights;

    @NotBlank(message = "Điểm khởi hành không được để trống")
    private String departureLocation;

    private String thumbnailUrl;

    private Long destinationId;
}
