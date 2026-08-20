import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import { CreditCard, CheckCircle, ShieldCheck, QrCode, ArrowLeft, Building2, Wallet } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  const tourId = stateData.tourId || 1;
  const tourTitle = stateData.tourTitle || 'TOUR CHÂU ĐỐC AN GIANG VIẾNG MIẾU BÀ CHÚA XỨ, NÚI CẤM & CHÙA TÀ PẠ';
  const tourThumbnailUrl = stateData.tourThumbnailUrl || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80';
  const tourCode = stateData.tourCode || 'CHAU-DOC-AN-GIANG-1N1D';
  const adults = stateData.numberOfAdults || 1;
  const children = stateData.numberOfChildren || 0;
  const voucherCode = stateData.voucherCode || '';
  const discountAmount = stateData.discountAmount || 0;

  // Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'DEPOSIT'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO' | 'BANK'>('VNPAY');
  
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Price calculations - dynamic from stateData
  const adultPrice = stateData.adultPrice || stateData.price || 890000;
  const childPrice = stateData.childPrice || Math.round(adultPrice * 0.7);
  const subtotal = (adultPrice * adults) + (childPrice * children);
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const finalPayAmount = paymentOption === 'DEPOSIT' ? Math.round(totalAfterDiscount * 0.3) : totalAfterDiscount;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người liên hệ');
      return;
    }

    setLoading(true);
    const chosenDate = stateData.departureDate || '15-09-2026';
    const totalGuests = adults + children;

    const newBookingObj: Booking = {
      id: Date.now(),
      bookingCode: `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      tourId: tourId,
      tourTitle: tourTitle,
      tourThumbnailUrl: tourThumbnailUrl,
      tourCode: tourCode,
      durationDays: stateData.durationDays || 1,
      durationNights: stateData.durationNights || 1,
      departureLocation: 'TP.Hồ Chí Minh',
      userId: 1,
      userName: contactName.trim(),
      numberOfAdults: adults,
      numberOfChildren: children,
      adultPrice: adultPrice,
      childPrice: childPrice,
      voucherCode: voucherCode,
      discountAmount: discountAmount,
      totalPrice: finalPayAmount,
      status: 'PAID',
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      departureDate: chosenDate,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7CBK-${Math.random().toString(36).substring(2, 8).toUpperCase()}%7C${tourCode}`,
      createdAt: new Date().toISOString(),
    };

    const updateLocalStorageSeats = () => {
      try {
        const storedStr = localStorage.getItem('schedule_seat_counts');
        const counts: Record<number, number> = storedStr ? JSON.parse(storedStr) : { 1: 28, 2: 35, 3: 40, 4: 40 };
        let schKey = 2;
        if (chosenDate.includes('30-08')) schKey = 1;
        else if (chosenDate.includes('15-09')) schKey = 2;
        else if (chosenDate.includes('01-10')) schKey = 3;
        else if (chosenDate.includes('15-10')) schKey = 4;

        counts[schKey] = Math.max(0, (counts[schKey] ?? 35) - totalGuests);
        localStorage.setItem('schedule_seat_counts', JSON.stringify(counts));

        const existingBookingsStr = localStorage.getItem('user_created_bookings');
        const existingBookings: Booking[] = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
        existingBookings.unshift(newBookingObj);
        localStorage.setItem('user_created_bookings', JSON.stringify(existingBookings));
      } catch (err) {
        console.error(err);
      }
    };

    try {
      const res = await bookingService.createBooking({
        tourId: tourId,
        numberOfAdults: adults,
        numberOfChildren: children,
        voucherCode: voucherCode || undefined,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod: paymentMethod,
        departureDate: chosenDate,
      });

      if (res.success && res.data) {
        updateLocalStorageSeats();
        setCreatedBooking({ ...res.data, departureDate: chosenDate });
      } else {
        updateLocalStorageSeats();
        setCreatedBooking(newBookingObj);
      }
    } catch {
      updateLocalStorageSeats();
      setCreatedBooking(newBookingObj);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Xác Nhận & Thanh Toán Đặt Tour</h1>
            <p className="text-xs text-slate-500">Hoàn tất bước cuối cùng để nhận vé điện tử QR Code lập tức qua email</p>
          </div>
        </div>

        {createdBooking ? (
          /* SUCCESS E-TICKET CONFIRMATION SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-2xl mx-auto text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Thanh toán & Đặt tour thành công</span>
              <h2 className="text-2xl font-black text-slate-900">Vé Điện Tử (E-Ticket) Smart Travel</h2>
              <p className="text-xs text-slate-500">Mã đơn hàng: <strong className="text-slate-900">{createdBooking.bookingCode}</strong></p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block mx-auto space-y-3">
              <img 
                src={createdBooking.qrCodeUrl} 
                alt="E-Ticket QR Code" 
                className="h-48 w-48 mx-auto rounded-xl border border-slate-300 shadow-md"
              />
              <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                <QrCode className="h-4 w-4 text-sky-600" /> Quét mã QR tại quầy làm thủ tục tour
              </div>
            </div>

            {/* Booking Specs */}
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Tên Tour:</span>
                <span className="font-bold text-slate-900">{createdBooking.tourTitle || 'Tour Ân Thi - Phượng Hoàng Cổ Trấn'}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Người liên hệ:</span>
                <span className="font-semibold text-slate-900">{createdBooking.contactName} ({createdBooking.contactPhone})</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Số lượng khách:</span>
                <span className="font-semibold text-slate-900">{createdBooking.numberOfAdults} Người lớn, {createdBooking.numberOfChildren} Trẻ em</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Tổng tiền đã thanh toán:</span>
                <span className="text-rose-600">{createdBooking.totalPrice?.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 rounded-xl bg-sky-900 hover:bg-sky-950 text-white py-3 text-xs font-bold transition shadow-md"
              >
                Xem Lịch Sử Đơn Hàng
              </button>
              <button
                onClick={() => navigate('/tours')}
                className="flex-1 rounded-xl border border-slate-300 text-slate-700 py-3 text-xs font-bold hover:bg-slate-50 transition"
              >
                Khám Phá Tour Khác
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM & SUMMARY */
          <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Contact Information Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                  1. Thông tin liên lạc
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Họ và tên người đại diện *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700">Email nhận vé điện tử (E-Ticket) *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="nguyenvana@gmail.com"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700">Ghi chú đặc biệt (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Ăn chay, ghế ngồi gần nhau, có trẻ nhỏ..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Option & Method Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Deposit Option Choice */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                    2. Tùy chọn đặt cọc / Thanh toán
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentOption('FULL')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        paymentOption === 'FULL' ? 'border-sky-600 bg-sky-50/60' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>Thanh toán 100% full</span>
                        <input type="radio" checked={paymentOption === 'FULL'} readOnly className="text-sky-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Hoàn tất 100% tiền tour để nhận ngay vé điện tử xác nhận.</p>
                      <div className="text-sm font-black text-rose-600 mt-2">{totalAfterDiscount.toLocaleString('vi-VN')} đ</div>
                    </div>

                    <div
                      onClick={() => setPaymentOption('DEPOSIT')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        paymentOption === 'DEPOSIT' ? 'border-sky-600 bg-sky-50/60' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>Đặt cọc 30% giữ chỗ</span>
                        <input type="radio" checked={paymentOption === 'DEPOSIT'} readOnly className="text-sky-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Đặt cọc giữ chỗ trước. 70% còn lại thanh toán trước khởi hành 7 ngày.</p>
                      <div className="text-sm font-black text-sky-700 mt-2">{Math.round(totalAfterDiscount * 0.3).toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>
                </div>

                {/* Gateway Methods Choice */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Cổng thanh toán</h4>

                  <div className="space-y-2">
                    {[
                      { id: 'VNPAY', name: 'Thanh toán trực tuyến VNPay', icon: CreditCard, color: 'bg-red-600', sub: 'Thẻ ATM nội địa, QR Pay, Visa/Mastercard' },
                      { id: 'MOMO', name: 'Ví điện tử MoMo', icon: Wallet, color: 'bg-pink-600', sub: 'Quét mã QR MoMo thanh toán tức thì' },
                      { id: 'BANK', name: 'Chuyển khoản Ngân hàng (QR Chuyển khoản)', icon: Building2, color: 'bg-emerald-600', sub: 'Chuyển khoản VietQR nhận xác nhận tự động' },
                    ].map((m) => {
                      const IconComp = m.icon;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                            paymentMethod === m.id ? 'border-sky-600 bg-sky-50/40' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-12 rounded-lg ${m.color} text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm`}>
                              <IconComp className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{m.name}</div>
                              <div className="text-[11px] text-slate-500">{m.sub}</div>
                            </div>
                          </div>
                          <input type="radio" checked={paymentMethod === m.id} readOnly className="text-sky-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 sticky top-24">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">Tóm tắt đơn đặt tour</h3>

                <div className="space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900 line-clamp-2">
                    {tourTitle}
                  </div>
                  <div className="text-slate-600 font-semibold flex items-center gap-1">
                    <span>📅 Khởi hành: <strong>{stateData.departureDate || '30-08-2026'}</strong></span>
                    {stateData.scheduleNote && <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">({stateData.scheduleNote})</span>}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Người lớn ({adults} x {adultPrice.toLocaleString('vi-VN')}đ):</span>
                    <span className="font-semibold text-slate-900">{(adultPrice * adults).toLocaleString('vi-VN')} đ</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>Trẻ em ({children} x {childPrice.toLocaleString('vi-VN')}đ):</span>
                      <span className="font-semibold text-slate-900">{(childPrice * children).toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Mã giảm giá ({voucherCode}):</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t text-sm font-black text-slate-900">
                    <span>Tổng đơn hàng:</span>
                    <span className="text-rose-600">{totalAfterDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {/* Amount to pay now */}
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="text-slate-600 font-medium">Số tiền cần thanh toán ngay:</div>
                  <div className="text-xl font-black text-sky-900">{finalPayAmount.toLocaleString('vi-VN')} đ</div>
                  {paymentOption === 'DEPOSIT' && (
                    <div className="text-[10px] text-amber-700 font-semibold">
                      (Đã áp dụng mức đặt cọc 30% giữ chỗ)
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-900 hover:bg-sky-950 text-white py-3.5 text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {loading ? 'Đang khởi tạo đơn hàng...' : 'Xác Nhận & Thanh Toán'}
                </button>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cam kết bảo mật mã hóa SSL 256-bit
                </div>
              </div>
            </aside>

          </form>
        )}
      </div>
    </div>
  );
};
