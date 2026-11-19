package com.smarttravel.repositories;

import com.smarttravel.entities.VisaTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VisaTemplateRepository extends JpaRepository<VisaTemplate, Long> {

    @Query("SELECT vt FROM VisaTemplate vt WHERE vt.vendor IS NULL OR vt.vendor.id = :vendorId ORDER BY vt.country ASC")
    List<VisaTemplate> findAvailableForVendor(@Param("vendorId") Long vendorId);

    List<VisaTemplate> findAllByOrderByCountryAsc();
}
