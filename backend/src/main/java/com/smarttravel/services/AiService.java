package com.smarttravel.services;

import com.smarttravel.dto.request.AiChatRequest;
import com.smarttravel.dto.request.AiReviewAnalysisRequest;
import com.smarttravel.dto.request.AiTourGeneratorRequest;
import com.smarttravel.dto.response.AiChatResponse;
import com.smarttravel.dto.response.AiReviewAnalysisResponse;
import com.smarttravel.dto.response.AiTourGeneratorResponse;

public interface AiService {
    AiChatResponse chat(AiChatRequest request);
    AiTourGeneratorResponse generateTourContent(AiTourGeneratorRequest request);
    AiReviewAnalysisResponse analyzeReviews(AiReviewAnalysisRequest request);
}
