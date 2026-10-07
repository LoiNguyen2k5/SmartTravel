import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag, Plus, User, Phone, TrendingUp, Users, Award, ArrowUpRight,
  ChevronRight, Eye, Edit, DollarSign, Clock, XCircle, CheckCircle2,
  BarChart3, Download, Filter, RefreshCw, AlertTriangle, Wallet, Info, Compass,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { bookingService } from '../../services/bookingService';
import { Tour } from '../../types/tour';
import { Booking } from '../../types/booking';

const COMMISSION_RATE = 0.10;
const PAYMENT_FEE_RATE = 0.015;

const fmt = (n: number) => n.toLocaleString('vi-VN');
const fmtM = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;

function getMonthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `Thg ${d.getMonth() + 1}`;
}

const STATUS_GROUPS = {
  confirmed: ['CONFIRMED', 'PAID', 'DA THANH TOAN', 'CONFIRMED_PAID'],
  pending: ['PENDING', 'AWAITING_PAYMENT', 'CHO THANH TOAN'],
  completed: ['COMPLETED', 'DA HOAN THANH', 'DONE'],
  cancelled: ['CANCELLED', 'REFUNDED', 'DA HUY', 'HOAN TIEN'],
};

function classifyStatus(status: string | undefined): keyof typeof STATUS_GROUPS {
  for (const [key, vals] of Object.entries(STATUS_GROUPS)) {
    if (vals.some((v) => (status || '').toUpperCase().includes(v.split(' ')[0]))) {
      return key as keyof typeof STATUS_GROUPS;
    }
  }
  return 'confirmed';
}

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <span className="relative group inline-flex items-center">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block w-52 rounded-xl bg-slate-900 text-white text-[11px] px-3 py-2 shadow-xl leading-relaxed pointer-events-none">
      {text}
    </span>
  </span>
);

export const VendorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMonths, setFilterMonths] = useState<number>(6);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const applyStatusOverrides = (list: Booking[]): Booking[] => {
    try {
      const saved = localStorage.getItem('vendor_booking_statuses');
      if (saved) {
        const map: Record<number, string> = JSON.parse(saved);
        return list.map((b) => (map[b.id] ? { ...b, status: map[b.id] as any } : b));
      }
    } catch (_) {}
    return list;
  };

  const fetchVendorData = async () => {
    setLoading(true);
    const savedUserStr = localStorage.getItem('user');
    const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
    const isDemoVendor = currentUser?.email === 'vendor@smarttravel.com';

    try {
      const [toursRes, bookingsRes] = await Promise.all([
        tourService.getMyTours(),
        bookingService.getVendorBookings(),
      ]);
      const loadedTours = toursRes.success && toursRes.data ? toursRes.data : [];
      setTours(loadedTours);
      const myTourIds = new Set(loadedTours.map((t) => t.id));

      let rawList: Booking[] = bookingsRes.success && bookingsRes.data?.length ? bookingsRes.data : [];
      if (!rawList.length && isDemoVendor) {
        const fb = await bookingService.getMyBookings();
        if (fb.success && fb.data) rawList = fb.data;
      }

      // Giới hạn chỉ hiển thị đơn đặt tour thuộc chính các tour do vendor này quản lý
      rawList = rawList.filter((b) => b.tourId && myTourIds.has(b.tourId));
      setBookings(applyStatusOverrides(rawList));
    } catch (err) {
      if (isDemoVendor) {
        try {
          const fb = await bookingService.getMyBookings();
          if (fb.success && fb.data) setBookings(applyStatusOverrides(fb.data));
        } catch (_) {}
      } else {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Vendor ID cố định cho demo (thực tế lấy từ auth context)
  const VENDOR_ID = 1;
  const SETTLED_VENDORS_KEY = 'smart_travel_settled_vendor_ids';

  const isAdminSettled = (): boolean => {
    try {
      const raw = localStorage.getItem(SETTLED_VENDORS_KEY);
      if (!raw) return false;
      const ids: number[] = JSON.parse(raw);
      return ids.includes(VENDOR_ID);
    } catch (_) { return false; }
  };

  useEffect(() => { fetchVendorData(); }, []);

  // Re-check settlement status khi tab được focus lại (admin vừa chi trả ở tab khác)
  useEffect(() => {
    const onFocus = () => fetchVendorData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const analytics = useMemo(() => {
    const confirmed = bookings.filter((b) => classifyStatus(b.status) === 'confirmed');
    const pending = bookings.filter((b) => classifyStatus(b.status) === 'pending');
    const completed = bookings.filter((b) => classifyStatus(b.status) === 'completed');
    const cancelled = bookings.filter((b) => classifyStatus(b.status) === 'cancelled');
    const grossRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const cancelledTotal = cancelled.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const netRevenue = grossRevenue - cancelledTotal;
    const commission = netRevenue * COMMISSION_RATE;
    const gatewayFee = netRevenue * PAYMENT_FEE_RATE;
    const netPayout = netRevenue - commission - gatewayFee;
    // Nếu admin đã quyết toán → pendingSettlement = 0
    const rawPendingSettlement = completed.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const pendingSettlement = isAdminSettled() ? 0 : rawPendingSettlement;
    const adminSettled = isAdminSettled();
    const paidCount = confirmed.length + completed.length;
    const aov = paidCount > 0 ? netRevenue / paidCount : 0;
    const cancellationRate = bookings.length > 0 ? (cancelled.length / bookings.length) * 100 : 0;
    const totalGuests = bookings.reduce((s, b) => s + (b.numberOfAdults || 0) + (b.numberOfChildren || 0), 0);
    return { grossRevenue, netRevenue, commission, gatewayFee, netPayout, pendingSettlement, adminSettled, aov, cancellationRate, totalGuests, counts: { confirmed: confirmed.length, pending: pending.length, completed: completed.length, cancelled: cancelled.length, total: bookings.length } };
  }, [bookings]);

  const chartData = useMemo(() => {
    return Array.from({ length: filterMonths }, (_, i) => {
      const offset = filterMonths - 1 - i;
      const d = new Date();
      d.setMonth(d.getMonth() - offset);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      const monthBookings = bookings.filter((b) => {
        if (!b.createdAt) return false;
        const bd = new Date(b.createdAt);
        return bd.getMonth() === targetMonth && bd.getFullYear() === targetYear;
      });
      const settled = monthBookings.filter((b) => classifyStatus(b.status) === 'completed').reduce((s, b) => s + (b.totalPrice || 0), 0);
      const pendingRev = monthBookings.filter((b) => ['confirmed', 'pending'].includes(classifyStatus(b.status))).reduce((s, b) => s + (b.totalPrice || 0), 0);
      return { month: getMonthLabel(offset), settled, pending: pendingRev, total: settled + pendingRev, bookingCount: monthBookings.length, guestCount: monthBookings.reduce((s, b) => s + (b.numberOfAdults || 0) + (b.numberOfChildren || 0), 0), netRev: (settled + pendingRev) * (1 - COMMISSION_RATE - PAYMENT_FEE_RATE) };
    });
  }, [bookings, filterMonths]);

  const mockBase = [8200000, 14500000, 22800000, 31000000, 38500000, 42000000, 35000000, 27000000, 44000000, 51000000, 39000000, 47000000];
  const chartDataFinal = useMemo(() => {
    const hasReal = chartData.some((d) => d.total > 0);
    if (hasReal) return chartData;
    const savedUserStr = localStorage.getItem('user');
    const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
    const isDemoVendor = currentUser?.email === 'vendor@smarttravel.com';
    if (!isDemoVendor) return chartData; // New vendors start with clean 0 chart
    return chartData.map((d, i) => ({ ...d, settled: Math.round(mockBase[i % 12] * 0.55), pending: Math.round(mockBase[i % 12] * 0.45), total: mockBase[i % 12], bookingCount: Math.round(2 + i * 1.5), guestCount: Math.round(8 + i * 5), netRev: Math.round(mockBase[i % 12] * (1 - COMMISSION_RATE - PAYMENT_FEE_RATE)) }));
  }, [chartData]);

  const maxChartVal = Math.max(...chartDataFinal.map((d) => d.total), 1);
  const filteredBookings = useMemo(() => filterStatus === 'ALL' ? bookings : bookings.filter((b) => classifyStatus(b.status) === filterStatus), [bookings, filterStatus]);

  const exportCSV = () => {
    const headers = ['Ma dat tour', 'Tour', 'Khach', 'SDT', 'Tong tien', 'Trang thai', 'Ngay dat'];
    const rows = bookings.map((b) => [b.bookingCode || b.id, b.tourTitle || '', b.contactName || b.userName || '', b.contactPhone || '', b.totalPrice || 0, b.status || '', b.createdAt || '']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string | undefined) => {
    const key = classifyStatus(status);
    const configs = { confirmed: { cls: 'bg-sky-100 text-sky-700', label: 'Xác nhận' }, pending: { cls: 'bg-amber-100 text-amber-700', label: 'Chờ thanh toán' }, completed: { cls: 'bg-emerald-100 text-emerald-700', label: 'Hoàn thành' }, cancelled: { cls: 'bg-rose-100 text-rose-700', label: 'Đã hủy' } };
    const c = configs[key];
    return <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${c.cls}`}>{status || c.label}</span>;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Vendor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Báo cáo tài chính · Quản lý tour · Đối soát doanh thu</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Download className="h-4 w-4" /> Xuất CSV
          </button>
          <button onClick={fetchVendorData} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link to="/vendor/tours/create" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-900/20">
            <Plus className="h-4 w-4" /> Thêm Tour Mới
          </Link>
        </div>
      </div>

      {/* Welcome Banner for brand new Vendor */}
      {!loading && tours.length === 0 && bookings.length === 0 && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Chào mừng Đối tác Nhà Cung Cấp mới!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tài khoản của bạn đã được phê duyệt thành công. Dữ liệu hiện đang trống vì bạn chưa đăng tải hành trình nào. Hãy tạo tour đầu tiên để bắt đầu kinh doanh!
              </p>
            </div>
          </div>
          <Link
            to="/vendor/tours/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 shadow-md shadow-emerald-900/20 transition whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Đăng Tour Đầu Tiên
          </Link>
        </div>
      )}

      {/* Revenue 4 cards */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Phân Tích Doanh Thu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700"><DollarSign className="h-5 w-5" /></div>
              <Tooltip text="Tổng tiền khách thanh toán cho mọi đơn, kể cả đơn đã hủy. Chưa trừ hoàn tiền hay phí.">
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doanh Thu Gộp</p>
            <p className="text-[10px] text-slate-400 mb-1">(Gross Revenue)</p>
            <h3 className="text-xl font-black text-slate-900">{analytics.grossRevenue > 0 ? `${fmtM(analytics.grossRevenue)} đ` : '0 đ'}</h3>
            {analytics.grossRevenue > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 mt-1"><ArrowUpRight className="h-3 w-3" /> +18.4% tháng trước</span>
            ) : (
              <span className="text-[11px] text-slate-400 mt-1">Chưa có doanh thu</span>
            )}
          </div>

          {/* Net Revenue */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700"><TrendingUp className="h-5 w-5" /></div>
              <Tooltip text="Doanh thu sau khi trừ các đơn hủy và đơn hoàn tiền. = Gross - Cancelled.">
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doanh Thu Ròng</p>
            <p className="text-[10px] text-slate-400 mb-1">(Net Revenue)</p>
            <h3 className="text-xl font-black text-slate-900">{analytics.netRevenue > 0 ? `${fmtM(analytics.netRevenue)} đ` : '0 đ'}</h3>
            <span className="text-[11px] text-slate-400">Sau trừ {analytics.counts.cancelled} đơn hủy</span>
          </div>

          {/* Net Payout */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700"><Wallet className="h-5 w-5" /></div>
              <Tooltip text={`Số tiền vendor thực nhận = Net Revenue − hoa hồng platform (${COMMISSION_RATE * 100}%) − phí cổng thanh toán (${PAYMENT_FEE_RATE * 100}%).`}>
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Thực Nhận</p>
            <p className="text-[10px] text-slate-400 mb-1">(Net Payout)</p>
            <h3 className="text-xl font-black text-slate-900">{analytics.netPayout > 0 ? `${fmtM(analytics.netPayout)} đ` : '0 đ'}</h3>
            <div className="text-[11px] text-slate-500 space-y-0.5 mt-1">
              <div>Hoa hồng {COMMISSION_RATE * 100}%: <span className="text-rose-500">−{analytics.commission > 0 ? fmtM(analytics.commission) : '0'} đ</span></div>
              <div>Phí GW {PAYMENT_FEE_RATE * 100}%: <span className="text-rose-500">−{analytics.gatewayFee > 0 ? fmtM(analytics.gatewayFee) : '0'} đ</span></div>
            </div>
          </div>

          {/* Pending Settlement — amber khi còn tiền chờ, trắng khi đã đối soát xong */}
          <div className={`rounded-3xl border p-5 shadow-sm transition-colors duration-500 ${
            analytics.pendingSettlement > 0
              ? 'border-amber-200 bg-amber-50'
              : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`rounded-2xl p-2.5 transition-colors duration-500 ${
                analytics.pendingSettlement > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}><Clock className="h-5 w-5" /></div>
              <Tooltip text="Đơn đã hoàn thành tour nhưng platform chưa chuyển tiền về tài khoản vendor. Sẽ đối soát định kỳ.">
                <Info className={`h-3.5 w-3.5 cursor-help ${analytics.pendingSettlement > 0 ? 'text-amber-400' : 'text-slate-300'}`} />
              </Tooltip>
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${
              analytics.pendingSettlement > 0 ? 'text-amber-700' : 'text-slate-500'
            }`}>Chờ Đối Soát</p>
            <p className={`text-[10px] mb-1 ${analytics.pendingSettlement > 0 ? 'text-amber-600' : 'text-slate-400'}`}>(Pending Settlement)</p>
            <h3 className={`text-xl font-black ${
              analytics.pendingSettlement > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}>{analytics.pendingSettlement > 0 ? `${fmtM(analytics.pendingSettlement)} đ` : '0 đ'}</h3>
            <span className={`text-[11px] font-medium ${
              analytics.pendingSettlement > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {analytics.pendingSettlement > 0
                ? `${analytics.counts.completed} tour chờ đối soát`
                : '✓ Đã đối soát toàn bộ'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Secondary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Booking split */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600"><ShoppingBag className="h-4 w-4" /></div>
            <p className="text-xs font-bold text-slate-500 uppercase">Đơn Đặt Tour</p>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-2">{analytics.counts.total}</p>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between"><span className="flex items-center gap-1 text-sky-600"><CheckCircle2 className="h-3 w-3" /> Xác nhận</span><span className="font-bold">{analytics.counts.confirmed}</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1 text-amber-600"><Clock className="h-3 w-3" /> Chờ TT</span><span className="font-bold">{analytics.counts.pending}</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1 text-emerald-600"><Award className="h-3 w-3" /> Hoàn thành</span><span className="font-bold">{analytics.counts.completed}</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3 w-3" /> Đã hủy</span><span className="font-bold">{analytics.counts.cancelled}</span></div>
          </div>
        </div>

        {/* AOV */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700"><BarChart3 className="h-4 w-4" /></div>
            <Tooltip text="Average Order Value = Doanh thu ròng / Số đơn thanh toán thành công. Giá trị trung bình mỗi booking.">
              <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">AOV</p>
          <p className="text-[10px] text-slate-400 mb-2">Avg Order Value</p>
          <p className="text-2xl font-black text-slate-900">{analytics.aov > 0 ? `${fmtM(analytics.aov)} đ` : '0 đ'}</p>
          <p className="text-[11px] text-slate-400 mt-1">/ đơn đặt</p>
        </div>

        {/* Cancellation */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600"><AlertTriangle className="h-4 w-4" /></div>
            <Tooltip text="Tỷ lệ hủy = Số đơn hủy / Tổng đơn. Ngành tour tỷ lệ lý tưởng < 5%.">
              <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Tỷ Lệ Hủy</p>
          <p className="text-[10px] text-slate-400 mb-2">Cancellation Rate</p>
          <p className={`text-2xl font-black ${analytics.cancellationRate > 10 ? 'text-rose-600' : 'text-slate-900'}`}>{analytics.cancellationRate > 0 ? analytics.cancellationRate.toFixed(1) : '0'}%</p>
          <p className={`text-[11px] mt-1 font-bold ${analytics.cancellationRate > 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {analytics.counts.total > 0 ? (analytics.cancellationRate > 10 ? '⚠ Cần theo dõi' : '✓ Trong ngưỡng tốt') : 'Chưa có đơn hàng'}
          </p>
        </div>

        {/* Guests */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-teal-100 p-2 text-teal-700"><Users className="h-4 w-4" /></div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tổng Khách</p>
          <p className="text-2xl font-black text-slate-900">{analytics.totalGuests}</p>
          <p className="text-[11px] text-slate-400 mt-1">du khách đã trải nghiệm</p>
          <div className="mt-2 h-1.5 rounded-full bg-teal-100 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (analytics.totalGuests / 200) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Chart + Top Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Biểu Đồ Doanh Thu Theo Tháng</h3>
              <p className="text-xs text-slate-500">Tính theo ngày đặt đơn (booking date). Màu đậm = đã đối soát · Màu nhạt = chờ đối soát</p>
            </div>
            <select value={filterMonths} onChange={(e) => setFilterMonths(Number(e.target.value))} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value={3}>3 tháng</option>
              <option value={6}>6 tháng</option>
              <option value={12}>12 tháng</option>
            </select>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded bg-emerald-600" /> Đã đối soát</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded border-2 border-dashed border-teal-400 bg-teal-100" /> Chờ đối soát</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-2 px-1">
            {chartDataFinal.map((item, i) => {
              const totalH = Math.round((item.total / maxChartVal) * 100);
              const settledH = item.total > 0 ? Math.round((item.settled / item.total) * totalH) : 0;
              const pendH = totalH - settledH;
              const isHov = hoveredBar === i;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  <div className={`transition-all duration-150 ${isHov ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} text-[10px] font-bold text-slate-700 bg-white border border-slate-200 shadow-xl rounded-xl px-2 py-1.5 whitespace-nowrap text-center`}>
                    <div className="font-black text-slate-900">{fmtM(item.total)} đ</div>
                    <div className="text-emerald-600">Ròng: {fmtM(item.netRev)} đ</div>
                    <div className="text-slate-500">{item.bookingCount} đơn · {item.guestCount} khách</div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-2xl h-40 flex flex-col justify-end overflow-hidden p-0.5 gap-0.5">
                    <div className="w-full rounded-t-xl border-2 border-dashed border-teal-400 bg-teal-100 transition-all duration-500" style={{ height: `${pendH}%`, minHeight: pendH > 0 ? 4 : 0 }} />
                    <div className="w-full rounded-b-xl bg-gradient-to-t from-emerald-700 to-emerald-500 transition-all duration-500" style={{ height: `${settledH}%`, minHeight: settledH > 0 ? 4 : 0 }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tours */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">Tour Bán Chạy</h3>
            <Link to="/vendor/tours" className="text-xs font-bold text-emerald-600 hover:underline">Xem tất cả</Link>
          </div>
          {tours.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Chưa có tour nào</p>
          ) : (
            <div className="space-y-4">
              {tours.slice(0, 4).map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-orange-100 text-orange-700'}`}>{idx + 1}</span>
                    <img src={t.thumbnailUrl} alt={t.title} className="h-9 w-12 object-cover rounded-lg border flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{fmt(t.price)} đ</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md flex-shrink-0">HOT</span>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Thông số nền tảng</p>
            <div className="flex justify-between"><span>Hoa hồng platform</span><span className="font-bold text-rose-600">{COMMISSION_RATE * 100}%</span></div>
            <div className="flex justify-between"><span>Phí cổng thanh toán</span><span className="font-bold text-rose-600">{PAYMENT_FEE_RATE * 100}%</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-1 mt-1"><span>Vendor giữ lại</span><span className="font-black text-emerald-600">{((1 - COMMISSION_RATE - PAYMENT_FEE_RATE) * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Đơn Đặt Tour Gần Đây</h2>
            <p className="text-xs text-slate-500">Lọc theo trạng thái để phân tích từng nhóm</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            {(['ALL', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((s) => {
              const labels: Record<string, string> = { ALL: 'Tất cả', confirmed: 'Xác nhận', pending: 'Chờ TT', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
              return (
                <button key={s} onClick={() => setFilterStatus(s)} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{labels[s]}</button>
              );
            })}
            <Link to="/vendor/bookings" className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 ml-1">Tất cả <ChevronRight className="h-4 w-4" /></Link>
          </div>
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Không có đơn nào trong nhóm này.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.slice(0, 6).map((b) => (
              <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img src={b.tourThumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=200&q=80'} alt={b.tourTitle} className="h-14 w-20 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">{b.bookingCode}</span>
                      {statusBadge(b.status)}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{b.tourTitle}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.contactName || b.userName}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{b.contactPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-[11px] text-slate-400">{b.numberOfAdults} người lớn{b.numberOfChildren ? ` · ${b.numberOfChildren} trẻ em` : ''}</div>
                  <div className="text-sm font-black text-rose-600">{fmt(b.totalPrice || 0)} đ</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Ròng: {fmt(Math.round((b.totalPrice || 0) * (1 - COMMISSION_RATE - PAYMENT_FEE_RATE)))} đ</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tour list */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-slate-900 text-base">Danh Sách Tour Của Bạn</h2>
          <span className="text-xs font-semibold text-slate-500">Tổng: {tours.length} tour</span>
        </div>
        {tours.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Chưa có tour. Bấm "Thêm Tour Mới" để bắt đầu!</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tours.map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={t.thumbnailUrl} alt={t.title} className="h-12 w-16 object-cover rounded-xl border border-slate-200" />
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 line-clamp-1">{t.title}</div>
                    <div className="text-[11px] text-slate-500">Mã: {t.tourCode} · Giá: <strong className="text-rose-600">{fmt(t.price)} đ</strong></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/vendor/tours/${t.id}/edit`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"><Edit className="h-3.5 w-3.5" /> Chỉnh sửa</button>
                  <button onClick={() => navigate(`/tours/${t.id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition"><Eye className="h-3.5 w-3.5" /> Xem</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shortcut đến trang Quản lý Visa */}
      <Link
        to="/vendor/visas"
        className="flex items-center justify-between rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 p-5 shadow-sm hover:from-sky-500/20 hover:to-indigo-500/20 transition-all group"
      >
        <div className="flex items-center gap-4">
          <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌐</span>
          </span>
          <div>
            <p className="font-black text-white text-base">Quản Lý Thủ Tục Visa</p>
            <p className="text-sm text-slate-400 mt-0.5">Thẩm định hồ sơ, duyệt giấy tờ và quản lý mẫu visa theo quốc gia</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};
