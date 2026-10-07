package com.smarttravel.services;

public interface EmailService {
    void sendOtpEmail(String toEmail, String code, String subject, String titleDescription);
    void sendContactEmail(String fromName, String fromEmail, String phone, String subject, String messageContent);
    void sendETicketEmail(com.smarttravel.entities.Booking booking);
    void sendETicketEmail(com.smarttravel.entities.Booking booking, com.smarttravel.entities.Payment payment);
    void sendVendorApplicationApprovedEmail(String toEmail, String businessName);
    void sendVendorApplicationRejectedEmail(String toEmail, String businessName, String reason);
}
