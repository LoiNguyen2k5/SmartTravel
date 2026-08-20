import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import { History, Package, QrCode, XCircle, Star } from 'lucide-react';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 101,
    bookingCode: 'BK-8F39A102',
    tourId: 1,
    tourTitle: 'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ | DẤU ẤN XỨ TRUNG HOA',
    tourThumbnailUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80',
    tourCode: 'DAHT14VQDZ',
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let localBookings: Booking[] = [];
      try {
        const localStr = localStorage.getItem('user_created_bookings');
        if (localStr) localBookings = JSON.parse(localStr);
      } catch (e) {
        console.error(e);
      }

      const res = await bookingService.getMyBookings();
      let rawList: Booking[] = (res.success && res.data && res.data.length > 0)
        ? [...localBookings, ...res.data]
        : [...localBookings, ...MOCK_BOOKINGS];

      // Sync status from saved vendor status updates
      try {
        const savedStatusesStr = localStorage.getItem('vendor_booking_statuses');
        if (savedStatusesStr) {
          const savedStatuses: Record<number, string> = JSON.parse(savedStatusesStr);
          rawList = rawList.map((b) => {
            if (savedStatuses[b.id]) {
              return { ...b, status: savedStatuses[b.id] as any };
            }
            return b;
          });
        }
      } catch (e) {
        console.error(e);
      }

      setBookings(rawList);
    } catch (err) {
      console.error(err);
      let localBookings: Booking[] = [];
      try {
        const localStr = localStorage.getItem('user_created_bookings');
        if (localStr) localBookings = JSON.parse(localStr);
      } catch (e) { console.error(e); }
      setBookings([...localBookings, ...MOCK_BOOKINGS]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt tour này?')) return;
    try {
      const res = await bookingService.cancelBooking(id);
      if (res.success) {
        alert('Hủy đơn đặt tour thành công');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể hủy đơn đặt tour');
    }
  };

  const statusBadges: Record<string, { label: string; style: string }> = {
    DEPOSITED: { label: 'Đã Cọc 30%', style: 'bg-amber-100 text-amber-800 border-amber-300' },
    PAID: { label: 'Đã Thanh Toán Full', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    COMPLETED: { label: 'Hoàn Thành Tour', style: 'bg-sky-100 text-sky-800 border-sky-300' },
    CANCELLED: { label: 'Đã Hủy Đơn', style: 'bg-rose-100 text-rose-800 border-rose-300' },
    PENDING: { label: 'Chờ Thanh Toán', style: 'bg-slate-100 text-slate-700 border-slate-300' },
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <History className="h-8 w-8 text-sky-600" /> Quản Lý Đơn Đặt Tour & Vé Điện Tử
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi trạng thái đơn hàng, nhận vé QR Code điện tử và lịch sử trải nghiệm du lịch.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-slate-200">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center bg-white text-slate-500 space-y-4">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <div className="text-base font-bold text-slate-800">Bạn chưa có đơn đặt tour nào</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Khám phá ngay hàng trăm tour du lịch hấp dẫn trong và ngoài nước.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const badge = statusBadges[b.status] || { label: b.status, style: 'bg-slate-100 text-slate-700' };
              return (
                <div 
                  key={b.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col md:flex-row"
                >
                  <div className="md:w-48 h-36 md:h-auto bg-slate-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={b.tourThumbnailUrl || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80'} 
                      alt={b.tourTitle} 
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          MÃ ĐƠN: {b.bookingCode}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 uppercase leading-snug">
                        {b.tourTitle}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
                        <div>Khởi hành: <strong className="text-sky-900 font-bold">{b.departureDate || '15-09-2026'}</strong></div>
                        <div>Số khách: <strong className="text-slate-900">{b.numberOfAdults} NL, {b.numberOfChildren} TE</strong></div>
                        <div>Tổng thanh toán: <strong className="text-rose-600 font-extrabold">{b.totalPrice?.toLocaleString('vi-VN')} đ</strong></div>
                        <div>Ngày đặt: <span className="text-slate-500">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</span></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="rounded-xl bg-sky-900 hover:bg-sky-950 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <QrCode className="h-4 w-4" /> Xem Vé QR Code
                        </button>

                        {b.status === 'COMPLETED' && (
                          <button
                            onClick={() => navigate(`/tours/${b.tourId || 6}?tab=reviews`)}
                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm animate-pulse"
                          >
                            <Star className="h-4 w-4 fill-white" /> Viết Đánh Giá
                          </button>
                        )}
                      </div>

                      {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 text-xs font-semibold transition flex items-center gap-1"
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

        {/* E-TICKET QR MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
                  <QrCode className="h-5 w-5" /> Vé Điện Tử E-Ticket
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
                  <img 
                    src={selectedTicket.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicket.bookingCode}`} 
                    alt="E-Ticket QR" 
                    className="h-48 w-48 rounded-xl mx-auto shadow-md"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500">MÃ VÉ ĐIỆN TỬ</div>
                  <div className="text-lg font-black font-mono text-sky-900">{selectedTicket.bookingCode}</div>
                </div>

                <div className="bg-sky-50 p-4 rounded-xl text-left text-xs text-slate-700 space-y-1.5 border border-sky-100">
                  <div className="font-bold text-slate-900 uppercase text-[11px] line-clamp-1">{selectedTicket.tourTitle}</div>
                  <div>Khách hàng: <strong className="text-slate-900">{selectedTicket.contactName}</strong></div>
                  <div>Khởi hành: <strong className="text-sky-900 font-bold">{selectedTicket.departureDate || '15-09-2026'}</strong></div>
                  <div>Số lượng: <strong className="text-slate-900">{selectedTicket.numberOfAdults} Người lớn, {selectedTicket.numberOfChildren} Trẻ em</strong></div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-xs font-bold hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
