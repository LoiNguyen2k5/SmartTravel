package com.smarttravel.services;

import com.smarttravel.dto.request.VisaRequirementRequestDto;
import com.smarttravel.dto.request.VisaTemplateRequest;
import com.smarttravel.dto.response.VisaApplicationResponseDto;
import com.smarttravel.dto.response.VisaRequirementResponseDto;
import com.smarttravel.dto.response.VisaTemplateResponse;
import com.smarttravel.enums.VisaApplicationStatus;
import com.smarttravel.enums.VisaDocumentStatus;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VisaService {

    record DownloadedVisaFile(Resource resource, String contentType, String fileName) {}

    // Public
    List<VisaRequirementResponseDto> getRequirementsForTour(Long tourId);

    // Customer (ROLE_USER)
    VisaApplicationResponseDto createOrGetApplication(Long bookingId, String userEmail);
    VisaApplicationResponseDto getApplicationByBooking(Long bookingId, String userEmail);
    VisaApplicationResponseDto uploadDocument(Long applicationId, Long requirementId, MultipartFile file, String userEmail);
    VisaApplicationResponseDto submitApplicationToVendor(Long applicationId, String userEmail);

    // Vendor / Admin
    List<VisaTemplateResponse> getTemplates(String userEmail, String suggestCountry);
    VisaTemplateResponse createTemplate(VisaTemplateRequest request, String userEmail);
    VisaTemplateResponse updateTemplate(Long templateId, VisaTemplateRequest request, String userEmail);
    void deleteTemplate(Long templateId, String userEmail);

    List<VisaRequirementResponseDto> saveTourRequirements(Long tourId, List<VisaRequirementRequestDto> requests, String userEmail);
    void assignTemplateToTour(Long tourId, Long templateId, String userEmail);

    List<VisaApplicationResponseDto> getVendorApplications(String userEmail);
    VisaApplicationResponseDto updateDocumentStatus(Long documentId, VisaDocumentStatus status, String vendorFeedback, String userEmail);
    VisaApplicationResponseDto updateApplicationStatus(Long applicationId, VisaApplicationStatus status, String notes, String embassyReceiptCode, String userEmail);

    // Private Document Streaming
    DownloadedVisaFile downloadDocumentFile(Long documentId, String requesterEmail);
}
