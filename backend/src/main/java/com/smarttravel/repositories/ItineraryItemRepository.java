package com.smarttravel.repositories;

import com.smarttravel.entities.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByItineraryDayIdOrderBySortOrderAsc(Long itineraryDayId);
}
