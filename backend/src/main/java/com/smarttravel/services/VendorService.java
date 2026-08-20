package com.smarttravel.services;

import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.TourResponse;

import java.util.List;
import java.util.Map;

public interface VendorService {
    Map<String, Object> getVendorDashboardStats(String vendorEmail);
    List<TourResponse> getVendorTours(String vendorEmail);
    List<BookingResponse> getVendorBookings(String vendorEmail);
}
