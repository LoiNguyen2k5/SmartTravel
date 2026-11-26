package com.smarttravel.dto.response;

import com.smarttravel.enums.BookingStatus;
import com.smarttravel.enums.TourCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private TourCategory tourCategory;
    private Integer durationDays;
    private Integer durationNights;
    private String departureLocation;
    private LocalDate departureDate;
    private Long tourScheduleId;
    private LocalDate endDate;
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
    private Long vendorId;
    private String vendorName;
    private String qrCodeUrl;
    private Boolean isDeposit;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private String notes;
    private Boolean requiresVisa;
    private Boolean visaOptIn;
    private BigDecimal visaFee;
    private BigDecimal consularFee;
    private LocalDate visaDeadline;
    private LocalDateTime createdAt;
}
