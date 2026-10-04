import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import { History, Package, QrCode, XCircle, Star, Globe } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { visaService } from '../../services/visaService';
import { MyVisaTracker } from '../../components/visa/MyVisaTracker';
import { VisaApplicationResponse, VisaRequirementResponse } from '../../types/visa';
import { PaymentQrModal } from '../../components/payment/PaymentQrModal';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 101,
    bookingCode: 'BK-8F39A102',
    tourId: 1,
    tourTitle: 'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ | DẤU ẤN XỨ TRUNG HOA',
    tourThumbnailUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80',
    tourCode: 'DAHT14VQDZ',
    tourCategory: 'NUOC_NGOAI',
    durationDays: 6,
    durationNights: 5,
    departureLocation: 'TP.Hồ Chí Minh',
    userId: 1,
    userName: 'Nguyễn Văn A',
    numberOfAdults: 2,
    numberOfChildren: 1,
    adultPrice: 17990000,
    childPrice: 12590000,
    voucherCode: 'SUMMER2026',
    discountAmount: 1000000,
    totalPrice: 47570000,
    status: 'DEPOSITED',
    contactName: 'Nguyễn Văn A',
    contactEmail: 'nguyenvana@gmail.com',
    contactPhone: '0912 345 678',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7CBK-8F39A102%7CTOUR-AN-THI',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 102,
    bookingCode: 'BK-1A90B543',
    tourId: 6,
    tourTitle: 'TOUR ĐÀ LẠT 4N3Đ | KHÁM PHÁ THÀNH PHỐ SƯƠNG MỜ & NHỮNG MÙA HOA',
    tourThumbnailUrl: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
    tourCode: 'DALAT-4N3D-HOA',
    tourCategory: 'TRONG_NUOC',
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    userId: 1,
    userName: 'Nguyễn Bảo Lợi',
    numberOfAdults: 1,
    numberOfChildren: 0,
    adultPrice: 3890000,
    totalPrice: 3890000,
    status: 'COMPLETED',
    contactName: 'Nguyễn Bảo Lợi',
    contactEmail: 'nguyenbaoloi@gmail.com',
    contactPhone: '0941899554',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SMARTTRAVEL-E-TICKET%7CBK-B0B61553%7CTOUR-DALAT',
    createdAt: '2026-08-20T08:30:00Z',
  }
];

export const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };
  const activeUser = user || getStoredUser();
  const currentEmail = activeUser?.email || 'nguyenbaoloicv@gmail.com';
  const currentName = activeUser?.fullName || 'Nguyễn Bảo Lợi';
  const currentPhone = activeUser?.phone || '0941899554';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [tourCategories, setTourCategories] = useState<Record<number, string>>({});

  // Visa states
  const [selectedVisaBooking, setSelectedVisaBooking] = useState<Booking | null>(null);
  const [visaApp, setVisaApp] = useState<VisaApplicationResponse | null>(null);
  const [visaReqs, setVisaReqs] = useState<VisaRequirementResponse[]>([]);
  const [loadingVisa, setLoadingVisa] = useState(false);

  const handleOpenVisaTracker = async (b: Booking) => {
    setSelectedVisaBooking(b);
    setLoadingVisa(true);
    try {
      // Fetch requirements first
      const reqs = await visaService.getRequirements(b.tourId);
      setVisaReqs(reqs || []);
      
      // If there are requirements, check if application exists
      if (reqs && reqs.length > 0) {
        try {
          const app = await visaService.getApplication(b.id);
          setVisaApp(app);
        } catch (err) {
          // Application not found (not created yet)
          setVisaApp(null);
        }
      } else {
        setVisaApp(null);
      }
    } catch (e) {
      console.log('Error opening visa tracker', e);
      setVisaApp(null);
      setVisaReqs([]);
    } finally {
      setLoadingVisa(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (bookings.length === 0) return;
    const fetchCategories = async () => {
      try {
        const { tourService } = await import('../../services/tourService');
        const uniqueIds = Array.from(new Set(bookings.map(b => b.tourId)));
        const newMap: Record<number, string> = {};
        await Promise.all(uniqueIds.map(async id => {
          try {
            const res = await tourService.getTourById(id);
            if (res?.data?.category) {
              newMap[id] = res.data.category;
            }
          } catch(e) {}
        }));
        setTourCategories(prev => ({ ...prev, ...newMap }));
      } catch (e) {
        console.error('Lỗi lấy danh mục tour:', e);
      }
    };
    fetchCategories();
  }, [bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let localBookings: Booking[] = [];
      try {
        const localStr = localStorage.getItem('user_created_bookings');
        if (localStr) {
          localBookings = JSON.parse(localStr);
          // Migrate any old dummy email to the real registered user email
          let hasMigration = false;
          localBookings = localBookings.map(b => {
            if (b.contactEmail === 'baoloi@smarttravel.com' || b.contactEmail === 'nguyenbaoloi@gmail.com' || !b.contactEmail) {
              hasMigration = true;
              return { ...b, contactEmail: currentEmail, contactName: currentName, userName: currentName, contactPhone: b.contactPhone || currentPhone };
            }
            return b;
          });
          if (hasMigration) {
            localStorage.setItem('user_created_bookings', JSON.stringify(localBookings));
          }
        }
      } catch (e) {
        console.error(e);
      }

      const res = await bookingService.getMyBookings();
      let rawList: Booking[] = (res.success && res.data && res.data.length > 0)
        ? [...localBookings, ...res.data]
        : [...localBookings, ...MOCK_BOOKINGS];

      // Sync status from saved vendor status updates & ensure real user info is shown
      try {
        const savedStatusesStr = localStorage.getItem('vendor_booking_statuses');
        const savedStatuses: Record<number, string> = savedStatusesStr ? JSON.parse(savedStatusesStr) : {};
        rawList = rawList.map((b) => {
          let updated = { ...b };
          if (savedStatuses[b.id]) {
            updated.status = savedStatuses[b.id] as any;
          }
          if (updated.contactEmail === 'baoloi@smarttravel.com' || updated.contactEmail === 'nguyenbaoloi@gmail.com' || updated.userName === 'Nguyễn Bảo Lợi') {
            updated.contactEmail = currentEmail;
            updated.contactName = currentName;
            updated.userName = currentName;
          }
          return updated;
        });
      } catch (e) {
        console.error(e);
      }

      // Hide all CANCELLED bookings from history
      rawList = rawList.filter(b => b.status !== 'CANCELLED');
      setBookings(rawList);
    } catch (err) {
      console.error(err);
      let localBookings: Booking[] = [];
      try {
        const localStr = localStorage.getItem('user_created_bookings');
        if (localStr) localBookings = JSON.parse(localStr);
      } catch (e) { console.error(e); }
      
      let allBookings = [...localBookings, ...MOCK_BOOKINGS];
      try {
        const savedStatusesStr = localStorage.getItem('vendor_booking_statuses');
        const savedStatuses: Record<number, string> = savedStatusesStr ? JSON.parse(savedStatusesStr) : {};
        allBookings = allBookings.map(b => savedStatuses[b.id] ? { ...b, status: savedStatuses[b.id] as any } : b);
      } catch (e) {}

      allBookings = allBookings.filter(b => b.status !== 'CANCELLED');
      setBookings(allBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (booking.status === 'PENDING') {
      if (!window.confirm('Bạn có chắc chắn muốn hủy đơn chờ thanh toán này? Đơn sẽ bị xóa khỏi lịch sử.')) return;
    } else {
      if (!window.confirm('Đơn này đã được thanh toán/đặt cọc. Hủy tour sẽ KHÔNG ĐƯỢC HOÀN TIỀN. Bạn có chắc chắn muốn hủy không?')) return;
    }

    try {
      // Check local bookings first
      const localStr = localStorage.getItem('user_created_bookings');
      if (localStr) {
        let localBookings: Booking[] = JSON.parse(localStr);
        const idx = localBookings.findIndex(b => b.id === id);
        if (idx !== -1) {
          if (booking.status === 'PENDING') {
             localBookings.splice(idx, 1); // Delete completely
          } else {
             localBookings[idx].status = 'CANCELLED' as any;
          }
          localStorage.setItem('user_created_bookings', JSON.stringify(localBookings));
          alert('Hủy đơn đặt tour thành công!');
          fetchBookings();
          return;
        }
      }

      // Check MOCK_BOOKINGS
      if (MOCK_BOOKINGS.some(b => b.id === id)) {
        try {
          const savedStr = localStorage.getItem('vendor_booking_statuses');
          const saved = savedStr ? JSON.parse(savedStr) : {};
          saved[id] = 'CANCELLED';
          localStorage.setItem('vendor_booking_statuses', JSON.stringify(saved));
        } catch (e) {}

        alert('Hủy đơn đặt tour thành công!');
        fetchBookings();
        return;
      }

      // If not local, call backend
      const res = await bookingService.cancelBooking(id);
      if (res.success) {
        alert('Hủy đơn đặt tour thành công!');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể hủy đơn đặt tour');
    }
  };

  const handlePaymentSuccess = (booking: Booking) => {
    try {
      const localStr = localStorage.getItem('user_created_bookings');
      if (localStr) {
        let localBookings: Booking[] = JSON.parse(localStr);
        localBookings = localBookings.map((b) =>
          b.id === booking.id || b.bookingCode === booking.bookingCode ? { ...b, status: 'PAID' as const } : b
        );
        localStorage.setItem('user_created_bookings', JSON.stringify(localBookings));
      }
    } catch (e) {
      console.error('Error updating local booking payment status:', e);
    }
    
    // Automatically display E-Ticket after payment
    setTimeout(() => {
        setSelectedTicket({ ...booking, status: 'PAID' });
    }, 500);

    fetchBookings();
  };

  const statusBadges: Record<string, { label: string; style: string }> = {
    DEPOSITED: { label: 'Đã Cọc 30%', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]' },
    PAID: { label: 'Đã Thanh Toán Full', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' },
    COMPLETED: { label: 'Hoàn Thành Tour', style: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.15)]' },
    CANCELLED: { label: 'Đã Hủy Đơn', style: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]' },
    PENDING: { label: 'Chờ Thanh Toán', style: 'bg-white/10 text-slate-300 border-white/20' },
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <History className="h-7 w-7" />
            </span>
            Quản Lý Đơn Đặt Tour & Vé Điện Tử
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Theo dõi trạng thái đơn hàng, xuất trình vé QR Code điện tử và lưu trữ nhật ký trải nghiệm du lịch.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-[#0a111d]/80 rounded-3xl border border-white/10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent shadow-[0_0_15px_rgba(56,189,248,0.4)]"></div>
          </div>
        ) : bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REFUNDED').length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 p-16 text-center bg-[#0a111d]/60 backdrop-blur-xl text-slate-400 space-y-4">
            <Package className="mx-auto h-12 w-12 text-slate-500" />
            <div className="text-base font-bold text-white">Bạn chưa có đơn đặt tour nào</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Khám phá ngay hàng trăm tour du lịch hấp dẫn trong và ngoài nước cùng Smart Travel.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REFUNDED').map((b) => {
              const badge = statusBadges[b.status] || { label: b.status, style: 'bg-white/10 text-slate-300 border-white/15' };
              const requiresVisa = tourCategories[b.tourId] 
                ? tourCategories[b.tourId] === 'NUOC_NGOAI' 
                : (b.tourCategory === 'NUOC_NGOAI' || b.tourTitle?.toLowerCase().match(/hàn quốc|châu âu|nhật bản|đài loan|visa|trung hoa|trung quốc|thái lan|singapore|malaysia|bali|indonesia|phượng hoàng cổ trấn|cửu trại câu|lệ giang|hồng kông|hong kong|mỹ|úc|pháp|anh|quốc tế/i) != null);
              return (
                <div 
                  key={b.id} 
                  className="bg-[#0a111d]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                >
                  <div className="md:w-56 h-48 md:h-auto bg-[#070c18] overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={b.tourThumbnailUrl || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80'} 
                      alt={b.tourTitle} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                          MÃ ĐƠN: {b.bookingCode}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white uppercase leading-snug group-hover:text-cyan-200 transition-colors">
                        {b.tourTitle}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
                        <div>Khởi hành: <strong className="text-sky-300 font-bold block">{b.departureDate || '15-09-2026'}</strong></div>
                        <div>Số khách: <strong className="text-slate-100 font-semibold block">{b.numberOfAdults} NL, {b.numberOfChildren} TE</strong></div>
                        <div>Tổng tiền: <strong className="text-rose-400 font-black text-sm block">{b.totalPrice?.toLocaleString('vi-VN')} đ</strong></div>
                        <div>Ngày đặt: <span className="text-slate-400 block">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</span></div>
                      </div>
                      
                      {/* Pending Payment Warning */}
                      {b.status === 'PENDING' && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                          <div className="h-7 w-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <QrCode className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-amber-400 text-xs uppercase">Chờ thanh toán</h4>
                            <p className="text-[11px] text-amber-200/80 leading-relaxed">
                              Đơn hàng đang được giữ chỗ tạm thời. Vui lòng hoàn tất thanh toán trước ngày <strong>{new Date(Date.now() + 86400000).toLocaleDateString('vi-VN')}</strong> để không bị hủy tự động.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Visa Deadline Warning */}
                      {requiresVisa && b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'REFUNDED' && (
                        <div className="mt-3 bg-red-500/10 border border-red-500/40 rounded-xl p-3 flex items-start gap-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                          <div className="h-7 w-7 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <Globe className="h-4 w-4 text-red-400" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-red-400 text-xs uppercase">Cảnh báo: Hạn chót nộp hồ sơ Visa sắp tới</h4>
                            <p className="text-[11px] text-red-200/80 leading-relaxed">
                              Tour của bạn yêu cầu nộp hồ sơ Visa trước ngày <strong>15/10/2026</strong>. Vui lòng bấm vào "Hồ sơ Visa" bên dưới để bổ sung ngay, tránh việc bị hủy tour và mất cọc!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/8">
                      <div className="flex items-center gap-2.5">
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => setPaymentBooking(b)}
                              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                            >
                              <QrCode className="h-4 w-4" /> Thanh Toán Ngay
                            </button>
                          )}
                          
                          {['DEPOSITED', 'CONFIRMED', 'PAID', 'COMPLETED'].includes(b.status) && (
                            <button
                              onClick={() => setSelectedTicket(b)}
                              className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(14,165,233,0.3)] cursor-pointer"
                            >
                              <QrCode className="h-4 w-4" /> Xem Vé QR Code
                            </button>
                          )}

                          {requiresVisa && (
                            <button
                              onClick={() => handleOpenVisaTracker(b)}
                              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer"
                            >
                              <Globe className="h-4 w-4" /> Hồ sơ Visa
                            </button>
                          )}


                          {b.status === 'COMPLETED' && (
                            <button
                              onClick={() => navigate(`/tours/${b.tourId || 6}?tab=reviews`)}
                              className="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
                            >
                              <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> Viết Đánh Giá
                            </button>
                          )}
                        </div>

                        {b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" /> Hủy Tour
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAYMENT QR MODAL */}
        <PaymentQrModal 
          isOpen={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          booking={paymentBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* E-TICKET QR MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#0a111d] border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                  <QrCode className="h-5 w-5" /> Vé Điện Tử E-Ticket
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-white/20 inline-block shadow-xl">
                  <img 
                    src={selectedTicket.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicket.bookingCode}`} 
                    alt="E-Ticket QR" 
                    className="h-48 w-48 rounded-xl mx-auto"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider">MÃ VÉ ĐIỆN TỬ</div>
                  <div className="text-xl font-black font-mono text-cyan-300 tracking-widest">{selectedTicket.bookingCode}</div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl text-left text-xs text-slate-300 space-y-1.5">
                  <div className="font-extrabold text-white uppercase text-[12px] line-clamp-1">{selectedTicket.tourTitle}</div>
                  <div>Khách hàng: <strong className="text-white">{selectedTicket.contactName}</strong></div>
                  <div>Khởi hành: <strong className="text-cyan-300 font-bold">{selectedTicket.departureDate || '15-09-2026'}</strong></div>
                  <div>Số lượng: <strong className="text-white">{selectedTicket.numberOfAdults} Người lớn, {selectedTicket.numberOfChildren} Trẻ em</strong></div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full rounded-xl bg-white/10 hover:bg-white/15 text-white py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* VISA TRACKER MODAL */}
        {selectedVisaBooking && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#0a111d] border border-white/15 rounded-3xl max-w-3xl w-full p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8)] text-white overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
                  <Globe className="h-5 w-5" /> Quản lý Hồ sơ Visa
                </div>
                <button 
                  onClick={() => { setSelectedVisaBooking(null); setVisaApp(null); }} 
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition font-bold"
                >
                  ✕
                </button>
              </div>

              {loadingVisa ? (
                <div className="py-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div></div>
              ) : visaApp ? (
                <div className="text-white">
                  <MyVisaTracker 
                    application={visaApp}
                    requirements={visaReqs}
                    onUploadFile={async (reqId, file) => {
                       await visaService.uploadDocument(visaApp.id, reqId, file);
                       const updatedApp = await visaService.getApplication(selectedVisaBooking.id);
                       setVisaApp(updatedApp);
                    }}
                    onSubmitApplication={async () => {
                       await visaService.updateApplicationStatus(visaApp.id, 'PROCESSING', 'Khách hàng đã nộp đầy đủ hồ sơ trực tuyến.');
                       const updatedApp = await visaService.getApplication(selectedVisaBooking.id);
                       setVisaApp(updatedApp);
                    }}
                  />
                </div>
              ) : visaReqs.length > 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-4">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-blue-400 opacity-80" />
                  <p className="text-white text-lg font-bold">Hồ sơ Visa của bạn chưa được khởi tạo.</p>
                  <p className="text-sm">Tour này yêu cầu cung cấp {visaReqs.length} loại giấy tờ Visa.</p>
                  <button 
                    onClick={async () => {
                       try {
                          setLoadingVisa(true);
                          await visaService.createApplication(selectedVisaBooking.id, selectedVisaBooking);
                          const app = await visaService.getApplication(selectedVisaBooking.id);
                          setVisaApp(app);
                       } catch(e) {
                          alert("Lỗi khi khởi tạo hồ sơ Visa!");
                       } finally {
                          setLoadingVisa(false);
                       }
                    }}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    Tạo Hồ Sơ Xin Visa Ngay
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Tour này không yêu cầu hồ sơ Visa.</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
};
