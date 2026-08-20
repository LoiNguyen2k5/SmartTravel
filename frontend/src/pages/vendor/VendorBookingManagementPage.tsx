import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  QrCode, 
  Search, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';

export const VendorBookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // QR Check-in verification modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);

  // Refund Modal State
  const [selectedRefundBooking, setSelectedRefundBooking] = useState<Booking | null>(null);
  const [refundPercent, setRefundPercent] = useState<number>(100);
  const [refundNote, setRefundNote] = useState<string>('');
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const applyStatusOverrides = (bookingList: Booking[]): Booking[] => {
    try {
      const savedStatusesStr = localStorage.getItem('vendor_booking_statuses');
      if (savedStatusesStr) {
        const savedStatuses: Record<number, string> = JSON.parse(savedStatusesStr);
        return bookingList.map((b) => {
          if (savedStatuses[b.id]) {
            return { ...b, status: savedStatuses[b.id] as any };
          }
          return b;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return bookingList;
  };

  const fetchBookings = async () => {
    setLoading(true);
    let userBookings: Booking[] = [];
    try {
      const userCreatedStr = localStorage.getItem('user_created_bookings');
      if (userCreatedStr) userBookings = JSON.parse(userCreatedStr);
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await bookingService.getVendorBookings();
      let rawList: Booking[] = (res.success && res.data && res.data.length > 0) ? res.data : [];
      if (rawList.length === 0) {
        const fallbackRes = await bookingService.getMyBookings();
        if (fallbackRes.success && fallbackRes.data) {
          rawList = fallbackRes.data;
        }
      }
      const combined = [...userBookings, ...rawList];
      setBookings(applyStatusOverrides(combined));
    } catch (err) {
      console.error('Lỗi khi tải đơn đặt tour, thử fallback getMyBookings:', err);
      let fallbackList: Booking[] = [];
      try {
        const fallbackRes = await bookingService.getMyBookings();
        if (fallbackRes.success && fallbackRes.data) {
          fallbackList = fallbackRes.data;
        }
      } catch (e) {
        console.error('Fallback failed:', e);
      }
      const combined = [...userBookings, ...fallbackList];
      setBookings(applyStatusOverrides(combined));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: any) => {
    // 1. Update local state
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    // 2. Persist in localStorage so it stays across logouts/logins
    try {
      const savedStatusesStr = localStorage.getItem('vendor_booking_statuses');
      const savedStatuses: Record<number, string> = savedStatusesStr ? JSON.parse(savedStatusesStr) : {};
      savedStatuses[bookingId] = newStatus;
      localStorage.setItem('vendor_booking_statuses', JSON.stringify(savedStatuses));
    } catch (e) {
      console.error('Lỗi lưu localStorage:', e);
    }

    // 3. Persist to MySQL Backend API
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
    } catch (err) {
      console.error('Lỗi khi gửi API cập nhật trạng thái:', err);
    }
  };

  const handleVerifyQrCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);

    const cleanInput = qrCodeInput.trim().toUpperCase();
    if (!cleanInput) return;

    // Search booking matching code or contained in QR payload
    const found = bookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === cleanInput ||
        cleanInput.includes(b.bookingCode.toUpperCase())
    );

    if (found) {
      if (found.status === 'CANCELLED') {
        setVerificationResult({
          success: false,
          message: `CẢNH BÁO: Đơn hàng '${found.bookingCode}' đã bị HỦY / HOÀN TIỀN. Vui lòng không cho du khách làm thủ tục Check-in!`,
          booking: found,
        });
        return;
      }

      if (found.status === 'COMPLETED') {
        setVerificationResult({
          success: true,
          message: `Đơn hàng '${found.bookingCode}' đã được Check-in thành công trước đó (Vé đã dùng).`,
          booking: found,
        });
        return;
      }

      // Automatically mark as COMPLETED upon valid check-in
      handleUpdateStatus(found.id, 'COMPLETED');
      setVerificationResult({
        success: true,
        message: `Xác nhận Check-in thành công! Khách hàng ${found.contactName || found.userName} đã hoàn thành thủ tục lên tour.`,
        booking: found,
      });
    } else {
      setVerificationResult({
        success: false,
        message: `Mã vé / QR Code '${cleanInput}' không tồn tại hoặc không thuộc quản lý của bạn.`,
      });
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      filterStatus === 'ALL' ||
      b.status === filterStatus ||
      (filterStatus === 'CANCELLED' && (b.status as string) === 'REFUNDED');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.bookingCode.toLowerCase().includes(q) ||
      (b.contactName && b.contactName.toLowerCase().includes(q)) ||
      (b.contactPhone && b.contactPhone.toLowerCase().includes(q)) ||
      (b.tourTitle && b.tourTitle.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-emerald-600" /> Quản Lý Đơn Đặt Tour & QR Check-in
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tiếp nhận danh sách khách đặt, kiểm tra mã QR vé điện tử khi khách check-in và xử lý đơn hủy
          </p>
        </div>

        <button
          onClick={() => {
            setShowQrModal(true);
            setVerificationResult(null);
            setQrCodeInput('');
          }}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition"
        >
          <QrCode className="h-4 w-4 text-emerald-400" /> Kiểm Tra Mã QR Check-in
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Tất cả đơn' },
            { id: 'PAID', label: 'Đã thanh toán' },
            { id: 'COMPLETED', label: 'Đã hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy / Hoàn tiền' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, khách, SĐT..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 focus:outline-none bg-slate-50"
          />
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base">Danh Sách Đơn Đặt Tour ({filteredBookings.length})</h3>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Không tìm thấy đơn đặt tour nào phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((b) => (
              <div key={b.id} className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Tour & Customer info */}
                <div className="flex items-start gap-4">
                  <img
                    src={b.tourThumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=200&q=80'}
                    alt={b.tourTitle}
                    className="h-20 w-24 object-cover rounded-2xl border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg tracking-wider">
                        {b.bookingCode}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg ${
                          b.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-700'
                            : (b.status as string) === 'REFUNDED'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {b.status === 'PAID'
                          ? 'ĐÃ THANH TOÁN'
                          : b.status === 'COMPLETED'
                          ? 'ĐÃ HOÀN THÀNH'
                          : b.status === 'CANCELLED'
                          ? 'ĐÃ HỦY (CHỜ HOÀN TIỀN)'
                          : (b.status as string) === 'REFUNDED'
                          ? 'ĐÃ HOÀN TIỀN'
                          : 'CHỜ XỬ LÝ'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">{b.tourTitle}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" /> {b.contactName || b.userName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {b.contactPhone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {b.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Status Action buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-500 font-semibold">
                      {b.numberOfAdults} người lớn{b.numberOfChildren ? `, ${b.numberOfChildren} trẻ em` : ''}
                    </div>
                    <div className="text-base font-black text-rose-600">
                      {(b.totalPrice || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {b.status === 'PAID' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
                        title="Xác nhận khách đã đi tour"
                      >
                        <Check className="h-3.5 w-3.5" /> Hoàn thành
                      </button>
                    )}

                    {b.status === 'CANCELLED' && (
                      <button
                        onClick={() => {
                          setSelectedRefundBooking(b);
                          setRefundPercent(100);
                          setRefundSuccessMsg(null);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 text-white px-3 py-2 text-xs font-bold hover:bg-rose-500 transition shadow-sm"
                        title="Xử lý hoàn tiền cho khách"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Xử Lý Hoàn Tiền
                      </button>
                    )}

                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (b.status as string) !== 'REFUNDED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                        className="flex items-center gap-1 rounded-xl bg-slate-100 text-rose-600 px-3 py-2 text-xs font-bold hover:bg-rose-50 transition"
                        title="Duyệt hủy tour"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Duyệt Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR CODE CHECK-IN MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <QrCode className="h-6 w-6 text-emerald-600" /> Kiểm Tra Vé QR Check-in
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyQrCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nhập Mã Booking hoặc Quét Nội dung QR Code *
                </label>
                <input
                  type="text"
                  required
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  placeholder="VD: BK-A1B2C3D4 hoặc SMARTTRAVEL-E-TICKET|BK-..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
              >
                <CheckCircle className="h-4 w-4" /> Xác Nhận Du Khách Check-in
              </button>
            </form>

            {/* Verification Alert Result */}
            {verificationResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold space-y-2 ${
                  verificationResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm">
                  {verificationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  )}
                  {verificationResult.success ? 'CHECK-IN THÀNH CÔNG' : 'XÁC NHẬN THẤT BẠI'}
                </div>
                <p>{verificationResult.message}</p>

                {verificationResult.booking && (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] space-y-0.5 text-slate-700 font-semibold">
                    <p>Tour: <strong>{verificationResult.booking.tourTitle}</strong></p>
                    <p>Khách hàng: <strong>{verificationResult.booking.contactName} ({verificationResult.booking.contactPhone})</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REFUND PROCESS MODAL */}
      {selectedRefundBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                <RefreshCw className="h-5 w-5 text-rose-600" /> Quy Trình Xử Lý Hoàn Tiền
              </div>
              <button
                onClick={() => setSelectedRefundBooking(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 space-y-1.5 text-xs text-rose-900">
              <p className="font-extrabold text-sm text-rose-800">
                Đơn hàng: {selectedRefundBooking.bookingCode}
              </p>
              <p className="font-medium">
                Tour: <strong>{selectedRefundBooking.tourTitle}</strong>
              </p>
              <p className="font-medium">
                Khách hàng: <strong>{selectedRefundBooking.contactName || selectedRefundBooking.userName}</strong> ({selectedRefundBooking.contactPhone})
              </p>
              <p className="font-extrabold text-base text-slate-900 pt-1">
                Tổng giá trị đơn: <span className="text-rose-600">{(selectedRefundBooking.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
              </p>
            </div>

            {/* Select Refund Percentage based on cancellation policy */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">
                Chọn Chính Sách / Tỷ Lệ Hoàn Tiền:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { percent: 100, label: '100% (Trước >30d)', desc: 'Miễn phí hủy' },
                  { percent: 50, label: '50% (Trước 15-29d)', desc: 'Phạt 50%' },
                  { percent: 0, label: '0% (Trong 7d)', desc: 'Không hoàn tiền' },
                ].map((item) => (
                  <button
                    key={item.percent}
                    type="button"
                    onClick={() => setRefundPercent(item.percent)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      refundPercent === item.percent
                        ? 'border-rose-600 bg-rose-50/50 text-rose-700 font-extrabold shadow-sm'
                        : 'border-slate-200 text-slate-600 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Refund Amount */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Số tiền hoàn trả du khách</span>
                <div className="text-2xl font-black text-emerald-400">
                  {Math.round(((selectedRefundBooking.totalPrice || 0) * refundPercent) / 100).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl">
                {refundPercent}% Giá trị
              </span>
            </div>

            {refundSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                {refundSuccessMsg}
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRefundBooking(null)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedRefundBooking.id, 'REFUNDED' as any);
                    setRefundSuccessMsg(
                      `Đã xác nhận hoàn tiền thành công ${Math.round(
                        ((selectedRefundBooking.totalPrice || 0) * refundPercent) / 100
                      ).toLocaleString('vi-VN')} đ cho khách hàng!`
                    );
                    setTimeout(() => {
                      setSelectedRefundBooking(null);
                      setRefundSuccessMsg(null);
                    }, 2000);
                  }}
                  className="w-2/3 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-900/20 hover:bg-rose-500 transition"
                >
                  Xác Nhận Đã Chuyển Tiền Hoàn
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
