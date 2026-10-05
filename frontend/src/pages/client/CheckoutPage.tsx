import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { tourScheduleService } from '../../services/tourScheduleService';
import { Booking } from '../../types/booking';
import { PaymentQrModal } from '../../components/payment/PaymentQrModal';
import useAuth from '../../hooks/useAuth';
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  ArrowLeft, 
  Building2, 
  Wallet, 
  Ticket,
  Sparkles,
  Package,
  Globe
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { notificationService } from '../../services/notificationService';
import { voucherService } from '../../services/voucherService';
import { VoucherSelectorModal } from '../../components/booking/VoucherSelectorModal';


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
  const [currentVoucherCode, setCurrentVoucherCode] = useState<string>(stateData.voucherCode || '');
  const [currentDiscountAmount, setCurrentDiscountAmount] = useState<number>(stateData.discountAmount || 0);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const singleRoomRequired = Boolean(stateData.singleRoomRequired);
  const singleRoomSurchargeAmount = Number(stateData.singleRoomSurchargeAmount || 0);
  const roomAllocation = stateData.roomAllocation || (adults === 1 ? 'Ghép phòng đôi tiêu chuẩn 2 người cùng giới tính' : `${Math.floor((adults + children) / 2)} Phòng đôi tiêu chuẩn (2 khách/phòng)`);
  const minParticipants = stateData.minParticipants || 10;

  const { user } = useAuth();
  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };
  const activeUser = user || getStoredUser();

  // Form states synced with real registered user
  const [contactName, setContactName] = useState<string>(() => activeUser?.fullName || 'Nguyễn Bảo Lợi');
  const [contactEmail, setContactEmail] = useState<string>(() => activeUser?.email || 'nguyenbaoloicv@gmail.com');
  const [contactPhone, setContactPhone] = useState<string>(() => activeUser?.phone || '0941899554');

  const [hasVisaConfig, setHasVisaConfig] = useState(false);
  const [fetchedCategory, setFetchedCategory] = useState('TRONG_NUOC');

  useEffect(() => {
    // Sync user data
    const current = user || getStoredUser();
    if (current) {
      if (current.fullName) setContactName(current.fullName);
      if (current.email) setContactEmail(current.email);
      if (current.phone) setContactPhone(current.phone);
    }

    // Check visa requirements for this tour
    const checkVisaAndCategory = async () => {
      try {
        const { tourService } = await import('../../services/tourService');
        const tourRes = await tourService.getTourById(tourId);
        let category = 'TRONG_NUOC';
        if (tourRes && tourRes.data) {
           category = String(tourRes.data.category ?? 'TRONG_NUOC');
           setFetchedCategory(category);
        }

        if (category === 'NUOC_NGOAI') {
          const { visaService } = await import('../../services/visaService');
          const reqs = await visaService.getRequirements(tourId);
          if (reqs && reqs.length > 0) {
            setHasVisaConfig(true);
          }
        }
      } catch (err) {
        console.log('Error fetching tour info', err);
      }
    };
    checkVisaAndCategory();
  }, [user, tourId]);
  const [note, setNote] = useState('');
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'DEPOSIT'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'MOMO' | 'VNPAY'>('BANK');
  
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Price calculations
  const adultPrice = stateData.adultPrice || stateData.price || 5000;
  const childPrice = stateData.childPrice || adultPrice;
  const subtotal = (adultPrice * adults) + (childPrice * children) + singleRoomSurchargeAmount;
  const totalAfterDiscount = Math.max(0, subtotal - currentDiscountAmount);
  const finalPayAmount = paymentOption === 'DEPOSIT' ? Math.round(totalAfterDiscount * 0.3) : totalAfterDiscount;

  const handleApplyVoucherOnCheckout = async (code: string) => {
    try {
      const res = await voucherService.validateVoucher(code, subtotal);
      if (res.data) {
        setCurrentVoucherCode(code);
        setCurrentDiscountAmount(res.data.discountAmount);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện áp dụng');
    }
  };

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

  const getNormalizedDepartureDate = () => {
    const defaultFutureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const rawDate = stateData.departureDate || defaultFutureDate;
    if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return rawDate;
  };

  const handleSavePendingBooking = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người liên hệ');
      return;
    }
    const code = `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const chosenDate = getNormalizedDepartureDate();
    
    // Attempt backend first
    try {
      await bookingService.createBooking({
        tourId: tourId,
        numberOfAdults: adults,
        numberOfChildren: children,
        voucherCode: currentVoucherCode || undefined,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod: paymentMethod,
        departureDate: chosenDate,
        bookingCode: code,
        status: 'PENDING',
        singleRoomSurcharge: singleRoomRequired,
        singleRoomSurchargeAmount: singleRoomSurchargeAmount,
        roomAllocation: roomAllocation,
      });
      // Optionally update status to PENDING if needed via API, but usually it defaults to PENDING
    } catch (err) {
      console.log('Pre-create booking notice (offline/fallback mode):', err);
      // Fallback local
      const pendingBooking: Booking = {
        id: Date.now(),
        bookingCode: code,
        tourId, tourTitle, tourThumbnailUrl, tourCode,
        tourCategory: fetchedCategory,
        durationDays: stateData.durationDays || 1, durationNights: stateData.durationNights || 0,
        departureLocation: 'TP.Hồ Chí Minh', userId: 1, userName: contactName.trim(),
        numberOfAdults: adults, numberOfChildren: children,
        adultPrice, childPrice, voucherCode: currentVoucherCode,
        discountAmount: currentDiscountAmount, totalPrice: finalPayAmount,
        status: 'PENDING', contactName: contactName.trim(),
        contactEmail: contactEmail.trim(), contactPhone: contactPhone.trim(),
        departureDate: chosenDate,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7C${code}%7C${tourCode}%7CPENDING`,
        createdAt: new Date().toISOString(),
      };
      const existingStr = localStorage.getItem('user_created_bookings');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('user_created_bookings', JSON.stringify([pendingBooking, ...existing]));
    }
    
    // Add notifications
    notificationService.addNotification({
      title: 'Đơn hàng chờ thanh toán',
      message: `Đơn hàng đặt tour "${tourTitle}" của bạn đang chờ thanh toán. Vui lòng thanh toán trước 24h để giữ chỗ!`,
      type: 'BOOKING'
    }, contactEmail);

    if (hasVisaConfig) {
      notificationService.addNotification({
        title: '⚠️ Bắt buộc: Nộp hồ sơ Visa',
        message: `Hành trình "${tourTitle}" yêu cầu phải có Visa. Vui lòng vào Lịch sử đặt tour để nộp hồ sơ Visa càng sớm càng tốt để kịp nộp lên Lãnh sự quán!`,
        type: 'SYSTEM'
      }, contactEmail);
    }

    alert('Đã lưu thông tin! Đơn đặt tour của bạn đã được thêm vào Lịch sử (Chờ thanh toán).');
    navigate('/my-bookings');
  };

  const handleInitiatePayment = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người liên hệ');
      return;
    }

    const code = `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const chosenDate = getNormalizedDepartureDate();

    // Call backend to persist PENDING booking so Webhook & Polling match it 100%
    try {
      await bookingService.createBooking({
        tourId: tourId,
        numberOfAdults: adults,
        numberOfChildren: children,
        voucherCode: currentVoucherCode || undefined,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod: paymentMethod,
        departureDate: chosenDate,
        bookingCode: code,
        status: 'PENDING',
        singleRoomSurcharge: singleRoomRequired,
        singleRoomSurchargeAmount: singleRoomSurchargeAmount,
        roomAllocation: roomAllocation,
      });
    } catch (e) {
      console.log('Pre-create booking notice (offline/fallback mode):', e);
    }
    
    const tempBooking: Booking = {
      id: Date.now(),
      bookingCode: code,
      tourId: tourId,
      tourTitle: tourTitle,
      tourThumbnailUrl: tourThumbnailUrl,
      tourCode: tourCode,
      tourCategory: fetchedCategory,
      durationDays: stateData.durationDays || 1,
      durationNights: stateData.durationNights || 0,
      departureLocation: 'TP.Hồ Chí Minh',
      userId: 1,
      userName: contactName.trim(),
      numberOfAdults: adults,
      numberOfChildren: children,
      adultPrice: adultPrice,
      childPrice: childPrice,
      voucherCode: currentVoucherCode,
      discountAmount: currentDiscountAmount,
      totalPrice: finalPayAmount,
      status: 'PENDING',
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      departureDate: chosenDate,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7C${code}%7C${tourCode}%7CPAID`,
      createdAt: new Date().toISOString(),
    };

    setPaymentBooking(tempBooking);
    deductSeatsIfPending();
  };

  const handlePaymentSuccess = (booking: Booking) => {
    const finalBooking = { ...booking, status: 'PAID' as const };
    
    try {
      const existingStr = localStorage.getItem('user_created_bookings');
      const existing: Booking[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('user_created_bookings', JSON.stringify([finalBooking, ...existing]));
    } catch (e) {
      console.error(e);
    }

    deductSeatsIfPending();

    setTimeout(async () => {
      try {
        await paymentService.markBookingPaid(booking.bookingCode);
      } catch (err) {
        console.log('Backend mark paid notice:', err);
      }

      setCreatedBooking(finalBooking);
      setPaymentBooking(null);
      
      notificationService.addNotification({
        title: '🎉 Thanh toán thành công',
        message: `Đơn hàng đặt tour "${tourTitle}" đã được thanh toán thành công. Cảm ơn quý khách!`,
        type: 'BOOKING'
      }, contactEmail);

      if (hasVisaConfig) {
         notificationService.addNotification({
           title: '⚠️ Bắt buộc: Nộp hồ sơ Visa',
           message: `Hành trình "${tourTitle}" yêu cầu phải có Visa. Vui lòng vào Lịch sử đặt tour để nộp hồ sơ Visa càng sớm càng tốt để kịp nộp lên Lãnh sự quán!`,
           type: 'SYSTEM'
         }, contactEmail);
      }
    }, 0);
  };

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
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
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
                      placeholder={activeUser?.email || "nguyenbaoloicv@gmail.com"}
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

              {hasVisaConfig && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-400 text-sm">Hành trình yêu cầu Visa</h4>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      Để thuận tiện cho bạn, thủ tục nộp giấy tờ Visa sẽ được thực hiện <strong>sau khi đặt tour</strong>. Bạn có thể upload hồ sơ bất cứ lúc nào trong mục <strong>Lịch sử đặt tour</strong>.
                    </p>
                  </div>
                </div>
              )}

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
                  {/* Voucher display & selection */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5 text-cyan-400" /> Mã khuyến mãi:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowVoucherModal(true)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{currentVoucherCode ? 'Đổi mã' : 'Chọn mã ưu đãi'}</span>
                      </button>
                    </div>
                    {currentDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Đã giảm ({currentVoucherCode}):</span>
                        <span>-{formatCurrency(currentDiscountAmount)}</span>
                      </div>
                    )}
                  </div>
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

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleSavePendingBooking}
                    className="w-full rounded-2xl bg-[#0a111d] border border-white/20 hover:bg-white/10 text-slate-300 py-3.5 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Lưu thông tin & Chờ thanh toán
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 text-xs font-black transition shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" />
                    Thanh Toán Ngay (Quét mã QR)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Cổng thanh toán VietQR chuẩn Napas 24/7
                </div>
              </div>
            </aside>

          </form>
        )}

        {/* PAYMENT QR MODAL */}
        <PaymentQrModal 
          isOpen={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          booking={paymentBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Voucher Selector Modal */}
        <VoucherSelectorModal
          isOpen={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          orderTotal={subtotal}
          selectedCode={currentVoucherCode}
          onSelectVoucher={(code) => handleApplyVoucherOnCheckout(code)}
        />

      </div>
    </div>
  );
};
