package com.smarttravel.services.impl;

import com.smarttravel.entities.Booking;
import com.smarttravel.entities.Tour;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.TourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled Task phục vụ Use Case UC_HoldSlot:
 * Tự động quét và giải phóng (hoàn trả) số slot chỗ của Tour
 * khi đơn đặt tour PENDING vượt quá thời gian giữ chỗ (3 phút).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingCleanupScheduler {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;

    // Thời gian hết hạn giữ chỗ (3 phút = 180 giây)
    private static final int HOLD_SLOT_TIMEOUT_MINUTES = 3;

    @Scheduled(fixedDelay = 20000) // Tự động quét mỗi 20 giây
    @Transactional
    public void releaseExpiredPendingBookings() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(HOLD_SLOT_TIMEOUT_MINUTES);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING, expirationThreshold);

        if (expiredBookings == null || expiredBookings.isEmpty()) {
            return;
        }

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.CANCELLED);

            Tour tour = booking.getTour();
            int seatsToRestore = 0;
            if (tour != null) {
                int numAdults = booking.getNumberOfAdults() != null ? booking.getNumberOfAdults() : 0;
                int numChildren = booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0;
                seatsToRestore = numAdults + numChildren;

                if (tour.getRemainingSeats() != null) {
                    tour.setRemainingSeats(tour.getRemainingSeats() + seatsToRestore);
                    tourRepository.save(tour);
                }
            }

            bookingRepository.save(booking);

            log.info("⏰ [UC_HoldSlot - Hết hạn 3 phút] Đơn hàng {} đã quá hạn thanh toán. Đã chuyển trạng thái sang CANCELLED và tự động hoàn trả {} slot chỗ cho tour ID {}.",
                    booking.getBookingCode(),
                    seatsToRestore,
                    tour != null ? tour.getId() : "N/A");
        }
    }
}
