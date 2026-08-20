package com.smarttravel.services;

import com.smarttravel.dto.request.ItineraryCreateRequest;
import com.smarttravel.dto.response.ItineraryItemDto;
import com.smarttravel.dto.response.ItineraryResponse;

import java.util.List;

public interface ItineraryService {
    ItineraryResponse createItinerary(ItineraryCreateRequest request, String userEmail);
    List<ItineraryResponse> getMyItineraries(String userEmail);
    ItineraryResponse getItineraryById(Long id, String userEmail);
    ItineraryResponse getItineraryByShareToken(String token);
    ItineraryResponse addItem(Long itineraryId, Long dayId, ItineraryItemDto itemDto, String userEmail);
    ItineraryResponse deleteItem(Long itineraryId, Long itemId, String userEmail);
    ItineraryResponse reorderItems(Long itineraryId, Long dayId, List<Long> itemIdsInOrder, String userEmail);
    String generateShareToken(Long itineraryId, String userEmail);
}
