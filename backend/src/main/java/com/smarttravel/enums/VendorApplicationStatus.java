package com.smarttravel.enums;

public enum VendorApplicationStatus {
    PENDING_REVIEW, // Hồ sơ đang chờ Ban Quản Trị xem xét
    APPROVED,       // Đã được phê duyệt, tài khoản được cấp quyền ROLE_VENDOR
    REJECTED,       // Bị từ chối (kèm theo lý do phản hồi)
    REVOKED         // Đã bị thu hồi quyền đối tác (trở về tài khoản thường)
}
