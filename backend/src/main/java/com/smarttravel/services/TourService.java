package com.smarttravel.services;

import com.smarttravel.dto.request.TourCreateRequest;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.enums.TourCategory;

import java.math.BigDecimal;
import java.util.List;

public interface TourService {
    List<TourResponse> getAllActiveTours();
    TourResponse getTourById(Long id);
    TourResponse createTour(TourCreateRequest request, String vendorEmail);
    List<TourResponse> getToursByVendor(String vendorEmail);
    List<TourResponse> searchTours(String departure, String destination, TourCategory category, BigDecimal minPrice, BigDecimal maxPrice, String durationFilter);
    void deleteTour(Long id, String vendorEmail);
}
