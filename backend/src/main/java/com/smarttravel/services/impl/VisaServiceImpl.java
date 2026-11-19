package com.smarttravel.services.impl;

import com.smarttravel.dto.request.VisaRequirementRequestDto;
import com.smarttravel.dto.request.VisaTemplateRequest;
import com.smarttravel.dto.response.*;
import com.smarttravel.entities.*;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.VisaApplicationStatus;
import com.smarttravel.enums.VisaDocumentStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ForbiddenException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.*;
import com.smarttravel.services.EmailService;
import com.smarttravel.services.VisaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisaServiceImpl implements VisaService {

    private final VisaTemplateRepository visaTemplateRepository;
    private final VisaRequirementRepository visaRequirementRepository;
    private final VisaApplicationRepository visaApplicationRepository;
    private final VisaDocumentRepository visaDocumentRepository;
    private final VisaStatusLogRepository visaStatusLogRepository;
    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.visa.storage-dir:uploads/visa-documents}")
    private String storageDir;

    @Value("${app.visa.max-file-bytes:5242880}")
    private long maxFileBytes;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png");

    @Override
    @Transactional(readOnly = true)
    public List<VisaRequirementResponseDto> getRequirementsForTour(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));

        VisaTemplate tpl = tour.getVisaTemplate();
        BigDecimal visaFee = tpl != null ? tpl.getVisaFee() : null;
        BigDecimal consularFee = tpl != null ? tpl.getConsularFee() : null;
        Integer procDays = tpl != null ? tpl.getProcessingDays() : null;
        Integer bufDays = tpl != null ? tpl.getBufferDays() : null;

        List<VisaRequirement> customReqs = visaRequirementRepository.findByTourIdOrderByIdAsc(tourId);
        if (!customReqs.isEmpty()) {
            return customReqs.stream()
                    .map(r -> VisaRequirementResponseDto.builder()
                            .id(r.getId())
                            .tourId(tourId)
                            .documentName(r.getDocumentName())
                            .description(r.getDescription())
                            .isMandatory(r.getIsMandatory())
                            .visaFee(visaFee)
                            .consularFee(consularFee)
                            .processingDays(procDays)
                            .bufferDays(bufDays)
                            .build())
                    .collect(Collectors.toList());
        }

        if (tpl != null && tpl.getDocuments() != null) {
            return tpl.getDocuments().stream()
                    .map(d -> VisaRequirementResponseDto.builder()
                            .id(d.getId())
                            .tourId(tourId)
                            .documentName(d.getDocumentName())
                            .description(d.getDescription())
                            .isMandatory(d.getIsMandatory())
                            .visaFee(visaFee)
                            .consularFee(consularFee)
                            .processingDays(procDays)
                            .bufferDays(bufDays)
                            .build())
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    @Override
    @Transactional
    public VisaApplicationResponseDto createOrGetApplication(Long bookingId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        assertBookingCustomerOrAdmin(booking, currentUser);

        Optional<VisaApplication> existing = visaApplicationRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            return mapToApplicationResponse(existing.get());
        }

        VisaApplication app = VisaApplication.builder()
                .booking(booking)
                .status(VisaApplicationStatus.PENDING_DOCS)
                .notes("Khởi tạo hồ sơ ủy quyền dịch vụ Visa. Vui lòng tải lên bản chụp/scan các giấy tờ bắt buộc để Đại lý sơ duyệt.")
                .build();

        VisaApplication saved = visaApplicationRepository.save(app);
        appendLog(saved, null, VisaApplicationStatus.PENDING_DOCS, "Khởi tạo hồ sơ Visa", currentUser.getEmail(), "CUSTOMER");
        return mapToApplicationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public VisaApplicationResponseDto getApplicationByBooking(Long bookingId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        assertBookingCustomerOrVendorOrAdmin(booking, currentUser);

        VisaApplication app = visaApplicationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaApplication", "bookingId", bookingId));

        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional
    public VisaApplicationResponseDto uploadDocument(Long applicationId, Long requirementId, MultipartFile file, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        VisaApplication app = visaApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaApplication", "id", applicationId));

        assertBookingCustomerOrAdmin(app.getBooking(), currentUser);

        if (EnumSet.of(VisaApplicationStatus.SUBMITTED, VisaApplicationStatus.PROCESSING, VisaApplicationStatus.APPROVED, VisaApplicationStatus.REJECTED).contains(app.getStatus())) {
            throw new BadRequestException("Hồ sơ đã được Đại lý mang nộp tại ĐSQ hoặc đã có kết quả cuối cùng nên không thể thay đổi giấy tờ.");
        }

        ValidatedFile vf = validateAndInspectFile(file);

        Tour tour = app.getBooking().getTour();
        List<VisaRequirementResponseDto> reqs = tour != null ? getRequirementsForTour(tour.getId()) : Collections.emptyList();
        String docName = reqs.stream()
                .filter(r -> Objects.equals(r.getId(), requirementId))
                .map(VisaRequirementResponseDto::getDocumentName)
                .findFirst()
                .orElse("Giấy tờ hồ sơ Visa #" + requirementId);

        Path savedPath = storePrivateFile(app.getId(), vf.extension(), file);

        Optional<VisaDocument> existingDocOpt = visaDocumentRepository.findByApplicationIdAndRequirementId(applicationId, requirementId);
        VisaDocument doc;
        if (existingDocOpt.isPresent()) {
            doc = existingDocOpt.get();
            deletePhysicalFileQuietly(doc.getStoredFilePath());
            doc.setDocumentName(docName);
            doc.setOriginalFileName(vf.safeOriginalName());
            doc.setContentType(vf.contentType());
            doc.setFileSize(file.getSize());
            doc.setStoredFilePath(savedPath.toString());
            doc.setFilePurged(false);
            doc.setStatus(VisaDocumentStatus.PENDING);
            doc.setVendorFeedback(null);
            doc.setReviewedAt(null);
            doc.setReviewedBy(null);
        } else {
            doc = VisaDocument.builder()
                    .application(app)
                    .requirementId(requirementId)
                    .documentName(docName)
                    .originalFileName(vf.safeOriginalName())
                    .contentType(vf.contentType())
                    .fileSize(file.getSize())
                    .storedFilePath(savedPath.toString())
                    .filePurged(false)
                    .status(VisaDocumentStatus.PENDING)
                    .build();
            app.getDocuments().add(doc);
        }

        visaDocumentRepository.save(doc);
        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional
    public VisaApplicationResponseDto submitApplicationToVendor(Long applicationId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        VisaApplication app = visaApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaApplication", "id", applicationId));

        assertBookingCustomerOrAdmin(app.getBooking(), currentUser);

        if (!EnumSet.of(VisaApplicationStatus.PENDING_DOCS, VisaApplicationStatus.NEED_MORE_DOCS, VisaApplicationStatus.REVIEWING).contains(app.getStatus())) {
            throw new BadRequestException("Hồ sơ hiện không ở trạng thái chờ gửi bản mềm cho Đại lý.");
        }

        Tour tour = app.getBooking().getTour();
        List<VisaRequirementResponseDto> reqs = tour != null ? getRequirementsForTour(tour.getId()) : Collections.emptyList();
        Set<Long> uploadedReqIds = app.getDocuments().stream()
                .filter(d -> !Boolean.TRUE.equals(d.getFilePurged()) && d.getStoredFilePath() != null)
                .map(VisaDocument::getRequirementId)
                .collect(Collectors.toSet());

        List<String> missingMandatory = reqs.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsMandatory()) && !uploadedReqIds.contains(r.getId()))
                .map(VisaRequirementResponseDto::getDocumentName)
                .collect(Collectors.toList());

        if (!missingMandatory.isEmpty()) {
            throw new BadRequestException("Vui lòng tải lên đầy đủ giấy tờ bắt buộc trước khi gửi Đại lý sơ duyệt: " + String.join(", ", missingMandatory));
        }

        boolean hasUnfixedRejectedDoc = app.getDocuments().stream()
                .anyMatch(d -> d.getStatus() == VisaDocumentStatus.REJECTED);
        if (hasUnfixedRejectedDoc) {
            throw new BadRequestException("Vui lòng tải lại file mới cho các giấy tờ bị yêu cầu bổ sung trước khi gửi lại cho Đại lý.");
        }

        VisaApplicationStatus prev = app.getStatus();
        app.setStatus(VisaApplicationStatus.REVIEWING);
        app.setSubmittedAt(LocalDateTime.now());
        app.setNotes("Khách hàng đã gửi đủ bản mềm trực tuyến. Đang chờ chuyên viên Đại lý sơ duyệt tính hợp lệ.");
        visaApplicationRepository.save(app);

        appendLog(app, prev, VisaApplicationStatus.REVIEWING, "Khách hàng nộp bản mềm để Đại lý sơ duyệt", currentUser.getEmail(), "CUSTOMER");
        notifyCustomerStatusChange(app, VisaApplicationStatus.REVIEWING, app.getNotes());

        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisaTemplateResponse> getTemplates(String userEmail, String suggestCountry) {
        User user = getUserByEmail(userEmail);
        boolean isAdmin = hasRole(user, RoleEnum.ROLE_ADMIN);
        List<VisaTemplate> templates = isAdmin
                ? visaTemplateRepository.findAllByOrderByCountryAsc()
                : visaTemplateRepository.findAvailableForVendor(user.getId());

        if (suggestCountry != null && !suggestCountry.isBlank()) {
            String needle = suggestCountry.trim().toLowerCase(Locale.ROOT);
            templates = new ArrayList<>(templates);
            templates.sort(Comparator.comparingInt(t ->
                    (t.getCountry() != null && t.getCountry().toLowerCase(Locale.ROOT).contains(needle))
                    || (needle.contains(t.getCountry() != null ? t.getCountry().toLowerCase(Locale.ROOT) : "---"))
                            ? 0 : 1));
        }

        return templates.stream()
                .map(this::mapToTemplateResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VisaTemplateResponse createTemplate(VisaTemplateRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        boolean isAdmin = hasRole(user, RoleEnum.ROLE_ADMIN);

        VisaTemplate template = VisaTemplate.builder()
                .country(request.getCountry().trim())
                .countryCode(request.getCountryCode().trim().toUpperCase(Locale.ROOT))
                .flagEmoji(request.getFlagEmoji() != null && !request.getFlagEmoji().isBlank() ? request.getFlagEmoji().trim() : "🌍")
                .processingDays(request.getProcessingDays() != null ? request.getProcessingDays() : 7)
                .bufferDays(request.getBufferDays() != null ? request.getBufferDays() : 3)
                .visaFee(request.getVisaFee() != null ? request.getVisaFee() : BigDecimal.ZERO)
                .consularFee(request.getConsularFee() != null ? request.getConsularFee() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .vendor(isAdmin ? null : user)
                .build();

        if (request.getDocuments() != null) {
            for (VisaRequirementRequestDto d : request.getDocuments()) {
                if (d.getDocumentName() == null || d.getDocumentName().isBlank()) continue;
                template.getDocuments().add(VisaTemplateDocument.builder()
                        .template(template)
                        .documentName(d.getDocumentName().trim())
                        .description(d.getDescription())
                        .isMandatory(d.getIsMandatory() == null || d.getIsMandatory())
                        .build());
            }
        }

        VisaTemplate saved = visaTemplateRepository.save(template);
        return mapToTemplateResponse(saved);
    }

    @Override
    @Transactional
    public VisaTemplateResponse updateTemplate(Long templateId, VisaTemplateRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        boolean isAdmin = hasRole(user, RoleEnum.ROLE_ADMIN);

        VisaTemplate template = visaTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaTemplate", "id", templateId));

        if (!isAdmin && template.getVendor() != null && !template.getVendor().getId().equals(user.getId())) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa mẫu Visa của đại lý khác.");
        }

        template.setCountry(request.getCountry().trim());
        template.setCountryCode(request.getCountryCode().trim().toUpperCase(Locale.ROOT));
        if (request.getFlagEmoji() != null) template.setFlagEmoji(request.getFlagEmoji().trim());
        if (request.getProcessingDays() != null) template.setProcessingDays(request.getProcessingDays());
        if (request.getBufferDays() != null) template.setBufferDays(request.getBufferDays());
        if (request.getVisaFee() != null) template.setVisaFee(request.getVisaFee());
        if (request.getConsularFee() != null) template.setConsularFee(request.getConsularFee());
        template.setNotes(request.getNotes());

        template.getDocuments().clear();
        if (request.getDocuments() != null) {
            for (VisaRequirementRequestDto d : request.getDocuments()) {
                if (d.getDocumentName() == null || d.getDocumentName().isBlank()) continue;
                template.getDocuments().add(VisaTemplateDocument.builder()
                        .template(template)
                        .documentName(d.getDocumentName().trim())
                        .description(d.getDescription())
                        .isMandatory(d.getIsMandatory() == null || d.getIsMandatory())
                        .build());
            }
        }

        VisaTemplate saved = visaTemplateRepository.save(template);
        return mapToTemplateResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long templateId, String userEmail) {
        User user = getUserByEmail(userEmail);
        boolean isAdmin = hasRole(user, RoleEnum.ROLE_ADMIN);

        VisaTemplate template = visaTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaTemplate", "id", templateId));

        if (!isAdmin && template.getVendor() != null && !template.getVendor().getId().equals(user.getId())) {
            throw new ForbiddenException("Bạn không có quyền xóa mẫu Visa của đại lý khác.");
        }

        List<Tour> linkedTours = tourRepository.findByVisaTemplateId(templateId);
        for (Tour t : linkedTours) {
            t.setVisaTemplate(null);
        }
        if (!linkedTours.isEmpty()) {
            tourRepository.saveAll(linkedTours);
        }

        visaTemplateRepository.delete(template);
    }

    @Override
    @Transactional
    public List<VisaRequirementResponseDto> saveTourRequirements(Long tourId, List<VisaRequirementRequestDto> requests, String userEmail) {
        User user = getUserByEmail(userEmail);
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));

        assertTourVendorOrAdmin(tour, user);

        visaRequirementRepository.deleteByTourId(tourId);
        visaRequirementRepository.flush();

        if (requests != null && !requests.isEmpty()) {
            List<VisaRequirement> toSave = requests.stream()
                    .filter(r -> r.getDocumentName() != null && !r.getDocumentName().isBlank())
                    .map(r -> VisaRequirement.builder()
                            .tour(tour)
                            .documentName(r.getDocumentName().trim())
                            .description(r.getDescription())
                            .isMandatory(r.getIsMandatory() == null || r.getIsMandatory())
                            .build())
                    .collect(Collectors.toList());
            visaRequirementRepository.saveAll(toSave);
        }

        return getRequirementsForTour(tourId);
    }

    @Override
    @Transactional
    public void assignTemplateToTour(Long tourId, Long templateId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));

        assertTourVendorOrAdmin(tour, user);

        if (templateId == null) {
            tour.setVisaTemplate(null);
        } else {
            VisaTemplate tpl = visaTemplateRepository.findById(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("VisaTemplate", "id", templateId));
            tour.setVisaTemplate(tpl);
        }
        tourRepository.save(tour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisaApplicationResponseDto> getVendorApplications(String userEmail) {
        User user = getUserByEmail(userEmail);
        boolean isAdmin = hasRole(user, RoleEnum.ROLE_ADMIN);

        List<VisaApplication> apps = isAdmin
                ? visaApplicationRepository.findAllByOrderByCreatedAtDesc()
                : visaApplicationRepository.findByBookingTourVendorIdOrderByCreatedAtDesc(user.getId());

        return apps.stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VisaApplicationResponseDto updateDocumentStatus(Long documentId, VisaDocumentStatus status, String vendorFeedback, String userEmail) {
        User vendor = getUserByEmail(userEmail);
        VisaDocument doc = visaDocumentRepository.findWithBookingById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaDocument", "id", documentId));

        VisaApplication app = doc.getApplication();
        assertTourVendorOrAdmin(app.getBooking().getTour(), vendor);

        if (app.getStatus() == VisaApplicationStatus.APPROVED || app.getStatus() == VisaApplicationStatus.REJECTED) {
            throw new BadRequestException("Hồ sơ Visa đã có kết quả cuối cùng từ ĐSQ nên không thể chỉnh sửa trạng thái giấy tờ.");
        }

        if (status == VisaDocumentStatus.REJECTED && (vendorFeedback == null || vendorFeedback.isBlank())) {
            vendorFeedback = "Giấy tờ chưa rõ nét hoặc chưa đúng quy cách. Quý khách vui lòng chụp/tải lại bản mới.";
        }

        doc.setStatus(status);
        doc.setVendorFeedback(status == VisaDocumentStatus.REJECTED ? vendorFeedback : null);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setReviewedBy(vendor.getFullName());
        visaDocumentRepository.save(doc);

        if (status == VisaDocumentStatus.REJECTED
                && EnumSet.of(VisaApplicationStatus.PENDING_DOCS, VisaApplicationStatus.REVIEWING).contains(app.getStatus())) {
            VisaApplicationStatus prev = app.getStatus();
            app.setStatus(VisaApplicationStatus.NEED_MORE_DOCS);
            String msg = "Đại lý yêu cầu bổ sung / tải lại giấy tờ \"" + doc.getDocumentName() + "\": " + doc.getVendorFeedback();
            app.setNotes(msg);
            visaApplicationRepository.save(app);
            appendLog(app, prev, VisaApplicationStatus.NEED_MORE_DOCS, msg, vendor.getEmail(), hasRole(vendor, RoleEnum.ROLE_ADMIN) ? "ADMIN" : "VENDOR");
            notifyCustomerStatusChange(app, VisaApplicationStatus.NEED_MORE_DOCS, msg);
        }

        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional
    public VisaApplicationResponseDto updateApplicationStatus(
            Long applicationId,
            VisaApplicationStatus targetStatus,
            String notes,
            String embassyReceiptCode,
            String userEmail) {

        User vendor = getUserByEmail(userEmail);
        VisaApplication app = visaApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaApplication", "id", applicationId));

        assertTourVendorOrAdmin(app.getBooking().getTour(), vendor);

        if (app.getStatus() == VisaApplicationStatus.APPROVED || app.getStatus() == VisaApplicationStatus.REJECTED) {
            throw new BadRequestException("Hồ sơ Visa đã có kết quả cuối cùng (" + statusLabel(app.getStatus()) + ") nên không thể thay đổi tiến độ.");
        }

        if (targetStatus == VisaApplicationStatus.SUBMITTED || targetStatus == VisaApplicationStatus.PROCESSING) {
            boolean anyRejected = app.getDocuments().stream().anyMatch(d -> d.getStatus() == VisaDocumentStatus.REJECTED);
            if (anyRejected) {
                throw new BadRequestException("Không thể chuyển sang trạng thái nộp ĐSQ khi vẫn còn giấy tờ bị từ chối chưa bổ sung.");
            }
        }

        VisaApplicationStatus prev = app.getStatus();
        app.setStatus(targetStatus);
        if (notes != null && !notes.isBlank()) {
            app.setNotes(notes.trim());
        }
        if (embassyReceiptCode != null && !embassyReceiptCode.isBlank()) {
            app.setEmbassyReceiptCode(embassyReceiptCode.trim());
        }
        if (targetStatus == VisaApplicationStatus.SUBMITTED && app.getSubmittedAt() == null) {
            app.setSubmittedAt(LocalDateTime.now());
        }
        if (targetStatus == VisaApplicationStatus.APPROVED || targetStatus == VisaApplicationStatus.REJECTED) {
            app.setCompletedAt(LocalDateTime.now());
        }

        visaApplicationRepository.save(app);

        String logNote = (notes != null && !notes.isBlank()) ? notes.trim() : statusLabel(targetStatus);
        if (embassyReceiptCode != null && !embassyReceiptCode.isBlank()) {
            logNote += " (Mã biên nhận ĐSQ/VFS: " + embassyReceiptCode.trim() + ")";
        }

        appendLog(app, prev, targetStatus, logNote, vendor.getEmail(), hasRole(vendor, RoleEnum.ROLE_ADMIN) ? "ADMIN" : "VENDOR");
        notifyCustomerStatusChange(app, targetStatus, logNote);

        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadedVisaFile downloadDocumentFile(Long documentId, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        VisaDocument doc = visaDocumentRepository.findWithBookingById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("VisaDocument", "id", documentId));

        assertBookingCustomerOrVendorOrAdmin(doc.getApplication().getBooking(), requester);

        if (Boolean.TRUE.equals(doc.getFilePurged()) || doc.getStoredFilePath() == null || doc.getStoredFilePath().isBlank()) {
            throw new ResourceNotFoundException("VisaDocumentFile", "id", documentId);
        }

        Path rootDir = Paths.get(storageDir).toAbsolutePath().normalize();
        Path filePath = Paths.get(doc.getStoredFilePath()).toAbsolutePath().normalize();
        if (!filePath.startsWith(rootDir) || !Files.exists(filePath)) {
            throw new ResourceNotFoundException("VisaDocumentFile", "id", documentId);
        }

        String contentType = doc.getContentType() != null ? doc.getContentType() : "application/octet-stream";
        String fileName = doc.getOriginalFileName() != null ? doc.getOriginalFileName() : ("visa-doc-" + documentId);
        return new DownloadedVisaFile(new PathResource(filePath), contentType, fileName);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private record ValidatedFile(String safeOriginalName, String extension, String contentType) {}

    private ValidatedFile validateAndInspectFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tải lên không được để trống.");
        }
        if (file.getSize() > maxFileBytes) {
            throw new BadRequestException("Dung lượng tệp vượt quá giới hạn cho phép (tối đa " + (maxFileBytes / (1024 * 1024)) + "MB).");
        }

        String rawName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String baseName = Paths.get(rawName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
        int dotIdx = baseName.lastIndexOf('.');
        String ext = dotIdx >= 0 ? baseName.substring(dotIdx).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Định dạng tệp không hợp lệ. Chỉ chấp nhận PDF, JPG, JPEG hoặc PNG.");
        }

        byte[] header = new byte[8];
        int read;
        try (InputStream is = file.getInputStream()) {
            read = is.read(header);
        } catch (IOException e) {
            throw new BadRequestException("Không thể đọc nội dung tệp tải lên.");
        }

        if (read < 4) {
            throw new BadRequestException("Tệp tải lên bị hỏng hoặc không hợp lệ.");
        }

        boolean isPdf = header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46; // %PDF
        boolean isJpeg = (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
        boolean isPng = (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;

        if (".pdf".equals(ext) && !isPdf) {
            throw new BadRequestException("Nội dung tệp không đúng chuẩn PDF.");
        }
        if ((".jpg".equals(ext) || ".jpeg".equals(ext)) && !isJpeg) {
            throw new BadRequestException("Nội dung tệp không đúng chuẩn ảnh JPEG.");
        }
        if (".png".equals(ext) && !isPng) {
            throw new BadRequestException("Nội dung tệp không đúng chuẩn ảnh PNG.");
        }

        String detectedContentType = isPdf ? "application/pdf" : isPng ? "image/png" : "image/jpeg";
        return new ValidatedFile(baseName, ext, detectedContentType);
    }

    private Path storePrivateFile(Long applicationId, String extension, MultipartFile file) {
        try {
            Path rootDir = Paths.get(storageDir).toAbsolutePath().normalize();
            Path appDir = rootDir.resolve("app-" + applicationId).normalize();
            if (!appDir.startsWith(rootDir)) {
                throw new BadRequestException("Đường dẫn lưu trữ không hợp lệ.");
            }
            Files.createDirectories(appDir);
            Path target = appDir.resolve(UUID.randomUUID() + extension).normalize();
            if (!target.startsWith(rootDir)) {
                throw new BadRequestException("Đường dẫn tệp không hợp lệ.");
            }
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return target;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu trữ tệp giấy tờ bảo mật: " + e.getMessage(), e);
        }
    }

    private void deletePhysicalFileQuietly(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) return;
        try {
            Path rootDir = Paths.get(storageDir).toAbsolutePath().normalize();
            Path p = Paths.get(storedPath).toAbsolutePath().normalize();
            if (p.startsWith(rootDir)) {
                Files.deleteIfExists(p);
            }
        } catch (Exception e) {
            log.warn("Không thể xóa tệp cũ {}: {}", storedPath, e.getMessage());
        }
    }

    private void appendLog(VisaApplication app, VisaApplicationStatus from, VisaApplicationStatus to, String note, String actorEmail, String actorRole) {
        VisaStatusLog logEntry = VisaStatusLog.builder()
                .application(app)
                .fromStatus(from)
                .toStatus(to)
                .note(note)
                .actorEmail(actorEmail)
                .actorRole(actorRole)
                .build();
        visaStatusLogRepository.save(logEntry);
        app.getStatusLogs().add(0, logEntry);
    }

    private void notifyCustomerStatusChange(VisaApplication app, VisaApplicationStatus status, String note) {
        Booking b = app.getBooking();
        if (b == null) return;
        String email = b.getContactEmail() != null ? b.getContactEmail() : (b.getUser() != null ? b.getUser().getEmail() : null);
        String name = b.getContactName() != null ? b.getContactName() : (b.getUser() != null ? b.getUser().getFullName() : "Quý khách");
        String tourTitle = b.getTour() != null ? b.getTour().getTitle() : "Tour quốc tế";
        emailService.sendVisaStatusUpdateEmail(email, name, b.getBookingCode(), tourTitle, statusLabel(status), note);
    }

    private String statusLabel(VisaApplicationStatus status) {
        return switch (status) {
            case PENDING_DOCS -> "Chờ tải lên bản mềm hồ sơ";
            case REVIEWING -> "Đại lý đang sơ duyệt bản mềm";
            case NEED_MORE_DOCS -> "Đại lý yêu cầu bổ sung / chụp lại giấy tờ";
            case SUBMITTED -> "Đại lý đã nộp hồ sơ tại ĐSQ / Trung tâm thị thực (Offline)";
            case PROCESSING -> "Hồ sơ đang chờ kết quả từ ĐSQ / Lãnh sự quán";
            case APPROVED -> "ĐSQ đã cấp Visa thành công (Đại lý cập nhật)";
            case REJECTED -> "ĐSQ từ chối cấp Visa (Đại lý cập nhật)";
        };
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private boolean hasRole(User user, RoleEnum role) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName() == role);
    }

    private void assertBookingCustomerOrAdmin(Booking booking, User user) {
        if (hasRole(user, RoleEnum.ROLE_ADMIN)) return;
        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Bạn không có quyền truy cập hồ sơ Visa của đơn đặt tour này.");
        }
    }

    private void assertTourVendorOrAdmin(Tour tour, User user) {
        if (hasRole(user, RoleEnum.ROLE_ADMIN)) return;
        if (tour == null || tour.getVendor() == null || !tour.getVendor().getId().equals(user.getId())) {
            throw new ForbiddenException("Bạn chỉ có quyền xử lý hồ sơ Visa thuộc các tour do đại lý của mình quản lý.");
        }
    }

    private void assertBookingCustomerOrVendorOrAdmin(Booking booking, User user) {
        if (hasRole(user, RoleEnum.ROLE_ADMIN)) return;
        boolean isCustomer = booking.getUser() != null && booking.getUser().getId().equals(user.getId());
        boolean isTourVendor = booking.getTour() != null && booking.getTour().getVendor() != null
                && booking.getTour().getVendor().getId().equals(user.getId());
        if (!isCustomer && !isTourVendor) {
            throw new ForbiddenException("Bạn không có quyền xem tài liệu bảo mật của hồ sơ Visa này.");
        }
    }

    private VisaTemplateResponse mapToTemplateResponse(VisaTemplate t) {
        long tourCount = t.getId() != null ? tourRepository.countByVisaTemplateId(t.getId()) : 0L;
        List<VisaTemplateResponse.VisaTemplateDocumentDto> docs = (t.getDocuments() == null ? Collections.<VisaTemplateDocument>emptyList() : t.getDocuments())
                .stream()
                .map(d -> VisaTemplateResponse.VisaTemplateDocumentDto.builder()
                        .id(d.getId())
                        .documentName(d.getDocumentName())
                        .description(d.getDescription())
                        .isMandatory(d.getIsMandatory())
                        .build())
                .collect(Collectors.toList());

        return VisaTemplateResponse.builder()
                .id(t.getId())
                .country(t.getCountry())
                .countryCode(t.getCountryCode())
                .flagEmoji(t.getFlagEmoji())
                .processingDays(t.getProcessingDays())
                .bufferDays(t.getBufferDays())
                .visaFee(t.getVisaFee())
                .consularFee(t.getConsularFee())
                .notes(t.getNotes())
                .vendorId(t.getVendor() != null ? t.getVendor().getId() : null)
                .isSystemDefault(t.getVendor() == null)
                .tourCount(tourCount)
                .documents(docs)
                .build();
    }

    private VisaApplicationResponseDto mapToApplicationResponse(VisaApplication app) {
        Booking b = app.getBooking();
        Tour tour = b != null ? b.getTour() : null;
        VisaTemplate tpl = tour != null ? tour.getVisaTemplate() : null;

        Integer procDays = tpl != null ? tpl.getProcessingDays() : 7;
        Integer bufDays = tpl != null ? tpl.getBufferDays() : 3;
        LocalDate depDate = b != null ? b.getDepartureDate() : null;
        if (depDate == null && b != null && b.getTourSchedule() != null) {
            depDate = b.getTourSchedule().getStartDate();
        }
        LocalDate deadline = b != null && b.getVisaDeadline() != null
                ? b.getVisaDeadline()
                : (depDate != null ? depDate.minusDays((procDays != null ? procDays : 7) + (bufDays != null ? bufDays : 3)) : null);

        List<VisaDocumentResponseDto> docs = (app.getDocuments() == null ? Collections.<VisaDocument>emptyList() : app.getDocuments())
                .stream()
                .map(d -> {
                    boolean hasFile = !Boolean.TRUE.equals(d.getFilePurged()) && d.getStoredFilePath() != null && !d.getStoredFilePath().isBlank();
                    return VisaDocumentResponseDto.builder()
                            .id(d.getId())
                            .requirementId(d.getRequirementId())
                            .documentName(d.getDocumentName())
                            .originalFileName(d.getOriginalFileName())
                            .contentType(d.getContentType())
                            .fileSize(d.getFileSize())
                            .fileUrl(hasFile ? "/api/v1/visa-documents/" + d.getId() + "/file" : null)
                            .hasFile(hasFile)
                            .filePurged(d.getFilePurged())
                            .status(d.getStatus())
                            .vendorFeedback(d.getVendorFeedback())
                            .reviewedAt(d.getReviewedAt())
                            .reviewedBy(d.getReviewedBy())
                            .build();
                })
                .collect(Collectors.toList());

        List<VisaStatusLogDto> logs = (app.getStatusLogs() == null ? Collections.<VisaStatusLog>emptyList() : app.getStatusLogs())
                .stream()
                .map(l -> VisaStatusLogDto.builder()
                        .id(l.getId())
                        .fromStatus(l.getFromStatus())
                        .toStatus(l.getToStatus())
                        .note(l.getNote())
                        .actorEmail(l.getActorEmail())
                        .actorRole(l.getActorRole())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return VisaApplicationResponseDto.builder()
                .id(app.getId())
                .bookingId(b != null ? b.getId() : null)
                .bookingCode(b != null ? b.getBookingCode() : null)
                .tourId(tour != null ? tour.getId() : null)
                .tourTitle(tour != null ? tour.getTitle() : null)
                .departureDate(depDate)
                .visaDeadline(deadline)
                .templateId(tpl != null ? tpl.getId() : null)
                .country(tpl != null ? tpl.getCountry() : null)
                .processingDays(procDays)
                .bufferDays(bufDays)
                .visaFee(b != null && b.getVisaFee() != null ? b.getVisaFee() : (tpl != null ? tpl.getVisaFee() : BigDecimal.ZERO))
                .consularFee(b != null && b.getConsularFee() != null ? b.getConsularFee() : (tpl != null ? tpl.getConsularFee() : BigDecimal.ZERO))
                .customerName(b != null ? b.getContactName() : null)
                .contactEmail(b != null ? b.getContactEmail() : null)
                .contactPhone(b != null ? b.getContactPhone() : null)
                .status(app.getStatus())
                .notes(app.getNotes())
                .embassyReceiptCode(app.getEmbassyReceiptCode())
                .submittedAt(app.getSubmittedAt())
                .completedAt(app.getCompletedAt())
                .updatedAt(app.getUpdatedAt())
                .documents(docs)
                .statusLogs(logs)
                .build();
    }
}
