package com.smarttravel.services;

import com.smarttravel.enums.OtpType;

public interface OtpService {
    String generateAndSendOtp(String email, OtpType type);
    boolean verifyOtp(String email, String code, OtpType type);
}
