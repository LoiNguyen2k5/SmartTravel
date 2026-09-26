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

  const tourId = stateData.tourId || 1;
  const tourTitle = stateData.tourTitle || 'TOUR ÂN THI ĐẠI HIỆP CỐC – PHƯỢNG HOÀNG CỔ TRẤN 5N4Đ';
  const tourThumbnailUrl = stateData.tourThumbnailUrl || '/images/tours/tour_anthi.png';
  const tourCode = stateData.tourCode || 'TOUR-001';
  const adults = stateData.numberOfAdults || 1;
  const children = stateData.numberOfChildren || 0;
  const voucherCode = stateData.voucherCode || '';
  const discountAmount = stateData.discountAmount || 0;
  const singleRoomRequired = Boolean(stateData.singleRoomRequired);
  const singleRoomSurchargeAmount = Number(stateData.singleRoomSurchargeAmount || 0);
  const roomAllocation = stateData.roomAllocation || (adults === 1 ? 'Ghép phòng đôi tiêu chuẩn 2 người cùng giới tính' : `${Math.floor((adults + children) / 2)} Phòng đôi tiêu chuẩn (2 khách/phòng)`);
  const minParticipants = stateData.minParticipants || 10;

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
  const subtotal = (adultPrice * adults) + (childPrice * children) + singleRoomSurchargeAmount;
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
  const seatsDeductedRef = useRef(false);

  const deductSeatsIfPending = () => {
    if (seatsDeductedRef.current) return;
    seatsDeductedRef.current = true;
    try {
      const scheduleId = stateData.scheduleId;
      const totalGuests = (adults || 1) + (children || 0);
      const chosenDate = stateData.departureDate;
      if (tourId) {
        tourScheduleService.bookSeatsForSchedule(tourId, scheduleId, totalGuests, chosenDate);
      }
      if (scheduleId) {
        const storedSeatsStr = localStorage.getItem('schedule_seat_counts');
        const storedSeats: Record<number, number> = storedSeatsStr 
          ? JSON.parse(storedSeatsStr) 
          : { 1: 28, 2: 35, 3: 40, 4: 40, 5: 45, 6: 45 };
        const current = storedSeats[scheduleId] !== undefined ? storedSeats[scheduleId] : 35;
        storedSeats[scheduleId] = Math.max(0, current - totalGuests);
        localStorage.setItem('schedule_seat_counts', JSON.stringify(storedSeats));
      }
    } catch (e) {
      console.error('Error updating seat count:', e);
    }
  };

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

    // Deduct seats immediately so availability is updated in real time
    deductSeatsIfPending();

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
    deductSeatsIfPending();

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
    <div className="bg-[#020204] text-white min-h-screen pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient Deep Space Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-[600px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Header navigation */}
        <div className="flex items-center gap-3.5 mb-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition shadow-sm cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Xác Nhận & Thanh Toán Đặt Tour</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Tích hợp thanh toán trực tuyến quét mã VietQR & Ví MoMo chuyển khoản tức thời</p>
          </div>
        </div>

        {createdBooking ? (
          /* SUCCESS E-TICKET CONFIRMATION SCREEN */
          <div className="bg-[#0a111d]/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in text-white">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Thanh toán & Đặt tour thành công</span>
              <h2 className="text-2xl font-black text-white">Vé Điện Tử (E-Ticket) SmartTravel</h2>
              <p className="text-xs text-slate-400">Mã đơn hàng: <strong className="text-cyan-300 font-mono">{createdBooking.bookingCode}</strong></p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 inline-block mx-auto space-y-3">
              <img 
                src={createdBooking.qrCodeUrl} 
                alt="E-Ticket QR Code" 
                className="h-48 w-48 mx-auto rounded-xl border border-white/20 shadow-md bg-white p-2"
              />
              <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                <QrCode className="h-4 w-4 text-sky-400" /> Quét mã QR tại quầy làm thủ tục tour
              </div>
            </div>

            {/* Booking Specs */}
            <div className="bg-white/[0.03] p-5 rounded-2xl text-left text-xs space-y-2.5 border border-white/10">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Tên Tour:</span>
                <span className="font-bold text-white">{createdBooking.tourTitle || tourTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Người liên hệ:</span>
                <span className="font-semibold text-white">{createdBooking.contactName} ({createdBooking.contactPhone})</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Số lượng khách:</span>
                <span className="font-semibold text-white">{createdBooking.numberOfAdults} Người lớn {createdBooking.numberOfChildren ? `, ${createdBooking.numberOfChildren} Trẻ em` : ''}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Tiêu chuẩn phòng:</span>
                <span className="font-bold text-emerald-400">{roomAllocation}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-white">
                <span>Tổng giá trị tour đã thanh toán:</span>
                <span className="text-rose-400">{formatCurrency(createdBooking.totalPrice || finalPayAmount)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white py-3 text-xs font-bold transition shadow-[0_0_20px_rgba(14,165,233,0.35)]"
              >
                Xem Lịch Sử Đơn Hàng
              </button>
              <button
                onClick={() => navigate('/tours')}
                className="flex-1 rounded-xl border border-white/20 text-slate-300 py-3 text-xs font-bold hover:bg-white/10 hover:text-white transition"
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
              <div className="bg-[#0a111d]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4">
                <h3 className="font-black text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-black border border-sky-500/30">1</span>
                  Thông tin người đặt tour
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Họ và tên người đại diện *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nguyễn Bảo Lợi"
                      className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 bg-white/[0.04] text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/[0.08] focus:outline-none font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0988 776 655"
                      className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 bg-white/[0.04] text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/[0.08] focus:outline-none font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-300">Email nhận vé điện tử (E-Ticket) *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="baoloi@smarttravel.com"
                      className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 bg-white/[0.04] text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/[0.08] focus:outline-none font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-300">Ghi chú đặc biệt (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Đặt chỗ cho chuyến trải nghiệm gia đình..."
                      className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 bg-white/[0.04] text-white placeholder-slate-500 focus:border-cyan-400 focus:bg-white/[0.08] focus:outline-none font-medium transition"
                    />
                  </div>
                </div>
              </div>

              {/* Room Allocation & Accommodation Box */}
              <div className="bg-[#0a111d]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-black border border-sky-500/30">2</span>
                    Tiêu chuẩn lưu trú & Phân bổ phòng
                  </h3>
                  <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                    Tiêu chuẩn 02 khách/phòng
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Phân bổ phòng dự kiến:</span>
                      {singleRoomRequired && (
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                          Phòng đơn riêng biệt
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      🏨 {roomAllocation}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 border-t border-white/10">
                      {singleRoomRequired
                        ? `✓ Đã tính phụ thu phòng đơn riêng biệt: +${formatCurrency(singleRoomSurchargeAmount)}. Khách hàng được bố trí phòng 1 người riêng tư tiêu chuẩn 3-4 sao.`
                        : `ℹ️ Tiêu chuẩn tour 02 người/phòng (Twin 2 giường đơn hoặc Double 1 giường đôi). Nếu đi 1 mình, quý khách được ghép cùng đoàn.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Đoàn cam kết tối thiểu <strong>{minParticipants} khách</strong>. Nếu không đủ đoàn trước ngày đi, hoàn tiền 100%.</span>
                  </div>
                </div>
              </div>

              {/* Payment Option & Method Box */}
              <div className="bg-[#0a111d]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
                
                {/* Deposit Option Choice */}
                <div className="space-y-3">
                  <h3 className="font-black text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-black border border-sky-500/30">3</span>
                    Tùy chọn thanh toán
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentOption('FULL')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        paymentOption === 'FULL'
                          ? 'border-cyan-500 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span>Thanh toán 100% trọn gói</span>
                        <input type="radio" checked={paymentOption === 'FULL'} readOnly className="accent-cyan-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Thanh toán trọn gói và nhận ngay vé điện tử.</p>
                      <div className="text-sm font-black text-rose-400 mt-2">{formatCurrency(totalAfterDiscount)}</div>
                    </div>

                    <div
                      onClick={() => setPaymentOption('DEPOSIT')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        paymentOption === 'DEPOSIT'
                          ? 'border-cyan-500 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span>Đặt cọc 30% giữ chỗ</span>
                        <input type="radio" checked={paymentOption === 'DEPOSIT'} readOnly className="accent-cyan-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Đặt cọc giữ chỗ trước chuyến đi.</p>
                      <div className="text-sm font-black text-cyan-400 mt-2">{formatCurrency(Math.round(totalAfterDiscount * 0.3))}</div>
                    </div>
                  </div>
                </div>

                {/* Gateway Methods Choice */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Phương thức thanh toán</h4>

                  <div className="space-y-2.5">
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
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setPaymentMethod(m.id as any);
                            if (m.id === 'MOMO') setQrGatewayTab('MOMO');
                            else setQrGatewayTab('VIETQR');
                          }}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`h-10 w-12 rounded-xl ${m.color} text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-md`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white">{m.name}</div>
                              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{m.sub}</div>
                            </div>
                          </div>
                          <input type="radio" checked={isSelected} readOnly className="accent-emerald-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-[#0a111d]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4 sticky top-28">
                <h3 className="font-black text-white text-base border-b border-white/10 pb-3">Tóm tắt đơn đặt tour</h3>

                <div className="space-y-2 text-xs">
                  <div className="font-extrabold text-white text-sm line-clamp-2 leading-snug">
                    {tourTitle}
                  </div>
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <span>📅 Khởi hành: <strong className="text-cyan-300">{stateData.departureDate || '15-09-2026'}</strong></span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-white/10">
                  <div className="flex justify-between">
                    <span>Người lớn ({adults} x {formatCurrency(adultPrice)}):</span>
                    <span className="font-semibold text-white">{formatCurrency(adultPrice * adults)}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>Trẻ em ({children} x {formatCurrency(childPrice)}):</span>
                      <span className="font-semibold text-white">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  {singleRoomRequired && singleRoomSurchargeAmount > 0 && (
                    <div className="flex justify-between text-amber-400 font-semibold">
                      <span>Phụ thu phòng đơn ({adults} phòng):</span>
                      <span>+{formatCurrency(singleRoomSurchargeAmount)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Mã giảm giá ({voucherCode}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-black text-white">
                    <span>Tổng đơn hàng:</span>
                    <span className="text-rose-400">{formatCurrency(totalAfterDiscount)}</span>
                  </div>
                </div>

                {/* Amount to pay on website */}
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl text-xs space-y-1">
                  <div className="text-slate-300 font-medium">Tổng số tiền thanh toán hiển thị:</div>
                  <div className="text-2xl font-black text-emerald-400">{formatCurrency(finalPayAmount)}</div>
                  {paymentOption === 'DEPOSIT' && (
                    <div className="text-[10px] text-emerald-300 font-semibold">
                      (Đã áp dụng mức đặt cọc 30% giữ chỗ)
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 text-xs font-black transition shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <QrCode className="h-4 w-4" />
                  Tiến Hành Quét Mã QR Thanh Toán
                </button>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Cổng thanh toán VietQR chuẩn Napas 24/7
                </div>
              </div>
            </aside>

          </form>
        )}

        {/* VIETQR & MOMO PAYMENT MODAL */}
        {showQrPaymentModal && (
          <div className="fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in" style={{ zIndex: 9999 }}>
            <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-lg bg-[#0a111d] rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-4 border border-white/15 text-white relative">
              
              {/* Modal Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  Thời gian thanh toán còn lại: <span className="font-mono text-white font-black">{formatTime(timeLeft)}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white pt-0.5">
                  Quét Mã QR Thanh Toán Trực Tiếp
                </h3>
                <p className="text-xs text-slate-400">
                  Mở ứng dụng Ngân hàng (Agribank, MB, VCB...) hoặc Ví MoMo để quét mã
                </p>
              </div>

              {/* Gateway Tabs in Modal */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.05] border border-white/10 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setQrGatewayTab('VIETQR')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    qrGatewayTab === 'VIETQR' ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-emerald-400" /> VietQR (Agribank)
                </button>
                <button
                  type="button"
                  onClick={() => setQrGatewayTab('MOMO')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    qrGatewayTab === 'MOMO' ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="h-4 w-4 text-pink-400" /> Ví MoMo
                </button>
              </div>

              {/* QR Image Box */}
              <div className={`p-3 rounded-2xl border text-center space-y-2 ${
                qrGatewayTab === 'VIETQR' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-pink-950/20 border-pink-500/30'
              }`}>
                <div className="relative inline-block bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200">
                  <img
                    src={qrGatewayTab === 'VIETQR' ? vietQrAgribankUrl : vietQrMomoUrl}
                    alt="VietQR Transfer"
                    className="h-44 w-44 sm:h-48 sm:w-48 mx-auto object-contain"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                  {qrGatewayTab === 'VIETQR' ? (
                    <>
                      <span className="font-bold text-emerald-400">NAPAS 24/7 • AGRIBANK</span>
                      <span>•</span>
                      <span>Chuyển khoản liên ngân hàng 24/7</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-pink-400">MOMO VIETQR</span>
                      <span>•</span>
                      <span>Quét bằng App MoMo hoặc ngân hàng bất kỳ</span>
                    </>
                  )}
                </div>
              </div>

              {/* Transfer Details Card with One-click Copy */}
              <div className="bg-white/[0.03] rounded-2xl p-4 space-y-2.5 text-xs border border-white/10">
                
                {/* Ngân hàng / Cổng */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Cổng nhận tiền:</span>
                  <span className="font-bold text-white text-right">
                    {qrGatewayTab === 'VIETQR' ? 'Agribank (Nông Nghiệp & PTNT)' : 'Ví Điện Tử MoMo'}
                  </span>
                </div>

                {/* Số tài khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Số tài khoản / Số ví nhận:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-cyan-300 text-sm">{BANK_CONFIG.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk')}
                      className="p-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedStk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chủ tài khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Tên chủ tài khoản:</span>
                  <span className="font-black text-white uppercase">{BANK_CONFIG.accountName}</span>
                </div>

                {/* Số tiền thực tế chuyển */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Số tiền thanh toán:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-400 text-base">{formatCurrency(BANK_CONFIG.realTestAmount)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.realTestAmount.toString(), 'amount')}
                      className="p-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
                      title="Sao chép số tiền"
                    >
                      {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-lg border border-sky-500/30">{transferContent}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="p-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedContent ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* AUTOMATIC REAL-TIME BANK TRANSACTION LISTENER */}
              <div className="space-y-3 pt-1">
                {paymentSuccessToast ? (
                  <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-in fade-in zoom-in-95">
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
                  <div className="p-4 rounded-2xl bg-[#070c18] text-white space-y-3 border border-white/10 shadow-xl">
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
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono border border-white/10">
                        Polling 2s • Napas 24/7
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Quý khách vui lòng quét mã QR trên bằng ứng dụng Ngân hàng hoặc MoMo để chuyển khoản <strong>5.000đ</strong>. Ngay khi tiền vào tài khoản thực, hệ thống sẽ <strong>tự động nhận diện và chuyển trang xuất vé điện tử</strong> tức thì (hoàn toàn tự động, không cần bấm xác nhận).
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                        <span>Đang chờ tín hiệu biến động số dư...</span>
                      </div>

                      {/* Simulator Trigger for Presentations & Tests */}
                      <button
                        type="button"
                        onClick={handleSimulateBankWebhook}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold transition flex items-center gap-1 cursor-pointer"
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
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Quay lại chỉnh sửa thông tin
                </button>
              </div>

            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
};
