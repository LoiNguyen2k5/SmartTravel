package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReviewAnalysisResponse {
    private String overallSentiment; // POSITIVE, NEUTRAL, NEGATIVE
    private Double positivePercentage;
    private Double negativePercentage;
    private Double neutralPercentage;
    private String summary;
    @Builder.Default
    private List<String> keyHighlights = new ArrayList<>();
    @Builder.Default
    private List<String> keyComplaints = new ArrayList<>();
    private String qualityAlert; // STABLE, WARNING, CRITICAL
    private String recommendationsForVendor;
}
