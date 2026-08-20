package com.smarttravel.services.impl;

import com.smarttravel.dto.request.ReviewCreateRequest;
import com.smarttravel.dto.response.ReviewResponse;
import com.smarttravel.entities.Review;
import com.smarttravel.entities.Tour;
import com.smarttravel.entities.User;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.ReviewRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    public boolean checkEligibility(Long tourId, String userEmail) {
        if (userEmail == null) return false;
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;

        return bookingRepository.existsByUserIdAndTourIdAndStatus(user.getId(), tourId, BookingStatus.COMPLETED);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", request.getTourId()));

        // Mandatory requirement check: Only accounts with COMPLETED bookings can leave reviews!
        boolean hasCompleted = bookingRepository.existsByUserIdAndTourIdAndStatus(user.getId(), tour.getId(), BookingStatus.COMPLETED);
        if (!hasCompleted) {
            throw new BadRequestException("Chỉ những tài khoản đã hoàn thành tour (COMPLETED) mới được phép gửi đánh giá và nhận xét.");
        }

        Review review = Review.builder()
                .user(user)
                .tour(tour)
                .rating(request.getRating())
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToReviewResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByTourId(Long tourId) {
        return reviewRepository.findByTourId(tourId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .tourId(review.getTour().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .userAvatar(review.getUser().getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
