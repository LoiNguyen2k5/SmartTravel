package com.smarttravel.repositories;

import com.smarttravel.entities.VisaRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface VisaRequirementRepository extends JpaRepository<VisaRequirement, Long> {
    List<VisaRequirement> findByTourIdOrderByIdAsc(Long tourId);
    boolean existsByTourId(Long tourId);

    @Query("SELECT DISTINCT vr.tour.id FROM VisaRequirement vr WHERE vr.tour.id IN :tourIds")
    Set<Long> findTourIdsWithCustomRequirements(@Param("tourIds") Collection<Long> tourIds);

    void deleteByTourId(Long tourId);
}
