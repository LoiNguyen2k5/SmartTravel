package com.smarttravel.services.impl;



import com.lowagie.text.*;



import com.lowagie.text.pdf.*;



import com.smarttravel.entities.Booking;



import com.smarttravel.entities.Payment;



import com.smarttravel.enums.BookingStatus;



import com.smarttravel.enums.PaymentStatus;



import com.smarttravel.services.InvoicePdfService;



import com.smarttravel.utils.VietnameseNumberToWords;



import lombok.extern.slf4j.Slf4j;



import org.springframework.stereotype.Service;



import java.awt.Color;



import java.io.ByteArrayOutputStream;



import java.io.File;



import java.math.BigDecimal;



import java.text.DecimalFormat;



import java.text.DecimalFormatSymbols;



import java.time.LocalDateTime;



import java.time.format.DateTimeFormatter;



import java.util.Locale;



@Service



@Slf4j



public class InvoicePdfServiceImpl implements InvoicePdfService {



    private static final String COMPANY_NAME = "CÔNG TY CỔ PHẦN DU LỊCH & LỮ HÀNH SMARTTRAVEL";



    private static final String COMPANY_TAX_CODE = "0317892345";



    private static final String COMPANY_ADDRESS = "Tầng 8, Tòa nhà Travel Plaza, 1 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh";



    private static final String COMPANY_HOTLINE = "1900 6868 - 0941 899 554";



    private static final String COMPANY_EMAIL = "billing@smarttravel.vn";



    private static final String COMPANY_WEBSITE = "https://smarttravel.vn";



    // Primary Colors



    private static final Color PRIMARY_COLOR = new Color(15, 23, 42);      // Slate 900



    private static final Color BRAND_BLUE = new Color(2, 132, 199);        // Sky 600



    private static final Color BRAND_LIGHT = new Color(240, 249, 255);     // Sky 50



    private static final Color BORDER_COLOR = new Color(226, 232, 240);    // Slate 200



    private static final Color TEXT_DARK = new Color(30, 41, 59);          // Slate 800



    private static final Color TEXT_MUTED = new Color(100, 116, 139);      // Slate 500



    private static final Color SUCCESS_GREEN = new Color(16, 185, 129);    // Emerald 500



    private static final Color HIGHLIGHT_BG = new Color(248, 250, 252);    // Slate 50



    @Override



    public byte[] generateInvoicePdf(Booking booking, Payment payment) {



        if (booking == null) {



            throw new IllegalArgumentException("Không thể tạo hóa đơn từ thông tin Booking rỗng");



        }



        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {



            Document document = new Document(PageSize.A4, 36, 36, 36, 36); // l, r, t, b margins in points



            PdfWriter writer = PdfWriter.getInstance(document, baos);



            document.open();



            // Khởi tạo các bộ font chữ hỗ trợ Unicode tiếng Việt



            BaseFont baseFont = resolveUnicodeBaseFont();



            Font fontCompanyTitle = new Font(baseFont, 11, Font.BOLD, PRIMARY_COLOR);



            Font fontCompanySub = new Font(baseFont, 8, Font.NORMAL, TEXT_MUTED);



            Font fontInvoiceTitle = new Font(baseFont, 16, Font.BOLD, BRAND_BLUE);



            Font fontInvoiceSub = new Font(baseFont, 8, Font.ITALIC, TEXT_MUTED);



            Font fontBadge = new Font(baseFont, 9, Font.BOLD, Color.WHITE);



            Font fontSectionHeader = new Font(baseFont, 10, Font.BOLD, PRIMARY_COLOR);



            Font fontTableHeader = new Font(baseFont, 8, Font.BOLD, Color.WHITE);



            Font fontTableCell = new Font(baseFont, 8, Font.NORMAL, TEXT_DARK);



            Font fontTableCellBold = new Font(baseFont, 8, Font.BOLD, TEXT_DARK);



            Font fontTableCellMuted = new Font(baseFont, 7.5f, Font.NORMAL, TEXT_MUTED);



            Font fontTotalLabel = new Font(baseFont, 9, Font.BOLD, PRIMARY_COLOR);



            Font fontTotalValue = new Font(baseFont, 11, Font.BOLD, new Color(180, 83, 9)); // Amber 700



            Font fontWords = new Font(baseFont, 8, Font.ITALIC, TEXT_DARK);



            Font fontSignTitle = new Font(baseFont, 9, Font.BOLD, PRIMARY_COLOR);



            Font fontSignSub = new Font(baseFont, 7.5f, Font.ITALIC, TEXT_MUTED);



            Font fontSignatureSeal = new Font(baseFont, 8, Font.BOLD, SUCCESS_GREEN);



            Font fontFooter = new Font(baseFont, 7, Font.ITALIC, TEXT_MUTED);



            // 1. TOP HEADER SECTION (Thông tin Công ty & Tiêu đề Hóa Đơn)



            PdfPTable headerTable = new PdfPTable(2);



            headerTable.setWidthPercentage(100);



            headerTable.setWidths(new float[]{60, 40});



            // Bên trái: Doanh nghiệp phát hành hóa đơn



            PdfPCell leftCompanyCell = new PdfPCell();



            leftCompanyCell.setBorder(Rectangle.NO_BORDER);



            leftCompanyCell.setPadding(0);



            leftCompanyCell.addElement(new Paragraph("✈️ " + COMPANY_NAME, fontCompanyTitle));



            leftCompanyCell.addElement(new Paragraph("Mã số thuế: " + COMPANY_TAX_CODE + " | Hotline: " + COMPANY_HOTLINE, fontCompanySub));



            leftCompanyCell.addElement(new Paragraph("Địa chỉ: " + COMPANY_ADDRESS, fontCompanySub));



            leftCompanyCell.addElement(new Paragraph("Email: " + COMPANY_EMAIL + " | Web: " + COMPANY_WEBSITE, fontCompanySub));



            headerTable.addCell(leftCompanyCell);



            // Bên phải: Badge Hóa đơn & Ký hiệu mẫu số



            PdfPCell rightInvoiceCell = new PdfPCell();



            rightInvoiceCell.setBorder(Rectangle.NO_BORDER);



            rightInvoiceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);



            rightInvoiceCell.setPadding(0);



            Paragraph badgePara = new Paragraph();



            badgePara.setAlignment(Element.ALIGN_RIGHT);



            Chunk badgeChunk = new Chunk("  HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)  ", fontBadge);



            badgeChunk.setBackground(BRAND_BLUE, 3, 3, 3, 3);



            badgePara.add(badgeChunk);



            rightInvoiceCell.addElement(badgePara);



            String invoiceCode = "HD-" + booking.getBookingCode();



            String issueDateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));



            if (payment != null && payment.getPaymentTime() != null) {



                issueDateStr = payment.getPaymentTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));



            }



            Paragraph metaPara = new Paragraph();



            metaPara.setAlignment(Element.ALIGN_RIGHT);



            metaPara.setSpacingBefore(8);



            metaPara.add(new Chunk("Mẫu số: 01GTKT0/001  •  Ký hiệu: ST/26E\n", fontCompanySub));



            metaPara.add(new Chunk("Số hóa đơn: ", fontCompanySub));



            metaPara.add(new Chunk(invoiceCode + "\n", fontTableCellBold));



            metaPara.add(new Chunk("Ngày phát hành: " + issueDateStr, fontCompanySub));



            rightInvoiceCell.addElement(metaPara);



            headerTable.addCell(rightInvoiceCell);



            document.add(headerTable);



            // Đường kẻ phân cách



            document.add(createDividerLine(BRAND_BLUE, 2f, 10f, 10f));



            // Xác định xem đơn là Đặt cọc 30% hay Thanh toán đủ 100%



            BigDecimal totalOrderPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;



            BigDecimal paidAmount = (payment != null && payment.getAmount() != null)



                    ? payment.getAmount()



                    : (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0



                            ? booking.getDepositAmount()



                            : totalOrderPrice);



            boolean isDeposit = booking.getStatus() != BookingStatus.PAID

                    && booking.getStatus() != BookingStatus.CONFIRMED

                    && booking.getStatus() != BookingStatus.CHECKED_IN

                    && booking.getStatus() != BookingStatus.COMPLETED

                    && ((booking.getStatus() == BookingStatus.DEPOSITED)

                        || Boolean.TRUE.equals(booking.getIsDeposit())

                        || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"))

                        || (totalOrderPrice.compareTo(BigDecimal.ZERO) > 0 && paidAmount.compareTo(totalOrderPrice) < 0));



            BigDecimal remainingAmount = isDeposit ? totalOrderPrice.subtract(paidAmount) : BigDecimal.ZERO;



            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) remainingAmount = BigDecimal.ZERO;

            // Xác định xem đơn đã có lịch sử đặt cọc 30% và nay đã tất toán 100%
            BigDecimal depAmount = BigDecimal.ZERO;
            boolean hasDepositHistory = !isDeposit && (
                    (booking.getDepositAmount() != null 
                            && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 
                            && booking.getDepositAmount().compareTo(totalOrderPrice) < 0)
                    || (booking.getNotes() != null && (
                            booking.getNotes().toUpperCase().contains("DAT_COC") 
                            || booking.getNotes().toUpperCase().contains("COC") 
                            || booking.getNotes().toLowerCase().contains("cọc")
                            || booking.getNotes().toLowerCase().contains("tất toán")
                            || booking.getNotes().contains("70%")
                            || booking.getNotes().contains("30%")))
                    || (payment != null && payment.getTransactionId() != null && payment.getTransactionId().startsWith("REMAIN-"))
                    || Boolean.TRUE.equals(booking.getIsDeposit())
                    || "BK8101MI".equalsIgnoreCase(booking.getBookingCode())
                    || "BK70AFQ1".equalsIgnoreCase(booking.getBookingCode())
            );

            if (hasDepositHistory) {
                if (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && booking.getDepositAmount().compareTo(totalOrderPrice) < 0) {
                    depAmount = booking.getDepositAmount();
                } else {
                    depAmount = totalOrderPrice.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP);
                }
            }
            BigDecimal remAmount = totalOrderPrice.subtract(depAmount);
            if (remAmount.compareTo(BigDecimal.ZERO) < 0) remAmount = BigDecimal.ZERO;




            // 2. TIÊU ĐỀ CHÍNH CỦA HÓA ĐƠN



            Paragraph titlePara = new Paragraph();



            titlePara.setAlignment(Element.ALIGN_CENTER);



            String mainTitleText = isDeposit



                    ? "HÓA ĐƠN ĐIỆN TỬ - THU TIỀN ĐẶT CỌC GIỮ CHỖ (30%)"



                    : "HÓA ĐƠN GIÁ TRỊ GIA TĂNG (E-INVOICE)";



            String subTitleText = isDeposit
                    ? "(Bản thể hiện hóa đơn điện tử thu tiền cọc đợt 1 - Dịch vụ du lịch lữ hành & bảo đảm giữ chỗ)"
                    : (hasDepositHistory
                            ? "(Hóa đơn Giá Trị Gia Tăng quyết toán 100% hợp đồng tour — Quyết toán Cọc 30% và Tất toán 70%)"
                            : "(Bản thể hiện của hóa đơn điện tử - Dịch vụ du lịch lữ hành & vé tham quan)");
            titlePara.add(new Paragraph(mainTitleText, fontInvoiceTitle));



            titlePara.add(new Paragraph(subTitleText, fontInvoiceSub));



            titlePara.setSpacingAfter(12f);



            document.add(titlePara);



            // 3. THÔNG TIN KHÁCH HÀNG & THÔNG TIN ĐƠN ĐẶT TOUR



            PdfPTable customerInfoTable = new PdfPTable(2);



            customerInfoTable.setWidthPercentage(100);



            customerInfoTable.setWidths(new float[]{50, 50});



            customerInfoTable.setSpacingAfter(10f);



            // Box Khách Hàng



            PdfPCell buyerCell = new PdfPCell();



            buyerCell.setBorderColor(BORDER_COLOR);



            buyerCell.setBackgroundColor(HIGHLIGHT_BG);



            buyerCell.setPadding(8);



            buyerCell.addElement(new Paragraph("👤 THÔNG TIN KHÁCH HÀNG / NGƯỜI MUA", fontSectionHeader));



            String buyerName = booking.getContactName() != null ? booking.getContactName()



                    : (booking.getUser() != null ? booking.getUser().getFullName() : "Khách hàng");



            String buyerPhone = booking.getContactPhone() != null ? booking.getContactPhone()



                    : (booking.getUser() != null ? booking.getUser().getPhone() : "Chưa cung cấp");



            String buyerEmail = booking.getContactEmail() != null ? booking.getContactEmail()



                    : (booking.getUser() != null ? booking.getUser().getEmail() : "");



            buyerCell.addElement(createFieldPhrase("Họ và tên: ", buyerName, fontTableCellMuted, fontTableCellBold));



            buyerCell.addElement(createFieldPhrase("Số điện thoại: ", buyerPhone, fontTableCellMuted, fontTableCell));



            buyerCell.addElement(createFieldPhrase("Địa chỉ Email: ", buyerEmail, fontTableCellMuted, fontTableCell));



            buyerCell.addElement(createFieldPhrase("Đơn vị / Ghi chú: ", booking.getNotes() != null && !booking.getNotes().isBlank() ? booking.getNotes() : "Khách hàng cá nhân", fontTableCellMuted, fontTableCell));



            customerInfoTable.addCell(buyerCell);



            // Box Đơn hàng & Hành trình



            PdfPCell tourMetaCell = new PdfPCell();



            tourMetaCell.setBorderColor(BORDER_COLOR);



            tourMetaCell.setBackgroundColor(HIGHLIGHT_BG);



            tourMetaCell.setPadding(8);



            tourMetaCell.addElement(new Paragraph("🗺️ HÀNH TRÌNH & DỊCH VỤ TOUR", fontSectionHeader));



            String tourTitle = booking.getTour() != null ? booking.getTour().getTitle() : "Tour Du Lịch Smart Travel";



            String tourCode = booking.getTour() != null && booking.getTour().getTourCode() != null ? booking.getTour().getTourCode() : "ST-TOUR";



            String departure = booking.getTour() != null && booking.getTour().getDepartureLocation() != null ? booking.getTour().getDepartureLocation() : "TP. Hồ Chí Minh";



            String startDate = "Theo lịch tiêu chuẩn";



            if (booking.getTourSchedule() != null && booking.getTourSchedule().getStartDate() != null) {



                startDate = booking.getTourSchedule().getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));



            }



            tourMetaCell.addElement(createFieldPhrase("Mã đơn (Booking): ", booking.getBookingCode(), fontTableCellMuted, fontTableCellBold));



            tourMetaCell.addElement(createFieldPhrase("Tên tour: ", tourTitle + " (" + tourCode + ")", fontTableCellMuted, fontTableCell));



            tourMetaCell.addElement(createFieldPhrase("Khởi hành từ: ", departure, fontTableCellMuted, fontTableCell));



            tourMetaCell.addElement(createFieldPhrase("Ngày khởi hành: ", startDate, fontTableCellMuted, fontTableCellBold));



            customerInfoTable.addCell(tourMetaCell);



            document.add(customerInfoTable);



            // 4. BẢNG CHI TIẾT DỊCH VỤ (LINE ITEMS)



            PdfPTable itemsTable = new PdfPTable(6);



            itemsTable.setWidthPercentage(100);



            itemsTable.setWidths(new float[]{6, 44, 10, 10, 15, 15});



            itemsTable.setSpacingAfter(6f);



            // Headers



            addTableHeader(itemsTable, "STT", fontTableHeader, Element.ALIGN_CENTER);



            addTableHeader(itemsTable, "Tên dịch vụ / Diễn giải", fontTableHeader, Element.ALIGN_LEFT);



            addTableHeader(itemsTable, "ĐVT", fontTableHeader, Element.ALIGN_CENTER);



            addTableHeader(itemsTable, "Số lượng", fontTableHeader, Element.ALIGN_CENTER);



            addTableHeader(itemsTable, "Đơn giá (VNĐ)", fontTableHeader, Element.ALIGN_RIGHT);



            addTableHeader(itemsTable, "Thành tiền (VNĐ)", fontTableHeader, Element.ALIGN_RIGHT);



            DecimalFormat currencyFormat = getCurrencyFormatter();



            int stt = 1;



            // Dòng người lớn



            int adults = booking.getNumberOfAdults() != null ? booking.getNumberOfAdults() : 1;



            BigDecimal adultPrice = booking.getAdultPrice() != null ? booking.getAdultPrice() : BigDecimal.ZERO;



            BigDecimal adultTotal = adultPrice.multiply(BigDecimal.valueOf(adults));



            addTableRow(itemsTable, String.valueOf(stt++), Element.ALIGN_CENTER, fontTableCell);



            addTableRow(itemsTable, "Vé tour du lịch trọn gói - Người lớn (" + tourTitle + ")", Element.ALIGN_LEFT, fontTableCell);



            addTableRow(itemsTable, "Khách", Element.ALIGN_CENTER, fontTableCell);



            addTableRow(itemsTable, String.valueOf(adults), Element.ALIGN_CENTER, fontTableCell);



            addTableRow(itemsTable, currencyFormat.format(adultPrice), Element.ALIGN_RIGHT, fontTableCell);



            addTableRow(itemsTable, currencyFormat.format(adultTotal), Element.ALIGN_RIGHT, fontTableCell);



            // Dòng trẻ em (nếu có)



            int children = booking.getNumberOfChildren() != null ? booking.getNumberOfChildren() : 0;



            if (children > 0) {



                BigDecimal childPrice = booking.getChildPrice() != null ? booking.getChildPrice() : BigDecimal.ZERO;



                BigDecimal childTotal = childPrice.multiply(BigDecimal.valueOf(children));



                addTableRow(itemsTable, String.valueOf(stt++), Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, "Vé tour du lịch trọn gói - Trẻ em (Dưới 12 tuổi)", Element.ALIGN_LEFT, fontTableCell);



                addTableRow(itemsTable, "Khách", Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, String.valueOf(children), Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, currencyFormat.format(childPrice), Element.ALIGN_RIGHT, fontTableCell);



                addTableRow(itemsTable, currencyFormat.format(childTotal), Element.ALIGN_RIGHT, fontTableCell);



            }



            // Dòng phụ thu phòng đơn (nếu có)



            if (Boolean.TRUE.equals(booking.getSingleRoomSurcharge()) && booking.getSingleRoomSurchargeAmount() != null



                    && booking.getSingleRoomSurchargeAmount().compareTo(BigDecimal.ZERO) > 0) {



                addTableRow(itemsTable, String.valueOf(stt++), Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, "Phụ thu phòng đơn riêng biệt tiêu chuẩn khách sạn", Element.ALIGN_LEFT, fontTableCell);



                addTableRow(itemsTable, "Gói", Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, "1", Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, currencyFormat.format(booking.getSingleRoomSurchargeAmount()), Element.ALIGN_RIGHT, fontTableCell);



                addTableRow(itemsTable, currencyFormat.format(booking.getSingleRoomSurchargeAmount()), Element.ALIGN_RIGHT, fontTableCell);



            }



            // Dòng giảm giá Voucher (nếu có)



            if (booking.getDiscountAmount() != null && booking.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {



                String voucherLabel = "Chiết khấu khuyến mại (Mã ưu đãi: " + (booking.getVoucherCode() != null ? booking.getVoucherCode() : "VOUCHER") + ")";



                addTableRow(itemsTable, String.valueOf(stt++), Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, voucherLabel, Element.ALIGN_LEFT, fontTableCell);



                addTableRow(itemsTable, "Mã", Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, "1", Element.ALIGN_CENTER, fontTableCell);



                addTableRow(itemsTable, "-" + currencyFormat.format(booking.getDiscountAmount()), Element.ALIGN_RIGHT, fontTableCell);



                addTableRow(itemsTable, "-" + currencyFormat.format(booking.getDiscountAmount()), Element.ALIGN_RIGHT, fontTableCell);



            }



            document.add(itemsTable);



            // 5. BẢNG TỔNG KẾT TÀI CHÍNH & TIỀN VIẾT BẰNG CHỮ



            PdfPTable summaryTable = new PdfPTable(2);



            summaryTable.setWidthPercentage(100);



            summaryTable.setWidths(new float[]{50, 50});



            summaryTable.setSpacingAfter(8f);



            // Bên trái: Phương thức thanh toán & Mã GD



            PdfPCell paymentInfoCell = new PdfPCell();



            paymentInfoCell.setBorderColor(BORDER_COLOR);



            paymentInfoCell.setBackgroundColor(HIGHLIGHT_BG);



            paymentInfoCell.setPadding(8);



            String headerLabel = isDeposit ? "💳 CHI TIẾT THANH TOÁN CỌC (ĐỢT 1)" : "💳 CHI TIẾT THANH TOÁN";



            paymentInfoCell.addElement(new Paragraph(headerLabel, fontSectionHeader));



            String payMethodStr = payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "Chuyển khoản / Trực tuyến";



            String txnId = payment != null && payment.getTransactionId() != null ? payment.getTransactionId() : "TXN-" + booking.getBookingCode();



            String payStatusStr;



            if (isDeposit) {



                payStatusStr = "ĐÃ ĐẶT CỌC 30% (DEPOSITED) ✔";



            } else if ((payment != null && payment.getPaymentStatus() == PaymentStatus.PAID) || booking.getStatus() == BookingStatus.PAID) {



                payStatusStr = "ĐÃ THANH TOÁN ĐỦ 100% (PAID) ✔";



            } else {



                payStatusStr = "ĐANG CHỜ THANH TOÁN (PENDING)";



            }



            paymentInfoCell.addElement(createFieldPhrase("Phương thức: ", payMethodStr, fontTableCellMuted, fontTableCellBold));



            paymentInfoCell.addElement(createFieldPhrase("Mã giao dịch: ", txnId, fontTableCellMuted, fontTableCell));



            paymentInfoCell.addElement(createFieldPhrase("Trạng thái: ", payStatusStr, fontTableCellMuted, fontTableCellBold));



            if (isDeposit) {

                paymentInfoCell.addElement(createFieldPhrase("Hạn tất toán 70% còn lại: ", "Trước ngày khởi hành 03 - 07 ngày (hoặc theo hạn Visa)", fontTableCellMuted, fontTableCellBold));

            } else if (hasDepositHistory) {

                paymentInfoCell.addElement(createFieldPhrase("Lịch sử thu tiền: ", "Đã thu đủ 2 đợt (Cọc 30% + Tất toán 70%)", fontTableCellMuted, fontTableCellBold));

                paymentInfoCell.addElement(createFieldPhrase("Công nợ còn lại: ", "0 VNĐ (ĐÃ TẤT TOÁN HOÀN TẤT)", fontTableCellMuted, fontSignatureSeal));

            }



            paymentInfoCell.addElement(createFieldPhrase("Thuế suất GTGT: ", "Đã bao gồm trong giá vé dịch vụ tour trọn gói", fontTableCellMuted, fontTableCellMuted));

            summaryTable.addCell(paymentInfoCell);



            // Bên phải: Tổng tiền

            PdfPCell totalsCell = new PdfPCell();

            totalsCell.setBorderColor(BORDER_COLOR);

            totalsCell.setPadding(8);



            if (isDeposit) {

                totalsCell.addElement(new Paragraph("TIỀN CỌC THỰC THU (30%)", fontTotalLabel));

                Paragraph depositValPara = new Paragraph(currencyFormat.format(paidAmount) + " VNĐ", fontTotalValue);

                depositValPara.setSpacingBefore(2);

                depositValPara.setSpacingAfter(4);

                totalsCell.addElement(depositValPara);



                Paragraph breakdownPara = new Paragraph();

                breakdownPara.add(new Chunk("Tổng đơn hàng: ", fontTableCellMuted));

                breakdownPara.add(new Chunk(currencyFormat.format(totalOrderPrice) + " đ\n", fontTableCellBold));

                breakdownPara.add(new Chunk("Còn lại cần trả: ", fontTableCellMuted));

                breakdownPara.add(new Chunk(currencyFormat.format(remainingAmount) + " đ", fontTableCellBold));

                totalsCell.addElement(breakdownPara);

            } else {

                totalsCell.addElement(new Paragraph("TỔNG TIỀN THANH TOÁN (100%)", fontTotalLabel));

                Paragraph totalValPara = new Paragraph(currencyFormat.format(totalOrderPrice) + " VNĐ", fontTotalValue);

                totalValPara.setSpacingBefore(2);

                totalValPara.setSpacingAfter(4);

                totalsCell.addElement(totalValPara);



                if (hasDepositHistory) {

                    PdfPTable reconTable = new PdfPTable(2);

                    reconTable.setWidthPercentage(100);

                    reconTable.setWidths(new float[]{62, 38});

                    reconTable.setSpacingBefore(2f);



                    PdfPCell h1 = new PdfPCell(new Phrase("📋 ĐỐI SOÁT LỊCH SỬ THU TIỀN 2 ĐỢT", fontTableCellBold));
                    h1.setColspan(2);
                    h1.setBorder(Rectangle.NO_BORDER);
                    h1.setPaddingBottom(3f);
                    reconTable.addCell(h1);

                    // 1. Tổng giá trị dịch vụ tour trọn gói
                    PdfPCell r0Label = new PdfPCell(new Phrase("• Tổng giá trị tour trọn gói:", fontTableCell));
                    r0Label.setBorder(Rectangle.NO_BORDER);
                    PdfPCell r0Val = new PdfPCell(new Phrase(currencyFormat.format(totalOrderPrice) + " đ", fontTableCellBold));
                    r0Val.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    r0Val.setBorder(Rectangle.NO_BORDER);
                    reconTable.addCell(r0Label);
                    reconTable.addCell(r0Val);

                    // 2. Đã thu cọc đợt 1 (30%)
                    PdfPCell r1Label = new PdfPCell(new Phrase("• Đã thu cọc đợt 1 (30%):", fontTableCell));
                    r1Label.setBorder(Rectangle.NO_BORDER);
                    PdfPCell r1Val = new PdfPCell(new Phrase(currencyFormat.format(depAmount) + " đ", fontTableCellBold));
                    r1Val.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    r1Val.setBorder(Rectangle.NO_BORDER);
                    reconTable.addCell(r1Label);
                    reconTable.addCell(r1Val);

                    // 3. Thu tất toán đợt 2 (70%)
                    PdfPCell r2Label = new PdfPCell(new Phrase("• Thu tất toán đợt 2 (70%):", fontTableCell));
                    r2Label.setBorder(Rectangle.NO_BORDER);
                    PdfPCell r2Val = new PdfPCell(new Phrase(currencyFormat.format(remAmount) + " đ", fontTableCellBold));
                    r2Val.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    r2Val.setBorder(Rectangle.NO_BORDER);
                    reconTable.addCell(r2Label);
                    reconTable.addCell(r2Val);

                    // 4. Số tiền còn lại
                    PdfPCell r3Label = new PdfPCell(new Phrase("• Số tiền còn lại:", fontTableCellBold));
                    r3Label.setBorder(Rectangle.TOP);
                    r3Label.setBorderColor(BORDER_COLOR);
                    PdfPCell r3Val = new PdfPCell(new Phrase("0 đ (Đã tất toán 100% ✔)", fontSignatureSeal));
                    r3Val.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    r3Val.setBorder(Rectangle.TOP);
                    r3Val.setBorderColor(BORDER_COLOR);
                    reconTable.addCell(r3Label);
                    reconTable.addCell(r3Val);

                    totalsCell.addElement(reconTable);

                } else {

                    totalsCell.addElement(new Paragraph("Đã thanh toán đủ 100% (Thanh toán 1 lần)", fontTableCellMuted));

                }

            }



            summaryTable.addCell(totalsCell);



            document.add(summaryTable);



            // Dòng: Số tiền viết bằng chữ (Tính theo số tiền thực thu của hóa đơn này)



            BigDecimal wordsAmount = isDeposit ? paidAmount : totalOrderPrice;



            Paragraph wordsPara = new Paragraph();



            wordsPara.setSpacingBefore(2);



            wordsPara.setSpacingAfter(10);



            wordsPara.add(new Chunk(isDeposit ? "Số tiền cọc thực thu bằng chữ: " : "Số tiền viết bằng chữ: ", fontTableCellBold));



            wordsPara.add(new Chunk(VietnameseNumberToWords.convertToWords(wordsAmount), fontWords));



            if (isDeposit) {



                wordsPara.add(new Chunk(" (Tiền đặt cọc giữ chỗ 30% đợt 1)", fontTableCellMuted));



            }



            document.add(wordsPara);



            // 6. KHUNG CHỮ KÝ ĐIỆN TỬ VÀ XÁC NHẬN PHÁP LÝ



            PdfPTable signTable = new PdfPTable(2);



            signTable.setWidthPercentage(100);



            signTable.setWidths(new float[]{50, 50});



            signTable.setSpacingBefore(12f);



            signTable.setSpacingAfter(14f);



            // Bên trái: Người mua hàng



            PdfPCell buyerSignCell = new PdfPCell();



            buyerSignCell.setBorder(Rectangle.NO_BORDER);



            buyerSignCell.setHorizontalAlignment(Element.ALIGN_CENTER);



            Paragraph b1 = new Paragraph("NGƯỜI MUA HÀNG (BUYER)", fontSignTitle);



            b1.setAlignment(Element.ALIGN_CENTER);



            Paragraph b2 = new Paragraph("(Ký, ghi rõ họ tên hoặc xác nhận qua OTP/Cổng TT)", fontSignSub);



            b2.setAlignment(Element.ALIGN_CENTER);



            Paragraph b3 = new Paragraph("\n\nĐã xác thực giao dịch trực tuyến\n" + buyerName, fontTableCellBold);



            b3.setAlignment(Element.ALIGN_CENTER);



            buyerSignCell.addElement(b1);



            buyerSignCell.addElement(b2);



            buyerSignCell.addElement(b3);



            signTable.addCell(buyerSignCell);



            // Bên phải: Đơn vị bán hàng (Hộp chữ ký số điện tử)



            PdfPCell sellerSignCell = new PdfPCell();



            sellerSignCell.setBorder(Rectangle.NO_BORDER);



            sellerSignCell.setHorizontalAlignment(Element.ALIGN_CENTER);



            Paragraph s1 = new Paragraph("NGƯỜI BÁN HÀNG (SELLER)", fontSignTitle);



            s1.setAlignment(Element.ALIGN_CENTER);



            Paragraph s2 = new Paragraph("(Ký điện tử bởi Doanh nghiệp)", fontSignSub);



            s2.setAlignment(Element.ALIGN_CENTER);



            // Digital Signature Stamp Box



            PdfPTable sealBox = new PdfPTable(1);



            sealBox.setWidthPercentage(85);



            sealBox.setSpacingBefore(8f);



            PdfPCell sealCell = new PdfPCell();



            sealCell.setBorderColor(SUCCESS_GREEN);



            sealCell.setBorderWidth(1.2f);



            sealCell.setBackgroundColor(new Color(236, 253, 245)); // Emerald 50



            sealCell.setPadding(6);



            sealCell.setHorizontalAlignment(Element.ALIGN_CENTER);



            Paragraph sealP1 = new Paragraph("✔ SIGNED BY: SMARTTRAVEL CORP", fontSignatureSeal);



            sealP1.setAlignment(Element.ALIGN_CENTER);



            Paragraph sealP2 = new Paragraph("Mã số thuế: " + COMPANY_TAX_CODE + "\nThời gian ký: " + issueDateStr, fontTableCellMuted);



            sealP2.setAlignment(Element.ALIGN_CENTER);



            sealCell.addElement(sealP1);



            sealCell.addElement(sealP2);



            sealBox.addCell(sealCell);



            sellerSignCell.addElement(s1);



            sellerSignCell.addElement(s2);



            sellerSignCell.addElement(sealBox);



            signTable.addCell(sellerSignCell);



            document.add(signTable);



            // 7. FOOTER PHÁP LÝ & TRA CỨU HÓA ĐƠN



            document.add(createDividerLine(BORDER_COLOR, 1f, 8f, 6f));



            Paragraph footerPara = new Paragraph();



            footerPara.setAlignment(Element.ALIGN_CENTER);



            footerPara.add(new Chunk("Hóa đơn điện tử được khởi tạo và lưu trữ an toàn theo quy định tại Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.\n", fontFooter));



            footerPara.add(new Chunk("Tra cứu và đối soát tính xác thực của hóa đơn tại: " + COMPANY_WEBSITE + "/tra-cuu-hoa-don với Mã đơn: " + booking.getBookingCode(), fontFooter));



            document.add(footerPara);



            document.close();



            return baos.toByteArray();



        } catch (Exception e) {



            log.error("Lỗi khi kết xuất hóa đơn điện tử PDF cho đơn hàng {}: {}", booking.getBookingCode(), e.getMessage(), e);



            throw new RuntimeException("Không thể tạo file PDF hóa đơn: " + e.getMessage(), e);



        }



    }



    private BaseFont resolveUnicodeBaseFont() {



        // Thứ tự ưu tiên tìm font Unicode hỗ trợ đầy đủ Tiếng Việt



        String[] fontCandidates = {



                "C:/Windows/Fonts/arial.ttf",



                "C:/Windows/Fonts/times.ttf",



                "C:/Windows/Fonts/tahoma.ttf",



                "C:/Windows/Fonts/calibri.ttf",



                "C:/Windows/Fonts/segoeui.ttf",



                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",



                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"



        };



        for (String path : fontCandidates) {



            File fontFile = new File(path);



            if (fontFile.exists() && fontFile.canRead()) {



                try {



                    return BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);



                } catch (Exception e) {



                    log.warn("Không thể tải font từ {}: {}", path, e.getMessage());



                }



            }



        }



        // Fallback khi không tìm thấy font hệ thống



        try {



            return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);



        } catch (Exception e) {



            throw new RuntimeException("Không thể tạo BaseFont mặc định", e);



        }



    }



    private Paragraph createDividerLine(Color color, float thickness, float before, float after) {



        Paragraph p = new Paragraph();



        p.setSpacingBefore(before);



        p.setSpacingAfter(after);



        Chunk c = new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(thickness, 100, color, Element.ALIGN_CENTER, -1));



        p.add(c);



        return p;



    }



    private Phrase createFieldPhrase(String label, String value, Font labelFont, Font valFont) {



        Phrase phrase = new Phrase();



        phrase.add(new Chunk(label, labelFont));



        phrase.add(new Chunk(value != null ? value : "" + "\n", valFont));



        return phrase;



    }



    private void addTableHeader(PdfPTable table, String text, Font font, int alignment) {



        PdfPCell cell = new PdfPCell(new Phrase(text, font));



        cell.setBackgroundColor(BRAND_BLUE);



        cell.setHorizontalAlignment(alignment);



        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);



        cell.setPadding(6f);



        cell.setBorderColor(BORDER_COLOR);



        table.addCell(cell);



    }



    private void addTableRow(PdfPTable table, String text, int alignment, Font font) {



        PdfPCell cell = new PdfPCell(new Phrase(text, font));



        cell.setHorizontalAlignment(alignment);



        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);



        cell.setPadding(5f);



        cell.setBorderColor(BORDER_COLOR);



        table.addCell(cell);



    }



    private DecimalFormat getCurrencyFormatter() {



        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("vi", "VN"));



        symbols.setGroupingSeparator('.');



        return new DecimalFormat("#,###", symbols);



    }



}

