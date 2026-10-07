package com.smarttravel.repositories;

import com.smarttravel.entities.User;
import com.smarttravel.entities.VendorApplication;
import com.smarttravel.enums.VendorApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorApplicationRepository extends JpaRepository<VendorApplication, Long> {
    Optional<VendorApplication> findTopByUserOrderByCreatedAtDesc(User user);
    List<VendorApplication> findByUserOrderByCreatedAtDesc(User user);
    List<VendorApplication> findByStatusOrderByCreatedAtDesc(VendorApplicationStatus status);
    List<VendorApplication> findAllByOrderByCreatedAtDesc();
    boolean existsByUserAndStatus(User user, VendorApplicationStatus status);
}
