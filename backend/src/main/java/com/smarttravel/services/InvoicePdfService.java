package com.smarttravel.services;

import com.smarttravel.entities.Booking;
import com.smarttravel.entities.Payment;

public interface InvoicePdfService {
    /**
     * Tạo tài liệu Hóa đơn điện tử dạng PDF (byte array) từ thông tin Đơn đặt tour và Giao dịch thanh toán.
     *
     * @param booking Thông tin đơn đặt tour
     * @param payment Thông tin thanh toán (có thể null nếu chưa thanh toán hoặc lấy trực tiếp từ booking)
     * @return Mảng byte chứa nội dung file PDF hóa đơn
     */
    byte[] generateInvoicePdf(Booking booking, Payment payment);
}

