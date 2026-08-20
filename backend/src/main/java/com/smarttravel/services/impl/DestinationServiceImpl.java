package com.smarttravel.services.impl;

import com.smarttravel.entities.Destination;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.DestinationRepository;
import com.smarttravel.services.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;

    @Override
    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    @Override
    public Destination getDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", "id", id));
    }

    @Override
    public Destination createDestination(Destination destination) {
        return destinationRepository.save(destination);
    }
}
