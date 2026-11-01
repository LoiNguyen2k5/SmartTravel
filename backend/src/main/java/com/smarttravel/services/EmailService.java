package com.smarttravel.services;

import com.smarttravel.entities.Booking;
import com.smarttravel.entities.Payment;

public interface EmailService {
    void sendOtpEmail(String toEmail, String code, String subject, String titleDescription);
    void sendContactEmail(String fromName, String fromEmail, String phone, String subject, String messageContent);
    void sendETicketEmail(Booking booking);
    void sendETicketEmail(Booking booking, Payment payment);
    void sendInvoiceEmail(Booking booking, Payment payment, byte[] pdfInvoice);
    void sendVendorApplicationApprovedEmail(String toEmail, String businessName);
    void sendVendorApplicationRejectedEmail(String toEmail, String businessName, String reason);
}
