package com.smarttravel.services;

import com.smarttravel.dto.request.*;
import com.smarttravel.dto.response.JwtAuthResponse;
import com.smarttravel.dto.response.UserResponse;

public interface AuthService {
    JwtAuthResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    UserResponse verifyRegisterOtp(VerifyOtpRequest request);
    void resendOtp(ResendOtpRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse getCurrentUser(String email);
}
