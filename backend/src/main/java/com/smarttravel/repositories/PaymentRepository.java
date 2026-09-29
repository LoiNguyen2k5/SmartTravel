package com.smarttravel.repositories;

import com.smarttravel.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByTransactionId(String transactionId);
    java.util.List<Payment> findAllByOrderByCreatedAtDesc();
}
