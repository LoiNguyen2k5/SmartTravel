package com.smarttravel.services;

import com.smarttravel.dto.request.BookingCreateRequest;
import com.smarttravel.dto.response.BookingResponse;

import java.math.BigDecimal;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingCreateRequest request, String userEmail);
    List<BookingResponse> getMyBookings(String userEmail);
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(Long id, String userEmail);
    BookingResponse cancelBooking(Long id, String userEmail);
    BookingResponse updateBookingStatus(Long id, com.smarttravel.enums.BookingStatus status);
    BigDecimal validateAndCalculateVoucher(String voucherCode, BigDecimal originalTotal);
    String resendETicket(String bookingCode, String targetEmail);
    /** Xóa đơn đặt tour (kèm payment) để reset doanh thu. vendorEmail = null → toàn sàn. Trả về số đơn đã xóa. */
    int resetBookings(String vendorEmail);
    default void resendETicket(String bookingCode) {
        resendETicket(bookingCode, null);
    }
}
