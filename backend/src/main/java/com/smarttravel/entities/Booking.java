package com.smarttravel.entities;

import com.smarttravel.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_schedule_id")
    private TourSchedule tourSchedule;

    @Column(name = "num_adults", nullable = false)
    private Integer numberOfAdults;

    @Column(name = "num_children", nullable = false)
    @Builder.Default
    private Integer numberOfChildren = 0;

    @Column(name = "adult_price", precision = 12, scale = 2)
    private BigDecimal adultPrice;

    @Column(name = "child_price", precision = 12, scale = 2)
    private BigDecimal childPrice;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "qr_code_url", columnDefinition = "TEXT")
    private String qrCodeUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "single_room_surcharge")
    @Builder.Default
    private Boolean singleRoomSurcharge = false;

    @Column(name = "single_room_surcharge_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal singleRoomSurchargeAmount = BigDecimal.ZERO;

    @Column(name = "room_allocation", length = 255)
    private String roomAllocation;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;
}
