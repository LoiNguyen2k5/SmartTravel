package com.smarttravel.services.impl;

import com.smarttravel.entities.Booking;
import com.smarttravel.entities.TourSchedule;
import com.smarttravel.entities.User;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourScheduleStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ForbiddenException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.TourScheduleRepository;
import com.smarttravel.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Quản lý vòng đời Đợt khởi hành (TourSchedule):
 * - Hoàn thành đợt khởi hành (thủ công bởi Vendor/Admin hoặc tự động qua endDate)
 * - Tự động chuyển toàn bộ đơn CHECKED_IN thuộc đợt đó sang COMPLETED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TourScheduleLifecycleService {

    private final TourScheduleRepository tourScheduleRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> completeSchedule(Long scheduleId, String actorEmail) {
        TourSchedule schedule = tourScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("TourSchedule", "id", scheduleId));

        if (actorEmail != null && !actorEmail.isBlank()) {
            User actor = userRepository.findByEmail(actorEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", actorEmail));
            boolean isAdmin = actor.getRoles() != null && actor.getRoles().stream()
                    .anyMatch(r -> r.getName() == RoleEnum.ROLE_ADMIN);
            boolean isTourVendor = schedule.getTour() != null
                    && schedule.getTour().getVendor() != null
                    && schedule.getTour().getVendor().getId().equals(actor.getId());
            if (!isAdmin && !isTourVendor) {
                throw new ForbiddenException("Bạn không có quyền hoàn thành đợt khởi hành của đại lý khác.");
            }
        }

        if (schedule.getStatus() == TourScheduleStatus.CANCELLED) {
            throw new BadRequestException("Không thể hoàn thành đợt khởi hành đã bị hủy.");
        }

        schedule.setStatus(TourScheduleStatus.COMPLETED);
        TourSchedule savedSchedule = tourScheduleRepository.save(schedule);

        // Thu thập tất cả booking thuộc đợt khởi hành (gắn trực tiếp tourScheduleId + bản ghi cũ khớp tourId & startDate)
        Map<Long, Booking> targetBookings = new LinkedHashMap<>();
        List<Booking> bySchedule = bookingRepository.findByTourScheduleId(scheduleId);
        if (bySchedule != null) {
            for (Booking b : bySchedule) {
                if (b.getId() != null) targetBookings.put(b.getId(), b);
            }
        }
        if (schedule.getTour() != null && schedule.getStartDate() != null) {
            List<Booking> byTourAndDate = bookingRepository.findByTourIdAndDepartureDate(
                    schedule.getTour().getId(), schedule.getStartDate());
            if (byTourAndDate != null) {
                for (Booking b : byTourAndDate) {
                    boolean matchesThisSchedule = b.getTourSchedule() == null
                            || scheduleId.equals(b.getTourSchedule().getId());
                    if (matchesThisSchedule && b.getId() != null) {
                        targetBookings.putIfAbsent(b.getId(), b);
                    }
                }
            }
        }

        int completedBookingsCount = 0;
        for (Booking booking : targetBookings.values()) {
            if (booking.getStatus() == BookingStatus.CHECKED_IN) {
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                completedBookingsCount++;
            }
        }

        Map<String, Object> dto = toDto(savedSchedule);
        dto.put("completedBookingsCount", completedBookingsCount);
        return dto;
    }

    /**
     * Tự động chốt hoàn thành các đợt khởi hành đã qua ngày kết thúc (endDate < hôm nay) lúc 00:05 hằng ngày.
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public int autoCompletePastSchedules() {
        List<TourSchedule> pastSchedules = tourScheduleRepository.findByEndDateBefore(LocalDate.now());
        if (pastSchedules == null || pastSchedules.isEmpty()) {
            return 0;
        }

        int completedSchedules = 0;
        for (TourSchedule s : pastSchedules) {
            TourScheduleStatus st = s.getStatus();
            if (st == TourScheduleStatus.COMPLETED || st == TourScheduleStatus.CANCELLED) {
                continue;
            }
            Map<String, Object> result = completeSchedule(s.getId(), null);
            completedSchedules++;
            log.info("✅ [Schedule Lifecycle] Tự động hoàn thành đợt khởi hành ID={} (endDate={}), đã chuyển {} đơn CHECKED_IN sang COMPLETED.",
                    s.getId(), s.getEndDate(), result.get("completedBookingsCount"));
        }
        return completedSchedules;
    }

    public Map<String, Object> toDto(TourSchedule s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("tourId", s.getTour() != null ? s.getTour().getId() : null);
        map.put("startDate", s.getStartDate() != null ? s.getStartDate().toString() : null);
        map.put("endDate", s.getEndDate() != null ? s.getEndDate().toString() : null);
        map.put("maxParticipants", s.getMaxParticipants());
        map.put("bookedCount", s.getBookedCount());
        map.put("status", s.getStatus() != null ? s.getStatus().name() : TourScheduleStatus.OPEN.name());
        map.put("minParticipants", 10);
        map.put("note", "Khởi hành định kỳ");
        return map;
    }
}
