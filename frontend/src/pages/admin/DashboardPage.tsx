import React, { useEffect, useState } from 'react';
import {
  Users,
  Compass,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Percent,
  XCircle,
  BarChart3,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types/admin';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

// ─── Constants (đồng bộ với VendorDashboard & TransactionSettlementPage) ──────
const PLATFORM_COMMISSION = 0.10; // 10% hoa hồng sàn
const GATEWAY_FEE = 0.015;        // 1.5% phí cổng TT
const SETTLED_VENDORS_KEY = 'smart_travel_settled_vendor_ids';

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <span className="relative group inline-flex items-center">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block w-56 rounded-xl bg-slate-900 text-white text-[11px] px-3 py-2 shadow-xl leading-relaxed pointer-events-none">
      {text}
    </span>
  </span>
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, forceUpdate] = useState(0); // để re-render khi settlement thay đổi

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats();
      if (res.data) setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Lắng nghe storage event để sync khi TransactionSettlementPage cập nhật
    const onStorage = () => forceUpdate(n => n + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Tính toán tài chính từ stats ────────────────────────────────────────────
  const grossRevenue = stats?.totalGrossRevenue || 0;
  const platformCommission = stats?.totalPlatformCommission || (grossRevenue * PLATFORM_COMMISSION);
  const totalNetPayout = grossRevenue - platformCommission - (grossRevenue * GATEWAY_FEE);
  const successfulBookings = stats?.successfulBookings || 0;
  const aov = successfulBookings > 0 ? grossRevenue / successfulBookings : 0;

  // ── Trạng thái đối soát: đọc localStorage chung với TransactionSettlementPage
  const getSettledIds = (): number[] => {
    try { return JSON.parse(localStorage.getItem(SETTLED_VENDORS_KEY) || '[]'); }
    catch (_) { return []; }
  };
  const settledIds = getSettledIds();
  const totalVendors = stats?.totalVendors || 0;
  const settledCount = Math.min(settledIds.length, totalVendors);
  const allSettled = totalVendors > 0 && settledCount >= totalVendors;
  const pendingVendors = Math.max(0, totalVendors - settledCount);

  // ── Monthly chart ────────────────────────────────────────────────────────────
  const monthlyEntries = stats?.monthlyRevenue ? Object.entries(stats.monthlyRevenue) : [];
  const maxMonthlyRevenue = monthlyEntries.length > 0
    ? Math.max(...monthlyEntries.map(([, val]) => Number(val) || 0), 1)
    : 1;

  if (loading && !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-sm font-medium text-slate-500">Đang tổng hợp dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-8 w-8 text-sky-600" />
            Tổng Quan Hệ Thống (Admin Dashboard)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Giám sát thời gian thực toàn bộ hoạt động kinh doanh, người dùng và đối tác trên sàn SmartTravel
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Làm mới số liệu
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── PHÂN TÍCH DOANH THU (góc nhìn Admin — đồng bộ với VendorDashboard) ── */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Phân Tích Doanh Thu Toàn Sàn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 1. Doanh Thu Gộp (GMV) */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700"><DollarSign className="h-5 w-5" /></div>
              <Tooltip text="Gross Merchandise Value = Tổng tiền khách thanh toán cho tất cả đơn (kể cả đơn hủy). Đây là chỉ số quy mô toàn sàn.">
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doanh Thu Gộp (GMV)</p>
            <p className="text-[10px] text-slate-400 mb-1">Gross Merchandise Value</p>
            <h3 className="text-xl font-black text-slate-900">{formatCurrency(grossRevenue)}</h3>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" /> {successfulBookings} đơn hoàn tất
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-sky-50 opacity-60 pointer-events-none" />
          </div>

          {/* 2. Hoa Hồng Sàn */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-600"><Percent className="h-5 w-5" /></div>
              <Tooltip text={`Doanh thu thực của nền tảng = ${PLATFORM_COMMISSION * 100}% hoa hồng + ${GATEWAY_FEE * 100}% phí cổng thanh toán (GW).`}>
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoa Hồng Sàn</p>
            <p className="text-[10px] text-slate-400 mb-1">Platform Commission ({PLATFORM_COMMISSION * 100}%)</p>
            <h3 className="text-xl font-black text-amber-600">{formatCurrency(platformCommission)}</h3>
            <div className="mt-1 text-[11px] text-slate-400">Doanh thu phí dịch vụ nền tảng</div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-50 opacity-60 pointer-events-none" />
          </div>

          {/* 3. Tổng Chi Trả Cho Vendor */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-600"><ArrowDownRight className="h-5 w-5" /></div>
              <Tooltip text={`Số tiền platform cần chuyển cho vendor = GMV − ${PLATFORM_COMMISSION * 100}% hoa hồng − ${GATEWAY_FEE * 100}% phí GW.`}>
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chi Trả Cho Vendor</p>
            <p className="text-[10px] text-slate-400 mb-1">Total Net Payout</p>
            <h3 className="text-xl font-black text-indigo-700">{formatCurrency(totalNetPayout)}</h3>
            <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
              <div>Hoa hồng {PLATFORM_COMMISSION * 100}%: <span className="text-amber-500">−{formatCurrency(platformCommission)}</span></div>
              <div>Phí GW {GATEWAY_FEE * 100}%: <span className="text-amber-500">−{formatCurrency(grossRevenue * GATEWAY_FEE)}</span></div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-50 opacity-60 pointer-events-none" />
          </div>

          {/* 4. Trạng thái Đối Soát — đồng bộ localStorage với TransactionSettlementPage */}
          <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm hover:shadow-md transition-colors duration-500 ${
            allSettled ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`rounded-2xl p-2.5 transition-colors duration-500 ${
                allSettled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}><Wallet className="h-5 w-5" /></div>
              <Tooltip text="Số vendor chưa được chi trả doanh thu. Thực hiện quyết toán tại trang Giao Dịch & Đối Soát.">
                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${allSettled ? 'text-slate-500' : 'text-amber-700'}`}>
              Đối Soát Vendor
            </p>
            <p className={`text-[10px] mb-1 ${allSettled ? 'text-slate-400' : 'text-amber-600'}`}>(Settlement Status)</p>
            <h3 className={`text-xl font-black ${allSettled ? 'text-slate-900' : 'text-amber-800'}`}>
              {allSettled ? 'Hoàn tất' : `${pendingVendors} vendor`}
            </h3>
            <div className={`text-[11px] font-medium mt-1 ${allSettled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {allSettled
                ? '✓ Tất cả đã được quyết toán'
                : `Chờ chi trả · ${settledCount}/${totalVendors} đã xong`}
            </div>
            {!allSettled && (
              <Link to="/admin/settlements" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline">
                Đối soát ngay <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-50 opacity-60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── KPI PHỤ ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Đơn đặt tour — split trạng thái */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600"><ShoppingBag className="h-4 w-4" /></div>
            <p className="text-xs font-bold text-slate-500 uppercase">Đơn Đặt Tour</p>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-2">{stats?.totalBookings || 0}</p>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Hoàn thành</span>
              <span className="font-bold">{successfulBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-amber-600"><Clock className="h-3 w-3" /> Chờ xử lý</span>
              <span className="font-bold">{Math.max(0, (stats?.totalBookings || 0) - successfulBookings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3 w-3" /> Đã hủy</span>
              <span className="font-bold">—</span>
            </div>
          </div>
        </div>

        {/* AOV */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700"><BarChart3 className="h-4 w-4" /></div>
            <Tooltip text="Average Order Value = Tổng doanh thu / Số đơn thành công. Giá trị trung bình mỗi booking toàn sàn.">
              <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">AOV Toàn Sàn</p>
          <p className="text-[10px] text-slate-400 mb-2">Avg Order Value</p>
          <p className="text-2xl font-black text-slate-900">{aov > 0 ? `${(aov / 1_000_000).toFixed(1)}M` : '—'} đ</p>
          <p className="text-[11px] text-slate-400 mt-1">/ đơn đặt thành công</p>
        </div>

        {/* Người dùng */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700"><Users className="h-4 w-4" /></div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Người Dùng</p>
          <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
            <div className="flex items-center gap-1 text-sky-600"><Building2 className="h-3 w-3" /> {stats?.totalVendors || 0} Vendor</div>
            <div>{stats?.totalCustomers || 0} Khách hàng</div>
          </div>
        </div>

        {/* Tour */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600"><Compass className="h-4 w-4" /></div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tour Du Lịch</p>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalActiveTours || 0} <span className="text-sm font-normal text-slate-400">đang chạy</span>
          </p>
          <div className="mt-1">
            {Number(stats?.totalPendingTours) > 0 ? (
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {stats?.totalPendingTours} tour chờ duyệt
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Đã duyệt tất cả
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── BIỂU ĐỒ + ĐIỂM ĐẾN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-600" />
                Biểu Đồ Tăng Trưởng Doanh Thu Theo Tháng
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Dòng tiền thanh toán từ các đơn tour thành công</p>
            </div>
            <Link to="/admin/settlements" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Chi tiết đối soát <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {monthlyEntries.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm">
              <ShoppingBag className="h-10 w-10 text-slate-300 mb-2" />
              Chưa có đủ dữ liệu giao dịch tháng để vẽ biểu đồ.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {monthlyEntries.map(([month, amount]) => {
                const numAmount = Number(amount) || 0;
                const percent = Math.min(Math.round((numAmount / maxMonthlyRevenue) * 100), 100);
                const netAmount = numAmount * (1 - PLATFORM_COMMISSION - GATEWAY_FEE);
                return (
                  <div key={month} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Tháng {month}</span>
                      <div className="text-right">
                        <span className="text-slate-900 font-bold">{formatCurrency(numAmount)}</span>
                        <span className="text-slate-400 ml-2 text-[11px]">→ Vendor: {formatCurrency(netAmount)}</span>
                      </div>
                    </div>
                    <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-700"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Điểm Đến */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-600" />
              Điểm Đến Xu Hướng
            </h2>
          </div>

          <div className="space-y-3.5 flex-1">
            {stats?.topDestinations && stats.topDestinations.length > 0 ? (
              stats.topDestinations.map((dest, idx) => (
                <div key={dest.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                    idx === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>{idx + 1}</span>
                  {dest.imageUrl ? (
                    <img src={dest.imageUrl} alt={dest.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{dest.name}</h4>
                    <p className="text-xs text-slate-500">{dest.city}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{dest.tourCount} tour</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu điểm đến.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── ĐƠN ĐẶT TOUR GẦN ĐÂY ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Đơn Đặt Chỗ Gần Đây
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Các giao dịch đặt tour mới nhất trên hệ thống</p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            Xem tất cả booking <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
              <tr>
                <th className="py-3 px-4">Mã Booking</th>
                <th className="py-3 px-4">Tour</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Sàn Giữ ({PLATFORM_COMMISSION * 100}%)</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-600 text-xs">{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 max-w-xs truncate">{b.tourTitle || 'Tour du lịch'}</div>
                      <div className="text-xs text-slate-500">{b.numberOfAdults || 1} người lớn{b.numberOfChildren ? `, ${b.numberOfChildren} trẻ em` : ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{b.contactName || b.userName || 'Khách vãng lai'}</div>
                      <div className="text-xs text-slate-500">{b.contactPhone || b.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(b.totalPrice || 0)}</td>
                    <td className="py-3 px-4 font-bold text-amber-600 text-xs">{formatCurrency((b.totalPrice || 0) * PLATFORM_COMMISSION)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') ? '✓ ' : ''}{b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {b.createdAt ? formatDate(b.createdAt) : 'Gần đây'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">Chưa có đơn đặt tour nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
