import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Users, Trash2, ShieldAlert, CheckCircle, Clock, Flag } from 'lucide-react';
import { tourService } from '../../services/tourService';
import { 
  tourScheduleService, 
  computeScheduleStatus,
  getBookingCutoffDays,
  TourScheduleItem
} from '../../services/tourScheduleService';
import { Tour } from '../../types/tour';

export const VendorSchedulesPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<TourScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleFilter, setScheduleFilter] = useState<'ALL' | 'ACTIVE' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED' | 'COMPLETED'>('ALL');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minSeats, setMinSeats] = useState(10);
  const [maxSeats, setMaxSeats] = useState(40);
  const [seasonalNote, setSeasonalNote] = useState('Khởi hành định kỳ');

  useEffect(() => {
    fetchTours();
    const handleTourUpdate = () => fetchTours();
    window.addEventListener('custom_tours_updated', handleTourUpdate);
    return () => window.removeEventListener('custom_tours_updated', handleTourUpdate);
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      void loadSchedulesForTour(selectedTourId);
    }
  }, [selectedTourId]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getMyTours();
      if (res.data && res.data.length > 0) {
        setTours(res.data);
        setSelectedTourId(res.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tour:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulesForTour = async (tourId: number) => {
    const items = await tourScheduleService.fetchSchedulesForTour(tourId);
    setSchedules(items);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedTourId) return;

    try {
      await tourScheduleService.addSchedule(selectedTourId, {
        startDate,
        endDate,
        minParticipants: minSeats,
        maxParticipants: maxSeats,
        note: seasonalNote,
      });
      await loadSchedulesForTour(selectedTourId);
      setStartDate('');
      setEndDate('');
      setMinSeats(10);
      setSeasonalNote('Khởi hành định kỳ');
    } catch (err) {
      console.error('Lỗi thêm lịch khởi hành:', err);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!selectedTourId) return;
    try {
      await tourScheduleService.deleteSchedule(selectedTourId, id);
      await loadSchedulesForTour(selectedTourId);
    } catch (err) {
      console.error('Lỗi xóa lịch khởi hành:', err);
    }
  };

  const handleCompleteSchedule = async (schedule: TourScheduleItem) => {
    if (!selectedTourId) return;
    const confirmed = window.confirm(
      `Xác nhận hoàn thành đợt khởi hành ${schedule.startDate} ➔ ${schedule.endDate}?\n\n` +
      `• Đợt khởi hành sẽ tự động ẩn khỏi danh sách đặt mới của khách hàng (giữ lại ở tab "Đã đi" để đối soát).\n` +
      `• Toàn bộ đơn đã Check-in thuộc đợt này sẽ tự động chuyển sang Hoàn Thành Tour và mở quyền Viết Đánh Giá cho khách.`
    );
    if (!confirmed) return;

    setCompletingId(schedule.id);
    setStatusMessage(null);
    try {
      const res = await tourScheduleService.completeSchedule(selectedTourId, schedule.id);
      // Xóa cache trạng thái localStorage cũ để đồng bộ trạng thái COMPLETED mới từ Backend
      try {
        localStorage.removeItem('vendor_booking_statuses');
      } catch (_) {}
      await loadSchedulesForTour(selectedTourId);
      const count = res?.completedBookingsCount ?? 0;
      setStatusMessage(
        `Đã hoàn thành đợt khởi hành ${schedule.startDate} ➔ ${schedule.endDate}! Đợt đã ẩn khỏi trang đặt tour của khách và tự động chuyển ${count} đơn đã Check-in sang Hoàn Thành Tour.`
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể hoàn thành đợt khởi hành.');
    } finally {
      setCompletingId(null);
    }
  };

  const selectedTour = tours.find((t) => t.id === selectedTourId);
  const selectedTourLeadDays = getBookingCutoffDays(selectedTour?.category, {
    requiresVisa: selectedTour?.requiresVisa,
    visaProcessingDays: selectedTour?.visaProcessingDays,
    visaBufferDays: selectedTour?.visaBufferDays,
  });

  // Compute status for all schedules
  const enrichedSchedules = schedules.map((s) => {
    const lifecycle = computeScheduleStatus(s, selectedTour?.category, {
      requiresVisa: selectedTour?.requiresVisa,
      visaProcessingDays: selectedTour?.visaProcessingDays,
      visaBufferDays: selectedTour?.visaBufferDays,
    });
    return {
      ...s,
      minParticipants: s.minParticipants || 10,
      lifecycle,
    };
  });

  const filteredSchedules = enrichedSchedules.filter((s) => {
    if (scheduleFilter === 'ALL') return true;
    if (scheduleFilter === 'ACTIVE') return s.lifecycle.status === 'ACTIVE';
    if (scheduleFilter === 'IN_PROGRESS') return s.lifecycle.status === 'IN_PROGRESS';
    if (scheduleFilter === 'CLOSED') return s.lifecycle.status === 'CLOSED_BOOKING';
    if (scheduleFilter === 'CANCELLED') return s.lifecycle.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS';
    if (scheduleFilter === 'COMPLETED') return s.lifecycle.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <CalendarDays className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 shrink-0" /> Lịch Khởi Hành & Quản Lý Vòng Đời Tour
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Cài đặt hạn đặt trước ({selectedTourLeadDays} ngày{selectedTour?.requiresVisa ? ' theo mẫu Visa' : selectedTour?.category === 'NUOC_NGOAI' ? ' quốc tế' : ' trong nước'}), quy định tối thiểu 10 khách/đoàn và tự động hoàn tiền
        </p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : tours.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Bạn chưa có tour nào để cài đặt lịch khởi hành. Vui lòng tạo tour trước!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Tour selector & Create schedule form */}
          <div className="space-y-6">
            {/* SELECT TOUR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn Tour Du Lịch</label>
              <select
                value={selectedTourId || ''}
                onChange={(e) => setSelectedTourId(Number(e.target.value))}
                disabled={tours.length === 0}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {tours.length === 0 ? (
                  <option value="">Chưa có tour du lịch nào</option>
                ) : (
                  tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.tourCode})
                    </option>
                  ))
                )}
              </select>

              {tours.length === 0 && (
                <p className="mt-3 text-xs text-amber-600 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Bạn chưa đăng tải tour nào. Vui lòng tạo tour trước khi thiết lập lịch khởi hành.
                </p>
              )}

              {selectedTour && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <img src={selectedTour.thumbnailUrl} alt={selectedTour.title} className="h-12 w-16 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-black text-slate-900 line-clamp-1">{selectedTour.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedTour.category as any) === 'NUOC_NGOAI' ? 'Quốc Tế (Chốt 15N)' : 'Trong Nước (Chốt 3N)'} | Giá: {selectedTour.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CREATE SCHEDULE FORM */}
            <form onSubmit={handleAddSchedule} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Plus className="h-4 w-4 text-emerald-600" /> Thêm Khung Lịch Khởi Hành Mới
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày khởi hành *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đoàn tối thiểu *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={minSeats}
                    onChange={(e) => setMinSeats(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Mặc định 10 khách</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chỗ tối đa (Max) *</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    required
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Sức chứa tối đa</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú / Mùa cao điểm</label>
                <input
                  type="text"
                  value={seasonalNote}
                  onChange={(e) => setSeasonalNote(e.target.value)}
                  placeholder="VD: Lễ Quốc Khánh, Cuối tuần"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
              >
                <Plus className="h-4 w-4" /> Kích Hoạt Lịch Khởi Hành
              </button>
            </form>
          </div>

          {/* RIGHT: Schedule Slots List with Lifecycle Filters */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Danh Sách Đợt Khởi Hành ({filteredSchedules.length})</h3>
                  <p className="text-xs text-slate-500">Quản lý trạng thái mở bán, đóng sổ và hủy đoàn tự động</p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'ACTIVE', label: 'Đang mở' },
                    { id: 'IN_PROGRESS', label: 'Đang đi' },
                    { id: 'CLOSED', label: 'Đã đóng' },
                    { id: 'CANCELLED', label: 'Hủy (<10)' },
                    { id: 'COMPLETED', label: 'Đã đi' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setScheduleFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        scheduleFilter === f.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {statusMessage && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-start justify-between gap-3">
                  <span>{statusMessage}</span>
                  <button
                    type="button"
                    onClick={() => setStatusMessage(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {filteredSchedules.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">Không có lịch khởi hành nào phù hợp với bộ lọc.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSchedules.map((s) => {
                    const remaining = Math.max(0, s.maxParticipants - s.bookedCount);
                    const percentBooked = Math.min(100, Math.round((s.bookedCount / s.maxParticipants) * 100));
                    const status = s.lifecycle.status;

                    return (
                      <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              📅 {s.startDate} ➔ {s.endDate}
                            </span>

                            {/* LIFECYCLE BADGES */}
                            {status === 'ACTIVE' && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-600" /> Đang mở bán (Còn {Math.max(0, s.lifecycle.daysRemaining - s.lifecycle.minLeadDays)} ngày đặt vé)
                              </span>
                            )}
                            {status === 'IN_PROGRESS' && (
                              <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-300 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-cyan-600" /> Đang đi tour
                              </span>
                            )}
                            {status === 'CLOSED_BOOKING' && (
                              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600" /> Đã đóng cổng nhận khách (Đủ đoàn hoặc quá hạn)
                              </span>
                            )}
                            {status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS' && (
                              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3 text-rose-600" /> Hủy: Không đủ {s.minParticipants} khách (Hoàn tiền 100%)
                              </span>
                            )}
                            {status === 'COMPLETED' && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                                Đã kết thúc chuyến đi
                              </span>
                            )}

                            {s.note && (
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                {s.note}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              Khách đã đặt: <strong className="text-slate-900">{s.bookedCount}</strong> / {s.maxParticipants} chỗ
                              <span className="text-slate-400 text-[11px]">(Tối thiểu: {s.minParticipants} khách)</span>
                            </span>
                            <span>
                              Chỗ trống còn lại: <strong className={remaining < 10 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>{remaining} chỗ</strong>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full sm:w-64 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${
                                status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                                  ? 'bg-rose-400'
                                  : percentBooked >= 100
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentBooked}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {status !== 'COMPLETED' && status !== 'CANCELLED_NOT_ENOUGH_PARTICIPANTS' && (
                            <button
                              type="button"
                              disabled={completingId === s.id}
                              onClick={() => handleCompleteSchedule(s)}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-50"
                              title="Chốt hoàn thành đợt khởi hành, ẩn khỏi danh sách đặt mới và chuyển đơn đã Check-in sang Hoàn Thành Tour"
                            >
                              <Flag className="h-3.5 w-3.5" />
                              {completingId === s.id ? 'Đang xử lý...' : 'Hoàn thành đợt'}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSchedule(s.id)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Xóa lịch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
