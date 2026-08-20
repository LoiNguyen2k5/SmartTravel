package com.smarttravel.services;

import com.smarttravel.entities.Destination;

import java.util.List;

public interface DestinationService {
    List<Destination> getAllDestinations();
    Destination getDestinationById(Long id);
    Destination createDestination(Destination destination);
}
