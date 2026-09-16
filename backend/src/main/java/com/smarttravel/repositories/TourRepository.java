package com.smarttravel.repositories;

import com.smarttravel.entities.Tour;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByStatus(TourStatus status);
    List<Tour> findByVendorId(Long vendorId);
    long countByStatus(TourStatus status);

    @Query("SELECT t FROM Tour t WHERE t.status = 'ACTIVE' " +
           "AND (:departure IS NULL OR LOWER(t.departureLocation) LIKE LOWER(CONCAT('%', :departure, '%'))) " +
           "AND (:destination IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :destination, '%')) OR (t.destination IS NOT NULL AND LOWER(t.destination.name) LIKE LOWER(CONCAT('%', :destination, '%')))) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:minPrice IS NULL OR t.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR t.price <= :maxPrice) " +
           "AND (:maxDays IS NULL OR t.durationDays <= :maxDays) " +
           "AND (:minDays IS NULL OR t.durationDays >= :minDays)")
    List<Tour> searchTours(
            @Param("departure") String departure,
            @Param("destination") String destination,
            @Param("category") TourCategory category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minDays") Integer minDays,
            @Param("maxDays") Integer maxDays
    );
}
