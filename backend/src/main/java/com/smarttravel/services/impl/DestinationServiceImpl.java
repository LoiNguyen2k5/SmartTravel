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

    @Override
    public Destination updateDestination(Long id, Destination updated) {
        Destination destination = getDestinationById(id);
        destination.setName(updated.getName());
        destination.setDescription(updated.getDescription());
        destination.setCity(updated.getCity());
        destination.setCountry(updated.getCountry());
        destination.setImageUrl(updated.getImageUrl());
        destination.setLatitude(updated.getLatitude());
        destination.setLongitude(updated.getLongitude());
        return destinationRepository.save(destination);
    }

    @Override
    public void deleteDestination(Long id) {
        Destination destination = getDestinationById(id);
        destinationRepository.delete(destination);
    }
}
