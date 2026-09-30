package com.smarttravel.repositories;

import com.smarttravel.entities.Destination;
import org.springframework.data.jpa.repository.JpaRepository;



public interface DestinationRepository extends JpaRepository<Destination, Long> {
}
