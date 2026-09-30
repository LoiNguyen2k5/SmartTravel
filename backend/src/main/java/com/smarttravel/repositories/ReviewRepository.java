package com.smarttravel.repositories;

import com.smarttravel.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;


public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTourId(Long tourId);
}
