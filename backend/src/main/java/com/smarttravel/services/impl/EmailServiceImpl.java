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

    @Override
    @Async
    public void sendContactEmail(String fromName, String clientEmail, String phone, String subject, String messageContent) {
        String targetSupportEmail = fromEmail != null && !fromEmail.isBlank() ? fromEmail : "tiemnet.coaching.y3@gmail.com";
        String emailSubject = "[Smart Travel CSKH] " + (subject != null && !subject.isBlank() ? subject : "Yêu cầu liên hệ mới") + " - " + fromName;

        log.info("==================================================");
        log.info("📩 NHẬN LIÊN HỆ TỪ KHÁCH HÀNG: {} ({}) - SĐT: {}", fromName, clientEmail, phone);
        log.info("📌 CHỦ ĐỀ: {}", subject);
        log.info("💬 NỘI DUNG: {}", messageContent);
        log.info("🚀 ĐANG CHUYỂN TIẾP TỚI HỘP THƯ HỖ TRỢ: {}", targetSupportEmail);
        log.info("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Smart Travel System");
            helper.setTo(targetSupportEmail);
            if (clientEmail != null && !clientEmail.isBlank()) {
                try {
                    helper.setReplyTo(clientEmail, fromName);
                } catch (Exception ignored) {
                    helper.setReplyTo(clientEmail);
                }
            }
            helper.setSubject(emailSubject);

            String formattedTime = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss - dd/MM/yyyy"));
            String safePhone = phone != null && !phone.isBlank() ? phone : "Chưa cung cấp";
            String safeSubject = subject != null && !subject.isBlank() ? subject : "Liên hệ chung";

            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;\">"
                    + "<div style=\"background: linear-gradient(135deg, #0284c7, #06b6d4); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;\">"
                    + "<h2 style=\"margin: 0; font-size: 20px; letter-spacing: 0.5px;\">✈️ SMART TRAVEL — YÊU CẦU HỖ TRỢ MỚI</h2>"
                    + "<p style=\"margin: 6px 0 0; font-size: 13px; opacity: 0.9;\">Thời gian gửi: " + formattedTime + "</p>"
                    + "</div>"
                    + "<div style=\"margin-bottom: 20px;\">"
                    + "<h3 style=\"font-size: 15px; color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 6px; margin-bottom: 14px;\">👤 THÔNG TIN KHÁCH HÀNG LIÊN HỆ</h3>"
                    + "<table style=\"width: 100%; font-size: 14px; border-collapse: collapse;\">"
                    + "<tr><td style=\"padding: 6px 0; color: #64748b; width: 140px;\">Họ và tên:</td><td style=\"padding: 6px 0; font-weight: bold; color: #0f172a;\">" + fromName + "</td></tr>"
                    + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Email khách:</td><td style=\"padding: 6px 0;\"><a href=\"mailto:" + clientEmail + "\" style=\"color: #0284c7; text-decoration: none; font-weight: bold;\">" + clientEmail + "</a></td></tr>"
                    + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Số điện thoại:</td><td style=\"padding: 6px 0; font-weight: bold; color: #0f172a;\">" + safePhone + "</td></tr>"
                    + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Chủ đề yêu cầu:</td><td style=\"padding: 6px 0;\"><span style=\"background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 12px;\">" + safeSubject + "</span></td></tr>"
                    + "</table>"
                    + "</div>"
                    + "<div style=\"margin-bottom: 24px;\">"
                    + "<h3 style=\"font-size: 15px; color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 6px; margin-bottom: 12px;\">💬 NỘI DUNG TIN NHẮN</h3>"
                    + "<div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;\">"
                    + messageContent
                    + "</div>"
                    + "</div>"
                    + "<div style=\"text-align: center; margin: 28px 0 10px;\">"
                    + "<a href=\"mailto:" + clientEmail + "?subject=Re: " + safeSubject + " - Smart Travel Support\" style=\"display: inline-block; background-color: #0284c7; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(2,132,199,0.3);\">Phản hồi ngay cho khách hàng</a>"
                    + "</div>"
                    + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 14px;\" />"
                    + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin: 0;\">Hệ thống gửi tự động từ Website Smart Travel Platform. Vui lòng bấm Trả lời hoặc liên hệ trực tiếp số điện thoại của khách hàng.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Đã chuyển tiếp thành công email liên hệ tới hộp thư hỗ trợ: {}", targetSupportEmail);

            // Gửi thêm 1 email xác nhận tự động tới hòm thư cá nhân của Khách hàng
            if (clientEmail != null && !clientEmail.isBlank() && clientEmail.contains("@")) {
                try {
                    MimeMessage clientConfirmMsg = mailSender.createMimeMessage();
                    MimeMessageHelper clientHelper = new MimeMessageHelper(clientConfirmMsg, true, "UTF-8");
                    clientHelper.setFrom(fromEmail, "Smart Travel CSKH");
                    clientHelper.setTo(clientEmail);
                    clientHelper.setSubject("[Smart Travel] Đã tiếp nhận yêu cầu hỗ trợ của bạn - " + safeSubject);

                    String clientHtml = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;\">"
                            + "<div style=\"background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;\">"
                            + "<h2 style=\"margin: 0; font-size: 20px; color: #38bdf8;\">✈️ SMART TRAVEL — XÁC NHẬN YÊU CẦU</h2>"
                            + "<p style=\"margin: 6px 0 0; font-size: 13px; color: #94a3b8;\">Cảm ơn bạn đã liên hệ với đội ngũ CSKH Smart Travel</p>"
                            + "</div>"
                            + "<p style=\"font-size: 15px; font-weight: 600;\">Xin chào " + fromName + ",</p>"
                            + "<p style=\"font-size: 14px; line-height: 1.6; color: #475569;\">Chúng tôi đã tiếp nhận yêu cầu của bạn về chủ đề: <strong style=\"color: #0284c7;\">" + safeSubject + "</strong>.</p>"
                            + "<div style=\"background-color: #f8fafc; border-left: 4px solid #38bdf8; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #334155; line-height: 1.5;\">"
                            + "<strong>Nội dung tin nhắn:</strong><br/>" + messageContent
                            + "</div>"
                            + "<p style=\"font-size: 14px; line-height: 1.6; color: #475569;\">Chuyên viên tư vấn của chúng tôi đang kiểm tra và sẽ phản hồi chi tiết qua email này hoặc gọi điện thoại cho bạn trong vòng <strong>2 giờ làm việc</strong>.</p>"
                            + "<p style=\"font-size: 13px; color: #64748b; margin-top: 20px;\">Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ Hotline: <strong style=\"color: #0284c7;\">0941 899 554</strong> (8:00 - 17:30).</p>"
                            + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 20px 0 10px;\" />"
                            + "<p style=\"color: #94a3b8; font-size: 11px; text-align: center;\">Trân trọng,<br/>Đội ngũ Chăm Sóc Khách Hàng Smart Travel</p>"
                            + "</div>";

                    clientHelper.setText(clientHtml, true);
                    mailSender.send(clientConfirmMsg);
                    log.info("Đã gửi email xác nhận tự động tới khách hàng: {}", clientEmail);
                } catch (Exception e) {
                    log.warn("Không thể gửi email xác nhận cho khách hàng {}: {}", clientEmail, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi email liên hệ tới {}: {}", targetSupportEmail, e.getMessage());
        }
    }
}

