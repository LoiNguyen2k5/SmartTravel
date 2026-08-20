import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Users, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';

interface TourScheduleItem {
  id: number;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  bookedCount: number;
  seasonalPriceMultiplier?: number;
  note?: string;
}

export const VendorSchedulesPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<TourScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxSeats, setMaxSeats] = useState(40);
  const [seasonalNote, setSeasonalNote] = useState('Khởi hành định kỳ');

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      loadMockSchedulesForTour(selectedTourId);
    }
  }, [selectedTourId]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getMyTours();
      if (res.success && res.data && res.data.length > 0) {
        setTours(res.data);
        setSelectedTourId(res.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tour:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMockSchedulesForTour = (tourId: number) => {
    // Generate default/sample schedule slots
    setSchedules([
      { id: 1, startDate: '2026-08-30', endDate: '2026-09-02', maxParticipants: 40, bookedCount: 12, note: 'Lễ Quốc Khánh 2/9 (+15% giá)' },
      { id: 2, startDate: '2026-09-15', endDate: '2026-09-18', maxParticipants: 35, bookedCount: 8, note: 'Khởi hành giữa tháng' },
      { id: 3, startDate: '2026-10-01', endDate: '2026-10-04', maxParticipants: 40, bookedCount: 0, note: 'Mùa thu vàng' },
    ]);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const newSchedule: TourScheduleItem = {
      id: Date.now(),
      startDate,
      endDate,
      maxParticipants: maxSeats,
      bookedCount: 0,
      note: seasonalNote,
    };

    setSchedules([newSchedule, ...schedules]);
    setStartDate('');
    setEndDate('');
    setSeasonalNote('Khởi hành định kỳ');
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const selectedTour = tours.find((t) => t.id === selectedTourId);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-emerald-600" /> Lịch Khởi Hành & Quản Lý Slot (Chỗ)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Thiết lập lịch khởi hành theo ngày/tuần, cài đặt giới hạn số lượng khách (slot) và phụ thu mùa lễ
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
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none bg-slate-50"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.tourCode})
                  </option>
                ))}
              </select>

              {selectedTour && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <img src={selectedTour.thumbnailUrl} alt={selectedTour.title} className="h-12 w-16 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-black text-slate-900 line-clamp-1">{selectedTour.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Thời lượng: {selectedTour.durationDays}N{selectedTour.durationNights}Đ | Giá: {selectedTour.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CREATE SCHEDULE FORM */}
            <form onSubmit={handleAddSchedule} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Plus className="h-4 w-4 text-emerald-600" /> Thêm Khung Lịch Khởi Hành
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số chỗ tối đa (Max Slot) *</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  required
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
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

          {/* RIGHT: Active Schedule Slots List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Danh Sách Đợt Khởi Hành Đã Mở</h3>
                  <p className="text-xs text-slate-500">Các lịch đang mở bán cho du khách lựa chọn</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {schedules.length} đợt khởi hành
                </span>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">Chưa có lịch khởi hành nào được thiết lập.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {schedules.map((s) => {
                    const remaining = s.maxParticipants - s.bookedCount;
                    const percentBooked = Math.round((s.bookedCount / s.maxParticipants) * 100);

                    return (
                      <div key={s.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              📅 {s.startDate} ➔ {s.endDate}
                            </span>
                            {s.note && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {s.note}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" /> Đã đặt: <strong className="text-slate-900">{s.bookedCount}</strong>/{s.maxParticipants} khách
                            </span>
                            <span>
                              Còn lại: <strong className={remaining < 10 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>{remaining} chỗ</strong>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${percentBooked > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${percentBooked}%` }}
                            ></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Xóa lịch"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
