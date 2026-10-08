package com.smarttravel.controllers;

import com.smarttravel.dto.request.AiChatRequest;
import com.smarttravel.dto.request.AiReviewAnalysisRequest;
import com.smarttravel.dto.request.AiTourGeneratorRequest;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.AiChatResponse;
import com.smarttravel.dto.response.AiReviewAnalysisResponse;
import com.smarttravel.dto.response.AiTourGeneratorResponse;
import com.smarttravel.services.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI & Chatbot", description = "Các API tích hợp Google Gemini AI cho Khách hàng, Vendor và Admin")
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Trợ lý ảo AI Chatbot tư vấn tour thông minh (Customer)")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.chat(request);
        return ResponseEntity.ok(ApiResponse.success("Phản hồi từ AI Chatbot thành công", response));
    }

    @PostMapping("/generate-tour-content")
    @Operation(summary = "Tự động sinh bài viết mô tả và lịch trình tour bằng AI (Vendor & Admin)")
    public ResponseEntity<ApiResponse<AiTourGeneratorResponse>> generateTourContent(@Valid @RequestBody AiTourGeneratorRequest request) {
        AiTourGeneratorResponse response = aiService.generateTourContent(request);
        return ResponseEntity.ok(ApiResponse.success("Sinh nội dung tour bằng AI thành công", response));
    }

    @PostMapping("/analyze-reviews")
    @Operation(summary = "Phân tích cảm xúc đánh giá của khách hàng (Sentiment Analysis - Admin)")
    public ResponseEntity<ApiResponse<AiReviewAnalysisResponse>> analyzeReviews(@RequestBody AiReviewAnalysisRequest request) {
        AiReviewAnalysisResponse response = aiService.analyzeReviews(request);
        return ResponseEntity.ok(ApiResponse.success("Phân tích cảm xúc đánh giá thành công", response));
    }
}
