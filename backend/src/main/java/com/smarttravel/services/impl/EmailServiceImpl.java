package com.smarttravel.services.impl;



import com.smarttravel.services.EmailService;



import com.smarttravel.enums.BookingStatus;



import java.math.BigDecimal;



import java.math.RoundingMode;



import java.text.NumberFormat;



import java.time.format.DateTimeFormatter;



import java.util.Locale;



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



        String toEmail = null;
        try {
            toEmail = booking.getContactEmail();
        } catch (Exception ignored) {}
        if (toEmail == null || toEmail.isBlank()) {
            try {
                if (booking.getUser() != null) {
                    toEmail = booking.getUser().getEmail();
                }
            } catch (Exception ignored) {}
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



            boolean isDeposit = booking.getStatus() != BookingStatus.PAID



                    && booking.getStatus() != BookingStatus.CONFIRMED



                    && booking.getStatus() != BookingStatus.COMPLETED



                    && ((booking.getStatus() == BookingStatus.DEPOSITED)



                        || Boolean.TRUE.equals(booking.getIsDeposit())



                        || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"))



                        || (booking.getTotalPrice() != null && payment != null && payment.getAmount() != null



                            && payment.getAmount().compareTo(booking.getTotalPrice()) < 0));



            boolean hasDepositHistory = !isDeposit && (

                    (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && booking.getDepositAmount().compareTo(booking.getTotalPrice()) < 0)

                    || (booking.getNotes() != null && (

                        booking.getNotes().toUpperCase().contains("DAT_COC")

                        || booking.getNotes().toUpperCase().contains("COC")

                        || booking.getNotes().toLowerCase().contains("cọc")

                        || booking.getNotes().toLowerCase().contains("tất toán")

                        || booking.getNotes().contains("70%")

                        || booking.getNotes().contains("30%")))

                    || (payment != null && payment.getTransactionId() != null && payment.getTransactionId().startsWith("REMAIN-"))

                    || Boolean.TRUE.equals(booking.getIsDeposit()));



            BigDecimal totalOrderPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;


            BigDecimal paidAmount = (payment != null && payment.getAmount() != null)



                    ? payment.getAmount()



                    : (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0



                            ? booking.getDepositAmount()



                            : (isDeposit ? totalOrderPrice.multiply(new BigDecimal("0.3")).setScale(0, RoundingMode.HALF_UP) : totalOrderPrice));



            BigDecimal remainingAmount = isDeposit ? totalOrderPrice.subtract(paidAmount) : BigDecimal.ZERO;



            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) remainingAmount = BigDecimal.ZERO;



            NumberFormat currencyFormatter = NumberFormat.getInstance(new Locale("vi", "VN"));



            String totalPriceFormatted = currencyFormatter.format(totalOrderPrice) + " đ";



            String paidAmountFormatted = currencyFormatter.format(paidAmount) + " đ";



            String remainingAmountFormatted = currencyFormatter.format(remainingAmount) + " đ";



            String emailSubject = isDeposit
                    ? "🎫 [Smart Travel] Vé điện tử (Xác nhận đặt cọc giữ chỗ 30%) - Đơn tour " + bookingCode
                    : (hasDepositHistory
                            ? "🎫 [Smart Travel] Vé du lịch điện tử chính thức (PAID 100%) - Đơn tour " + bookingCode
                            : "🎫 [Smart Travel] Vé du lịch điện tử (E-Ticket) - Đơn tour " + bookingCode);
            helper.setSubject(emailSubject);



            String customerName = "Quý khách";
            try {
                if (booking.getContactName() != null && !booking.getContactName().isBlank()) {
                    customerName = booking.getContactName();
                } else if (booking.getUser() != null && booking.getUser().getFullName() != null) {
                    customerName = booking.getUser().getFullName();
                }
            } catch (Exception ignored) {}

            String phone = "N/A";
            try {
                if (booking.getContactPhone() != null && !booking.getContactPhone().isBlank()) {
                    phone = booking.getContactPhone();
                } else if (booking.getUser() != null && booking.getUser().getPhone() != null) {
                    phone = booking.getUser().getPhone();
                }
            } catch (Exception ignored) {}

            String tourTitle = "Tour Du Lịch Smart Travel";
            String tourCode = "ST-TOUR";
            String departureLocation = "TP. Hồ Chí Minh";
            int days = 1;
            int nights = 0;
            try {
                if (booking.getTour() != null) {
                    if (booking.getTour().getTitle() != null) tourTitle = booking.getTour().getTitle();
                    if (booking.getTour().getTourCode() != null) tourCode = booking.getTour().getTourCode();
                    if (booking.getTour().getDepartureLocation() != null) departureLocation = booking.getTour().getDepartureLocation();
                    if (booking.getTour().getDurationDays() != null) days = booking.getTour().getDurationDays();
                    if (booking.getTour().getDurationNights() != null) nights = booking.getTour().getDurationNights();
                }
            } catch (Exception ignored) {}

            String durationText = days + " Ngày " + (nights > 0 ? nights + " Đêm" : "");

            String departureDateText = "Theo lịch trình tiêu chuẩn";
            try {
                if (booking.getTourSchedule() != null && booking.getTourSchedule().getStartDate() != null) {
                    departureDateText = booking.getTourSchedule().getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } else if (booking.getCreatedAt() != null) {
                    departureDateText = booking.getCreatedAt().toLocalDate().plusDays(7).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                }
            } catch (Exception ignored) {}



            int adults = booking.getNumberOfAdults() != null ? booking.getNumberOfAdults() : 1;



            int children = booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0;



            String guestsText = adults + " Người lớn" + (children > 0 ? " • " + children + " Trẻ em" : "");



            String roomText = "Tiêu chuẩn tour (ghép phòng đôi)";



            if (Boolean.TRUE.equals(booking.getSingleRoomSurcharge())) {



                roomText = "Phụ thu phòng đơn riêng";



            } else if (booking.getRoomAllocation() != null && !booking.getRoomAllocation().isBlank()) {



                roomText = booking.getRoomAllocation();



            }



            String paymentMethodText = "Chuyển khoản VietQR / Ngân hàng";



            String transactionId = "TXN-" + bookingCode;



            String paymentTimeText = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));



            if (payment != null) {



                if (payment.getPaymentMethod() != null) {



                    paymentMethodText = payment.getPaymentMethod().name();



                }



                if (payment.getTransactionId() != null && !payment.getTransactionId().isBlank()) {



                    transactionId = payment.getTransactionId();



                }



                if (payment.getPaymentTime() != null) {



                    paymentTimeText = payment.getPaymentTime().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));



                }



            }



            String qrStatus = isDeposit ? "DEPOSITED_30" : "PAID";



            String qrData = "SMARTTRAVEL-E-TICKET|" + bookingCode + "|" + tourCode + "|" + qrStatus;



            String qrCodeUrl = (booking.getQrCodeUrl() != null && !booking.getQrCodeUrl().isBlank())



                    ? booking.getQrCodeUrl()



                    : "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + java.net.URLEncoder.encode(qrData, java.nio.charset.StandardCharsets.UTF_8);



            String badgeAndTitleHtml = isDeposit



                    ? "<div style=\"display: inline-block; background-color: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; border-radius: 9999px; padding: 4px 14px; margin-bottom: 10px;\">"



                      + "<span style=\"color: #fbbf24; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;\">✓ ĐÃ ĐẶT CỌC GIỮ CHỖ 30% (CÒN NỢ 70%)</span>"



                      + "</div>"



                      + "<h1 style=\"margin: 0; font-size: 21px; font-weight: 800; letter-spacing: 0.5px;\">✈️ VÉ DU LỊCH ĐIỆN TỬ - XÁC NHẬN GIỮ CHỖ</h1>"



                    : "<div style=\"display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 9999px; padding: 4px 14px; margin-bottom: 10px;\">"



                      + "<span style=\"color: #34d399; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;\">✓ XÁC NHẬN ĐẶT TOUR THÀNH CÔNG</span>"



                      + "</div>"



                      + "<h1 style=\"margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;\">✈️ VÉ DU LỊCH ĐIỆN TỬ (E-TICKET)</h1>";



            String paymentBoxHtml = isDeposit



                    ? "<div style=\"background-color: #0f172a; border-radius: 12px; padding: 16px 18px; color: #ffffff; margin-bottom: 20px;\">"



                      + "<table style=\"width: 100%; font-size: 12px; border-collapse: collapse;\">"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Phương thức thanh toán:</td><td style=\"padding: 3px 0; text-align: right; color: #e2e8f0; font-weight: 600;\">" + paymentMethodText + "</td></tr>"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Mã giao dịch:</td><td style=\"padding: 3px 0; text-align: right; color: #38bdf8; font-family: monospace;\">" + transactionId + "</td></tr>"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Trạng thái vé:</td><td style=\"padding: 3px 0; text-align: right; color: #fbbf24; font-weight: bold;\">ĐÃ ĐẶT CỌC 30% (DEPOSITED) ✔</td></tr>"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Hạn tất toán 70% còn lại:</td><td style=\"padding: 3px 0; text-align: right; color: #38bdf8; font-weight: bold;\">Trước ngày khởi hành 03 - 15 ngày</td></tr>"



                      + "<tr><td colspan=\"2\" style=\"border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px; margin-top: 4px;\"></td></tr>"



                      + "<tr><td style=\"font-size: 12px; color: #cbd5e1;\">Tổng giá trị tour (100%):</td><td style=\"font-size: 13px; font-weight: 600; color: #cbd5e1; text-align: right;\">" + totalPriceFormatted + "</td></tr>"



                      + "<tr><td style=\"font-size: 13px; font-weight: bold; color: #34d399;\">TIỀN CỌC ĐÃ THANH TOÁN (30%):</td><td style=\"font-size: 17px; font-weight: 800; color: #34d399; text-align: right;\">" + paidAmountFormatted + "</td></tr>"



                      + "<tr><td style=\"font-size: 13px; font-weight: bold; color: #f87171;\">SỐ TIỀN CÒN PHẢI NỘP (70%):</td><td style=\"font-size: 15px; font-weight: 800; color: #f87171; text-align: right;\">" + remainingAmountFormatted + "</td></tr>"



                      + "</table>"



                      + "</div>"



                    : "<div style=\"background-color: #0f172a; border-radius: 12px; padding: 16px 18px; color: #ffffff; margin-bottom: 20px;\">"



                      + "<table style=\"width: 100%; font-size: 12px; border-collapse: collapse;\">"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Phương thức thanh toán:</td><td style=\"padding: 3px 0; text-align: right; color: #e2e8f0; font-weight: 600;\">" + paymentMethodText + "</td></tr>"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Mã giao dịch ngân hàng:</td><td style=\"padding: 3px 0; text-align: right; color: #38bdf8; font-family: monospace;\">" + transactionId + "</td></tr>"



                      + "<tr><td style=\"padding: 3px 0; color: #94a3b8;\">Trạng thái thanh toán:</td><td style=\"padding: 3px 0; text-align: right; color: #34d399; font-weight: bold;\">ĐÃ THANH TOÁN ĐỦ 100% (PAID) ✔</td></tr>"

                      + (hasDepositHistory

                          ? "<tr><td style=\"padding: 6px 0; color: #64748b;\">Lịch sử thu tiền:</td><td style=\"padding: 6px 0; color: #0284c7; font-weight: 600;\">Đợt 1 (Cọc 30%) + Đợt 2 (Tất toán 70%)</td></tr>"

                            + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Công nợ còn lại:</td><td style=\"padding: 6px 0; color: #10b981; font-weight: bold;\">0 đ (Đã quyết toán hoàn tất ✔)</td></tr>"

                          : "")



                      + "<tr><td colspan=\"2\" style=\"border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px; margin-top: 4px;\"></td></tr>"



                      + "<tr><td style=\"font-size: 14px; font-weight: bold; color: #ffffff;\">TỔNG TIỀN ĐÃ THANH TOÁN:</td><td style=\"font-size: 18px; font-weight: 800; color: #fbbf24; text-align: right;\">" + totalPriceFormatted + "</td></tr>"



                      + "</table>"



                      + "</div>";



            String depositNoteHtml = isDeposit



                    ? "• <strong>Điều kiện hiệu lực của vé:</strong> Vé điện tử này xác nhận Quý khách đã đặt cọc giữ chỗ 30% thành công. Chỗ của Quý khách đã được bảo lưu an toàn. Quý khách vui lòng hoàn tất thanh toán 70% số tiền còn lại (<strong>" + remainingAmountFormatted + "</strong>) trước ngày khởi hành tối thiểu 03 ngày (tour nội địa) hoặc 15 ngày (tour quốc tế) để được cấp thẻ lên đoàn chính thức.<br/>"



                    : "";



            String qrInstructionText = isDeposit



                    ? "Vui lòng xuất trình mã QR này để tra cứu trạng thái giữ chỗ và hoàn tất thanh toán 70% còn lại trước ngày khởi hành."



                    : "Vui lòng xuất trình mã QR này cho Hướng Dẫn Viên hoặc Lễ Tân tại điểm hẹn để làm thủ tục nhanh chóng.";



            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 25px 10px; margin: 0;\">"



                    + "<div style=\"max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;\">"



                    + "<div style=\"background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%); padding: 26px 20px; text-align: center; color: #ffffff;\">"



                    + badgeAndTitleHtml



                    + "<p style=\"margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;\">Nền tảng Đặt Tour & Lập Kế Hoạch Thông Minh — Smart Travel</p>"



                    + "</div>"



                    + "<div style=\"background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px dashed #cbd5e1;\">"



                    + "<table style=\"width: 100%; border-collapse: collapse; font-size: 12px;\">"



                    + "<tr>"



                    + "<td style=\"color: #64748b;\">Mã vé: <strong style=\"color: #0284c7; font-size: 15px; font-family: monospace;\">" + bookingCode + "</strong></td>"



                    + "<td style=\"text-align: right; color: #64748b;\">Thời gian: <strong style=\"color: #334155;\">" + paymentTimeText + "</strong></td>"



                    + "</tr>"



                    + "</table>"



                    + "</div>"



                    + "<div style=\"padding: 22px;\">"



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



                    + "<div style=\"background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 20px;\">"



                    + "<p style=\"margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #0369a1; text-transform: uppercase;\">📱 MÃ QR CHECK-IN & TRA CỨU ĐƠN TOUR</p>"



                    + "<div style=\"display: inline-block; background-color: #ffffff; padding: 10px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;\">"



                    + "<img src=\"" + qrCodeUrl + "\" alt=\"QR E-Ticket\" width=\"170\" height=\"170\" style=\"display: block; margin: 0 auto;\" />"



                    + "</div>"



                    + "<p style=\"margin: 10px 0 0 0; font-size: 11px; color: #64748b;\">" + qrInstructionText + "</p>"



                    + "</div>"



                    + paymentBoxHtml



                    + "<div style=\"background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 14px; font-size: 11px; color: #92400e; line-height: 1.6; margin-bottom: 18px;\">"



                    + "<strong style=\"font-size: 12px;\">⚠️ Lưu ý quan trọng cho chuyến đi:</strong><br/>"



                    + depositNoteHtml



                    + "• <strong>Giấy tờ tùy thân:</strong> Quý khách vui lòng mang theo CCCD/Hộ chiếu gốc (còn hạn trên 6 tháng). Đối với tour quốc tế, cần chuẩn bị đầy đủ hồ sơ Visa theo hướng dẫn.<br/>"



                    + "• <strong>Thời gian tập trung:</strong> Có mặt tại điểm khởi hành trước giờ khởi hành tối thiểu 60 phút (tour trong nước) hoặc 120 phút (tour quốc tế).<br/>"



                    + "• <strong>Hành lý:</strong> Tuân thủ quy định hành lý xách tay và ký gửi theo hướng dẫn chi tiết của HDV."



                    + "</div>"



                    + "<div style=\"text-align: center; padding: 8px 0;\">"



                    + "<p style=\"margin: 0; font-size: 12px; color: #475569;\">Cần hỗ trợ gấp? Hotline 24/7: <strong style=\"color: #0284c7; font-size: 14px;\">0941 899 554</strong></p>"



                    + "</div>"



                    + "</div>"



                    + "<div style=\"background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;\">"



                    + "<p style=\"margin: 0 0 3px 0;\">© 2026 SmartTravel Platform. Bản quyền thuộc về Đồ Án Chuyên Ngành CNTT - HCMUTE.</p>"



                    + "<p style=\"margin: 0;\">Email này được tạo và gửi tự động khi đơn hàng hoàn tất thanh toán / đặt cọc.</p>"



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



    @Override



    @Async



    public void sendInvoiceEmail(com.smarttravel.entities.Booking booking, com.smarttravel.entities.Payment payment, byte[] pdfInvoice) {



        if (booking == null) {



            log.warn("Không thể gửi Hóa đơn điện tử: Booking null");



            return;



        }



        String toEmail = null;
        try {
            toEmail = booking.getContactEmail();
        } catch (Exception ignored) {}
        if (toEmail == null || toEmail.isBlank()) {
            try {
                if (booking.getUser() != null) {
                    toEmail = booking.getUser().getEmail();
                }
            } catch (Exception ignored) {}
        }



        if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {



            log.warn("Không thể gửi Hóa đơn điện tử cho đơn {}: Email người nhận không hợp lệ ({})", booking.getBookingCode(), toEmail);



            return;



        }



        String bookingCode = booking.getBookingCode();



        log.info("==================================================");



        log.info("🧾 ĐANG GỬI HÓA ĐƠN ĐIỆN TỬ (PDF ĐÍNH KÈM) TỚI: {} - ĐƠN: {}", toEmail, bookingCode);



        log.info("==================================================");



        try {



            MimeMessage message = mailSender.createMimeMessage();



            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");



            helper.setFrom(fromEmail, "Smart Travel Billing");



            helper.setTo(toEmail);



            boolean isDeposit = booking.getStatus() != BookingStatus.PAID



                    && booking.getStatus() != BookingStatus.CONFIRMED



                    && booking.getStatus() != BookingStatus.COMPLETED



                    && ((booking.getStatus() == BookingStatus.DEPOSITED)



                        || Boolean.TRUE.equals(booking.getIsDeposit())



                        || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"))



                        || (booking.getTotalPrice() != null && payment != null && payment.getAmount() != null



                            && payment.getAmount().compareTo(booking.getTotalPrice()) < 0));



            boolean hasDepositHistory = !isDeposit && (

                    (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && booking.getDepositAmount().compareTo(booking.getTotalPrice()) < 0)

                    || (booking.getNotes() != null && (

                        booking.getNotes().toUpperCase().contains("DAT_COC")

                        || booking.getNotes().toUpperCase().contains("COC")

                        || booking.getNotes().toLowerCase().contains("cọc")

                        || booking.getNotes().toLowerCase().contains("tất toán")

                        || booking.getNotes().contains("70%")

                        || booking.getNotes().contains("30%")))

                    || (payment != null && payment.getTransactionId() != null && payment.getTransactionId().startsWith("REMAIN-"))

                    || Boolean.TRUE.equals(booking.getIsDeposit()));



            BigDecimal totalOrderPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;



            BigDecimal paidAmount = (payment != null && payment.getAmount() != null)



                    ? payment.getAmount()



                    : (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0



                            ? booking.getDepositAmount()



                            : (isDeposit ? totalOrderPrice.multiply(new BigDecimal("0.3")).setScale(0, RoundingMode.HALF_UP) : totalOrderPrice));



            BigDecimal remainingAmount = isDeposit ? totalOrderPrice.subtract(paidAmount) : BigDecimal.ZERO;



            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) remainingAmount = BigDecimal.ZERO;



            NumberFormat currencyFormatter = NumberFormat.getInstance(new Locale("vi", "VN"));

            BigDecimal depAmount = (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && booking.getDepositAmount().compareTo(totalOrderPrice) < 0)
                    ? booking.getDepositAmount()
                    : totalOrderPrice.multiply(new BigDecimal("0.3")).setScale(0, RoundingMode.HALF_UP);
            BigDecimal remAmount = totalOrderPrice.subtract(depAmount);
            if (remAmount.compareTo(BigDecimal.ZERO) < 0) remAmount = BigDecimal.ZERO;
            String depAmountFormatted = currencyFormatter.format(depAmount) + " đ";
            String remAmountFormatted = currencyFormatter.format(remAmount) + " đ";



            String totalPriceFormatted = currencyFormatter.format(totalOrderPrice) + " đ";



            String paidAmountFormatted = currencyFormatter.format(paidAmount) + " đ";



            String remainingAmountFormatted = currencyFormatter.format(remainingAmount) + " đ";



            String emailSubject = isDeposit
                    ? "🧾 [Smart Travel] Hóa đơn điện tử - Thu tiền đặt cọc giữ chỗ (30%) đơn tour " + bookingCode
                    : (hasDepositHistory
                            ? "🧾 [Smart Travel] Hóa đơn GTGT (E-Invoice) 100% tất toán hợp đồng tour " + bookingCode
                            : "🧾 [Smart Travel] Hóa đơn điện tử xác nhận thanh toán đơn tour " + bookingCode);
            helper.setSubject(emailSubject);



            String customerName = "Quý khách";
            try {
                if (booking.getContactName() != null && !booking.getContactName().isBlank()) {
                    customerName = booking.getContactName();
                } else if (booking.getUser() != null && booking.getUser().getFullName() != null) {
                    customerName = booking.getUser().getFullName();
                }
            } catch (Exception ignored) {}

            String tourTitle = "Tour Du Lịch Smart Travel";
            try {
                if (booking.getTour() != null && booking.getTour().getTitle() != null) {
                    tourTitle = booking.getTour().getTitle();
                }
            } catch (Exception ignored) {}



            String paymentMethod = payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "Chuyển khoản / Trực tuyến";



            String txnId = payment != null && payment.getTransactionId() != null ? payment.getTransactionId() : "TXN-" + bookingCode;



            String paymentTimeText = payment != null && payment.getPaymentTime() != null



                    ? payment.getPaymentTime().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"))



                    : java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));



            String headerTitle = isDeposit ? "🧾 HÓA ĐƠN THU TIỀN ĐẶT CỌC GIỮ CHỖ (30%)" : (hasDepositHistory ? "🧾 HÓA ĐƠN GIÁ TRỊ GIA TĂNG (E-INVOICE) 100%" : "🧾 HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)");
            String headerSub = isDeposit ? "Bản thể hiện hóa đơn điện tử thu tiền cọc đợt 1 - Dịch vụ du lịch lữ hành & giữ chỗ" : (hasDepositHistory ? "Quyết toán 100% hợp đồng tour — Đã bao gồm Cọc 30% và Tất toán 70%" : "Xác nhận thanh toán thành công đơn đặt tour");
            String introText = isDeposit



                    ? "Hệ thống Smart Travel trân trọng cảm ơn Quý khách đã hoàn tất thanh toán tiền đặt cọc giữ chỗ (30%) cho đơn đặt tour. Chỗ của Quý khách đã được bảo đảm trên chuyến đi. Hóa đơn giá trị gia tăng điện tử thu tiền cọc đợt 1 của Quý khách đã được phát hành thành công và được đính kèm ở tệp tin PDF bên dưới email này."



                    : "Hệ thống Smart Travel trân trọng cảm ơn Quý khách đã hoàn tất thanh toán cho đơn đặt tour. Hóa đơn giá trị gia tăng điện tử của Quý khách đã được phát hành thành công và được đính kèm ở tệp tin PDF bên dưới email này.";



            String attachmentFilename = isDeposit
                    ? "Hoa-Don-Dat-Coc-30-" + bookingCode + ".pdf"
                    : (hasDepositHistory
                            ? "Hoa-Don-VAT-Tat-Toan-100-" + bookingCode + ".pdf"
                            : "Hoa-Don-Dien-Tu-" + bookingCode + ".pdf");
            String attachmentExplanation = isDeposit



                    ? "📎 <strong>Tệp đính kèm:</strong> Tệp <em>" + attachmentFilename + "</em> ghi nhận chuẩn xác số tiền cọc thực thu (" + paidAmountFormatted + "), số tiền viết bằng chữ đúng theo thực thu, và có chữ ký số xác thực của doanh nghiệp."



                    : "📎 <strong>Tệp đính kèm:</strong> Tệp <em>" + attachmentFilename + "</em> chứa đầy đủ thông tin pháp lý, mã tra cứu, dấu ký số điện tử của doanh nghiệp theo quy định của Bộ Tài Chính.";



            String invoiceTableHtml = isDeposit



                    ? "<div style=\"background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin: 20px 0;\">"



                      + "<table style=\"width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;\">"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b; width: 40%;\">Mã đơn hàng:</td><td style=\"padding: 6px 0; font-weight: bold; color: #0284c7;\">" + bookingCode + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Tour đã đặt:</td><td style=\"padding: 6px 0; font-weight: 600; color: #0f172a;\">" + tourTitle + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Phương thức:</td><td style=\"padding: 6px 0;\">" + paymentMethod + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Mã giao dịch:</td><td style=\"padding: 6px 0; font-family: monospace; font-weight: bold;\">" + txnId + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Thời gian thanh toán:</td><td style=\"padding: 6px 0;\">" + paymentTimeText + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Trạng thái thu tiền:</td><td style=\"padding: 6px 0; color: #d97706; font-weight: bold;\">ĐÃ THU CỌC 30% (ĐỢT 1) ✔</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Hạn tất toán 70% còn lại:</td><td style=\"padding: 6px 0; color: #0284c7; font-weight: 600;\">Trước ngày khởi hành 03 - 15 ngày</td></tr>"



                      + "<tr><td colspan=\"2\" style=\"border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 6px;\"></td></tr>"



                      + "<tr><td style=\"font-size: 13px; color: #64748b;\">Tổng giá trị đơn tour (100%):</td><td style=\"font-size: 14px; font-weight: 600; color: #475569; text-align: right;\">" + totalPriceFormatted + "</td></tr>"



                      + "<tr><td style=\"font-size: 14px; font-weight: bold; color: #0f172a;\">TIỀN CỌC THỰC THU (30%):</td><td style=\"font-size: 17px; font-weight: 800; color: #0284c7; text-align: right;\">" + paidAmountFormatted + "</td></tr>"



                      + "<tr><td style=\"font-size: 13px; font-weight: bold; color: #ef4444;\">SỐ TIỀN CÒN NỢ (70%):</td><td style=\"font-size: 15px; font-weight: 800; color: #ef4444; text-align: right;\">" + remainingAmountFormatted + "</td></tr>"



                      + "</table>"



                      + "</div>"



                    : "<div style=\"background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin: 20px 0;\">"



                      + "<table style=\"width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;\">"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b; width: 40%;\">Mã đơn hàng:</td><td style=\"padding: 6px 0; font-weight: bold; color: #0284c7;\">" + bookingCode + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Tour đã đặt:</td><td style=\"padding: 6px 0; font-weight: 600; color: #0f172a;\">" + tourTitle + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Phương thức:</td><td style=\"padding: 6px 0;\">" + paymentMethod + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Mã giao dịch:</td><td style=\"padding: 6px 0; font-family: monospace; font-weight: bold;\">" + txnId + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Thời gian thanh toán:</td><td style=\"padding: 6px 0;\">" + paymentTimeText + "</td></tr>"



                      + "<tr><td style=\"padding: 6px 0; color: #64748b;\">Trạng thái:</td><td style=\"padding: 6px 0; color: #10b981; font-weight: bold;\">ĐÃ THANH TOÁN ĐỦ 100% (PAID) ✔</td></tr>"

                      + (hasDepositHistory
                          ? "<tr><td colspan=\"2\" style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-top: 6px;\">"
                              + "<div style=\"font-weight: bold; color: #0f172a; margin-bottom: 6px;\">📋 ĐỐI SOÁT THU TIỀN 2 ĐỢT:</div>"
                              + "<table style=\"width: 100%; font-size: 12px;\">"
                              + "<tr><td style=\"color: #64748b;\">• Tổng giá trị tour trọn gói:</td><td style=\"text-align: right; font-weight: bold; color: #0f172a;\">" + totalPriceFormatted + "</td></tr>"
                              + "<tr><td style=\"color: #64748b;\">• Đã thu cọc đợt 1 (30%):</td><td style=\"text-align: right; font-weight: bold; color: #0284c7;\">" + depAmountFormatted + "</td></tr>"
                              + "<tr><td style=\"color: #64748b;\">• Thu tất toán đợt 2 (70%):</td><td style=\"text-align: right; font-weight: bold; color: #0284c7;\">" + remAmountFormatted + "</td></tr>"
                              + "<tr><td style=\"color: #10b981; font-weight: bold; border-top: 1px dashed #cbd5e1; padding-top: 4px;\">• Số tiền còn lại:</td><td style=\"text-align: right; font-weight: bold; color: #10b981; border-top: 1px dashed #cbd5e1; padding-top: 4px;\">0 đ (Đã tất toán 100% ✔)</td></tr>"
                              + "</table></div></td></tr>"
                          : "")
                      + "<tr><td colspan=\"2\" style=\"border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 6px;\"></td></tr>"



                      + "<tr><td style=\"font-size: 14px; font-weight: bold; color: #0f172a;\">TỔNG SỐ TIỀN:</td><td style=\"font-size: 16px; font-weight: 800; color: #0284c7;\">" + totalPriceFormatted + "</td></tr>"



                      + "</table>"



                      + "</div>";



            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 25px 10px; margin: 0;\">"



                    + "<div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;\">"



                    + "<div style=\"background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff;\">"



                    + "<h1 style=\"margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;\">" + headerTitle + "</h1>"



                    + "<p style=\"margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;\">" + headerSub + "</p>"



                    + "</div>"



                    + "<div style=\"padding: 24px;\">"



                    + "<p style=\"font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0;\">Kính gửi " + customerName + ",</p>"



                    + "<p style=\"font-size: 14px; line-height: 1.6; color: #334155;\">" + introText + "</p>"



                    + invoiceTableHtml



                    + "<div style=\"background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #10b981; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #065f46; line-height: 1.5; margin-bottom: 20px;\">"



                    + attachmentExplanation



                    + "</div>"



                    + "<p style=\"font-size: 13px; color: #64748b; line-height: 1.5;\">Nếu Quý khách cần xuất hóa đơn cho tổ chức/doanh nghiệp có MST riêng, vui lòng liên hệ bộ phận Kế toán Smart Travel qua Hotline: <strong>0941 899 554</strong> hoặc email: <strong>billing@smarttravel.vn</strong> trong vòng 24h kể từ khi thanh toán.</p>"



                    + "</div>"



                    + "<div style=\"background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;\">"



                    + "<p style=\"margin: 0;\">© 2026 SmartTravel Platform. Hóa đơn điện tử hợp lệ theo Nghị định 123/2020/NĐ-CP.</p>"



                    + "</div>"



                    + "</div>"



                    + "</div>";



            helper.setText(htmlContent, true);



            if (pdfInvoice != null && pdfInvoice.length > 0) {



                helper.addAttachment(attachmentFilename, new org.springframework.core.io.ByteArrayResource(pdfInvoice), "application/pdf");



            }



            mailSender.send(message);



            log.info("Hóa đơn điện tử PDF đã gửi kèm email thành công tới: {}", toEmail);



        } catch (Exception e) {



            log.error("Không thể gửi email đính kèm Hóa đơn điện tử tới {}. Lý do: {}", toEmail, e.getMessage(), e);



        }



    }



    @Override



    @Async



    public void sendVendorApplicationApprovedEmail(String toEmail, String businessName) {



        log.info("==================================================");



        log.info("🎉 THÔNG BÁO DUYỆT ĐỐI TÁC VENDOR: {} [{}]", toEmail, businessName);



        log.info("==================================================");



        try {



            MimeMessage message = mailSender.createMimeMessage();



            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");



            helper.setFrom(fromEmail, "Smart Travel Partner Portal");



            helper.setTo(toEmail);



            helper.setSubject("🎉 [SmartTravel] Chúc mừng! Hồ sơ đối tác " + businessName + " đã được phê duyệt");



            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"



                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"



                    + "<h2 style=\"color: #0284c7; margin: 0; font-size: 24px;\">✈️ Smart Travel Partner Portal</h2>"



                    + "<p style=\"color: #64748b; font-size: 13px; margin-top: 4px;\">Nền tảng Quản trị & Phân phối Tour Du lịch Thông minh</p>"



                    + "</div>"



                    + "<div style=\"background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;\">"



                    + "<span style=\"font-size: 36px;\">🎉</span>"



                    + "<h3 style=\"color: #065f46; margin: 8px 0 4px 0; font-size: 18px;\">HỒ SƠ ĐÃ ĐƯỢC PHÊ DUYỆT THÀNH CÔNG!</h3>"



                    + "<p style=\"color: #047857; margin: 0; font-size: 13px;\">Tài khoản của bạn đã được nâng cấp lên quyền <strong>Nhà Cung Cấp (Vendor)</strong>.</p>"



                    + "</div>"



                    + "<div style=\"color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;\">"



                    + "<p>Kính gửi Quý đối tác <strong>" + businessName + "</strong>,</p>"



                    + "<p>Ban Quản Trị SmartTravel trân trọng thông báo hồ sơ đăng ký đại lý bán tour của Quý công ty đã được thẩm định và phê duyệt thành công.</p>"



                    + "<p>Hiện tại, Quý công ty có thể đăng nhập vào hệ thống và bắt đầu sử dụng các tính năng:</p>"



                    + "<ul style=\"padding-left: 20px; color: #475569;\">"



                    + "<li>Đăng tải và quản lý Tour du lịch của doanh nghiệp.</li>"



                    + "<li>Quản lý lịch khởi hành, giá vé người lớn & trẻ em.</li>"



                    + "<li>Tiếp nhận, xử lý booking và xét duyệt hồ sơ Visa du khách.</li>"



                    + "<li>Theo dõi báo cáo doanh thu & đối soát thanh toán trực tuyến.</li>"



                    + "</ul>"



                    + "</div>"



                    + "<div style=\"text-align: center; margin: 30px 0;\">"



                    + "<a href=\"http://localhost:5173/vendor\" style=\"display: inline-block; background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;\">Truy Cập Kênh Nhà Cung Cấp Ngay</a>"



                    + "</div>"



                    + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />"



                    + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin: 0;\">SmartTravel trân trọng cảm ơn sự đồng hành của Quý đối tác!</p>"



                    + "</div>";



            helper.setText(htmlContent, true);



            mailSender.send(message);



            log.info("Email phê duyệt Vendor đã gửi thành công tới: {}", toEmail);



        } catch (Exception e) {



            log.error("Không thể gửi email phê duyệt tới {}. Lý do: {}", toEmail, e.getMessage());



        }



    }



    @Override



    @Async



    public void sendVendorApplicationRejectedEmail(String toEmail, String businessName, String reason) {



        log.info("==================================================");



        log.info("⚠️ THÔNG BÁO TỪ CHỐI ĐỐI TÁC VENDOR: {} [Lý do: {}]", toEmail, reason);



        log.info("==================================================");



        try {



            MimeMessage message = mailSender.createMimeMessage();



            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");



            helper.setFrom(fromEmail, "Smart Travel Partner Portal");



            helper.setTo(toEmail);



            helper.setSubject("⚠️ [SmartTravel] Thông báo kết quả thẩm định hồ sơ đối tác " + businessName);



            String displayReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Thông tin hoặc hồ sơ pháp lý chưa đầy đủ theo quy định.";



            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"



                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"



                    + "<h2 style=\"color: #0284c7; margin: 0; font-size: 24px;\">✈️ Smart Travel Partner Portal</h2>"



                    + "<p style=\"color: #64748b; font-size: 13px; margin-top: 4px;\">Nền tảng Quản trị & Phân phối Tour Du lịch Thông minh</p>"



                    + "</div>"



                    + "<div style=\"background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;\">"



                    + "<span style=\"font-size: 36px;\">⚠️</span>"



                    + "<h3 style=\"color: #9f1239; margin: 8px 0 4px 0; font-size: 18px;\">HỒ SƠ CẦN BỔ SUNG HOẶC CHƯA ĐẠT YÊU CẦU</h3>"



                    + "<p style=\"color: #be123c; margin: 0; font-size: 13px;\">Rất tiếc hồ sơ đăng ký đại lý chưa được phê duyệt trong đợt này.</p>"



                    + "</div>"



                    + "<div style=\"color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;\">"



                    + "<p>Kính gửi Quý đối tác <strong>" + businessName + "</strong>,</p>"



                    + "<p>Ban Quản Trị SmartTravel đã thẩm định hồ sơ đăng ký của Quý công ty và nhận thấy một số thông tin cần được điều chỉnh:</p>"



                    + "<div style=\"background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-weight: 500; color: #1e293b;\">"



                    + "<strong>Lý do phản hồi từ Ban Quản Trị:</strong><br/>"



                    + displayReason



                    + "</div>"



                    + "<p>Quý đối tác vui lòng cập nhật lại thông tin, tải lên đầy đủ giấy tờ hợp lệ và gửi lại hồ sơ qua cổng đăng ký của chúng tôi.</p>"



                    + "</div>"



                    + "<div style=\"text-align: center; margin: 30px 0;\">"



                    + "<a href=\"http://localhost:5173/become-vendor\" style=\"display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;\">Cập Nhật Lại Hồ Sơ</a>"



                    + "</div>"



                    + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />"



                    + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin: 0;\">Nếu có thắc mắc, vui lòng liên hệ Hotline hỗ trợ đối tác: 0941 899 554.</p>"



                    + "</div>";



            helper.setText(htmlContent, true);



            mailSender.send(message);



            log.info("Email từ chối Vendor đã gửi thành công tới: {}", toEmail);



        } catch (Exception e) {



            log.error("Không thể gửi email từ chối tới {}. Lý do: {}", toEmail, e.getMessage());

        }

    }

    @Override
    @Async
    public void sendVisaStatusUpdateEmail(String toEmail, String customerName, String bookingCode, String tourTitle, String statusLabel, String note) {
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Smart Travel Visa Support");
            helper.setTo(toEmail);
            helper.setSubject("[Smart Travel] Cập nhật tiến độ hồ sơ Visa #" + bookingCode + " - " + statusLabel);

            String safeName = customerName != null && !customerName.isBlank() ? customerName : "Quý khách";
            String safeTour = tourTitle != null ? tourTitle : "Tour du lịch quốc tế";
            String noteBlock = (note != null && !note.isBlank())
                    ? "<div style=\"background-color:#f8fafc;border-left:4px solid #0284c7;padding:12px 16px;border-radius:8px;margin:16px 0;color:#1e293b;\"><strong>Ghi chú từ chuyên viên Đại lý:</strong><br/>" + note + "</div>"
                    : "";

            String htmlContent = "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;\">"
                    + "<h2 style=\"color:#0f172a;margin-top:0;\">Thông báo tiến độ dịch vụ ủy quyền hồ sơ Visa</h2>"
                    + "<p>Xin chào <strong>" + safeName + "</strong>,</p>"
                    + "<p>Đại lý du lịch phụ trách hành trình <strong>" + safeTour + "</strong> (Mã đặt chỗ: <strong>" + bookingCode + "</strong>) vừa cập nhật trạng thái hồ sơ Visa của bạn:</p>"
                    + "<p style=\"font-size:15px;\">Trạng thái hiện tại: <strong style=\"color:#0284c7;\">" + statusLabel + "</strong></p>"
                    + noteBlock
                    + "<p style=\"font-size:13px;color:#475569;\">Lưu ý: Mọi quyết định xét duyệt và cấp thị thực đều do Đại sứ quán / Lãnh sự quán thực hiện trực tiếp. Chuyên viên Đại lý chỉ đóng vai trò sơ duyệt bản mềm, nộp hộ hồ sơ theo đoàn và cập nhật kết quả trả về để Quý khách tiện theo dõi.</p>"
                    + "<div style=\"margin-top:24px;text-align:center;\"><a href=\"http://localhost:5173/my-bookings\" style=\"display:inline-block;background-color:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold;\">Xem Chi Tiết Hồ Sơ</a></div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Đã gửi email cập nhật trạng thái Visa [{}] tới {}", statusLabel, toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email cập nhật Visa tới {}: {}", toEmail, e.getMessage());
        }
    }

}
