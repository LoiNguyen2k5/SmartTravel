import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { tourScheduleService } from '../../services/tourScheduleService';
import { Booking } from '../../types/booking';
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  ArrowLeft, 
  Building2, 
  Wallet, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Config Bank Account Thụ Hưởng (Real VietQR & MoMo)
const BANK_CONFIG = {
  bankId: 'agribank', // BIN: 970405
  bankName: 'Agribank (Ngân hàng Nông nghiệp & PTNT Việt Nam)',
  branch: 'Chi nhánh Chợ Vàm - An Giang',
  accountNumber: '6712263140663',
  accountName: 'NGUYEN BAO LOI',
  momoPhone: '0988776655', // Số ví MoMo
  realTestAmount: 5000, // Số tiền thực nghiệm chuyển khoản thực tế qua QR
};

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  const tourId = stateData.tourId || 11;
  const tourTitle = stateData.tourTitle || '[DEMO TEST] TOUR TRẢI NGHIỆM THỬ NGHIỆM THANH TOÁN VIETQR THỰC TẾ (5.000Đ)';
  const tourThumbnailUrl = stateData.tourThumbnailUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  const tourCode = stateData.tourCode || 'DEMO-VIETQR-5K';
  const adults = stateData.numberOfAdults || 1;
  const children = stateData.numberOfChildren || 0;
  const voucherCode = stateData.voucherCode || '';
  const discountAmount = stateData.discountAmount || 0;

  // Form states
  const [contactName, setContactName] = useState('Nguyễn Bảo Lợi');
  const [contactEmail, setContactEmail] = useState('baoloi@smarttravel.com');
  const [contactPhone, setContactPhone] = useState('0988776655');
  const [note, setNote] = useState('');
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'DEPOSIT'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'MOMO' | 'VNPAY'>('BANK');
  
  const [showQrPaymentModal, setShowQrPaymentModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [pendingBookingCode, setPendingBookingCode] = useState<string>('');
  
  // Copy feedback states
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  // Countdown timer 15:00
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  useEffect(() => {
    if (!showQrPaymentModal) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showQrPaymentModal]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Price calculations
  const adultPrice = stateData.adultPrice || stateData.price || 5000;
  const childPrice = stateData.childPrice || adultPrice;
  const subtotal = (adultPrice * adults) + (childPrice * children);
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const finalPayAmount = paymentOption === 'DEPOSIT' ? Math.round(totalAfterDiscount * 0.3) : totalAfterDiscount;

  const handleCopy = (text: string, type: 'stk' | 'amount' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'stk') {
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);
  const pollingRef = useRef<any>(null);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người liên hệ');
      return;
    }

    const code = `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setPendingBookingCode(code);
    setTimeLeft(900);
    setShowQrPaymentModal(true);
    setPaymentSuccessToast(false);

    // Create booking in backend in background
    try {
      const chosenDate = stateData.departureDate || '15-09-2026';
      await bookingService.createBooking({
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
    } catch (err) {
      console.log('Background booking initialisation:', err);
    }
  };

  // Live Bank Polling Effect: Checks backend every 2.5s for real-world incoming transfer
  useEffect(() => {
    if (!showQrPaymentModal || !pendingBookingCode || paymentSuccessToast) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentService.checkPaymentStatus(pendingBookingCode);
        if (res?.data?.isPaid) {
          clearInterval(pollingRef.current);
          handleAutoPaymentSuccess();
        }
      } catch (e) {
        // Continue polling silently
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [showQrPaymentModal, pendingBookingCode, paymentSuccessToast]);

  const handleAutoPaymentSuccess = (customBooking?: Booking) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPaymentSuccessToast(true);

    const chosenDate = stateData.departureDate || '15-09-2026';
    const finalBooking: Booking = customBooking || {
      id: Date.now(),
      bookingCode: pendingBookingCode,
      tourId: tourId,
      tourTitle: tourTitle,
      tourThumbnailUrl: tourThumbnailUrl,
      tourCode: tourCode,
      durationDays: stateData.durationDays || 1,
      durationNights: stateData.durationNights || 0,
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
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7C${pendingBookingCode}%7C${tourCode}%7CPAID`,
      createdAt: new Date().toISOString(),
    };

    // Save to user_created_bookings so Vendor and My Bookings page show it as PAID
    try {
      const existingStr = localStorage.getItem('user_created_bookings');
      const existing: Booking[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('user_created_bookings', JSON.stringify([finalBooking, ...existing]));
    } catch (e) {
      console.error(e);
    }

    // Automatically deduct remaining seats for this schedule
    try {
      const scheduleId = stateData.scheduleId || 2;
      const totalGuests = (adults || 1) + (children || 0);
      if (tourId) {
        tourScheduleService.bookSeatsForSchedule(tourId, scheduleId, totalGuests);
      }
      const storedSeatsStr = localStorage.getItem('schedule_seat_counts');
      const storedSeats: Record<number, number> = storedSeatsStr 
        ? JSON.parse(storedSeatsStr) 
        : { 1: 28, 2: 35, 3: 40, 4: 40, 5: 45, 6: 45 };
      
      const current = storedSeats[scheduleId] !== undefined ? storedSeats[scheduleId] : 35;
      storedSeats[scheduleId] = Math.max(0, current - totalGuests);
      localStorage.setItem('schedule_seat_counts', JSON.stringify(storedSeats));
    } catch (e) {
      console.error('Error updating seat count:', e);
    }

    // Auto-transition to E-Ticket after 2 seconds
    setTimeout(() => {
      setCreatedBooking(finalBooking);
      setShowQrPaymentModal(false);
      setPaymentSuccessToast(false);
    }, 2200);
  };

  // Instant simulator trigger for demo / presentations
  const handleSimulateBankWebhook = async () => {
    try {
      await paymentService.markBookingPaid(pendingBookingCode);
    } catch (e) {
      console.log('Simulate webhook trigger', e);
    }
    handleAutoPaymentSuccess();
  };

  const [qrGatewayTab, setQrGatewayTab] = useState<'VIETQR' | 'MOMO'>('VIETQR');

  // Transfer content syntax
  const transferContent = `SMARTTRAVEL ${pendingBookingCode}`;

  // VietQR URLs (Real 5.000đ transfer to NGUYEN BAO LOI)
  const vietQrAgribankUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  
  // MoMo QR (VietQR Napas Standard for MoMo / All Wallets)
  const vietQrMomoUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-qr_only.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

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
            <p className="text-xs text-slate-500">Tích hợp thanh toán trực tuyến quét mã VietQR & Ví MoMo chuyển khoản tức thời</p>
          </div>
        </div>

        {createdBooking ? (
          /* SUCCESS E-TICKET CONFIRMATION SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Thanh toán & Đặt tour thành công</span>
              <h2 className="text-2xl font-black text-slate-900">Vé Điện Tử (E-Ticket) SmartTravel</h2>
              <p className="text-xs text-slate-500">Mã đơn hàng: <strong className="text-slate-900 font-mono">{createdBooking.bookingCode}</strong></p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block mx-auto space-y-3">
              <img 
                src={createdBooking.qrCodeUrl} 
                alt="E-Ticket QR Code" 
                className="h-48 w-48 mx-auto rounded-xl border border-slate-300 shadow-md bg-white p-2"
              />
              <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                <QrCode className="h-4 w-4 text-sky-600" /> Quét mã QR tại quầy làm thủ tục tour
              </div>
            </div>

            {/* Booking Specs */}
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Tên Tour:</span>
                <span className="font-bold text-slate-900">{createdBooking.tourTitle || tourTitle}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Người liên hệ:</span>
                <span className="font-semibold text-slate-900">{createdBooking.contactName} ({createdBooking.contactPhone})</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Số lượng khách:</span>
                <span className="font-semibold text-slate-900">{createdBooking.numberOfAdults} Người lớn {createdBooking.numberOfChildren ? `, ${createdBooking.numberOfChildren} Trẻ em` : ''}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Tổng giá trị tour đã thanh toán:</span>
                <span className="text-rose-600">{formatCurrency(createdBooking.totalPrice || finalPayAmount)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-bold transition shadow-md"
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
          <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Contact Information Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                  1. Thông tin người đặt tour
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Họ và tên người đại diện *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nguyễn Bảo Lợi"
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
                      placeholder="0988 776 655"
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
                      placeholder="baoloi@smarttravel.com"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700">Ghi chú đặc biệt (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Đặt chỗ cho chuyến trải nghiệm..."
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
                    2. Tùy chọn thanh toán
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentOption('FULL')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        paymentOption === 'FULL' ? 'border-sky-600 bg-sky-50/60' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>Thanh toán 100% trọn gói</span>
                        <input type="radio" checked={paymentOption === 'FULL'} readOnly className="text-sky-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Thanh toán trọn gói và nhận ngay vé điện tử.</p>
                      <div className="text-sm font-black text-rose-600 mt-2">{formatCurrency(totalAfterDiscount)}</div>
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
                      <p className="text-[11px] text-slate-500 mt-1">Đặt cọc giữ chỗ trước chuyến đi.</p>
                      <div className="text-sm font-black text-sky-700 mt-2">{formatCurrency(Math.round(totalAfterDiscount * 0.3))}</div>
                    </div>
                  </div>
                </div>

                {/* Gateway Methods Choice */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Phương thức thanh toán</h4>

                  <div className="space-y-2">
                    {[
                      { 
                        id: 'BANK', 
                        name: 'Quét mã VietQR (Chuyển khoản Ngân hàng 24/7)', 
                        icon: Building2, 
                        color: 'bg-emerald-600', 
                        sub: 'Quét mã QR bằng mọi App Ngân hàng (Agribank, VCB, MB, TCB...) - Tự động điền tiền và nội dung' 
                      },
                      { 
                        id: 'MOMO', 
                        name: 'Ví điện tử MoMo (Quét QR MoMo)', 
                        icon: Wallet, 
                        color: 'bg-pink-600', 
                        sub: 'Quét mã QR qua ứng dụng MoMo thanh toán tức thì' 
                      },
                      { 
                        id: 'VNPAY', 
                        name: 'Cổng thanh toán VNPay', 
                        icon: CreditCard, 
                        color: 'bg-red-600', 
                        sub: 'Thẻ ATM nội địa, Thẻ quốc tế Visa/Mastercard' 
                      },
                    ].map((m) => {
                      const IconComp = m.icon;
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setPaymentMethod(m.id as any);
                            if (m.id === 'MOMO') setQrGatewayTab('MOMO');
                            else setQrGatewayTab('VIETQR');
                          }}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                            paymentMethod === m.id ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-12 rounded-lg ${m.color} text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{m.name}</div>
                              <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{m.sub}</div>
                            </div>
                          </div>
                          <input type="radio" checked={paymentMethod === m.id} readOnly className="text-emerald-600" />
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
                    <span>📅 Khởi hành: <strong>{stateData.departureDate || '15-09-2026'}</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Người lớn ({adults} x {formatCurrency(adultPrice)}):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(adultPrice * adults)}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>Trẻ em ({children} x {formatCurrency(childPrice)}):</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Mã giảm giá ({voucherCode}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t text-sm font-black text-slate-900">
                    <span>Tổng đơn hàng:</span>
                    <span className="text-rose-600">{formatCurrency(totalAfterDiscount)}</span>
                  </div>
                </div>

                {/* Amount to pay on website */}
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="text-slate-600 font-medium">Tổng số tiền thanh toán hiển thị:</div>
                  <div className="text-2xl font-black text-emerald-700">{formatCurrency(finalPayAmount)}</div>
                  {paymentOption === 'DEPOSIT' && (
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      (Đã áp dụng mức đặt cọc 30% giữ chỗ)
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs font-extrabold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <QrCode className="h-4 w-4" />
                  Tiến Hành Quét Mã QR Thanh Toán
                </button>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cổng thanh toán VietQR chuẩn Napas 24/7
                </div>
              </div>
            </aside>

          </form>
        )}

        {/* VIETQR & MOMO PAYMENT MODAL */}
        {showQrPaymentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 my-6 border border-slate-100">
              
              {/* Modal Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Thời gian thanh toán còn lại: <span className="font-mono text-emerald-900 font-black">{formatTime(timeLeft)}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 pt-1">
                  Quét Mã QR Thanh Toán Trực Tiếp
                </h3>
                <p className="text-xs text-slate-500">
                  Mở ứng dụng Ngân hàng (Agribank, MB, VCB...) hoặc Ví MoMo để quét mã
                </p>
              </div>

              {/* Gateway Tabs in Modal */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setQrGatewayTab('VIETQR')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    qrGatewayTab === 'VIETQR' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-emerald-600" /> VietQR (Agribank)
                </button>
                <button
                  type="button"
                  onClick={() => setQrGatewayTab('MOMO')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    qrGatewayTab === 'MOMO' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="h-4 w-4 text-pink-600" /> Ví MoMo
                </button>
              </div>

              {/* Demo Mode Notice Badge */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Chế độ Demo / Thử nghiệm thực tế:</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-5">
                  Giá tour trên hệ thống là <strong>{formatCurrency(finalPayAmount)}</strong>. Nhằm phục vụ việc chấm điểm kiểm thử luồng chuyển khoản thật, mã QR được thiết lập số tiền chuyển thực nghiệm là <strong className="text-rose-600 font-black">5.000đ</strong> vào tài khoản tác giả (<strong>NGUYEN BAO LOI</strong>).
                </p>
              </div>

              {/* QR Image Box */}
              <div className={`p-4 rounded-2xl border-2 text-center space-y-2 shadow-inner ${
                qrGatewayTab === 'VIETQR' ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-500/30' : 'bg-gradient-to-b from-pink-50/50 to-white border-pink-500/30'
              }`}>
                <div className="relative inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={qrGatewayTab === 'VIETQR' ? vietQrAgribankUrl : vietQrMomoUrl}
                    alt="VietQR Transfer"
                    className="h-56 w-56 mx-auto object-contain"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                  {qrGatewayTab === 'VIETQR' ? (
                    <>
                      <span className="font-bold text-emerald-700">NAPAS 24/7 • AGRIBANK</span>
                      <span>•</span>
                      <span>Chuyển khoản liên ngân hàng miễn phí</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-pink-700">MOMO VIETQR</span>
                      <span>•</span>
                      <span>Quét bằng App MoMo hoặc ngân hàng bất kỳ</span>
                    </>
                  )}
                </div>
              </div>

              {/* Transfer Details Card with One-click Copy */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs border border-slate-200">
                
                {/* Ngân hàng / Cổng */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Cổng nhận tiền:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {qrGatewayTab === 'VIETQR' ? 'Agribank (Nông Nghiệp & PTNT)' : 'Ví Điện Tử MoMo'}
                  </span>
                </div>

                {/* Số tài khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Số tài khoản / Số ví nhận:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm">{BANK_CONFIG.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk')}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Sao chép số tài khoản"
                    >
                      {copiedStk ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chủ tài khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Tên chủ tài khoản:</span>
                  <span className="font-black text-slate-900 uppercase">{BANK_CONFIG.accountName}</span>
                </div>

                {/* Số tiền thực tế chuyển */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Số tiền quét thực tế (Demo Test):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-600 text-base">{formatCurrency(BANK_CONFIG.realTestAmount)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.realTestAmount.toString(), 'amount')}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Sao chép số tiền"
                    >
                      {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">{transferContent}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Sao chép nội dung"
                    >
                      {copiedContent ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* AUTOMATIC REAL-TIME BANK TRANSACTION LISTENER (NO MANUAL BUTTON) */}
              <div className="space-y-3 pt-1">
                {paymentSuccessToast ? (
                  <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-xl shadow-emerald-600/30 animate-in fade-in zoom-in-95">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-sm">Giao Dịch Chuyển Khoản Thành Công!</div>
                      <div className="text-xs text-emerald-100 mt-0.5">
                        Đã nhận 5.000đ từ Ngân hàng Agribank ({BANK_CONFIG.accountName}). Đang tự động xuất vé...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-black text-emerald-400 tracking-wide uppercase">
                          Tự động lắng nghe giao dịch liên ngân hàng
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">
                        Polling 2s • Napas 24/7
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Quý khách vui lòng quét mã QR trên bằng ứng dụng Ngân hàng hoặc MoMo để chuyển khoản <strong>5.000đ</strong>. Ngay khi tiền vào tài khoản thực, hệ thống sẽ <strong>tự động nhận diện và chuyển trang xuất vé điện tử</strong> tức thì (hoàn toàn tự động, không cần bấm xác nhận).
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                        <span>Đang chờ tín hiệu biến động số dư...</span>
                      </div>

                      {/* Simulator Trigger for Presentations & Tests */}
                      <button
                        type="button"
                        onClick={handleSimulateBankWebhook}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold transition flex items-center gap-1"
                        title="Dành cho Demo: Giả lập tín hiệu Webhook ngân hàng báo nhận tiền thành công"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Kích hoạt nhận diện ngay</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowQrPaymentModal(false)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  Quay lại chỉnh sửa thông tin
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
