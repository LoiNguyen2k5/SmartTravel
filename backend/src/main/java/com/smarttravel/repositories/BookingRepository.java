package com.smarttravel.repositories;

import com.smarttravel.entities.Booking;
import com.smarttravel.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByTourVendorId(Long vendorId);
    Optional<Booking> findByBookingCode(String bookingCode);
    boolean existsByUserIdAndTourIdAndStatus(Long userId, Long tourId, BookingStatus status);
    long countByStatus(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime dateTime);
}
