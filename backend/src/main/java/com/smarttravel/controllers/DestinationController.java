package com.smarttravel.controllers;

import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.entities.Destination;
import com.smarttravel.services.DestinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
@Tag(name = "Destination Management", description = "APIs điểm đến du lịch")
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách điểm đến du lịch")
    public ResponseEntity<ApiResponse<List<Destination>>> getAllDestinations() {
        return ResponseEntity.ok(ApiResponse.success(destinationService.getAllDestinations()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết điểm đến theo ID")
    public ResponseEntity<ApiResponse<Destination>> getDestinationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(destinationService.getDestinationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới điểm đến du lịch (Admin)")
    public ResponseEntity<ApiResponse<Destination>> createDestination(@RequestBody Destination destination) {
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo điểm đến thành công", destinationService.createDestination(destination)));
    }
}
