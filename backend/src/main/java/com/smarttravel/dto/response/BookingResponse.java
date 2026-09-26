package com.smarttravel.dto.response;

import com.smarttravel.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long tourId;
    private String tourTitle;
    private String tourThumbnailUrl;
    private String tourCode;
    private Integer durationDays;
    private Integer durationNights;
    private String departureLocation;
    private Long userId;
    private String userName;
    private Integer numberOfAdults;
    private Integer numberOfChildren;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private Boolean singleRoomSurcharge;
    private BigDecimal singleRoomSurchargeAmount;
    private String roomAllocation;
    private String qrCodeUrl;
    private LocalDateTime createdAt;
}
