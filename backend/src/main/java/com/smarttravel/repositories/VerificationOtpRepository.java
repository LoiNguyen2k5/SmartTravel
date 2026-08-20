package com.smarttravel.repositories;

import com.smarttravel.entities.VerificationOtp;
import com.smarttravel.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationOtpRepository extends JpaRepository<VerificationOtp, Long> {

    Optional<VerificationOtp> findFirstByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(String email, OtpType type);

    void deleteByEmailAndType(String email, OtpType type);
}
