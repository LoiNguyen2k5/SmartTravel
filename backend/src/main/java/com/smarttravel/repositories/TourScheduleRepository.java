package com.smarttravel.repositories;

import com.smarttravel.entities.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    List<TourSchedule> findByTourIdOrderByStartDateAsc(Long tourId);
    List<TourSchedule> findAllByOrderByStartDateAsc();
    Optional<TourSchedule> findFirstByTourIdAndStartDate(Long tourId, LocalDate startDate);
    List<TourSchedule> findByEndDateBefore(LocalDate date);
}
