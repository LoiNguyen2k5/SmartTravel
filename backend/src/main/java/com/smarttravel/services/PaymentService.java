package com.smarttravel.services;

import com.smarttravel.dto.request.PaymentRequest;
import com.smarttravel.dto.response.PaymentResponse;

import java.util.Map;

public interface PaymentService {
    PaymentResponse createVNPayPayment(PaymentRequest request, String userEmail);
    PaymentResponse processVNPayCallback(Map<String, String> queryParams);
    boolean processSepayWebhook(Map<String, Object> webhookData);
    Map<String, Object> checkPaymentStatus(String bookingCode);
    boolean markBookingAsPaid(String bookingCode);
}
