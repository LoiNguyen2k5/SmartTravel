package com.smarttravel.repositories;

import com.smarttravel.entities.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByUserId(Long userId);
    Optional<Itinerary> findByShareToken(String shareToken);
}
