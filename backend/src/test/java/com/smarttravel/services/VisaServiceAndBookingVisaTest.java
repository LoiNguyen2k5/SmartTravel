package com.smarttravel.services;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.response.BookingResponse;
import com.smarttravel.dto.response.VisaApplicationResponseDto;
import com.smarttravel.entities.*;
import com.smarttravel.enums.*;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ForbiddenException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.impl.BookingServiceImpl;
import com.smarttravel.services.impl.VisaDocumentCleanupScheduler;
import com.smarttravel.services.impl.VisaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisaServiceAndBookingVisaTest {

    @Mock private VisaTemplateRepository visaTemplateRepository;
    @Mock private VisaRequirementRepository visaRequirementRepository;
    @Mock private VisaApplicationRepository visaApplicationRepository;
    @Mock private VisaDocumentRepository visaDocumentRepository;
    @Mock private VisaStatusLogRepository visaStatusLogRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private TourRepository tourRepository;
    @Mock private TourScheduleRepository tourScheduleRepository;
    @Mock private UserRepository userRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private VoucherService voucherService;
    @Mock private EmailService emailService;
    @Mock private PaymentRepository paymentRepository;

    @TempDir
    Path tempStorageDir;

    private VisaServiceImpl visaService;
    private BookingServiceImpl bookingService;
    private VisaDocumentCleanupScheduler cleanupScheduler;

    private User customerA;
    private User customerB;
    private User vendorA;
    private User vendorB;
    private VisaTemplate japanTemplate;
    private Tour japanTour;

    @BeforeEach
    void setUp() {
        visaService = new VisaServiceImpl(
                visaTemplateRepository,
                visaRequirementRepository,
                visaApplicationRepository,
                visaDocumentRepository,
                visaStatusLogRepository,
                bookingRepository,
                tourRepository,
                userRepository,
                emailService
        );
        ReflectionTestUtils.setField(visaService, "storageDir", tempStorageDir.toString());
        ReflectionTestUtils.setField(visaService, "maxFileBytes", 5L * 1024 * 1024);

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

        cleanupScheduler = new VisaDocumentCleanupScheduler(visaApplicationRepository, visaDocumentRepository);
        ReflectionTestUtils.setField(cleanupScheduler, "storageDir", tempStorageDir.toString());
        ReflectionTestUtils.setField(cleanupScheduler, "retentionDays", 30);

        Role userRole = new Role(1L, RoleEnum.ROLE_USER);
        Role vendorRole = new Role(2L, RoleEnum.ROLE_VENDOR);

        customerA = User.builder().email("custA@test.com").fullName("Khách A").roles(Set.of(userRole)).build();
        customerA.setId(10L);

        customerB = User.builder().email("custB@test.com").fullName("Khách B").roles(Set.of(userRole)).build();
        customerB.setId(11L);

        vendorA = User.builder().email("vendorA@test.com").fullName("Đại Lý A").roles(Set.of(vendorRole)).build();
        vendorA.setId(20L);

        vendorB = User.builder().email("vendorB@test.com").fullName("Đại Lý B").roles(Set.of(vendorRole)).build();
        vendorB.setId(21L);

        japanTemplate = VisaTemplate.builder()
                .country("Nhật Bản")
                .countryCode("JP")
                .processingDays(7)
                .bufferDays(3) // Tổng lead time = 10 ngày (thay số 15 cứng!)
                .visaFee(new BigDecimal("1000000"))
                .consularFee(new BigDecimal("600000"))
                .documents(new ArrayList<>())
                .build();
        japanTemplate.setId(1L);

        VisaTemplateDocument mandatoryDoc = VisaTemplateDocument.builder()
                .template(japanTemplate)
                .documentName("Hộ chiếu gốc")
                .description("Còn hạn 6 tháng")
                .isMandatory(true)
                .build();
        mandatoryDoc.setId(101L);
        japanTemplate.getDocuments().add(mandatoryDoc);

        japanTour = Tour.builder()
                .title("Tour Nhật Bản Mùa Lá Đỏ")
                .price(new BigDecimal("20000000"))
                .childPrice(new BigDecimal("14000000"))
                .durationDays(5)
                .durationNights(4)
                .departureLocation("TP.HCM")
                .category(TourCategory.NUOC_NGOAI)
                .remainingSeats(20)
                .vendor(vendorA)
                .visaTemplate(japanTemplate)
                .build();
        japanTour.setId(100L);
    }

    @Test
    void createBooking_usesDynamicTemplateCutOff_separatesConsularFee_andAutoCreatesVisaApplication() {
        when(userRepository.findByEmail("custA@test.com")).thenReturn(Optional.of(customerA));
        when(tourRepository.findById(100L)).thenReturn(Optional.of(japanTour));
        when(visaRequirementRepository.existsByTourId(100L)).thenReturn(false);

        // 1) Đặt sát ngày (chỉ còn 8 ngày < 7 + 3 = 10 ngày) -> phải bị chặn theo lead time động
        BookingCreateRequest tooCloseReq = new BookingCreateRequest();
        tooCloseReq.setTourId(100L);
        tooCloseReq.setNumberOfAdults(2);
        tooCloseReq.setNumberOfChildren(0);
        tooCloseReq.setDepartureDate(LocalDate.now().plusDays(8));
        tooCloseReq.setVisaOptIn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(tooCloseReq, "custA@test.com"));
        assertTrue(ex.getMessage().contains("10 ngày"));

        // 2) Đặt trước 12 ngày (với code cũ 15 ngày cứng sẽ bị từ chối oan, nhưng template Nhật chỉ cần 10 ngày -> THÀNH CÔNG!)
        LocalDate depDate = LocalDate.now().plusDays(12);
        BookingCreateRequest validReq = new BookingCreateRequest();
        validReq.setTourId(100L);
        validReq.setNumberOfAdults(2);
        validReq.setNumberOfChildren(0);
        validReq.setDepartureDate(depDate);
        validReq.setVisaOptIn(true);

        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(500L);
            return b;
        });
        when(visaApplicationRepository.save(any(VisaApplication.class))).thenAnswer(inv -> {
            VisaApplication a = inv.getArgument(0);
            a.setId(900L);
            return a;
        });

        BookingResponse resp = bookingService.createBooking(validReq, "custA@test.com");

        // Giá tour 2 NL = 40tr + Phí dịch vụ Visa (1tr * 2 = 2tr) = 42tr; Lệ phí lãnh sự (600k * 2 = 1.2tr) TÁCH RIÊNG không cộng vào totalPrice!
        assertEquals(0, new BigDecimal("42000000").compareTo(resp.getTotalPrice()));
        assertEquals(0, new BigDecimal("2000000").compareTo(resp.getVisaFee()));
        assertEquals(0, new BigDecimal("1200000").compareTo(resp.getConsularFee()));
        assertEquals(depDate.minusDays(10), resp.getVisaDeadline());
        assertTrue(resp.getRequiresVisa());
        assertTrue(resp.getVisaOptIn());

        ArgumentCaptor<VisaApplication> appCaptor = ArgumentCaptor.forClass(VisaApplication.class);
        verify(visaApplicationRepository).save(appCaptor.capture());
        assertEquals(VisaApplicationStatus.PENDING_DOCS, appCaptor.getValue().getStatus());
    }

    @Test
    void agencyWorkflow_enforcesOwnership_privateStorage_statusTransitions_andRetentionPurge() throws Exception {
        Booking booking = Booking.builder()
                .bookingCode("BK-VISA01")
                .user(customerA)
                .tour(japanTour)
                .departureDate(LocalDate.now().plusDays(20))
                .visaDeadline(LocalDate.now().plusDays(10))
                .contactName("Khách A")
                .contactEmail("custA@test.com")
                .totalPrice(new BigDecimal("21000000"))
                .build();
        booking.setId(500L);

        VisaApplication app = VisaApplication.builder()
                .booking(booking)
                .status(VisaApplicationStatus.PENDING_DOCS)
                .documents(new ArrayList<>())
                .statusLogs(new ArrayList<>())
                .build();
        app.setId(900L);

        when(userRepository.findByEmail("custA@test.com")).thenReturn(Optional.of(customerA));
        when(userRepository.findByEmail("custB@test.com")).thenReturn(Optional.of(customerB));
        when(userRepository.findByEmail("vendorA@test.com")).thenReturn(Optional.of(vendorA));
        when(userRepository.findByEmail("vendorB@test.com")).thenReturn(Optional.of(vendorB));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(visaApplicationRepository.findById(900L)).thenReturn(Optional.of(app));
        when(tourRepository.findById(100L)).thenReturn(Optional.of(japanTour));
        when(visaRequirementRepository.findByTourIdOrderByIdAsc(100L)).thenReturn(List.of());

        // 1) Khách B không được xem hồ sơ của Khách A
        assertThrows(ForbiddenException.class, () -> visaService.getApplicationByBooking(500L, "custB@test.com"));

        // 2) Chặn file giả mạo PDF (không có magic bytes %PDF)
        MockMultipartFile fakePdf = new MockMultipartFile("file", "malware.pdf", "application/pdf", "MZ-exe-content".getBytes(StandardCharsets.UTF_8));
        assertThrows(BadRequestException.class, () -> visaService.uploadDocument(900L, 101L, fakePdf, "custA@test.com"));

        // 3) Upload file PDF thật -> lưu private trên đĩa
        byte[] realPdfBytes = "%PDF-1.4\nPassport scan test content".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile realPdf = new MockMultipartFile("file", "passport.pdf", "application/pdf", realPdfBytes);

        when(visaDocumentRepository.findByApplicationIdAndRequirementId(900L, 101L)).thenReturn(Optional.empty());
        when(visaDocumentRepository.save(any(VisaDocument.class))).thenAnswer(inv -> {
            VisaDocument d = inv.getArgument(0);
            d.setId(701L);
            return d;
        });

        visaService.uploadDocument(900L, 101L, realPdf, "custA@test.com");
        assertEquals(1, app.getDocuments().size());
        VisaDocument savedDoc = app.getDocuments().get(0);
        assertTrue(Files.exists(Path.of(savedDoc.getStoredFilePath())));

        // 4) Khách bấm nộp bản mềm -> chuyển sang REVIEWING (Đại lý sơ duyệt), KHÔNG nhảy sang ĐSQ PROCESSING!
        VisaApplicationResponseDto afterSubmit = visaService.submitApplicationToVendor(900L, "custA@test.com");
        assertEquals(VisaApplicationStatus.REVIEWING, afterSubmit.getStatus());

        // 5) Vendor B (không sở hữu tour) bị chặn khi cố tình duyệt hoặc tải file hộ chiếu
        when(visaDocumentRepository.findWithBookingById(701L)).thenReturn(Optional.of(savedDoc));
        assertThrows(ForbiddenException.class, () -> visaService.downloadDocumentFile(701L, "vendorB@test.com"));
        assertThrows(ForbiddenException.class, () -> visaService.updateDocumentStatus(701L, VisaDocumentStatus.APPROVED, null, "vendorB@test.com"));

        // 6) Vendor A (chủ tour) tải file thành công, sơ duyệt đạt, nộp ĐSQ offline -> SUBMITTED -> APPROVED
        VisaService.DownloadedVisaFile dl = visaService.downloadDocumentFile(701L, "vendorA@test.com");
        assertTrue(dl.resource().exists());

        visaService.updateDocumentStatus(701L, VisaDocumentStatus.APPROVED, null, "vendorA@test.com");
        visaService.updateApplicationStatus(900L, VisaApplicationStatus.SUBMITTED, "Đã nộp tại Lãnh sự quán", "VFS-JP-001", "vendorA@test.com");
        assertEquals(VisaApplicationStatus.SUBMITTED, app.getStatus());
        assertEquals("VFS-JP-001", app.getEmbassyReceiptCode());

        visaService.updateApplicationStatus(900L, VisaApplicationStatus.APPROVED, "Đã nhận hộ chiếu dán Visa", null, "vendorA@test.com");
        assertEquals(VisaApplicationStatus.APPROVED, app.getStatus());
        assertNotNull(app.getCompletedAt());
        verify(emailService, atLeast(3)).sendVisaStatusUpdateEmail(any(), any(), any(), any(), any(), any());

        // 6b) Sau khi chốt kết quả cuối (APPROVED / REJECTED) -> khóa cứng, không thể đổi tiến độ hay giấy tờ nữa
        assertThrows(BadRequestException.class, () ->
                visaService.updateApplicationStatus(900L, VisaApplicationStatus.PROCESSING, "Thử đổi lại", null, "vendorA@test.com"));
        assertThrows(BadRequestException.class, () ->
                visaService.updateDocumentStatus(701L, VisaDocumentStatus.REJECTED, "Thử từ chối lại", "vendorA@test.com"));

        // Kiểm tra tương tự với trạng thái REJECTED (bước 5)
        app.setStatus(VisaApplicationStatus.REJECTED);
        assertThrows(BadRequestException.class, () ->
                visaService.updateApplicationStatus(900L, VisaApplicationStatus.APPROVED, "Thử đổi sang đậu", null, "vendorA@test.com"));
        assertThrows(BadRequestException.class, () ->
                visaService.uploadDocument(900L, 101L, realPdf, "custA@test.com"));
        app.setStatus(VisaApplicationStatus.APPROVED);

        // 7) Cleanup scheduler tự động xóa file nhạy cảm sau 30 ngày
        app.setCompletedAt(LocalDateTime.now().minusDays(31));
        when(visaApplicationRepository.findByStatusInAndCompletedAtBefore(any(), any())).thenReturn(List.of(app));

        Path physicalFile = Path.of(savedDoc.getStoredFilePath());
        int purged = cleanupScheduler.purgeExpiredSensitiveVisaFiles();
        assertEquals(1, purged);
        assertFalse(Files.exists(physicalFile));
        assertTrue(savedDoc.getFilePurged());
        assertNull(savedDoc.getStoredFilePath());
    }
}
