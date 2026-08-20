package com.smarttravel.services;

import com.smarttravel.dto.request.ReviewCreateRequest;
import com.smarttravel.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewCreateRequest request, String userEmail);
    List<ReviewResponse> getReviewsByTourId(Long tourId);
    boolean checkEligibility(Long tourId, String userEmail);
}
