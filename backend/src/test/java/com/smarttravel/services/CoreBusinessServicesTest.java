package com.smarttravel.services;

import com.smarttravel.dto.request.TourModerationRequest;
import com.smarttravel.dto.request.VendorApplicationRequest;
import com.smarttravel.dto.request.VendorApplicationReviewRequest;
import com.smarttravel.dto.request.VoucherRequest;
import com.smarttravel.dto.response.*;
import com.smarttravel.entities.*;
import com.smarttravel.enums.*;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.impl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoreBusinessServicesTest {

    @Mock private VoucherRepository voucherRepository;
    @Mock private VendorApplicationRepository vendorApplicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private EmailService emailService;
    @Mock private VerificationOtpRepository otpRepository;
    @Mock private TourRepository tourRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private DestinationRepository destinationRepository;
    @Mock private TourService tourService;

    private VoucherServiceImpl voucherService;
    private VendorApplicationServiceImpl vendorApplicationService;
    private OtpServiceImpl otpService;
    private VendorServiceImpl vendorService;
    private AdminServiceImpl adminService;

    private Role userRole;
    private Role vendorRole;
    private Role adminRole;
    private User customer;
    private User vendor;
    private User admin;

    @BeforeEach
    void setUp() {
        voucherService = new VoucherServiceImpl(voucherRepository);
        vendorApplicationService = new VendorApplicationServiceImpl(
                vendorApplicationRepository, userRepository, roleRepository, emailService);
        otpService = new OtpServiceImpl(otpRepository, emailService);
        ReflectionTestUtils.setField(otpService, "expirationSeconds", 60L);
        vendorService = new VendorServiceImpl(tourRepository, userRepository, bookingRepository, tourService);
        adminService = new AdminServiceImpl(
                userRepository, tourRepository, bookingRepository, paymentRepository, destinationRepository);

        userRole = new Role(1L, RoleEnum.ROLE_USER);
        vendorRole = new Role(2L, RoleEnum.ROLE_VENDOR);
        adminRole = new Role(3L, RoleEnum.ROLE_ADMIN);

        customer = User.builder().email("cust@test.com").fullName("Khách A").phone("0901111111")
                .enabled(true).roles(new HashSet<>(Set.of(userRole))).build();
        customer.setId(1L);

        vendor = User.builder().email("vendor@test.com").fullName("Đại Lý A").phone("0902222222")
                .enabled(true).roles(new HashSet<>(Set.of(userRole, vendorRole))).build();
        vendor.setId(2L);

        admin = User.builder().email("admin@test.com").fullName("Admin Gốc").phone("0903333333")
                .enabled(true).roles(new HashSet<>(Set.of(adminRole))).build();
        admin.setId(3L);
    }

    // ─── VOUCHER SERVICE ───────────────────────────────────────────────

    @Test
    void voucher_createUpdateToggleDeleteAndGetActive() {
        VoucherRequest req = VoucherRequest.builder()
                .code(" summer20 ")
                .title("Giảm 20% Hè")
                .discountPercent(20)
                .maxDiscountAmount(new BigDecimal("500000"))
                .minOrderValue(new BigDecimal("1000000"))
                .usageLimit(100)
                .startDate(LocalDate.now().minusDays(1))
                .expiryDate(LocalDate.now().plusDays(10))
                .active(true)
                .build();

        when(voucherRepository.existsByCodeIgnoreCase("SUMMER20")).thenReturn(false);
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> {
            Voucher v = inv.getArgument(0);
            if (v.getId() == null) v.setId(10L);
            return v;
        });

        VoucherResponse created = voucherService.createVoucher(req);
        assertEquals("SUMMER20", created.getCode());
        assertEquals(20, created.getDiscountPercent());

        // Duplicate code rejected
        when(voucherRepository.existsByCodeIgnoreCase("SUMMER20")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> voucherService.createVoucher(req));

        // Update, toggle, getActive, delete
        Voucher entity = Voucher.builder()
                .code("SUMMER20").title("Giảm 20% Hè").discountPercent(20)
                .maxDiscountAmount(new BigDecimal("500000")).minOrderValue(new BigDecimal("1000000"))
                .usageLimit(100).usedCount(0)
                .startDate(LocalDate.now().minusDays(1)).expiryDate(LocalDate.now().plusDays(10))
                .active(true).build();
        entity.setId(10L);

        when(voucherRepository.findById(10L)).thenReturn(Optional.of(entity));
        when(voucherRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(entity));
        when(voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(entity));

        assertEquals(1, voucherService.getAllVouchers().size());
        assertEquals(1, voucherService.getActiveVouchers().size());
        assertEquals("SUMMER20", voucherService.getVoucherById(10L).getCode());

        VoucherResponse updated = voucherService.updateVoucher(10L, req);
        assertEquals("SUMMER20", updated.getCode());

        VoucherResponse toggled = voucherService.toggleVoucherActive(10L);
        assertFalse(Boolean.TRUE.equals(toggled.getActive()));

        voucherService.deleteVoucher(10L);
        verify(voucherRepository).delete(entity);
    }

    @Test
    void voucher_validateDiscountPercentCapFixedAndRejections() {
        Voucher percentVoucher = Voucher.builder()
                .code("SALE20").title("Giảm 20% tối đa 500k").discountPercent(20)
                .maxDiscountAmount(new BigDecimal("500000")).minOrderValue(new BigDecimal("2000000"))
                .usageLimit(10).usedCount(2)
                .startDate(LocalDate.now().minusDays(1)).expiryDate(LocalDate.now().plusDays(5))
                .active(true).build();

        when(voucherRepository.findByCodeAndActiveTrue("SALE20")).thenReturn(Optional.of(percentVoucher));

        // 20% of 5,000,000 = 1,000,000 -> capped at 500,000
        Map<String, Object> res = voucherService.validateAndCalculateVoucher("sale20", new BigDecimal("5000000"));
        assertEquals(new BigDecimal("500000"), res.get("discountAmount"));
        assertEquals(new BigDecimal("4500000"), res.get("finalTotal"));

        // Below minOrderValue rejected
        assertThrows(BadRequestException.class,
                () -> voucherService.validateAndCalculateVoucher("SALE20", new BigDecimal("1000000")));

        // Expired rejected
        percentVoucher.setExpiryDate(LocalDate.now().minusDays(1));
        assertThrows(BadRequestException.class,
                () -> voucherService.validateAndCalculateVoucher("SALE20", new BigDecimal("5000000")));

        // Usage limit exceeded rejected
        percentVoucher.setExpiryDate(LocalDate.now().plusDays(5));
        percentVoucher.setUsedCount(10);
        assertThrows(BadRequestException.class,
                () -> voucherService.validateAndCalculateVoucher("SALE20", new BigDecimal("5000000")));

        // Fixed amount voucher
        Voucher fixedVoucher = Voucher.builder()
                .code("FIX300").title("Giảm 300k").discountAmount(new BigDecimal("300000"))
                .minOrderValue(BigDecimal.ZERO).usageLimit(5).usedCount(0)
                .startDate(LocalDate.now()).expiryDate(LocalDate.now().plusDays(2))
                .active(true).build();
        when(voucherRepository.findByCodeAndActiveTrue("FIX300")).thenReturn(Optional.of(fixedVoucher));
        Map<String, Object> fixedRes = voucherService.validateAndCalculateVoucher("FIX300", new BigDecimal("2000000"));
        assertEquals(new BigDecimal("300000"), fixedRes.get("discountAmount"));
        assertEquals(new BigDecimal("1700000"), fixedRes.get("finalTotal"));

        // Increment used count
        when(voucherRepository.findByCodeIgnoreCase("FIX300")).thenReturn(Optional.of(fixedVoucher));
        voucherService.incrementUsedCount("FIX300");
        assertEquals(1, fixedVoucher.getUsedCount());
    }

    // ─── VENDOR APPLICATION SERVICE ────────────────────────────────────

    @Test
    void vendorApplication_submitApproveRejectAndRevokeLifecycle() {
        VendorApplicationRequest req = VendorApplicationRequest.builder()
                .businessName("Công ty Du Lịch Á Châu")
                .taxCode("0312345678")
                .businessAddress("Quận 1, TP.HCM")
                .hotline("0909999999")
                .representativeName("Nguyễn Văn A")
                .businessLicenseUrl("https://cdn.example/license.jpg")
                .idCardFrontUrl("https://cdn.example/cccd.jpg")
                .build();

        when(userRepository.findByEmail("cust@test.com")).thenReturn(Optional.of(customer));
        when(vendorApplicationRepository.existsByUserAndStatus(customer, VendorApplicationStatus.PENDING_REVIEW))
                .thenReturn(false);
        when(vendorApplicationRepository.save(any(VendorApplication.class))).thenAnswer(inv -> {
            VendorApplication a = inv.getArgument(0);
            if (a.getId() == null) a.setId(50L);
            return a;
        });

        VendorApplicationResponse submitted = vendorApplicationService.submitApplication(req, "cust@test.com");
        assertEquals(VendorApplicationStatus.PENDING_REVIEW, submitted.getStatus());

        // Reject duplicate pending
        when(vendorApplicationRepository.existsByUserAndStatus(customer, VendorApplicationStatus.PENDING_REVIEW))
                .thenReturn(true);
        assertThrows(BadRequestException.class,
                () -> vendorApplicationService.submitApplication(req, "cust@test.com"));

        // Reject already vendor
        when(userRepository.findByEmail("vendor@test.com")).thenReturn(Optional.of(vendor));
        assertThrows(BadRequestException.class,
                () -> vendorApplicationService.submitApplication(req, "vendor@test.com"));

        // Admin approves -> grants ROLE_VENDOR & sends email
        VendorApplication app = VendorApplication.builder()
                .user(customer).businessName("Công ty Du Lịch Á Châu").taxCode("0312345678")
                .businessAddress("Quận 1").hotline("0909999999").representativeName("Nguyễn Văn A")
                .status(VendorApplicationStatus.PENDING_REVIEW).build();
        app.setId(50L);

        when(vendorApplicationRepository.findById(50L)).thenReturn(Optional.of(app));
        when(roleRepository.findByName(RoleEnum.ROLE_VENDOR)).thenReturn(Optional.of(vendorRole));
        when(roleRepository.findByName(RoleEnum.ROLE_USER)).thenReturn(Optional.of(userRole));

        VendorApplicationResponse approved = vendorApplicationService.reviewApplication(
                50L,
                VendorApplicationReviewRequest.builder().status(VendorApplicationStatus.APPROVED).build(),
                "admin@test.com"
        );
        assertEquals(VendorApplicationStatus.APPROVED, approved.getStatus());
        assertTrue(customer.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_VENDOR));
        verify(emailService).sendVendorApplicationApprovedEmail("cust@test.com", "Công ty Du Lịch Á Châu");

        // Admin revokes -> removes ROLE_VENDOR, keeps ROLE_USER, status REVOKED
        VendorApplicationResponse revoked = vendorApplicationService.revokeVendor(50L, "admin@test.com");
        assertEquals(VendorApplicationStatus.REVOKED, revoked.getStatus());
        assertFalse(customer.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_VENDOR));
        assertTrue(customer.getRoles().stream().anyMatch(r -> r.getName() == RoleEnum.ROLE_USER));

        // Admin rejects another pending app -> sets reason & sends rejection email
        app.setStatus(VendorApplicationStatus.PENDING_REVIEW);
        VendorApplicationResponse rejected = vendorApplicationService.reviewApplication(
                50L,
                VendorApplicationReviewRequest.builder()
                        .status(VendorApplicationStatus.REJECTED)
                        .reason("Thiếu giấy phép lữ hành")
                        .build(),
                "admin@test.com"
        );
        assertEquals(VendorApplicationStatus.REJECTED, rejected.getStatus());
        assertEquals("Thiếu giấy phép lữ hành", rejected.getRejectionReason());
        verify(emailService).sendVendorApplicationRejectedEmail(
                "cust@test.com", "Công ty Du Lịch Á Châu", "Thiếu giấy phép lữ hành");
    }

    // ─── OTP SERVICE ───────────────────────────────────────────────────

    @Test
    void otp_generateVerifyExpiredAndWrongCode() {
        String code = otpService.generateAndSendOtp("cust@test.com", OtpType.REGISTER);
        assertEquals(6, code.length());
        assertTrue(code.matches("\\d{6}"));
        verify(otpRepository).save(any(VerificationOtp.class));
        verify(emailService).sendOtpEmail(eq("cust@test.com"), eq(code), anyString(), anyString());

        VerificationOtp validOtp = VerificationOtp.builder()
                .email("cust@test.com").code("123456").type(OtpType.REGISTER)
                .expiryTime(LocalDateTime.now().plusSeconds(45)).isUsed(false).build();
        when(otpRepository.findFirstByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc("cust@test.com", OtpType.REGISTER))
                .thenReturn(Optional.of(validOtp));

        // Wrong code rejected
        assertThrows(BadRequestException.class, () -> otpService.verifyOtp("cust@test.com", "999999", OtpType.REGISTER));

        // Valid code passes and marks used
        assertTrue(otpService.verifyOtp("cust@test.com", "123456", OtpType.REGISTER));
        assertTrue(validOtp.getIsUsed());

        // Expired OTP rejected
        validOtp.setIsUsed(false);
        validOtp.setExpiryTime(LocalDateTime.now().minusSeconds(5));
        assertThrows(BadRequestException.class, () -> otpService.verifyOtp("cust@test.com", "123456", OtpType.REGISTER));
    }

    // ─── VENDOR & ADMIN REVENUE / SETTLEMENT / MODERATION ──────────────

    @Test
    void vendorAndAdmin_revenueRecognitionCommission10PercentAndProtections() {
        Destination dest = Destination.builder().name("Đà Lạt").city("Lâm Đồng").build();
        dest.setId(7L);

        Tour tour = Tour.builder().title("Đà Lạt 3N2Đ").tourCode("DL-01").price(new BigDecimal("4000000"))
                .durationDays(3).durationNights(2).departureLocation("TP.HCM")
                .status(TourStatus.ACTIVE).vendor(vendor).destination(dest).build();
        tour.setId(100L);

        Booking paidBooking = Booking.builder().bookingCode("BK-1").user(customer).tour(tour)
                .numberOfAdults(1).numberOfChildren(0).totalPrice(new BigDecimal("4000000"))
                .status(BookingStatus.PAID).build();
        paidBooking.setId(1L);
        paidBooking.setCreatedAt(LocalDateTime.now());

        Booking checkedInBooking = Booking.builder().bookingCode("BK-2").user(customer).tour(tour)
                .numberOfAdults(1).numberOfChildren(0).totalPrice(new BigDecimal("6000000"))
                .status(BookingStatus.CHECKED_IN).build();
        checkedInBooking.setId(2L);
        checkedInBooking.setCreatedAt(LocalDateTime.now());

        Booking depositedBooking = Booking.builder().bookingCode("BK-3").user(customer).tour(tour)
                .numberOfAdults(1).numberOfChildren(0).totalPrice(new BigDecimal("10000000"))
                .isDeposit(true).depositAmount(new BigDecimal("3000000"))
                .status(BookingStatus.DEPOSITED).build();
        depositedBooking.setId(3L);
        depositedBooking.setCreatedAt(LocalDateTime.now());

        Booking cancelledBooking = Booking.builder().bookingCode("BK-4").user(customer).tour(tour)
                .numberOfAdults(1).numberOfChildren(0).totalPrice(new BigDecimal("5000000"))
                .status(BookingStatus.CANCELLED).build();
        cancelledBooking.setId(4L);

        List<Booking> allBookings = List.of(paidBooking, checkedInBooking, depositedBooking, cancelledBooking);

        // Vendor dashboard stats: 4,000,000 + 6,000,000 + 3,000,000 = 13,000,000 (excludes CANCELLED)
        when(userRepository.findByEmail("vendor@test.com")).thenReturn(Optional.of(vendor));
        when(tourRepository.findByVendorId(2L)).thenReturn(List.of(tour));
        when(bookingRepository.findByTourVendorId(2L)).thenReturn(allBookings);

        Map<String, Object> vStats = vendorService.getVendorDashboardStats("vendor@test.com");
        assertEquals(1, vStats.get("totalTours"));
        assertEquals(4, vStats.get("totalBookings"));
        assertEquals(new BigDecimal("13000000"), vStats.get("totalRevenue"));
        assertEquals(4, vendorService.getVendorBookings("vendor@test.com").size());

        // Admin dashboard analytics & 10% commission settlement
        when(userRepository.findAll()).thenReturn(List.of(customer, vendor, admin));
        when(tourRepository.countByStatus(TourStatus.ACTIVE)).thenReturn(1L);
        when(tourRepository.countByStatus(TourStatus.PENDING_APPROVAL)).thenReturn(0L);
        when(bookingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(allBookings);
        when(bookingRepository.findAll()).thenReturn(allBookings);
        when(destinationRepository.findAll()).thenReturn(List.of(dest));
        when(tourRepository.findAll()).thenReturn(List.of(tour));

        AdminStatsResponse aStats = adminService.getDashboardAnalytics();
        assertEquals(3L, aStats.getTotalUsers());
        assertEquals(1L, aStats.getTotalVendors());
        assertEquals(3L, aStats.getSuccessfulBookings());
        assertEquals(1L, aStats.getCancelledBookings());
        assertEquals(0L, aStats.getSettledVendors());
        assertEquals(new BigDecimal("13000000"), aStats.getTotalGrossRevenue());
        assertEquals(new BigDecimal("1300000.00"), aStats.getTotalPlatformCommission());

        List<VendorSettlementResponse> settlements = adminService.getVendorSettlements();
        assertEquals(1, settlements.size());
        assertEquals(new BigDecimal("1300000.00"), settlements.get(0).getPlatformFee());
        assertEquals(new BigDecimal("11700000.00"), settlements.get(0).getNetPayout());
        assertEquals("PENDING", settlements.get(0).getSettlementStatus());

        // Settle vendor payout persisted on User entity
        when(userRepository.findById(2L)).thenReturn(Optional.of(vendor));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        VendorSettlementResponse settled = adminService.settleVendor(2L);
        assertEquals("SETTLED", settled.getSettlementStatus());
        assertEquals(true, vendorService.getVendorDashboardStats("vendor@test.com").get("isSettled"));

        // Vendor business & bank payout profile persisted as JSON on User
        Map<String, String> savedProfile = vendorService.updateVendorBusinessProfile(
                "vendor@test.com", Map.of("companyName", "Đại Lý A Travel", "accountNumber", "123456789"));
        assertEquals("Đại Lý A Travel", savedProfile.get("companyName"));
        assertEquals("123456789", vendorService.getVendorBusinessProfile("vendor@test.com").get("accountNumber"));

        // Admin user status lock protection for root Admin
        when(userRepository.findById(3L)).thenReturn(Optional.of(admin));
        assertThrows(BadRequestException.class, () -> adminService.toggleUserStatus(3L, false));

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        UserResponse lockedCust = adminService.toggleUserStatus(1L, false);
        assertFalse(lockedCust.getEnabled());

        // Tour moderation
        when(tourRepository.findById(100L)).thenReturn(Optional.of(tour));
        when(tourRepository.save(any(Tour.class))).thenAnswer(inv -> inv.getArgument(0));
        TourResponse moderated = adminService.moderateTour(
                100L, TourModerationRequest.builder().status(TourStatus.INACTIVE).build());
        assertEquals(TourStatus.INACTIVE, moderated.getStatus());
    }
}
