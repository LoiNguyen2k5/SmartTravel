package com.smarttravel.controllers;

import com.smarttravel.dto.request.*;
import com.smarttravel.dto.response.ApiResponse;
import com.smarttravel.dto.response.JwtAuthResponse;
import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Management", description = "APIs xác thực đăng nhập, đăng ký, OTP 60s và Quên mật khẩu")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Trả về JWT Bearer Token khi xác thực thành công")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtAuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản chưa kích hoạt và gửi mã OTP 60s qua email")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.created("Đăng ký thành công! Đã gửi mã xác thực OTP (hiệu lực 60s) đến email của bạn.", response));
    }

    @PostMapping("/verify-register-otp")
    @Operation(summary = "Xác thực OTP đăng ký", description = "Kích hoạt tài khoản khi mã OTP chính xác và trong hạn 60s")
    public ResponseEntity<ApiResponse<UserResponse>> verifyRegisterOtp(@Valid @RequestBody VerifyOtpRequest request) {
        UserResponse response = authService.verifyRegisterOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Xác thực email và kích hoạt tài khoản thành công!", response));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Gửi lại mã OTP", description = "Tạo mã OTP 60s mới và gửi lại qua Email")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi lại mã OTP mới (hiệu lực 60s) đến email của bạn.", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Yêu cầu quên mật khẩu", description = "Gửi mã OTP 60s khôi phục mật khẩu đến email")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi mã OTP khôi phục mật khẩu (hiệu lực 60s) đến email của bạn.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu mới bằng OTP", description = "Xác thực OTP và đặt lại mật khẩu mới")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
