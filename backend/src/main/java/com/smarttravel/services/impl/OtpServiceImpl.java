package com.smarttravel.services.impl;

import com.smarttravel.entities.VerificationOtp;
import com.smarttravel.enums.OtpType;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.repositories.VerificationOtpRepository;
import com.smarttravel.services.EmailService;
import com.smarttravel.services.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final VerificationOtpRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.expiration-seconds:60}")
    private long expirationSeconds;

    @Override
    @Transactional
    public String generateAndSendOtp(String email, OtpType type) {
        // Tạo mã 6 chữ số
        String code = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(expirationSeconds);

        // Lưu OTP vào database
        VerificationOtp otp = VerificationOtp.builder()
                .email(email)
                .code(code)
                .type(type)
                .expiryTime(expiryTime)
                .isUsed(false)
                .build();

        otpRepository.save(otp);

        // Gửi qua Email
        String subject = (type == OtpType.REGISTER)
                ? "[Smart Travel] Mã xác thực kích hoạt tài khoản"
                : "[Smart Travel] Mã xác thực lấy lại mật khẩu";

        String description = (type == OtpType.REGISTER)
                ? "Bạn vừa đăng ký tài khoản tại Smart Travel. Vui lòng nhập mã OTP dưới đây để xác thực email:"
                : "Bạn vừa gửi yêu cầu khôi phục mật khẩu. Vui lòng nhập mã OTP dưới đây để thiết lập mật khẩu mới:";

        emailService.sendOtpEmail(email, code, subject, description);

        return code;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String code, OtpType type) {
        VerificationOtp otp = otpRepository
                .findFirstByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(email, type)
                .orElseThrow(() -> new BadRequestException("Mã xác thực không tồn tại hoặc đã được sử dụng!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn! Vui lòng bấm 'Gửi lại mã' để nhận mã mới.");
        }

        if (!otp.getCode().equals(code.trim())) {
            throw new BadRequestException("Mã OTP không chính xác. Vui lòng kiểm tra lại!");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);
        return true;
    }
}
