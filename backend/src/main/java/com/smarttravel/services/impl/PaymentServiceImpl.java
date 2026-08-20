package com.smarttravel.services.impl;

import com.smarttravel.config.VNPayConfig;
import com.smarttravel.dto.request.PaymentRequest;
import com.smarttravel.dto.response.PaymentResponse;
import com.smarttravel.entities.Booking;
import com.smarttravel.entities.Payment;
import com.smarttravel.enums.BookingStatus;
import com.smarttravel.enums.PaymentStatus;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.BookingRepository;
import com.smarttravel.repositories.PaymentRepository;
import com.smarttravel.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final VNPayConfig vnPayConfig;

    @Override
    @Transactional
    public PaymentResponse createVNPayPayment(PaymentRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Bạn không có quyền thanh toán cho đơn hàng này");
        }

        long amountInVND = booking.getTotalPrice().longValue() * 100;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amountInVND));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", booking.getBookingCode());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + booking.getBookingCode());
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
                        .amount(booking.getTotalPrice())
                        .paymentMethod(request.getPaymentMethod())
                        .paymentStatus(PaymentStatus.UNPAID)
                        .build());

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .amount(booking.getTotalPrice())
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

        Booking booking = bookingRepository.findByBookingCode(vnp_TxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", vnp_TxnRef));

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", booking.getId()));

        if ("00".equals(vnp_ResponseCode)) {
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setTransactionId(vnp_TransactionNo);
            payment.setPaymentTime(LocalDateTime.now());

            booking.setStatus(BookingStatus.PAID);
            bookingRepository.save(booking);
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
        }

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
