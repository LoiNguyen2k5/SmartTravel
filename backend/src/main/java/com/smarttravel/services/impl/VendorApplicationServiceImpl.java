package com.smarttravel.services.impl;

import com.smarttravel.dto.request.VendorApplicationRequest;
import com.smarttravel.dto.request.VendorApplicationReviewRequest;
import com.smarttravel.dto.response.VendorApplicationResponse;
import com.smarttravel.entities.Role;
import com.smarttravel.entities.User;
import com.smarttravel.entities.VendorApplication;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.VendorApplicationStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.RoleRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.repositories.VendorApplicationRepository;
import com.smarttravel.services.EmailService;
import com.smarttravel.services.VendorApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorApplicationServiceImpl implements VendorApplicationService {

    private final VendorApplicationRepository vendorApplicationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public VendorApplicationResponse submitApplication(VendorApplicationRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // 1. Kiểm tra tài khoản đã là Vendor chưa
        boolean isAlreadyVendor = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleEnum.ROLE_VENDOR);
        if (isAlreadyVendor) {
            throw new BadRequestException("Tài khoản của bạn đã là Nhà Cung Cấp (Vendor) trên hệ thống.");
        }

        // 2. Kiểm tra xem có hồ sơ nào đang chờ duyệt không
        boolean hasPending = vendorApplicationRepository.existsByUserAndStatus(user, VendorApplicationStatus.PENDING_REVIEW);
        if (hasPending) {
            throw new BadRequestException("Bạn đã có một hồ sơ đăng ký đang chờ Ban Quản Trị xét duyệt.");
        }

        // 3. Tạo mới VendorApplication
        VendorApplication application = VendorApplication.builder()
                .user(user)
                .businessName(request.getBusinessName().trim())
                .taxCode(request.getTaxCode().trim())
                .businessAddress(request.getBusinessAddress().trim())
                .hotline(request.getHotline().trim())
                .contactEmail(request.getContactEmail() != null && !request.getContactEmail().isBlank()
                        ? request.getContactEmail().trim()
                        : user.getEmail())
                .website(request.getWebsite() != null ? request.getWebsite().trim() : null)
                .description(request.getDescription())
                .representativeName(request.getRepresentativeName().trim())
                .businessLicenseUrl(request.getBusinessLicenseUrl())
                .idCardFrontUrl(request.getIdCardFrontUrl())
                .idCardBackUrl(request.getIdCardBackUrl())
                .status(VendorApplicationStatus.PENDING_REVIEW)
                .build();

        VendorApplication saved = vendorApplicationRepository.save(application);
        log.info("Người dùng {} vừa nộp đơn đăng ký Vendor: [Cty: {} - MST: {}]",
                userEmail, saved.getBusinessName(), saved.getTaxCode());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public VendorApplicationResponse getMyApplication(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return vendorApplicationRepository.findTopByUserOrderByCreatedAtDesc(user)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorApplicationResponse> getAllApplications(VendorApplicationStatus status) {
        List<VendorApplication> list;
        if (status != null) {
            list = vendorApplicationRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = vendorApplicationRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VendorApplicationResponse getApplicationById(Long id) {
        VendorApplication application = vendorApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorApplication", "id", id));
        return mapToResponse(application);
    }

    @Override
    @Transactional
    public VendorApplicationResponse reviewApplication(Long applicationId, VendorApplicationReviewRequest request, String adminEmail) {
        VendorApplication application = vendorApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VendorApplication", "id", applicationId));

        if (application.getStatus() == VendorApplicationStatus.APPROVED) {
            throw new BadRequestException("Hồ sơ này đã được phê duyệt trước đó.");
        }

        User user = application.getUser();

        if (request.getStatus() == VendorApplicationStatus.APPROVED) {
            // Cấp quyền ROLE_VENDOR
            Role vendorRole = roleRepository.findByName(RoleEnum.ROLE_VENDOR)
                    .orElseGet(() -> roleRepository.save(new Role(null, RoleEnum.ROLE_VENDOR)));

            user.getRoles().add(vendorRole);
            userRepository.save(user);

            application.setStatus(VendorApplicationStatus.APPROVED);
            application.setRejectionReason(null);
            application.setReviewedBy(adminEmail);
            application.setReviewedAt(LocalDateTime.now());
            vendorApplicationRepository.save(application);

            log.info("Admin {} đã DUYỆT hồ sơ Vendor #{} cho user {}", adminEmail, applicationId, user.getEmail());

            // Gửi email chúc mừng và hướng dẫn
            emailService.sendVendorApplicationApprovedEmail(user.getEmail(), application.getBusinessName());

        } else if (request.getStatus() == VendorApplicationStatus.REJECTED) {
            application.setStatus(VendorApplicationStatus.REJECTED);
            application.setRejectionReason(request.getReason() != null ? request.getReason().trim() : "Thông tin chưa hợp lệ");
            application.setReviewedBy(adminEmail);
            application.setReviewedAt(LocalDateTime.now());
            vendorApplicationRepository.save(application);

            log.info("Admin {} đã TỪ CHỐI hồ sơ Vendor #{} của user {}. Lý do: {}",
                    adminEmail, applicationId, user.getEmail(), application.getRejectionReason());

            // Gửi email thông báo từ chối kèm lý do
            emailService.sendVendorApplicationRejectedEmail(user.getEmail(), application.getBusinessName(), application.getRejectionReason());

        } else {
            throw new BadRequestException("Trạng thái phê duyệt không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED.");
        }

        return mapToResponse(application);
    }

    @Override
    @Transactional
    public VendorApplicationResponse revokeVendor(Long applicationId, String adminEmail) {
        VendorApplication application = vendorApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VendorApplication", "id", applicationId));

        User user = application.getUser();
        if (user != null && user.getRoles() != null) {
            user.getRoles().removeIf(r -> r.getName() == RoleEnum.ROLE_VENDOR);
            Role userRole = roleRepository.findByName(RoleEnum.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(null, RoleEnum.ROLE_USER)));
            user.getRoles().add(userRole);
            userRepository.save(user);
            log.info("Admin {} đã THU HỒI quyền ROLE_VENDOR của user {}, tài khoản trở về ROLE_USER", adminEmail, user.getEmail());
        }

        application.setStatus(VendorApplicationStatus.REVOKED);
        application.setRejectionReason("Thu hồi tư cách đối tác Vendor bởi Admin");
        application.setReviewedBy(adminEmail);
        application.setReviewedAt(LocalDateTime.now());
        VendorApplication updated = vendorApplicationRepository.save(application);

        return mapToResponse(updated);
    }

    private VendorApplicationResponse mapToResponse(VendorApplication app) {
        User u = app.getUser();
        return VendorApplicationResponse.builder()
                .id(app.getId())
                .userId(u != null ? u.getId() : null)
                .userEmail(u != null ? u.getEmail() : null)
                .userFullName(u != null ? u.getFullName() : null)
                .userPhone(u != null ? u.getPhone() : null)
                .businessName(app.getBusinessName())
                .taxCode(app.getTaxCode())
                .businessAddress(app.getBusinessAddress())
                .hotline(app.getHotline())
                .contactEmail(app.getContactEmail())
                .website(app.getWebsite())
                .description(app.getDescription())
                .representativeName(app.getRepresentativeName())
                .businessLicenseUrl(app.getBusinessLicenseUrl())
                .idCardFrontUrl(app.getIdCardFrontUrl())
                .idCardBackUrl(app.getIdCardBackUrl())
                .status(app.getStatus())
                .rejectionReason(app.getRejectionReason())
                .reviewedBy(app.getReviewedBy())
                .reviewedAt(app.getReviewedAt())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
