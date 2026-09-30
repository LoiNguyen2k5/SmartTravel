package com.smarttravel.repositories;

import com.smarttravel.entities.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;


public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByItineraryDayIdOrderBySortOrderAsc(Long itineraryDayId);
}
