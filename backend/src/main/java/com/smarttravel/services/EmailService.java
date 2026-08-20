package com.smarttravel.services;

public interface EmailService {
    void sendOtpEmail(String toEmail, String code, String subject, String titleDescription);
}
