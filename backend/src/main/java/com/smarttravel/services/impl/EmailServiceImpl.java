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

    @Override
    @Async
    public void sendETicketEmail(com.smarttravel.entities.Booking booking) {
        sendETicketEmail(booking, null);
    }

    @Override
    @Async
    public void sendETicketEmail(com.smarttravel.entities.Booking booking, com.smarttravel.entities.Payment payment) {
        if (booking == null) {
            log.warn("Không thể gửi Vé điện tử: Booking null");
            return;
        }

        String toEmail = booking.getContactEmail();
        if (toEmail == null || toEmail.isBlank()) {
            if (booking.getUser() != null) {
                toEmail = booking.getUser().getEmail();
            }
        }

        if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
            log.warn("Không thể gửi Vé điện tử cho đơn {}: Địa chỉ email không hợp lệ ({})", booking.getBookingCode(), toEmail);
            return;
        }

        String bookingCode = booking.getBookingCode();
        log.info("==================================================");
        log.info("🎫 ĐANG GỬI VÉ ĐIỆN TỬ (E-TICKET) TỚI: {} - ĐƠN: {}", toEmail, bookingCode);
        log.info("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Smart Travel E-Ticket");
            helper.setTo(toEmail);
            helper.setSubject("[Smart Travel] Vé điện tử (E-Ticket) xác nhận đặt tour thành công - " + bookingCode);

            String customerName = booking.getContactName() != null && !booking.getContactName().isBlank()
                    ? booking.getContactName()
                    : (booking.getUser() != null && booking.getUser().getFullName() != null ? booking.getUser().getFullName() : "Quý khách");

            String phone = booking.getContactPhone() != null && !booking.getContactPhone().isBlank()
                    ? booking.getContactPhone()
                    : (booking.getUser() != null && booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "N/A");

            String tourTitle = booking.getTour() != null ? booking.getTour().getTitle() : "Tour Du Lịch Smart Travel";
            String tourCode = booking.getTour() != null && booking.getTour().getTourCode() != null ? booking.getTour().getTourCode() : "ST-TOUR";
            String departureLocation = booking.getTour() != null && booking.getTour().getDepartureLocation() != null ? booking.getTour().getDepartureLocation() : "TP. Hồ Chí Minh";
            int days = booking.getTour() != null && booking.getTour().getDurationDays() != null ? booking.getTour().getDurationDays() : 1;
            int nights = booking.getTour() != null && booking.getTour().getDurationNights() != null ? booking.getTour().getDurationNights() : 0;
            String durationText = days + " Ngày " + (nights > 0 ? nights + " Đêm" : "");

            String departureDateText = "Theo lịch trình tiêu chuẩn";
            if (booking.getTourSchedule() != null && booking.getTourSchedule().getStartDate() != null) {
                departureDateText = booking.getTourSchedule().getStartDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else if (booking.getCreatedAt() != null) {
                departureDateText = booking.getCreatedAt().toLocalDate().plusDays(7).format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }

            int adults = booking.getNumberOfAdults() != null ? booking.getNumberOfAdults() : 1;
            int children = booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0;
            String guestsText = adults + " Người lớn" + (children > 0 ? " • " + children + " Trẻ em" : "");

            String roomText = "Tiêu chuẩn tour (ghép phòng đôi)";
            if (Boolean.TRUE.equals(booking.getSingleRoomSurcharge())) {
                roomText = "Phụ thu phòng đơn riêng";
            } else if (booking.getRoomAllocation() != null && !booking.getRoomAllocation().isBlank()) {
                roomText = booking.getRoomAllocation();
            }

            java.text.NumberFormat currencyFormatter = java.text.NumberFormat.getInstance(new java.util.Locale("vi", "VN"));
            String totalPriceFormatted = currencyFormatter.format(booking.getTotalPrice() != null ? booking.getTotalPrice() : java.math.BigDecimal.ZERO) + " đ";

            String paymentMethodText = "Chuyển khoản VietQR / Ngân hàng";
            String transactionId = "TXN-" + bookingCode;
            String paymentTimeText = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));

            if (payment != null) {
                if (payment.getPaymentMethod() != null) {
                    paymentMethodText = payment.getPaymentMethod().name();
                }
                if (payment.getTransactionId() != null && !payment.getTransactionId().isBlank()) {
                    transactionId = payment.getTransactionId();
                }
                if (payment.getPaymentTime() != null) {
                    paymentTimeText = payment.getPaymentTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
                }
            }

            String qrData = "SMARTTRAVEL-E-TICKET|" + bookingCode + "|" + tourCode + "|PAID";
            String qrCodeUrl = (booking.getQrCodeUrl() != null && !booking.getQrCodeUrl().isBlank())
                    ? booking.getQrCodeUrl()
                    : "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + java.net.URLEncoder.encode(qrData, java.nio.charset.StandardCharsets.UTF_8);

            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 25px 10px; margin: 0;\">"
                    + "<div style=\"max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;\">"
                    // Header
                    + "<div style=\"background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%); padding: 26px 20px; text-align: center; color: #ffffff;\">"
                    + "<div style=\"display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 9999px; padding: 4px 14px; margin-bottom: 10px;\">"
                    + "<span style=\"color: #34d399; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;\">✓ XÁC NHẬN ĐẶT TOUR THÀNH CÔNG</span>"
                    + "</div>"
                    + "<h1 style=\"margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;\">✈️ VÉ DU LỊCH ĐIỆN TỬ (E-TICKET)</h1>"
                    + "<p style=\"margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;\">Nền tảng Đặt Tour & Lập Kế Hoạch Thông Minh — Smart Travel</p>"
                    + "</div>"
                    // Reference Bar
                    + "<div style=\"background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px dashed #cbd5e1;\">"
                    + "<table style=\"width: 100%; border-collapse: collapse; font-size: 12px;\">"
                    + "<tr>"
                    + "<td style=\"color: #64748b;\">Mã vé: <strong style=\"color: #0284c7; font-size: 15px; font-family: monospace;\">" + bookingCode + "</strong></td>"
                    + "<td style=\"text-align: right; color: #64748b;\">Thời gian: <strong style=\"color: #334155;\">" + paymentTimeText + "</strong></td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"
                    // Body
                    + "<div style=\"padding: 22px;\">"
                    // Tour Info Card
                    + "<div style=\"background: linear-gradient(to right, #f0f9ff, #e0f2fe); border-left: 4px solid #0284c7; border-radius: 12px; padding: 16px; margin-bottom: 20px;\">"
                    + "<span style=\"font-size: 11px; font-weight: bold; color: #0284c7; text-transform: uppercase;\">THÔNG TIN HÀNH TRÌNH</span>"
                    + "<h2 style=\"margin: 6px 0 10px 0; font-size: 17px; color: #0f172a; line-height: 1.4;\">" + tourTitle + "</h2>"
                    + "<table style=\"width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;\">"
                    + "<tr>"
                    + "<td style=\"padding: 3px 0; width: 50%;\">📍 <strong>Điểm khởi hành:</strong> " + departureLocation + "</td>"
                    + "<td style=\"padding: 3px 0; width: 50%;\">🗓️ <strong>Ngày đi:</strong> <span style=\"color: #0284c7; font-weight: bold;\">" + departureDateText + "</span></td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style=\"padding: 3px 0;\">⏱️ <strong>Thời lượng:</strong> " + durationText + "</td>"
                    + "<td style=\"padding: 3px 0;\">🏷️ <strong>Mã tour:</strong> " + tourCode + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"
                    // Passenger Details
                    + "<div style=\"margin-bottom: 20px;\">"
                    + "<h3 style=\"margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;\">👤 THÔNG TIN HÀNH KHÁCH & LƯU TRÚ</h3>"
                    + "<table style=\"width: 100%; font-size: 13px; border-collapse: collapse;\">"
                    + "<tr><td style=\"padding: 5px 0; color: #64748b; width: 35%;\">Hành khách đại diện:</td><td style=\"padding: 5px 0; color: #0f172a; font-weight: bold;\">" + customerName + "</td></tr>"
                    + "<tr><td style=\"padding: 5px 0; color: #64748b;\">Số điện thoại:</td><td style=\"padding: 5px 0; color: #0f172a; font-weight: bold;\">" + phone + "</td></tr>"
                    + "<tr><td style=\"padding: 5px 0; color: #64748b;\">Email liên hệ:</td><td style=\"padding: 5px 0; color: #0284c7; font-weight: bold;\">" + toEmail + "</td></tr>"
                    + "<tr><td style=\"padding: 5px 0; color: #64748b;\">Số lượng khách:</td><td style=\"padding: 5px 0; color: #0f172a; font-weight: bold;\">" + guestsText + "</td></tr>"
                    + "<tr><td style=\"padding: 5px 0; color: #64748b;\">Quy cách phòng ở:</td><td style=\"padding: 5px 0; color: #0f172a; font-weight: bold;\">" + roomText + "</td></tr>"
                    + "</table>"
                    + "</div>"
                    // QR Code Card
                    + "<div style=\"background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 20px;\">"
                    + "<p style=\"margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #0369a1; text-transform: uppercase;\">📱 MÃ QR CHECK-IN LÊN XE & NHẬN PHÒNG</p>"
                    + "<div style=\"display: inline-block; background-color: #ffffff; padding: 10px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;\">"
                    + "<img src=\"" + qrCodeUrl + "\" alt=\"QR E-Ticket\" width=\"170\" height=\"170\" style=\"display: block; margin: 0 auto;\" />"
                    + "</div>"
                    + "<p style=\"margin: 10px 0 0 0; font-size: 11px; color: #64748b;\">Vui lòng xuất trình mã QR này cho Hướng Dẫn Viên hoặc Lễ Tân tại điểm hẹn để làm thủ tục nhanh chóng.</p>"
                    + "</div>"
                    // Payment Summary
                    + "<div style=\"background-color: #0f172a; border-radius: 12px; padding: 16px 18px; color: #ffffff; margin-bottom: 20px;\">"
                    + "<table style=\"width: 100%; font-size: 12px; border-collapse: collapse;\">"
                    + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Phương thức thanh toán:</td><td style=\"padding: 3px 0; text-align: right; color: #e2e8f0; font-weight: 600;\">" + paymentMethodText + "</td></tr>"
                    + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Mã giao dịch ngân hàng:</td><td style=\"padding: 3px 0; text-align: right; color: #38bdf8; font-family: monospace;\">" + transactionId + "</td></tr>"
                    + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Trạng thái thanh toán:</td><td style=\"padding: 3px 0; text-align: right; color: #34d399; font-weight: bold;\">ĐÃ THANH TOÁN (PAID)</td></tr>"
                    + "<tr><td colspan=\"2\" style=\"border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px; margin-top: 4px;\"></td></tr>"
                    + "<tr><td style=\"font-size: 14px; font-weight: bold; color: #ffffff;\">TỔNG TIỀN ĐÃ THANH TOÁN:</td><td style=\"font-size: 18px; font-weight: 800; color: #fbbf24; text-align: right;\">" + totalPriceFormatted + "</td></tr>"
                    + "</table>"
                    + "</div>"
                    // Important Notes
                    + "<div style=\"background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 14px; font-size: 11px; color: #92400e; line-height: 1.6; margin-bottom: 18px;\">"
                    + "<strong style=\"font-size: 12px;\">⚠️ Lưu ý quan trọng cho chuyến đi:</strong><br/>"
                    + "• <strong>Giấy tờ tùy thân:</strong> Quý khách vui lòng mang theo CCCD/Hộ chiếu gốc (còn hạn trên 6 tháng). Đối với tour quốc tế, cần chuẩn bị đầy đủ hồ sơ Visa theo hướng dẫn.<br/>"
                    + "• <strong>Thời gian tập trung:</strong> Có mặt tại điểm khởi hành trước giờ khởi hành tối thiểu 60 phút (tour trong nước) hoặc 120 phút (tour quốc tế).<br/>"
                    + "• <strong>Hành lý:</strong> Tuân thủ quy định hành lý xách tay và ký gửi theo hướng dẫn chi tiết của HDV."
                    + "</div>"
                    // Support
                    + "<div style=\"text-align: center; padding: 8px 0;\">"
                    + "<p style=\"margin: 0; font-size: 12px; color: #475569;\">Cần hỗ trợ gấp? Hotline 24/7: <strong style=\"color: #0284c7; font-size: 14px;\">0941 899 554</strong></p>"
                    + "</div>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;\">"
                    + "<p style=\"margin: 0 0 3px 0;\">© 2026 SmartTravel Platform. Bản quyền thuộc về Đồ Án Chuyên Ngành CNTT - HCMUTE.</p>"
                    + "<p style=\"margin: 0;\">Email này được tạo và gửi tự động khi đơn hàng hoàn tất thanh toán.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Vé điện tử E-Ticket đã gửi thành công tới email: {}", toEmail);
        } catch (Exception e) {
            log.error("Không thể gửi Vé điện tử thực tế tới {}. Lý do: {}. (Hãy kiểm tra cấu hình spring.mail)", toEmail, e.getMessage());
        }
    }
}

