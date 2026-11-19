package com.smarttravel.repositories;

import com.smarttravel.entities.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    List<TourSchedule> findByTourIdOrderByStartDateAsc(Long tourId);
    List<TourSchedule> findAllByOrderByStartDateAsc();
}
