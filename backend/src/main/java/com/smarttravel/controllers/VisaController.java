package com.smarttravel.controllers;

import com.smarttravel.dto.request.VisaRequirementRequestDto;
import com.smarttravel.dto.request.VisaTemplateRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.VisaApplicationResponseDto;
import com.smarttravel.dto.response.VisaRequirementResponseDto;
import com.smarttravel.dto.response.VisaTemplateResponse;
import com.smarttravel.enums.VisaApplicationStatus;
import com.smarttravel.enums.VisaDocumentStatus;
import com.smarttravel.services.VisaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Visa Agency Service", description = "APIs quản lý dịch vụ Đại lý sơ duyệt & ủy quyền hồ sơ xin Visa")
public class VisaController {

    private final VisaService visaService;

    // ─────────────────────────────────────────────────────────────
    // PUBLIC
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/tours/{tourId}/visa-requirements")
    @Operation(summary = "Lấy danh mục giấy tờ yêu cầu Visa của Tour (Public)")
    public ResponseEntity<ApiResponse<List<VisaRequirementResponseDto>>> getTourVisaRequirements(@PathVariable Long tourId) {
        List<VisaRequirementResponseDto> reqs = visaService.getRequirementsForTour(tourId);
        return ResponseEntity.ok(ApiResponse.success(reqs));
    }

    // ─────────────────────────────────────────────────────────────
    // CUSTOMER (/api/v1/user/**)
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/user/bookings/{bookingId}/visa-application")
    @Operation(summary = "Khởi tạo hồ sơ ủy quyền xin Visa cho đơn đặt tour của khách")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> createVisaApplication(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto app = visaService.createOrGetApplication(bookingId, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Khởi tạo hồ sơ Visa thành công", app));
    }

    @GetMapping("/user/bookings/{bookingId}/visa-application")
    @Operation(summary = "Xem tiến độ hồ sơ Visa của đơn đặt tour")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> getVisaApplication(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto app = visaService.getApplicationByBooking(bookingId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(app));
    }

    @PostMapping(value = "/user/visa-applications/{applicationId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Khách hàng tải lên bản mềm giấy tờ (PDF/JPG/PNG, lưu private)")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> uploadVisaDocument(
            @PathVariable Long applicationId,
            @RequestParam Long requirementId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto app = visaService.uploadDocument(applicationId, requirementId, file, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tải giấy tờ lên thành công", app));
    }

    @PostMapping("/user/visa-applications/{applicationId}/submit")
    @Operation(summary = "Khách hàng gửi toàn bộ bản mềm cho chuyên viên Đại lý sơ duyệt")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> submitApplicationToVendor(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto app = visaService.submitApplicationToVendor(applicationId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi hồ sơ bản mềm cho Đại lý sơ duyệt", app));
    }

    // ─────────────────────────────────────────────────────────────
    // VENDOR (/api/v1/vendor/**)
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/vendor/visa-templates")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Lấy thư viện mẫu Visa theo quốc gia (có gợi ý theo country)")
    public ResponseEntity<ApiResponse<List<VisaTemplateResponse>>> getVisaTemplates(
            @RequestParam(required = false) String country,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<VisaTemplateResponse> templates = visaService.getTemplates(userDetails.getUsername(), country);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @PostMapping("/vendor/visa-templates")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Tạo mới mẫu hồ sơ Visa theo quốc gia")
    public ResponseEntity<ApiResponse<VisaTemplateResponse>> createVisaTemplate(
            @Valid @RequestBody VisaTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaTemplateResponse created = visaService.createTemplate(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo mẫu Visa thành công", created));
    }

    @PutMapping("/vendor/visa-templates/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Cập nhật mẫu hồ sơ Visa")
    public ResponseEntity<ApiResponse<VisaTemplateResponse>> updateVisaTemplate(
            @PathVariable Long id,
            @Valid @RequestBody VisaTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaTemplateResponse updated = visaService.updateTemplate(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mẫu Visa thành công", updated));
    }

    @DeleteMapping("/vendor/visa-templates/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Xóa mẫu hồ sơ Visa")
    public ResponseEntity<ApiResponse<Void>> deleteVisaTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        visaService.deleteTemplate(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Xóa mẫu Visa thành công", null));
    }

    @PostMapping("/vendor/tours/{tourId}/visa-requirements")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Cấu hình danh mục giấy tờ Visa riêng cho Tour")
    public ResponseEntity<ApiResponse<List<VisaRequirementResponseDto>>> saveTourVisaRequirements(
            @PathVariable Long tourId,
            @Valid @RequestBody List<VisaRequirementRequestDto> requests,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<VisaRequirementResponseDto> saved = visaService.saveTourRequirements(tourId, requests, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Lưu cấu hình giấy tờ Visa thành công", saved));
    }

    @PutMapping("/vendor/tours/{tourId}/visa-template")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Gắn / gỡ mẫu Visa quốc gia cho Tour")
    public ResponseEntity<ApiResponse<Void>> assignTemplateToTour(
            @PathVariable Long tourId,
            @RequestParam(required = false) Long templateId,
            @AuthenticationPrincipal UserDetails userDetails) {
        visaService.assignTemplateToTour(tourId, templateId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mẫu Visa cho Tour thành công", null));
    }

    @GetMapping("/vendor/visa-applications")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Lấy danh sách hồ sơ Visa thuộc các tour do Đại lý quản lý")
    public ResponseEntity<ApiResponse<List<VisaApplicationResponseDto>>> getVendorVisaApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<VisaApplicationResponseDto> apps = visaService.getVendorApplications(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(apps));
    }

    @PutMapping("/vendor/visa-documents/{documentId}/status")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Chuyên viên Đại lý sơ duyệt từng bản mềm giấy tờ")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> updateDocumentStatus(
            @PathVariable Long documentId,
            @RequestParam VisaDocumentStatus status,
            @RequestParam(required = false) String vendorFeedback,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto updated = visaService.updateDocumentStatus(documentId, status, vendorFeedback, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật kết quả kiểm tra giấy tờ", updated));
    }

    @PutMapping("/vendor/visa-applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Chuyên viên Đại lý cập nhật tiến độ nộp ĐSQ offline và kết quả ĐSQ trả về")
    public ResponseEntity<ApiResponse<VisaApplicationResponseDto>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam VisaApplicationStatus status,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String embassyReceiptCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaApplicationResponseDto updated = visaService.updateApplicationStatus(applicationId, status, notes, embassyReceiptCode, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái hồ sơ Visa", updated));
    }

    // ─────────────────────────────────────────────────────────────
    // AUTHENTICATED PRIVATE FILE STREAMING
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/visa-documents/{documentId}/file")
    @Operation(summary = "Xem/tải tệp giấy tờ Visa bảo mật (Chỉ chủ booking, Vendor quản lý tour hoặc Admin)")
    public ResponseEntity<Resource> downloadVisaDocumentFile(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        VisaService.DownloadedVisaFile file = visaService.downloadDocumentFile(documentId, userDetails.getUsername());
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store, max-age=0")
                .body(file.resource());
    }
}
