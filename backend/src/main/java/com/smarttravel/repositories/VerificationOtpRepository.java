package com.smarttravel.repositories;

import com.smarttravel.entities.VerificationOtp;
import com.smarttravel.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface VerificationOtpRepository extends JpaRepository<VerificationOtp, Long> {

    Optional<VerificationOtp> findFirstByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(String email, OtpType type);

    void deleteByEmailAndType(String email, OtpType type);
}
