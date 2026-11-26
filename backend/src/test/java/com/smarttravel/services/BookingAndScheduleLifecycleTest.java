package com.smarttravel.services;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.request.ReviewCreateRequest;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.ReviewResponse;
import com.smarttravel.entities.*;
import com.smarttravel.enums.*;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ForbiddenException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.impl.BookingCleanupScheduler;
import com.smarttravel.services.impl.BookingServiceImpl;
import com.smarttravel.services.impl.ReviewServiceImpl;
import com.smarttravel.services.impl.TourScheduleLifecycleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingAndScheduleLifecycleTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private TourRepository tourRepository;
    @Mock private TourScheduleRepository tourScheduleRepository;
    @Mock private UserRepository userRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private VoucherService voucherService;
    @Mock private EmailService emailService;
    @Mock private PaymentRepository paymentRepository;
    @Mock private VisaRequirementRepository visaRequirementRepository;
    @Mock private VisaApplicationRepository visaApplicationRepository;
    @Mock private VisaStatusLogRepository visaStatusLogRepository;
    @Mock private ReviewRepository reviewRepository;

    private BookingServiceImpl bookingService;
    private BookingCleanupScheduler bookingCleanupScheduler;
    private TourScheduleLifecycleService scheduleLifecycleService;
    private ReviewServiceImpl reviewService;

    private User customer;
    private User vendorA;
    private User vendorB;
    private Tour domesticTour;
    private TourSchedule openSchedule;

    @BeforeEach
    void setUp() {
        bookingService = new BookingServiceImpl(
                bookingRepository,
                tourRepository,
                tourScheduleRepository,
                userRepository,
                voucherRepository,
                voucherService,
                emailService,
                paymentRepository,
                visaRequirementRepository,
                visaApplicationRepository,
                visaStatusLogRepository
        );
        bookingCleanupScheduler = new BookingCleanupScheduler(
                bookingRepository,
                tourRepository,
                tourScheduleRepository
        );
        scheduleLifecycleService = new TourScheduleLifecycleService(
                tourScheduleRepository,
                bookingRepository,
                userRepository
        );
        reviewService = new ReviewServiceImpl(
                reviewRepository,
                tourRepository,
                userRepository,
                bookingRepository
        );

        Role userRole = new Role(1L, RoleEnum.ROLE_USER);
        Role vendorRole = new Role(2L, RoleEnum.ROLE_VENDOR);

        customer = User.builder().email("cust@test.com").fullName("Khách A").roles(Set.of(userRole)).build();
        customer.setId(10L);

        vendorA = User.builder().email("vendorA@test.com").fullName("Đại Lý A").roles(Set.of(vendorRole)).build();
        vendorA.setId(20L);

        vendorB = User.builder().email("vendorB@test.com").fullName("Đại Lý B").roles(Set.of(vendorRole)).build();
        vendorB.setId(21L);

        domesticTour = Tour.builder()
                .title("Đà Lạt 3N2Đ")
                .tourCode("DL-3N2D")
                .category(TourCategory.DOMESTIC)
                .price(new BigDecimal("3000000"))
                .remainingSeats(20)
                .vendor(vendorA)
                .build();
        domesticTour.setId(100L);

        openSchedule = TourSchedule.builder()
                .tour(domesticTour)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(12))
                .maxParticipants(30)
                .bookedCount(5)
                .status(TourScheduleStatus.OPEN)
                .build();
        openSchedule.setId(500L);
    }

    @Test
    void createBooking_linksScheduleAndIncrementsBookedCount() {
        BookingCreateRequest req = new BookingCreateRequest();
        req.setTourId(100L);
        req.setTourScheduleId(500L);
        req.setNumberOfAdults(2);
        req.setNumberOfChildren(1);
        req.setDepartureDate(openSchedule.getStartDate());

        when(userRepository.findByEmail("cust@test.com")).thenReturn(Optional.of(customer));
        when(tourRepository.findById(100L)).thenReturn(Optional.of(domesticTour));
        when(tourScheduleRepository.findById(500L)).thenReturn(Optional.of(openSchedule));
        when(visaRequirementRepository.existsByTourId(100L)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(1L);
            return b;
        });

        BookingResponse resp = bookingService.createBooking(req, "cust@test.com");

        assertEquals(8, openSchedule.getBookedCount());
        assertEquals(17, domesticTour.getRemainingSeats());
        assertEquals(500L, resp.getTourScheduleId());
        verify(tourScheduleRepository).save(openSchedule);
    }

    @Test
    void createBooking_rejectsCompletedSchedule() {
        openSchedule.setStatus(TourScheduleStatus.COMPLETED);
        BookingCreateRequest req = new BookingCreateRequest();
        req.setTourId(100L);
        req.setTourScheduleId(500L);
        req.setNumberOfAdults(1);
        req.setDepartureDate(openSchedule.getStartDate());

        when(userRepository.findByEmail("cust@test.com")).thenReturn(Optional.of(customer));
        when(tourRepository.findById(100L)).thenReturn(Optional.of(domesticTour));
        when(tourScheduleRepository.findById(500L)).thenReturn(Optional.of(openSchedule));
        when(visaRequirementRepository.existsByTourId(100L)).thenReturn(false);

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(req, "cust@test.com"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_restoresBothTourSeatsAndScheduleBookedCount_andBlocksCheckedIn() {
        Booking paidBooking = Booking.builder()
                .bookingCode("BK-TEST01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(openSchedule)
                .numberOfAdults(2)
                .numberOfChildren(1)
                .totalPrice(new BigDecimal("8100000"))
                .status(BookingStatus.PAID)
                .build();
        paidBooking.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(paidBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(visaRequirementRepository.existsByTourId(100L)).thenReturn(false);

        BookingResponse res = bookingService.cancelBooking(1L, "cust@test.com");
        assertEquals(BookingStatus.CANCELLED, res.getStatus());
        assertEquals(23, domesticTour.getRemainingSeats());
        assertEquals(2, openSchedule.getBookedCount());

        // Cannot cancel once CHECKED_IN
        paidBooking.setStatus(BookingStatus.CHECKED_IN);
        assertThrows(BadRequestException.class, () -> bookingService.cancelBooking(1L, "cust@test.com"));
    }

    @Test
    void cleanupScheduler_restoresScheduleBookedCountOnExpiredPending() {
        Booking pending = Booking.builder()
                .bookingCode("BK-EXP01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(openSchedule)
                .numberOfAdults(3)
                .numberOfChildren(0)
                .status(BookingStatus.PENDING)
                .build();
        pending.setId(2L);

        when(bookingRepository.findByStatusAndCreatedAtBefore(eq(BookingStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of(pending));

        bookingCleanupScheduler.releaseExpiredPendingBookings();

        assertEquals(BookingStatus.CANCELLED, pending.getStatus());
        assertEquals(2, openSchedule.getBookedCount());
        assertEquals(23, domesticTour.getRemainingSeats());
        verify(tourScheduleRepository).save(openSchedule);
    }

    @Test
    void checkInBooking_transitionsPaidToCheckedIn_andRequiresDepositCollectionForDeposited() {
        Booking deposited = Booking.builder()
                .bookingCode("BK-DEP01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(openSchedule)
                .numberOfAdults(1)
                .numberOfChildren(0)
                .totalPrice(new BigDecimal("3000000"))
                .isDeposit(true)
                .depositAmount(new BigDecimal("900000"))
                .remainingAmount(new BigDecimal("2100000"))
                .status(BookingStatus.DEPOSITED)
                .build();
        deposited.setId(3L);

        when(bookingRepository.findById(3L)).thenReturn(Optional.of(deposited));
        when(userRepository.findByEmail("vendorA@test.com")).thenReturn(Optional.of(vendorA));
        when(userRepository.findByEmail("vendorB@test.com")).thenReturn(Optional.of(vendorB));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(visaRequirementRepository.existsByTourId(100L)).thenReturn(false);

        // Unauthorized vendor blocked
        assertThrows(ForbiddenException.class, () -> bookingService.checkInBooking(3L, true, "vendorB@test.com"));

        // Deposited without collecting remaining 70% blocked
        assertThrows(BadRequestException.class, () -> bookingService.checkInBooking(3L, false, "vendorA@test.com"));

        // Deposited with collection confirmed -> CHECKED_IN + remainingAmount = 0
        BookingResponse checkedIn = bookingService.checkInBooking(3L, true, "vendorA@test.com");
        assertEquals(BookingStatus.CHECKED_IN, checkedIn.getStatus());
        assertEquals(BigDecimal.ZERO, checkedIn.getRemainingAmount());
    }

    @Test
    void completeSchedule_marksScheduleCompleted_andTransitionsOnlyCheckedInBookings() {
        Booking checkedInBooking = Booking.builder()
                .bookingCode("BK-CI01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(openSchedule)
                .status(BookingStatus.CHECKED_IN)
                .build();
        checkedInBooking.setId(11L);

        Booking noShowPaidBooking = Booking.builder()
                .bookingCode("BK-NS01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(openSchedule)
                .status(BookingStatus.PAID)
                .build();
        noShowPaidBooking.setId(12L);

        Booking legacyCheckedInBooking = Booking.builder()
                .bookingCode("BK-LEG01")
                .user(customer)
                .tour(domesticTour)
                .tourSchedule(null)
                .departureDate(openSchedule.getStartDate())
                .status(BookingStatus.CHECKED_IN)
                .build();
        legacyCheckedInBooking.setId(13L);

        when(tourScheduleRepository.findById(500L)).thenReturn(Optional.of(openSchedule));
        when(userRepository.findByEmail("vendorA@test.com")).thenReturn(Optional.of(vendorA));
        when(tourScheduleRepository.save(any(TourSchedule.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingRepository.findByTourScheduleId(500L)).thenReturn(List.of(checkedInBooking, noShowPaidBooking));
        when(bookingRepository.findByTourIdAndDepartureDate(100L, openSchedule.getStartDate()))
                .thenReturn(List.of(legacyCheckedInBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = scheduleLifecycleService.completeSchedule(500L, "vendorA@test.com");

        assertEquals(TourScheduleStatus.COMPLETED, openSchedule.getStatus());
        assertEquals("COMPLETED", result.get("status"));
        assertEquals(2, result.get("completedBookingsCount"));
        assertEquals(BookingStatus.COMPLETED, checkedInBooking.getStatus());
        assertEquals(BookingStatus.COMPLETED, legacyCheckedInBooking.getStatus());
        assertEquals(BookingStatus.PAID, noShowPaidBooking.getStatus());
    }

    @Test
    void reviewEligibilityAndCreation_requiresCompletedBooking() {
        when(userRepository.findByEmail("cust@test.com")).thenReturn(Optional.of(customer));
        when(tourRepository.findById(100L)).thenReturn(Optional.of(domesticTour));

        // Not completed yet
        when(bookingRepository.existsByUserIdAndTourIdAndStatus(10L, 100L, BookingStatus.COMPLETED))
                .thenReturn(false);

        assertFalse(reviewService.checkEligibility(100L, "cust@test.com"));

        ReviewCreateRequest req = new ReviewCreateRequest();
        req.setTourId(100L);
        req.setRating(5);
        req.setComment("Tour rất tuyệt!");

        assertThrows(BadRequestException.class, () -> reviewService.createReview(req, "cust@test.com"));
        verify(reviewRepository, never()).save(any());

        // Completed booking exists
        when(bookingRepository.existsByUserIdAndTourIdAndStatus(10L, 100L, BookingStatus.COMPLETED))
                .thenReturn(true);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(99L);
            return r;
        });

        assertTrue(reviewService.checkEligibility(100L, "cust@test.com"));
        ReviewResponse saved = reviewService.createReview(req, "cust@test.com");
        assertEquals(99L, saved.getId());
        assertEquals(5, saved.getRating());
    }
}
