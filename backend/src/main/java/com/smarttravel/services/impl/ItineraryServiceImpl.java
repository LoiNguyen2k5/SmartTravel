package com.smarttravel.services.impl;

import com.smarttravel.dto.request.ItineraryCreateRequest;
import com.smarttravel.dto.response.ItineraryDayDto;
import com.smarttravel.dto.response.ItineraryItemDto;
import com.smarttravel.dto.response.ItineraryResponse;
import com.smarttravel.entities.Itinerary;
import com.smarttravel.entities.ItineraryDay;
import com.smarttravel.entities.ItineraryItem;
import com.smarttravel.entities.User;
import com.smarttravel.enums.ActivityCategory;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.ItineraryDayRepository;
import com.smarttravel.repositories.ItineraryItemRepository;
import com.smarttravel.repositories.ItineraryRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryServiceImpl implements ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryDayRepository itineraryDayRepository;
    private final ItineraryItemRepository itineraryItemRepository;

    @Override
    @Transactional
    public ItineraryResponse createItinerary(ItineraryCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        String shareToken = "TRIP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Itinerary itinerary = Itinerary.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .estimatedBudget(request.getEstimatedBudget())
                .visibility(request.getVisibility())
                .shareToken(shareToken)
                .build();

        Itinerary saved = itineraryRepository.save(itinerary);

        // Automatically create days based on start and end date
        long numDays = 1;
        if (request.getStartDate() != null && request.getEndDate() != null) {
            numDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            if (numDays <= 0) numDays = 1;
        }

        List<ItineraryDay> days = new ArrayList<>();
        for (int i = 1; i <= numDays; i++) {
            ItineraryDay day = ItineraryDay.builder()
                    .itinerary(saved)
                    .dayNumber(i)
                    .date(request.getStartDate() != null ? request.getStartDate().plusDays(i - 1) : null)
                    .title("Ngày " + i)
                    .build();
            days.add(itineraryDayRepository.save(day));
        }

        saved.setDays(days);
        return mapToResponse(saved);
    }

    @Override
    public List<ItineraryResponse> getMyItineraries(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return itineraryRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ItineraryResponse getItineraryById(Long id, String userEmail) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary", "id", id));
        return mapToResponse(itinerary);
    }

    @Override
    public ItineraryResponse getItineraryByShareToken(String token) {
        Itinerary itinerary = itineraryRepository.findByShareToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary", "shareToken", token));
        return mapToResponse(itinerary);
    }

    @Override
    @Transactional
    public ItineraryResponse addItem(Long itineraryId, Long dayId, ItineraryItemDto itemDto, String userEmail) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary", "id", itineraryId));

        ItineraryDay day = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("ItineraryDay", "id", dayId));

        LocalTime startT = null;
        if (itemDto.getStartTime() != null && !itemDto.getStartTime().isEmpty()) {
            try { startT = LocalTime.parse(itemDto.getStartTime()); } catch (Exception ignored) {}
        }
        LocalTime endT = null;
        if (itemDto.getEndTime() != null && !itemDto.getEndTime().isEmpty()) {
            try { endT = LocalTime.parse(itemDto.getEndTime()); } catch (Exception ignored) {}
        }

        ItineraryItem item = ItineraryItem.builder()
                .itineraryDay(day)
                .activityName(itemDto.getActivityName())
                .startTime(startT)
                .endTime(endT)
                .estimatedCost(itemDto.getEstimatedCost() != null ? itemDto.getEstimatedCost() : BigDecimal.ZERO)
                .category(itemDto.getCategory() != null ? itemDto.getCategory() : ActivityCategory.ATTRACTION)
                .latitude(itemDto.getLatitude())
                .longitude(itemDto.getLongitude())
                .notes(itemDto.getNotes())
                .sortOrder(itemDto.getSortOrder() != null ? itemDto.getSortOrder() : day.getItems().size() + 1)
                .build();

        itineraryItemRepository.save(item);
        return getItineraryById(itineraryId, userEmail);
    }

    @Override
    @Transactional
    public ItineraryResponse deleteItem(Long itineraryId, Long itemId, String userEmail) {
        itineraryItemRepository.deleteById(itemId);
        return getItineraryById(itineraryId, userEmail);
    }

    @Override
    @Transactional
    public ItineraryResponse reorderItems(Long itineraryId, Long dayId, List<Long> itemIdsInOrder, String userEmail) {
        for (int i = 0; i < itemIdsInOrder.size(); i++) {
            Long itemId = itemIdsInOrder.get(i);
            ItineraryItem item = itineraryItemRepository.findById(itemId).orElse(null);
            if (item != null) {
                item.setSortOrder(i + 1);
                itineraryItemRepository.save(item);
            }
        }
        return getItineraryById(itineraryId, userEmail);
    }

    @Override
    @Transactional
    public String generateShareToken(Long itineraryId, String userEmail) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary", "id", itineraryId));
        if (itinerary.getShareToken() == null) {
            itinerary.setShareToken("TRIP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            itineraryRepository.save(itinerary);
        }
        return itinerary.getShareToken();
    }

    private ItineraryResponse mapToResponse(Itinerary i) {
        BigDecimal totalCost = BigDecimal.ZERO;
        List<ItineraryDayDto> dayDtos = new ArrayList<>();

        if (i.getDays() != null) {
            for (ItineraryDay day : i.getDays()) {
                List<ItineraryItemDto> itemDtos = new ArrayList<>();
                if (day.getItems() != null) {
                    for (ItineraryItem item : day.getItems()) {
                        if (item.getEstimatedCost() != null) {
                            totalCost = totalCost.add(item.getEstimatedCost());
                        }
                        itemDtos.add(ItineraryItemDto.builder()
                                .id(item.getId())
                                .dayId(day.getId())
                                .activityName(item.getActivityName())
                                .startTime(item.getStartTime() != null ? item.getStartTime().toString() : null)
                                .endTime(item.getEndTime() != null ? item.getEndTime().toString() : null)
                                .estimatedCost(item.getEstimatedCost())
                                .category(item.getCategory() != null ? item.getCategory() : ActivityCategory.ATTRACTION)
                                .latitude(item.getLatitude())
                                .longitude(item.getLongitude())
                                .notes(item.getNotes())
                                .sortOrder(item.getSortOrder())
                                .build());
                    }
                }
                dayDtos.add(ItineraryDayDto.builder()
                        .id(day.getId())
                        .dayNumber(day.getDayNumber())
                        .date(day.getDate())
                        .title(day.getTitle())
                        .items(itemDtos)
                        .build());
            }
        }

        return ItineraryResponse.builder()
                .id(i.getId())
                .title(i.getTitle())
                .description(i.getDescription())
                .startDate(i.getStartDate())
                .endDate(i.getEndDate())
                .estimatedBudget(i.getEstimatedBudget())
                .totalCost(totalCost)
                .visibility(i.getVisibility())
                .shareToken(i.getShareToken())
                .userId(i.getUser() != null ? i.getUser().getId() : null)
                .userName(i.getUser() != null ? i.getUser().getFullName() : null)
                .days(dayDtos)
                .build();
    }
}
