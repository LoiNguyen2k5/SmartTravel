package com.smarttravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisaRequirementRequestDto {

    @NotBlank(message = "Tên giấy tờ không được để trống")
    private String documentName;

    private String description;

    @Builder.Default
    private Boolean isMandatory = true;
}
