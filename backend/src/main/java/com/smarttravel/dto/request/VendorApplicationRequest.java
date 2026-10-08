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
public class VendorApplicationRequest {

    @NotBlank(message = "Tên doanh nghiệp lữ hành không được để trống")
    private String businessName;

    @NotBlank(message = "Mã số thuế doanh nghiệp không được để trống")
    private String taxCode;

    @NotBlank(message = "Địa chỉ trụ sở công ty không được để trống")
    private String businessAddress;

    @NotBlank(message = "Số điện thoại hotline hỗ trợ không được để trống")
    private String hotline;

    private String contactEmail;

    private String website;

    private String description;

    @NotBlank(message = "Họ và tên người đại diện pháp luật không được để trống")
    private String representativeName;

    @NotBlank(message = "Ảnh Giấy phép kinh doanh lữ hành không được để trống")
    private String businessLicenseUrl;

    @NotBlank(message = "Ảnh CCCD người đại diện (mặt trước) không được để trống")
    private String idCardFrontUrl;

    private String idCardBackUrl;
}
