package com.smarttravel.repositories;

import com.smarttravel.entities.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeAndActiveTrue(String code);
    Optional<Voucher> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    java.util.List<Voucher> findAllByActiveTrueOrderByCreatedAtDesc();
    java.util.List<Voucher> findAllByOrderByCreatedAtDesc();
}
