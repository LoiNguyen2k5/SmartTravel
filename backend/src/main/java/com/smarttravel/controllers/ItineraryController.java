package com.smarttravel.controllers;

import com.smarttravel.dto.request.ItineraryCreateRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.ItineraryItemDto;
import com.smarttravel.dto.response.ItineraryResponse;
import com.smarttravel.services.ItineraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/itineraries")
@RequiredArgsConstructor
@Tag(name = "Itinerary Management", description = "APIs lập kế hoạch du lịch cá nhân và kéo thả lịch trình")
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping
    @Operation(summary = "Tạo kế hoạch du lịch mới")
    public ResponseEntity<ApiResponse<ItineraryResponse>> createItinerary(
            @Valid @RequestBody ItineraryCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ItineraryResponse itinerary = itineraryService.createItinerary(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo kế hoạch thành công", itinerary));
    }

    @GetMapping("/my-itineraries")
    @Operation(summary = "Lấy danh sách kế hoạch du lịch của tôi")
    public ResponseEntity<ApiResponse<List<ItineraryResponse>>> getMyItineraries(@AuthenticationPrincipal UserDetails userDetails) {
        List<ItineraryResponse> itineraries = itineraryService.getMyItineraries(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(itineraries));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết kế hoạch du lịch theo ID")
    public ResponseEntity<ApiResponse<ItineraryResponse>> getItineraryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        ItineraryResponse itinerary = itineraryService.getItineraryById(id, email);
        return ResponseEntity.ok(ApiResponse.success(itinerary));
    }

    @GetMapping("/share/{token}")
    @Operation(summary = "Xem kế hoạch du lịch được chia sẻ qua token (Public)")
    public ResponseEntity<ApiResponse<ItineraryResponse>> getItineraryByShareToken(@PathVariable String token) {
        ItineraryResponse itinerary = itineraryService.getItineraryByShareToken(token);
        return ResponseEntity.ok(ApiResponse.success(itinerary));
    }

    @PostMapping("/{id}/days/{dayId}/items")
    @Operation(summary = "Thêm mới địa điểm/hoạt động vào ngày trong lịch trình")
    public ResponseEntity<ApiResponse<ItineraryResponse>> addItem(
            @PathVariable Long id,
            @PathVariable Long dayId,
            @RequestBody ItineraryItemDto itemDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        ItineraryResponse itinerary = itineraryService.addItem(id, dayId, itemDto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Thêm hoạt động thành công", itinerary));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Xóa hoạt động khỏi lịch trình")
    public ResponseEntity<ApiResponse<ItineraryResponse>> deleteItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ItineraryResponse itinerary = itineraryService.deleteItem(id, itemId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Xóa hoạt động thành công", itinerary));
    }

    @PutMapping("/{id}/days/{dayId}/reorder")
    @Operation(summary = "Cập nhật thứ tự các hoạt động (Kéo thả reorder)")
    public ResponseEntity<ApiResponse<ItineraryResponse>> reorderItems(
            @PathVariable Long id,
            @PathVariable Long dayId,
            @RequestBody List<Long> itemIdsInOrder,
            @AuthenticationPrincipal UserDetails userDetails) {
        ItineraryResponse itinerary = itineraryService.reorderItems(id, dayId, itemIdsInOrder, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thứ tự thành công", itinerary));
    }

    @PostMapping("/{id}/generate-share-link")
    @Operation(summary = "Tạo link chia sẻ kế hoạch du lịch")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateShareLink(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String token = itineraryService.generateShareToken(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(Map.of("shareToken", token, "shareUrl", "/itinerary/share/" + token)));
    }
}
