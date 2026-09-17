package com.smarttravel.services;

public interface EmailService {
    void sendOtpEmail(String toEmail, String code, String subject, String titleDescription);
    void sendContactEmail(String fromName, String fromEmail, String phone, String subject, String messageContent);
}
