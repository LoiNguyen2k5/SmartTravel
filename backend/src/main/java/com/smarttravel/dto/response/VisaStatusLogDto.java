package com.smarttravel.dto.response;

import com.smarttravel.enums.VisaApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaStatusLogDto {
    private Long id;
    private VisaApplicationStatus fromStatus;
    private VisaApplicationStatus toStatus;
    private String note;
    private String actorEmail;
    private String actorRole;
    private LocalDateTime createdAt;
}
