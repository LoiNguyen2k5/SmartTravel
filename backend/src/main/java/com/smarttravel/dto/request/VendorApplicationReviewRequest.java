package com.smarttravel.dto.request;

import com.smarttravel.enums.VendorApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorApplicationReviewRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private VendorApplicationStatus status; // APPROVED hoặc REJECTED

    private String reason; // Lý do từ chối nếu status == REJECTED
}
