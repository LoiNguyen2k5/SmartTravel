package com.smarttravel.controllers;

import com.smarttravel.dto.request.ReviewCreateRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.ReviewResponse;
import com.smarttravel.services.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review Management", description = "APIs viết đánh giá và xem nhận xét tour")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Viết đánh giá cho Tour du lịch")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ReviewResponse review = reviewService.createReview(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Đăng đánh giá thành công", review));
    }

    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Lấy danh sách đánh giá của một Tour")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsByTourId(tourId)));
    }

    @GetMapping("/check-eligibility")
    @Operation(summary = "Kiểm tra người dùng có đủ điều kiện đánh giá Tour hay không")
    public ResponseEntity<ApiResponse<Boolean>> checkEligibility(
            @RequestParam Long tourId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        boolean eligible = reviewService.checkEligibility(tourId, email);
        return ResponseEntity.ok(ApiResponse.success(eligible));
    }
}
