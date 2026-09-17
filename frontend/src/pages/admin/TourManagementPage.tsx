import React, { useEffect, useState } from 'react';
import { 
  Compass, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  RefreshCw, 
  Building2, 
  AlertCircle, 
  FileText 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Tour, TourStatus } from '../../types/tour';
import { formatCurrency } from '../../utils/formatters';

export const TourManagementPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Review / Inspection modal
  const [inspectTour, setInspectTour] = useState<Tour | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTours();
      if (res.data) {
        setTours(res.data);
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleModerate = async (tourId: number, status: TourStatus, reason?: string) => {
    try {
      setActionLoadingId(tourId);
      const res = await adminService.moderateTour(tourId, status, reason);
      if (res.data) {
        setTours(prev => prev.map(t => t.id === tourId ? { ...t, status } : t));
        if (inspectTour && inspectTour.id === tourId) {
          setInspectTour({ ...inspectTour, status });
        }
      }
      setInspectTour(null);
      setShowRejectInput(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error moderating tour:', err);
      alert('Có lỗi xảy ra khi kiểm duyệt Tour. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter tours
  const filteredTours = tours.filter(tour => {
    const matchesSearch = 
      tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.tourCode?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (selectedTab !== 'ALL') {
      matchesTab = tour.status === selectedTab;
    }

    return matchesSearch && matchesTab;
  });

  const countPending = tours.filter(t => t.status === TourStatus.PENDING_APPROVAL).length;
  const countActive = tours.filter(t => t.status === TourStatus.ACTIVE || (t.status as any) === 'APPROVED').length;
  const countRejected = tours.filter(t => t.status === TourStatus.REJECTED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="h-8 w-8 text-sky-600" />
            Kiểm Duyệt & Quản Lý Tour Du Lịch
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Phê duyệt bài đăng tour của Vendor trước khi cho phép mở bán và hiển thị công khai trên sàn
          </p>
        </div>
        <button
          onClick={fetchTours}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Tabs / Filter Status */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả ({tours.length})
        </button>

        <button
          onClick={() => setSelectedTab(TourStatus.PENDING_APPROVAL)}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedTab === TourStatus.PENDING_APPROVAL
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
          }`}
        >
          Chờ phê duyệt ({countPending})
          {countPending > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedTab(TourStatus.ACTIVE)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedTab === TourStatus.ACTIVE
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          Đang hoạt động ({countActive})
        </button>

        <button
          onClick={() => setSelectedTab(TourStatus.REJECTED)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedTab === TourStatus.REJECTED
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50'
          }`}
        >
          Bị từ chối ({countRejected})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tour theo tiêu đề, tên vendor, mã tour, điểm đến..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition"
        />
      </div>

      {/* Tours List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 bg-[#0d1527]">
              <tr>
                <th className="py-3.5 px-4">Tour Du Lịch</th>
                <th className="py-3.5 px-4">Nhà Cung Cấp (Vendor)</th>
                <th className="py-3.5 px-4">Thời Lượng & Điểm Đến</th>
                <th className="py-3.5 px-4">Giá Niêm Yết</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                    Đang tải danh sách tour...
                  </td>
                </tr>
              ) : filteredTours.length > 0 ? (
                filteredTours.map((tour) => {
                  const isPending = tour.status === TourStatus.PENDING_APPROVAL;
                  const isActive = tour.status === TourStatus.ACTIVE || (tour.status as any) === 'APPROVED';
                  const isRejected = tour.status === TourStatus.REJECTED;

                  return (
                    <tr key={tour.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120'}
                            alt={tour.title}
                            className="h-12 w-16 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-slate-900 truncate">{tour.title}</h4>
                            <div className="text-xs text-slate-500 font-mono">Mã: {tour.tourCode || `TOUR-${tour.id}`}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{tour.vendorName || 'SmartTravel Partner'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-700">
                          {tour.durationDays}N{tour.durationNights}Đ
                        </div>
                        <div className="text-xs text-slate-500">{tour.destinationName || tour.departureLocation}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(tour.price)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <Clock className="h-3 w-3" /> Chờ duyệt
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" /> Đã từ chối
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {tour.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setInspectTour(tour);
                            setShowRejectInput(false);
                            setRejectionReason('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition active:scale-95"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem & Duyệt
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy tour nào trong mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tour Inspection & Moderation Modal */}
      {inspectTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0a111d] border border-white/10 rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8)] space-y-5 my-8 max-h-[90vh] overflow-y-auto text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Mã: {inspectTour.tourCode || `TOUR-${inspectTour.id}`}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    inspectTour.status === TourStatus.PENDING_APPROVAL ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    inspectTour.status === TourStatus.ACTIVE ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {inspectTour.status}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-2">{inspectTour.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5 text-sky-400" />
                  Đăng bởi Vendor: <strong className="text-slate-200">{inspectTour.vendorName || 'SmartTravel Partner'}</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectTour(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Thumbnail */}
            {inspectTour.thumbnailUrl && (
              <img
                src={inspectTour.thumbnailUrl}
                alt={inspectTour.title}
                className="w-full h-48 rounded-2xl object-cover border border-white/10 shadow-inner"
              />
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.04] border border-white/8 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Giá Người Lớn</span>
                <span className="text-sm font-black text-white">{formatCurrency(inspectTour.price)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Giá Trẻ Em</span>
                <span className="text-sm font-black text-white">{inspectTour.childPrice ? formatCurrency(inspectTour.childPrice) : 'Theo quy định'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Thời Lượng</span>
                <span className="text-sm font-black text-white">{inspectTour.durationDays}N {inspectTour.durationNights}Đ</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Khởi Hành Tại</span>
                <span className="text-sm font-black text-white">{inspectTour.departureLocation}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-sm">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-sky-400" />
                Mô Tả & Lịch Trình Tour
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-white/[0.04] p-3.5 rounded-xl border border-white/8">
                {inspectTour.description || inspectTour.itineraryDetails || 'Chưa có mô tả chi tiết.'}
              </p>
            </div>

            {/* Services */}
            {(inspectTour.includedServices || inspectTour.excludedServices) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {inspectTour.includedServices && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="font-bold text-emerald-400 block mb-1">Dịch Vụ Bao Gồm:</span>
                    <p className="text-slate-300 leading-relaxed">{inspectTour.includedServices}</p>
                  </div>
                )}
                {inspectTour.excludedServices && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                    <span className="font-bold text-rose-400 block mb-1">Không Bao Gồm:</span>
                    <p className="text-slate-300 leading-relaxed">{inspectTour.excludedServices}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection input box */}
            {showRejectInput && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 animate-in fade-in">
                <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  Lý do từ chối bài đăng tour (sẽ gửi thông báo cho Vendor):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Thiếu thông tin lịch trình chi tiết, hình ảnh không đúng quy chuẩn..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white/[0.05] border border-rose-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-white placeholder-slate-500"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setInspectTour(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                Đóng
              </button>

              {showRejectInput ? (
                <button
                  onClick={() => handleModerate(inspectTour.id, TourStatus.REJECTED, rejectionReason)}
                  disabled={actionLoadingId !== null || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId !== null ? 'Đang xử lý...' : 'Xác Nhận Từ Chối'}
                </button>
              ) : (
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition active:scale-95 cursor-pointer"
                >
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Từ Chối Tour
                </button>
              )}

              <button
                onClick={() => handleModerate(inspectTour.id, TourStatus.ACTIVE)}
                disabled={actionLoadingId !== null}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                {actionLoadingId !== null ? 'Đang duyệt...' : 'Phê Duyệt & Mở Bán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
