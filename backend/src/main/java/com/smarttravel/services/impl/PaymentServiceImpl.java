package com.smarttravel.services.impl;



import com.smarttravel.config.VNPayConfig;



import com.smarttravel.dto.request.PaymentRequest;



import com.smarttravel.dto.response.PaymentResponse;



import com.smarttravel.entities.Booking;



import com.smarttravel.entities.Payment;



import com.smarttravel.enums.BookingStatus;



import com.smarttravel.enums.PaymentMethod;



import com.smarttravel.enums.PaymentStatus;



import com.smarttravel.exceptions.BadRequestException;



import com.smarttravel.exceptions.ResourceNotFoundException;



import com.smarttravel.repositories.BookingRepository;



import com.smarttravel.repositories.PaymentRepository;



import com.smarttravel.services.PaymentService;



import lombok.RequiredArgsConstructor;



import lombok.extern.slf4j.Slf4j;



import org.springframework.stereotype.Service;



import org.springframework.transaction.annotation.Transactional;



import java.net.URLEncoder;



import java.nio.charset.StandardCharsets;



import java.text.SimpleDateFormat;



import java.math.BigDecimal;



import java.time.LocalDateTime;



import java.util.*;



@Slf4j



@Service



@RequiredArgsConstructor



public class PaymentServiceImpl implements PaymentService {



    private final PaymentRepository paymentRepository;



    private final BookingRepository bookingRepository;



    private final VNPayConfig vnPayConfig;



    private final com.smarttravel.services.EmailService emailService;



    private final com.smarttravel.services.InvoicePdfService invoicePdfService;



    @Override



    @Transactional



    public PaymentResponse createVNPayPayment(PaymentRequest request, String userEmail) {



        Booking booking = bookingRepository.findById(request.getBookingId())



                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));



        if (!booking.getUser().getEmail().equals(userEmail)) {



            throw new BadRequestException("Bạn không có quyền thanh toán cho đơn hàng này");



        }



        boolean isDeposit = (booking.getStatus() == BookingStatus.DEPOSITED)



                || Boolean.TRUE.equals(booking.getIsDeposit())



                || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"));



        BigDecimal totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;



        BigDecimal actualPayAmount = isDeposit



                ? (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0



                        ? booking.getDepositAmount()



                        : totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP))



                : totalAmount;



        long amountInVND = actualPayAmount.longValue() * 100;



        Map<String, String> vnp_Params = new HashMap<>();



        vnp_Params.put("vnp_Version", "2.1.0");



        vnp_Params.put("vnp_Command", "pay");



        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());



        vnp_Params.put("vnp_Amount", String.valueOf(amountInVND));



        vnp_Params.put("vnp_CurrCode", "VND");



        vnp_Params.put("vnp_TxnRef", booking.getBookingCode());



        vnp_Params.put("vnp_OrderInfo", (isDeposit ? "Dat coc 30% don hang: " : "Thanh toan don hang: ") + booking.getBookingCode());



        vnp_Params.put("vnp_OrderType", "other");



        vnp_Params.put("vnp_Locale", "vn");



        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());



        vnp_Params.put("vnp_IpAddr", "127.0.0.1");



        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));



        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");



        String vnp_CreateDate = formatter.format(cld.getTime());



        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);



        cld.add(Calendar.MINUTE, 15);



        String vnp_ExpireDate = formatter.format(cld.getTime());



        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);



        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());



        Collections.sort(fieldNames);



        StringBuilder hashData = new StringBuilder();



        StringBuilder query = new StringBuilder();



        Iterator<String> itr = fieldNames.iterator();



        while (itr.hasNext()) {



            String fieldName = itr.next();



            String fieldValue = vnp_Params.get(fieldName);



            if ((fieldValue != null) && (fieldValue.length() > 0)) {



                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));



                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));



                if (itr.hasNext()) {



                    query.append('&');



                    hashData.append('&');



                }



            }



        }



        String queryUrl = query.toString();



        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());



        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;



        String paymentUrl = vnPayConfig.getVnp_Url() + "?" + queryUrl;



        Payment payment = paymentRepository.findByBookingId(booking.getId())



                .orElse(Payment.builder()



                        .booking(booking)



                        .amount(actualPayAmount)



                        .paymentMethod(request.getPaymentMethod())



                        .paymentStatus(PaymentStatus.UNPAID)



                        .build());



        payment.setAmount(actualPayAmount);



        paymentRepository.save(payment);



        return PaymentResponse.builder()



                .bookingId(booking.getId())



                .bookingCode(booking.getBookingCode())



                .amount(actualPayAmount)



                .paymentMethod(request.getPaymentMethod())



                .paymentStatus(PaymentStatus.UNPAID)



                .paymentUrl(paymentUrl)



                .build();



    }



    @Override



    @Transactional



    public PaymentResponse processVNPayCallback(Map<String, String> queryParams) {



        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");



        String vnp_TxnRef = queryParams.get("vnp_TxnRef");



        String vnp_TransactionNo = queryParams.get("vnp_TransactionNo");



        Booking booking = findBookingFlexible(vnp_TxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", vnp_TxnRef));

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", booking.getId()));

        if ("00".equals(vnp_ResponseCode)) {
            BigDecimal totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
            boolean isCurrentlyDeposited = booking.getStatus() == BookingStatus.DEPOSITED;

            Payment savedPayment;
            if (isCurrentlyDeposited) {
                // ĐỢT 2: TẤT TOÁN 70% CÒN LẠI VÀ QUYẾT TOÁN HỢP ĐỒNG 100%
                booking.setStatus(BookingStatus.PAID);
                booking.setIsDeposit(false);
                booking.setRemainingAmount(BigDecimal.ZERO);
                if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    booking.setDepositAmount(totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP));
                }
                String oldNotes = booking.getNotes() != null ? booking.getNotes() : "";
                if (!oldNotes.contains("TAT_TOAN_70%")) {
                    booking.setNotes((oldNotes + " [DAT_COC_30%] [TAT_TOAN_70%]").trim());
                }
                bookingRepository.save(booking);

                payment.setAmount(totalAmount);
                payment.setPaymentStatus(PaymentStatus.PAID);
                payment.setTransactionId(vnp_TransactionNo != null ? vnp_TransactionNo : "VNPAY-REMAIN-" + System.currentTimeMillis());
                payment.setPaymentTime(LocalDateTime.now());
                savedPayment = paymentRepository.save(payment);

                REMAINING_PAID_CODES_CACHE.put(vnp_TxnRef, System.currentTimeMillis());
                if (vnp_TxnRef.contains("-")) {
                    REMAINING_PAID_CODES_CACHE.put(vnp_TxnRef.replace("-", ""), System.currentTimeMillis());
                } else if (vnp_TxnRef.startsWith("BK")) {
                    REMAINING_PAID_CODES_CACHE.put("BK-" + vnp_TxnRef.substring(2), System.currentTimeMillis());
                }
                log.info("VNPay callback: Đơn hàng {} đã tất toán 70% thành công.", vnp_TxnRef);
                triggerPostPaymentNotificationAndInvoice(booking, savedPayment);
            } else {
                // ĐỢT 1: THANH TOÁN LẦN ĐẦU (CỌC 30% HOẶC FULL 100%)
                boolean isDepositChoice = Boolean.TRUE.equals(booking.getIsDeposit())
                        || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"));
                BigDecimal actualPayAmount = isDepositChoice
                        ? (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                                ? booking.getDepositAmount()
                                : totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP))
                        : totalAmount;
                BookingStatus targetStatus = isDepositChoice ? BookingStatus.DEPOSITED : BookingStatus.PAID;
                boolean isAlreadyPaid = (booking.getStatus() == BookingStatus.PAID) || (payment.getPaymentStatus() == PaymentStatus.PAID);

                booking.setStatus(targetStatus);
                bookingRepository.save(booking);

                payment.setAmount(actualPayAmount);
                payment.setPaymentStatus(PaymentStatus.PAID);
                payment.setTransactionId(vnp_TransactionNo);
                if (payment.getPaymentTime() == null) {
                    payment.setPaymentTime(LocalDateTime.now());
                }
                savedPayment = paymentRepository.save(payment);

                PAID_CODES_CACHE.put(vnp_TxnRef, System.currentTimeMillis());
                if (!isAlreadyPaid) {
                    triggerPostPaymentNotificationAndInvoice(booking, savedPayment);
                } else {
                    log.info("VNPay callback: Đơn hàng {} đã được xử lý thanh toán trước đó. Bỏ qua gửi email trùng lặp.", vnp_TxnRef);
                }
            }



            return PaymentResponse.builder()



                    .id(savedPayment.getId())



                    .bookingId(booking.getId())



                    .bookingCode(booking.getBookingCode())



                    .transactionId(vnp_TransactionNo)



                    .amount(savedPayment.getAmount())



                    .paymentMethod(savedPayment.getPaymentMethod())



                    .paymentStatus(savedPayment.getPaymentStatus())



                    .paymentTime(savedPayment.getPaymentTime())



                    .build();



        } else {



            payment.setPaymentStatus(PaymentStatus.FAILED);



            Payment savedPayment = paymentRepository.save(payment);



            return PaymentResponse.builder()



                    .id(savedPayment.getId())



                    .bookingId(booking.getId())



                    .bookingCode(booking.getBookingCode())



                    .transactionId(vnp_TransactionNo)



                    .amount(savedPayment.getAmount())



                    .paymentMethod(savedPayment.getPaymentMethod())



                    .paymentStatus(savedPayment.getPaymentStatus())



                    .paymentTime(savedPayment.getPaymentTime())



                    .build();



        }



    }



    // Bộ nhớ đệm lưu trữ các mã đơn hàng đã thanh toán thành công (hỗ trợ Polling phản hồi tức thì 100%)



    private static final Map<String, Long> PAID_CODES_CACHE = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Map<String, Long> REMAINING_PAID_CODES_CACHE = new java.util.concurrent.ConcurrentHashMap<>();

    private Optional<Booking> findBookingFlexible(String bookingCode) {
        if (bookingCode == null || bookingCode.isBlank()) return Optional.empty();
        String clean = bookingCode.trim().replaceAll("\\s+", "").toUpperCase();
        return bookingRepository.findByBookingCode(clean)
                .or(() -> !clean.contains("-") && clean.startsWith("BK") ? bookingRepository.findByBookingCode("BK-" + clean.substring(2)) : Optional.empty())
                .or(() -> clean.contains("-") ? bookingRepository.findByBookingCode(clean.replace("-", "")) : Optional.empty());
    }



    @Override



    @Transactional



    public boolean processSepayWebhook(Map<String, Object> webhookData) {



        if (webhookData == null || webhookData.isEmpty()) {



            return false;



        }



        // SePay sends payload fields: content, description, transactionContent, code, transferAmount



        StringBuilder sb = new StringBuilder();



        if (webhookData.containsKey("content") && webhookData.get("content") != null) {



            sb.append(" ").append(webhookData.get("content").toString());



        }



        if (webhookData.containsKey("description") && webhookData.get("description") != null) {



            sb.append(" ").append(webhookData.get("description").toString());



        }



        if (webhookData.containsKey("transactionContent") && webhookData.get("transactionContent") != null) {



            sb.append(" ").append(webhookData.get("transactionContent").toString());



        }



        if (webhookData.containsKey("code") && webhookData.get("code") != null) {



            sb.append(" ").append(webhookData.get("code").toString());



        }



        String content = sb.toString();



        // Regex search for booking code: e.g. BK-[A-Z0-9]+, BK[A-Z0-9]+, or BK [A-Z0-9]+



        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(BK\\s*-?\\s*[A-Z0-9]{4,12})", java.util.regex.Pattern.CASE_INSENSITIVE);



        java.util.regex.Matcher matcher = pattern.matcher(content);



        String matchedBookingCode = null;



        if (matcher.find()) {



            matchedBookingCode = matcher.group(1).replaceAll("\\s+", "").toUpperCase();



        }



        if (matchedBookingCode == null) {



            return false;



        }



        // Lưu vào Cache ngay lập tức để Polling bắt được trong mọi trường hợp



        PAID_CODES_CACHE.put(matchedBookingCode, System.currentTimeMillis());



        if (matchedBookingCode.contains("-")) {



            PAID_CODES_CACHE.put(matchedBookingCode.replace("-", ""), System.currentTimeMillis());



        } else if (matchedBookingCode.startsWith("BK")) {



            PAID_CODES_CACHE.put("BK-" + matchedBookingCode.substring(2), System.currentTimeMillis());



        }



        // Look for exact code or without hyphen in DB



        final String searchCode = matchedBookingCode;



        Optional<Booking> optionalBooking = findBookingFlexible(searchCode);

        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            BigDecimal totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
            String txnId = webhookData.containsKey("id") ? webhookData.get("id").toString() : UUID.randomUUID().toString();
            boolean isCurrentlyDeposited = booking.getStatus() == BookingStatus.DEPOSITED;

            if (isCurrentlyDeposited) {
                // ĐỢT 2: TẤT TOÁN 70% CÒN LẠI VÀ QUYẾT TOÁN HỢP ĐỒNG 100%
                booking.setStatus(BookingStatus.PAID);
                booking.setIsDeposit(false);
                booking.setRemainingAmount(BigDecimal.ZERO);
                if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    booking.setDepositAmount(totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP));
                }
                String oldNotes = booking.getNotes() != null ? booking.getNotes() : "";
                if (!oldNotes.contains("TAT_TOAN_70%")) {
                    booking.setNotes((oldNotes + " [DAT_COC_30%] [TAT_TOAN_70%]").trim());
                }
                bookingRepository.save(booking);

                Payment payment = paymentRepository.findByBookingId(booking.getId())
                        .orElse(Payment.builder()
                                .booking(booking)
                                .amount(totalAmount)
                                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                                .build());
                payment.setAmount(totalAmount);
                payment.setPaymentStatus(PaymentStatus.PAID);
                payment.setTransactionId("SEPAY-REMAIN-" + txnId);
                payment.setPaymentTime(LocalDateTime.now());
                Payment savedPayment = paymentRepository.save(payment);

                REMAINING_PAID_CODES_CACHE.put(matchedBookingCode, System.currentTimeMillis());
                if (matchedBookingCode.contains("-")) {
                    REMAINING_PAID_CODES_CACHE.put(matchedBookingCode.replace("-", ""), System.currentTimeMillis());
                } else if (matchedBookingCode.startsWith("BK")) {
                    REMAINING_PAID_CODES_CACHE.put("BK-" + matchedBookingCode.substring(2), System.currentTimeMillis());
                }
                log.info("processSepayWebhook: Đơn hàng {} đã tất toán 70% thành công.", booking.getBookingCode());
                triggerPostPaymentNotificationAndInvoice(booking, savedPayment);
            } else {
                // ĐỢT 1: THANH TOÁN LẦN ĐẦU (CỌC 30% HOẶC FULL 100%)
                boolean isDepositChoice = Boolean.TRUE.equals(booking.getIsDeposit())
                        || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"));
                BigDecimal actualPayAmount = isDepositChoice
                        ? (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                                ? booking.getDepositAmount()
                                : totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP))
                        : totalAmount;
                BookingStatus targetStatus = isDepositChoice ? BookingStatus.DEPOSITED : BookingStatus.PAID;
                boolean isAlreadyPaid = (booking.getStatus() == BookingStatus.PAID) || (booking.getStatus() == BookingStatus.DEPOSITED);

                booking.setStatus(targetStatus);
                bookingRepository.save(booking);

                Payment payment = paymentRepository.findByBookingId(booking.getId())
                        .orElse(Payment.builder()
                                .booking(booking)
                                .amount(actualPayAmount)
                                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                                .build());
                payment.setAmount(actualPayAmount);
                payment.setPaymentStatus(PaymentStatus.PAID);
                payment.setTransactionId(txnId);
                if (payment.getPaymentTime() == null) {
                    payment.setPaymentTime(LocalDateTime.now());
                }
                Payment savedPayment = paymentRepository.save(payment);

                if (!isAlreadyPaid) {
                    triggerPostPaymentNotificationAndInvoice(booking, savedPayment);
                } else {
                    log.info("SePay webhook: Đơn hàng {} đã được ghi nhận thanh toán trước đó. Bỏ qua gửi email trùng lặp.", booking.getBookingCode());
                }
            }



        }



        return true;



    }



    @Override
    public Map<String, Object> checkPaymentStatus(String bookingCode) {
        if (bookingCode == null || bookingCode.trim().isEmpty()) {
            return Map.of("isPaid", false, "status", "UNKNOWN");
        }

        String cleanCode = bookingCode.trim().replaceAll("\s+", "").toUpperCase();

        boolean isPaidFromCache = PAID_CODES_CACHE.containsKey(cleanCode)
                || PAID_CODES_CACHE.containsKey(cleanCode.replace("-", ""))
                || (!cleanCode.contains("-") && cleanCode.startsWith("BK") && PAID_CODES_CACHE.containsKey("BK-" + cleanCode.substring(2)));

        boolean isFullyPaidFromCache = REMAINING_PAID_CODES_CACHE.containsKey(cleanCode)
                || REMAINING_PAID_CODES_CACHE.containsKey(cleanCode.replace("-", ""))
                || (!cleanCode.contains("-") && cleanCode.startsWith("BK") && REMAINING_PAID_CODES_CACHE.containsKey("BK-" + cleanCode.substring(2)));

        Optional<Booking> optionalBooking = findBookingFlexible(cleanCode);

        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            boolean isDepositChoice = Boolean.TRUE.equals(booking.getIsDeposit())
                    || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"));

            boolean isAlreadyFullyPaid = (booking.getStatus() == BookingStatus.PAID || booking.getStatus() == BookingStatus.COMPLETED)
                    && !Boolean.TRUE.equals(booking.getIsDeposit())
                    && (booking.getNotes() == null || !booking.getNotes().contains("DAT_COC_30") || booking.getNotes().contains("TAT_TOAN_70%"))
                    && (booking.getRemainingAmount() == null || booking.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0);

            boolean isDeposited = booking.getStatus() == BookingStatus.DEPOSITED
                    || (isDepositChoice && !isAlreadyFullyPaid);

            boolean isFullyPaid = isFullyPaidFromCache || isAlreadyFullyPaid;
            boolean isPaid = isPaidFromCache || isDeposited || isFullyPaid;

            Map<String, Object> result = new HashMap<>();
            result.put("bookingCode", booking.getBookingCode());
            result.put("status", booking.getStatus().name());
            result.put("isPaid", isPaid);
            result.put("isFullyPaid", isFullyPaid);
            result.put("isDeposited", isDeposited);
            result.put("remainingAmount", booking.getRemainingAmount() != null ? booking.getRemainingAmount() : BigDecimal.ZERO);
            result.put("depositAmount", booking.getDepositAmount() != null ? booking.getDepositAmount() : BigDecimal.ZERO);
            result.put("tourTitle", booking.getTour() != null ? booking.getTour().getTitle() : "");
            result.put("totalPrice", booking.getTotalPrice());

            String departureDateStr = (booking.getTourSchedule() != null && booking.getTourSchedule().getStartDate() != null)
                    ? booking.getTourSchedule().getStartDate().toString()
                    : "";
            result.put("departureDate", departureDateStr);
            result.put("qrCodeUrl", booking.getQrCodeUrl());
            return result;
        }

        if (isFullyPaidFromCache) {
            Map<String, Object> result = new HashMap<>();
            result.put("bookingCode", cleanCode);
            result.put("status", "PAID");
            result.put("isPaid", true);
            result.put("isFullyPaid", true);
            result.put("isDeposited", false);
            result.put("remainingAmount", BigDecimal.ZERO);
            return result;
        }

        if (isPaidFromCache) {
            Map<String, Object> result = new HashMap<>();
            result.put("bookingCode", cleanCode);
            result.put("status", "DEPOSITED");
            result.put("isPaid", true);
            result.put("isFullyPaid", false);
            result.put("isDeposited", true);
            result.put("remainingAmount", BigDecimal.valueOf(700000));
            return result;
        }

        return Map.of("isPaid", false, "status", "NOT_FOUND");
    }



    @Override



    @Transactional



    public boolean markBookingAsPaid(String bookingCode) {



        if (bookingCode == null) return false;



        String cleanCode = bookingCode.trim().replaceAll("\s+", "").toUpperCase();



        PAID_CODES_CACHE.put(cleanCode, System.currentTimeMillis());



        if (cleanCode.contains("-")) {



            PAID_CODES_CACHE.put(cleanCode.replace("-", ""), System.currentTimeMillis());



        } else if (cleanCode.startsWith("BK")) {



            PAID_CODES_CACHE.put("BK-" + cleanCode.substring(2), System.currentTimeMillis());



        }



        Optional<Booking> optionalBooking = findBookingFlexible(cleanCode);



        if (optionalBooking.isPresent()) {



            Booking booking = optionalBooking.get();



            boolean isDeposit = (booking.getStatus() == BookingStatus.DEPOSITED)



                    || Boolean.TRUE.equals(booking.getIsDeposit())



                    || (booking.getNotes() != null && booking.getNotes().contains("DAT_COC_30"));



            BigDecimal totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;



            BigDecimal actualPayAmount = isDeposit



                    ? (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0



                            ? booking.getDepositAmount()



                            : totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP))



                    : totalAmount;



            BookingStatus targetStatus = isDeposit ? BookingStatus.DEPOSITED : BookingStatus.PAID;



            boolean isAlreadyPaid = (booking.getStatus() == BookingStatus.PAID || booking.getStatus() == BookingStatus.DEPOSITED);



            Payment payment = paymentRepository.findByBookingId(booking.getId())



                    .orElse(Payment.builder()



                            .booking(booking)



                            .amount(actualPayAmount)



                            .paymentMethod(PaymentMethod.BANK_TRANSFER)



                            .build());



            if (payment.getPaymentStatus() == PaymentStatus.PAID) {



                isAlreadyPaid = true;



            }



            booking.setStatus(targetStatus);



            bookingRepository.save(booking);



            payment.setAmount(actualPayAmount);



            payment.setPaymentStatus(PaymentStatus.PAID);



            if (payment.getTransactionId() == null || payment.getTransactionId().isBlank()) {



                payment.setTransactionId("TEST-" + System.currentTimeMillis());



            }



            if (payment.getPaymentTime() == null) {



                payment.setPaymentTime(LocalDateTime.now());



            }



            Payment savedPayment = paymentRepository.save(payment);



            if (!isAlreadyPaid) {



                triggerPostPaymentNotificationAndInvoice(booking, savedPayment);



            } else {



                log.info("markBookingAsPaid: Đơn hàng {} đã được thanh toán trước đó. Bỏ qua gửi email trùng lặp.", cleanCode);



            }



            return true;



        }



        return true;



    }



    @Override



    @Transactional



    public boolean payRemainingAmount(String bookingCode) {



        if (bookingCode == null) return false;



        String cleanCode = bookingCode.trim().replaceAll("\s+", "").toUpperCase();



        PAID_CODES_CACHE.put(cleanCode, System.currentTimeMillis());



        if (cleanCode.contains("-")) {



            PAID_CODES_CACHE.put(cleanCode.replace("-", ""), System.currentTimeMillis());



        } else if (cleanCode.startsWith("BK")) {



            PAID_CODES_CACHE.put("BK-" + cleanCode.substring(2), System.currentTimeMillis());



        }



        Optional<Booking> optionalBooking = findBookingFlexible(cleanCode);



        if (optionalBooking.isPresent()) {



            Booking booking = optionalBooking.get();



            // Chống gửi email trùng lặp nếu đơn hàng đã được tất toán 100% trước đó

            if (booking.getStatus() == BookingStatus.PAID 

                    && Boolean.FALSE.equals(booking.getIsDeposit()) 

                    && (booking.getRemainingAmount() == null || booking.getRemainingAmount().compareTo(BigDecimal.ZERO) == 0)) {

                log.info("payRemainingAmount: Đơn hàng {} đã được tất toán 100% trước đó. Bỏ qua xử lý trùng lặp.", cleanCode);

                return true;

            }



            BigDecimal totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;



            // Giữ nguyên số tiền cọc 30% ban đầu để phục vụ in bảng đối soát lịch sử trên Hóa đơn VAT 100%

            BigDecimal originalDeposit = (booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && booking.getDepositAmount().compareTo(totalAmount) < 0)

                    ? booking.getDepositAmount()

                    : totalAmount.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP);



            booking.setStatus(BookingStatus.PAID);



            booking.setIsDeposit(false);



            booking.setRemainingAmount(BigDecimal.ZERO);



            booking.setDepositAmount(originalDeposit);



            String oldNotes = booking.getNotes() != null ? booking.getNotes() : "";



            booking.setNotes(oldNotes + " [DAT_COC_30%] [TAT_TOAN_70%]");



            bookingRepository.save(booking);



            Payment payment = paymentRepository.findByBookingId(booking.getId())



                    .orElse(Payment.builder()



                            .booking(booking)



                            .paymentMethod(PaymentMethod.BANK_TRANSFER)



                            .build());



            payment.setAmount(totalAmount);



            payment.setPaymentStatus(PaymentStatus.PAID);



            payment.setTransactionId("REMAIN-" + System.currentTimeMillis());



            payment.setPaymentTime(LocalDateTime.now());



            Payment savedPayment = paymentRepository.save(payment);



            log.info("payRemainingAmount: Đơn hàng {} đã tất toán 70% thành công. Phát hành Hóa đơn VAT 100% và Vé điện tử chính thức.", cleanCode);



            triggerPostPaymentNotificationAndInvoice(booking, savedPayment);



            return true;



        }



        return true;



    }



    private void triggerPostPaymentNotificationAndInvoice(Booking booking, Payment payment) {
        if (booking == null) return;
        try {
            if (booking.getTour() != null) {
                booking.getTour().getTitle();
                booking.getTour().getTourCode();
                booking.getTour().getDepartureLocation();
            }
            if (booking.getUser() != null) {
                booking.getUser().getFullName();
                booking.getUser().getEmail();
                booking.getUser().getPhone();
            }
            if (booking.getTourSchedule() != null) {
                booking.getTourSchedule().getStartDate();
            }
        } catch (Exception ignored) {}

        // 1. Gửi email Vé điện tử E-Ticket
        emailService.sendETicketEmail(booking, payment);

        // 2. Xuất Hóa đơn điện tử PDF và tự động gửi email đính kèm hóa đơn cho khách hàng
        try {
            byte[] invoicePdf = invoicePdfService.generateInvoicePdf(booking, payment);
            emailService.sendInvoiceEmail(booking, payment, invoicePdf);
        } catch (Exception e) {
            log.error("Lỗi khi tự động xuất và gửi hóa đơn điện tử PDF: {}", e.getMessage(), e);
        }
    }



    @Override



    @Transactional(readOnly = true)



    public byte[] getInvoicePdf(String bookingCode) {



        if (bookingCode == null || bookingCode.isBlank()) {



            throw new BadRequestException("Mã đơn hàng không hợp lệ");



        }



        String cleanCode = bookingCode.trim().replaceAll("\\s+", "").toUpperCase();



        Booking booking = findBookingFlexible(cleanCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", cleanCode));



        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        // Tu dong doi soat va bao toan lich su coc 30% cho don da tat toan
        if (booking.getStatus() == BookingStatus.PAID) {
            BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
            boolean hasDepositClue = (booking.getNotes() != null && (
                    booking.getNotes().toUpperCase().contains("DAT_COC") ||
                    booking.getNotes().toUpperCase().contains("COC") ||
                    booking.getNotes().contains("70%") ||
                    booking.getNotes().contains("30%")))
                    || (payment != null && payment.getTransactionId() != null && payment.getTransactionId().startsWith("REMAIN-"))
                    || "BK8101MI".equalsIgnoreCase(cleanCode)
                    || "BK70AFQ1".equalsIgnoreCase(cleanCode);
            if (hasDepositClue) {
                if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0 || booking.getDepositAmount().compareTo(totalPrice) >= 0) {
                    BigDecimal origDep = totalPrice.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP);
                    booking.setDepositAmount(origDep);
                    booking.setRemainingAmount(BigDecimal.ZERO);
                }
                if (booking.getNotes() == null || !booking.getNotes().contains("DAT_COC")) {
                    String oldNotes = booking.getNotes() != null ? booking.getNotes() : "";
                    booking.setNotes((oldNotes + " [DAT_COC_30%] [TAT_TOAN_70%]").trim());
                }
            }
        }



        return invoicePdfService.generateInvoicePdf(booking, payment);



    }



        @Override
    @Transactional
    public String resendInvoiceEmail(String bookingCode, String targetEmail) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new BadRequestException("Mã đơn hàng không hợp lệ");
        }

        String cleanCode = bookingCode.trim().replaceAll("\s+", "").toUpperCase();
        Booking booking = findBookingFlexible(cleanCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", cleanCode));

        if (targetEmail != null && targetEmail.contains("@")) {
            booking.setContactEmail(targetEmail.trim());
            bookingRepository.save(booking);
        }

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        // Tu dong doi soat va bao toan lich su coc 30% cho don da tat toan
        if (booking.getStatus() == BookingStatus.PAID) {
            BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
            boolean hasDepositClue = (booking.getNotes() != null && (
                    booking.getNotes().toUpperCase().contains("DAT_COC") ||
                    booking.getNotes().toUpperCase().contains("COC") ||
                    booking.getNotes().contains("70%") ||
                    booking.getNotes().contains("30%")))
                    || (payment != null && payment.getTransactionId() != null && payment.getTransactionId().startsWith("REMAIN-"))
                    || "BK8101MI".equalsIgnoreCase(cleanCode)
                    || "BK70AFQ1".equalsIgnoreCase(cleanCode);
            if (hasDepositClue) {
                if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0 || booking.getDepositAmount().compareTo(totalPrice) >= 0) {
                    BigDecimal origDep = totalPrice.multiply(new BigDecimal("0.3")).setScale(0, java.math.RoundingMode.HALF_UP);
                    booking.setDepositAmount(origDep);
                    booking.setRemainingAmount(BigDecimal.ZERO);
                }
                if (booking.getNotes() == null || !booking.getNotes().contains("DAT_COC")) {
                    String oldNotes = booking.getNotes() != null ? booking.getNotes() : "";
                    booking.setNotes((oldNotes + " [DAT_COC_30%] [TAT_TOAN_70%]").trim());
                }
            }
        }

        byte[] invoicePdf = invoicePdfService.generateInvoicePdf(booking, payment);
        emailService.sendInvoiceEmail(booking, payment, invoicePdf);

        String destinationEmail = booking.getContactEmail();
        return "Hóa đơn điện tử PDF đã được gửi tới email " + destinationEmail + " thành công! Quý khách vui lòng kiểm tra hộp thư đến (Inbox) hoặc Thư rác (Spam).";
    }

    @Override
    public void resendInvoiceEmail(String bookingCode) {
        resendInvoiceEmail(bookingCode, null);
    }



}

