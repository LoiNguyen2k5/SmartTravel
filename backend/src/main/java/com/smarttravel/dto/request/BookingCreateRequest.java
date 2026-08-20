package com.smarttravel.dto.request;

import com.smarttravel.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {
    @NotNull
    private Long tourId;
    private Long tourScheduleId;
    @NotNull
    @Min(1)
    private Integer numberOfAdults;
    private Integer numberOfChildren = 0;
    private LocalDate departureDate;
    private PaymentMethod paymentMethod;
    private String voucherCode;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String note;
}
