package com.smarttravel.dto.request;

import com.smarttravel.enums.TourStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourModerationRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private TourStatus status; // APPROVED, REJECTED, ACTIVE, INACTIVE

    private String reason; // Lý do nếu từ chối
}
