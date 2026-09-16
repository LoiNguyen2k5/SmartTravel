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
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types/admin';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  const monthlyEntries = stats?.monthlyRevenue ? Object.entries(stats.monthlyRevenue) : [];
  const maxMonthlyRevenue = monthlyEntries.length > 0 
    ? Math.max(...monthlyEntries.map(([_, val]) => Number(val) || 0), 1)
    : 1;

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

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doanh thu toàn sàn */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Doanh Thu Sàn</span>
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(stats?.totalGrossRevenue || 0)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{stats?.successfulBookings || 0} đơn hoàn tất</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-50 opacity-60 pointer-events-none" />
        </div>

        {/* Hoa hồng sàn thu được */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hoa Hồng Sàn (10%)</span>
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-600">
              {formatCurrency(stats?.totalPlatformCommission || 0)}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Chiết khấu nền tảng thực thu
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-50 opacity-60 pointer-events-none" />
        </div>

        {/* Người dùng & Vendor */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Người Dùng & Đối Tác</span>
            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {stats?.totalUsers || 0}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-sky-600">
                <Building2 className="h-3 w-3" /> {stats?.totalVendors || 0} Vendor
              </span>
              <span>•</span>
              <span>{stats?.totalCustomers || 0} Khách</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-sky-50 opacity-60 pointer-events-none" />
        </div>

        {/* Quản lý Tour */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tour Du Lịch</span>
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
              <Compass className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {stats?.totalActiveTours || 0} <span className="text-sm font-normal text-slate-500">đang chạy</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {Number(stats?.totalPendingTours) > 0 ? (
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {stats?.totalPendingTours} tour chờ duyệt
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Đã duyệt tất cả
                </span>
              )}
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-50 opacity-60 pointer-events-none" />
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-600" />
                Biểu Đồ Tăng Trưởng Doanh Thu Theo Tháng
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Dòng tiền thanh toán từ các đơn tour thành công</p>
            </div>
            <Link
              to="/admin/settlements"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
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
                return (
                  <div key={month} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Tháng {month}</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(numAmount)}</span>
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

        {/* Top Điểm Đến Xu Hướng */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Điểm Đến Xu Hướng
            </h2>
            <Link
              to="/admin/destinations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Quản lý <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {stats?.topDestinations && stats.topDestinations.length > 0 ? (
              stats.topDestinations.map((dest, idx) => (
                <div
                  key={dest.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                    idx === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  {dest.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{dest.name}</h4>
                    <p className="text-xs text-slate-500">{dest.city}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {dest.tourCount} tour
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu điểm đến.</p>
            )}
          </div>
        </div>
      </div>

      {/* Đơn đặt tour gần đây */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Đơn Đặt Chỗ Gần Đây
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Các giao dịch đặt tour mới nhất trên hệ thống</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Xem tất cả booking <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Mã Booking</th>
                <th className="py-3 px-4">Tour</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-600 text-xs">
                      {b.bookingCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 max-w-xs truncate">{b.tourTitle || 'Tour du lịch'}</div>
                      <div className="text-xs text-slate-500">{b.numberOfAdults || 1} người lớn {b.numberOfChildren ? `, ${b.numberOfChildren} trẻ em` : ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{b.contactName || b.userName || 'Khách vãng lai'}</div>
                      <div className="text-xs text-slate-500">{b.contactPhone || b.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(b.totalPrice || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {b.createdAt ? formatDate(b.createdAt) : 'Gần đây'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Chưa có đơn đặt tour nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
