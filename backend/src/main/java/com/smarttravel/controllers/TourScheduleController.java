package com.smarttravel.controllers;

import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.entities.Tour;
import com.smarttravel.entities.TourSchedule;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.TourScheduleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tour-schedules")
@RequiredArgsConstructor
@Tag(name = "Tour Schedules", description = "APIs quản lý và tra cứu lịch khởi hành của Tour từ CSDL")
public class TourScheduleController {

    private final TourScheduleRepository tourScheduleRepository;
    private final TourRepository tourRepository;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách lịch khởi hành của các tour")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllSchedules() {
        List<Map<String, Object>> list = tourScheduleRepository.findAllByOrderByStartDateAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Lấy danh sách lịch khởi hành theo mã Tour")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSchedulesByTour(@PathVariable Long tourId) {
        List<Map<String, Object>> list = tourScheduleRepository.findByTourIdOrderByStartDateAsc(tourId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/tour/{tourId}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Thêm đợt khởi hành mới cho Tour (Vendor/Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createSchedule(
            @PathVariable Long tourId,
            @RequestBody Map<String, Object> body
    ) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));

        String startStr = body.get("startDate") != null ? body.get("startDate").toString() : null;
        String endStr = body.get("endDate") != null ? body.get("endDate").toString() : null;
        if (startStr == null || endStr == null) {
            throw new BadRequestException("Vui lòng nhập ngày bắt đầu và ngày kết thúc.");
        }

        int maxParticipants = body.get("maxParticipants") != null
                ? Integer.parseInt(body.get("maxParticipants").toString())
                : 40;

        TourSchedule schedule = TourSchedule.builder()
                .tour(tour)
                .startDate(LocalDate.parse(startStr))
                .endDate(LocalDate.parse(endStr))
                .maxParticipants(maxParticipants)
                .bookedCount(0)
                .build();

        TourSchedule saved = tourScheduleRepository.save(schedule);
        return ResponseEntity.status(201).body(ApiResponse.created("Thêm lịch khởi hành thành công", toDto(saved)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Xóa đợt khởi hành (Vendor/Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        if (!tourScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("TourSchedule", "id", id);
        }
        tourScheduleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa lịch khởi hành thành công", null));
    }

    @PatchMapping("/{id}/book")
    @Operation(summary = "Cập nhật tăng số lượng khách đã đặt cho đợt khởi hành")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookSeats(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int guests
    ) {
        TourSchedule schedule = tourScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TourSchedule", "id", id));
        int nextBooked = Math.min(schedule.getMaxParticipants(), schedule.getBookedCount() + Math.max(1, guests));
        schedule.setBookedCount(nextBooked);
        TourSchedule saved = tourScheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật số chỗ thành công", toDto(saved)));
    }

    private Map<String, Object> toDto(TourSchedule s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("tourId", s.getTour() != null ? s.getTour().getId() : null);
        map.put("startDate", s.getStartDate() != null ? s.getStartDate().toString() : null);
        map.put("endDate", s.getEndDate() != null ? s.getEndDate().toString() : null);
        map.put("maxParticipants", s.getMaxParticipants());
        map.put("bookedCount", s.getBookedCount());
        map.put("minParticipants", 10);
        map.put("note", "Khởi hành định kỳ");
        return map;
    }
}
