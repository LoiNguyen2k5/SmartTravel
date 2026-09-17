package com.smarttravel.controllers;

import com.smarttravel.dto.request.ContactRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.services.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contact", description = "API tiếp nhận tin nhắn hỗ trợ và liên hệ từ khách hàng")
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    @Operation(summary = "Gửi tin nhắn liên hệ tới email hỗ trợ của Smart Travel")
    public ResponseEntity<ApiResponse<Void>> submitContactForm(@Valid @RequestBody ContactRequest request) {
        log.info("Received contact form submission from: {} ({})", request.getFullName(), request.getEmail());
        
        emailService.sendContactEmail(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getSubject(),
                request.getMessage()
        );

        return ResponseEntity.ok(ApiResponse.success("Tin nhắn của bạn đã được gửi thành công đến đội ngũ hỗ trợ!", null));
    }
}
