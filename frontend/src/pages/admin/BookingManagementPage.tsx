import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  XCircle 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings();
      if (res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tourTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactPhone?.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      matchesStatus = b.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-8 w-8 text-sky-600" />
            Quản Lý Đơn Đặt Chỗ (Booking)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm soát toàn bộ các đơn đặt tour trên hệ thống, tình trạng thanh toán và thông tin vé điện tử
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã booking, tên tour, tên khách, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
          <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
          <option value="PENDING">Chờ xử lý (PENDING)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 bg-[#0d1527]">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Tour Đặt</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Số Lượng</th>
                <th className="py-3.5 px-4">Tổng Tiền</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                    Đang tải danh sách đơn đặt tour...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr 
                    key={b.id} 
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-sky-600">
                      {b.bookingCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{b.tourTitle || 'Tour Du Lịch'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{b.contactName || b.userName || 'Khách đặt'}</div>
                      <div className="text-xs text-slate-500">{b.contactPhone || b.contactEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {b.numberOfAdults || 1} Lớn {b.numberOfChildren ? `, ${b.numberOfChildren} Nhỏ` : ''}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatCurrency(b.totalPrice)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {b.createdAt ? formatDate(b.createdAt) : 'Gần đây'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy đơn đặt nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                  {selectedBooking.bookingCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Chi Tiết Đơn Booking</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1.5">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Tour Được Đặt</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedBooking.tourTitle}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Thông Tin Khách</span>
                  <div className="font-bold text-slate-800 mt-1">{selectedBooking.contactName || selectedBooking.userName}</div>
                  <div className="text-slate-500 mt-0.5">{selectedBooking.contactEmail}</div>
                  <div className="text-slate-500">{selectedBooking.contactPhone}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Số Lượng Vé</span>
                  <div className="font-bold text-slate-800 mt-1">{selectedBooking.numberOfAdults || 1} Người lớn</div>
                  <div className="text-slate-500">{selectedBooking.numberOfChildren || 0} Trẻ em</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <span className="font-bold text-slate-700">Tổng Giá Trị Đơn:</span>
                <span className="text-base font-black text-emerald-600">{formatCurrency(selectedBooking.totalPrice)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
