package com.smarttravel.repositories;

import com.smarttravel.entities.VisaRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisaRequirementRepository extends JpaRepository<VisaRequirement, Long> {
    List<VisaRequirement> findByTourIdOrderByIdAsc(Long tourId);
    boolean existsByTourId(Long tourId);
    void deleteByTourId(Long tourId);
}
