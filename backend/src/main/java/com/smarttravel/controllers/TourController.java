package com.smarttravel.controllers;

import com.smarttravel.dto.request.TourCreateRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.TourResponse;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.services.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
@Tag(name = "Tour Management", description = "APIs tìm kiếm, xem chi tiết và tạo mới Tour du lịch")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @Operation(summary = "Lấy danh sách Tour đang hoạt động")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getAllActiveTours() {
        List<TourResponse> tours = tourService.getAllActiveTours();
        return ResponseEntity.ok(ApiResponse.success(tours));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm và Lọc Tour nâng cao")
    public ResponseEntity<ApiResponse<List<TourResponse>>> searchTours(
            @RequestParam(required = false) String departure,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) TourCategory category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String duration
    ) {
        List<TourResponse> tours = tourService.searchTours(departure, destination, category, minPrice, maxPrice, duration);
        return ResponseEntity.ok(ApiResponse.success(tours));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết Tour theo ID")
    public ResponseEntity<ApiResponse<TourResponse>> getTourById(@PathVariable Long id) {
        TourResponse tour = tourService.getTourById(id);
        return ResponseEntity.ok(ApiResponse.success(tour));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Tạo mới Tour du lịch (Chỉ dành cho Vendor và Admin)")
    public ResponseEntity<ApiResponse<TourResponse>> createTour(
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TourResponse tour = tourService.createTour(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo tour du lịch thành công", tour));
    }

    @GetMapping("/my-tours")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Lấy danh sách Tour do Vendor quản lý")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getMyTours(@AuthenticationPrincipal UserDetails userDetails) {
        List<TourResponse> tours = tourService.getToursByVendor(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(tours));
    }
}
