package com.smarttravel.repositories;

import com.smarttravel.entities.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByItineraryIdOrderByDayNumberAsc(Long itineraryId);
}
