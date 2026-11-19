package com.smarttravel.repositories;

import com.smarttravel.entities.VisaStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisaStatusLogRepository extends JpaRepository<VisaStatusLog, Long> {
    List<VisaStatusLog> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
}
