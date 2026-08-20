package com.smarttravel.controllers;

import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.services.BookingService;
import com.smarttravel.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Portal", description = "APIs quản trị hệ thống dành cho Admin")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;

    @GetMapping("/users")
    @Operation(summary = "Lấy toàn bộ danh sách người dùng")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Lấy toàn bộ danh sách đặt tour")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }
}
