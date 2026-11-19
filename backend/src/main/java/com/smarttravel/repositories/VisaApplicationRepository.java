package com.smarttravel.repositories;

import com.smarttravel.entities.VisaApplication;
import com.smarttravel.enums.VisaApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface VisaApplicationRepository extends JpaRepository<VisaApplication, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.tour", "booking.user"})
    Optional<VisaApplication> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.tour", "booking.user"})
    List<VisaApplication> findByBookingTourVendorIdOrderByCreatedAtDesc(Long vendorId);

    @EntityGraph(attributePaths = {"booking", "booking.tour", "booking.user"})
    List<VisaApplication> findAllByOrderByCreatedAtDesc();

    List<VisaApplication> findByStatusInAndCompletedAtBefore(Collection<VisaApplicationStatus> statuses, LocalDateTime cutoff);
}
