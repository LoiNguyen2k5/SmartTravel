package com.smarttravel.dto.request;

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
public class AiReviewAnalysisRequest {
    private Long tourId;
    private String tourTitle;
    @Builder.Default
    private List<String> reviewTexts = new ArrayList<>();
}
