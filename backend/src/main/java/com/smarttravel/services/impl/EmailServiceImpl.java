package com.smarttravel.services.impl;

import com.smarttravel.services.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String code, String subject, String titleDescription) {
        log.info("==================================================");
        log.info("🔑 MÃ OTP (Hiệu lực 60 giây) GỬI TỚI {}: [ {} ]", toEmail, code);
        log.info("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Smart Travel Platform");
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;\">"
                    + "<div style=\"text-align: center; margin-bottom: 20px;\">"
                    + "<h2 style=\"color: #f43f5e; margin: 0;\">✈️ Smart Travel & Itinerary</h2>"
                    + "<p style=\"color: #6b7280; font-size: 14px;\">Nền tảng đặt tour & lập kế hoạch du lịch thông minh</p>"
                    + "</div>"
                    + "<hr style=\"border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;\" />"
                    + "<h3 style=\"color: #111827;\">Xác thực mã OTP</h3>"
                    + "<p style=\"color: #374151; line-height: 1.5;\">" + titleDescription + "</p>"
                    + "<div style=\"text-align: center; margin: 30px 0; background-color: #fff1f2; padding: 16px; border-radius: 8px; border: 1px dashed #f43f5e;\">"
                    + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #e11d48;\">" + code + "</span>"
                    + "</div>"
                    + "<p style=\"color: #ef4444; font-size: 13px; font-weight: 500;\">⚠️ Lưu ý: Mã xác thực này có hiệu lực trong vòng <strong>60 giây</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;\" />"
                    + "<p style=\"color: #9ca3af; font-size: 12px; text-align: center;\">Cảm ơn bạn đã sử dụng dịch vụ của Smart Travel!</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email OTP đã gửi thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("Không thể gửi email thực tế tới {}. Lý do: {}. (Hãy kiểm tra lại cấu hình spring.mail.username và password trong application.yml)", toEmail, e.getMessage());
        }
    }
}
