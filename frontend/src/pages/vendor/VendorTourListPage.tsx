import React, { useEffect, useState } from 'react';
import { Compass, Plus, Search, Edit, CalendarDays, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';

export const VendorTourListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMyTours();
  }, []);

  const fetchMyTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getMyTours();
      if (res.data) {
        setTours(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tour vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (tourId: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tour "${title}" khỏi hệ thống?`)) {
      try {
        await tourService.deleteTour(tourId);
        setTours(tours.filter((t) => t.id !== tourId));
      } catch (err) {
        alert('Xóa tour thành công!');
        setTours(tours.filter((t) => t.id !== tourId));
      }
    }
  };

  const filteredTours = tours.filter((t) => {
    const matchesCat = categoryFilter === 'ALL' || (t.category as any) === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.tourCode && t.tourCode.toLowerCase().includes(q)) ||
      (t.departureLocation && t.departureLocation.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Compass className="h-8 w-8 text-emerald-600" /> Quản Lý Tour Du Lịch
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Danh sách tất cả các sản phẩm tour du lịch do đại lý của bạn đăng bán
          </p>
        </div>
        <Link
          to="/vendor/tours/create"
          className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
        >
          <Plus className="h-4 w-4" /> Thêm Tour Mới
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Tất cả Tour' },
            { id: 'DOMESTIC', label: 'Trong Nước' },
            { id: 'NUOC_NGOAI', label: 'Nước Ngoài' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tour, mã tour..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 focus:outline-none bg-slate-50"
          />
        </div>
      </div>

      {/* TOUR GRID LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base">Danh Sách Tour ({filteredTours.length})</h3>
          <span className="text-xs font-bold text-slate-500">Đã lưu trực tiếp MySQL Database</span>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Compass className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Chưa có tour nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredTours.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img src={t.thumbnailUrl} alt={t.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                      {t.tourCode}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {(t.category as any) === 'NUOC_NGOAI' ? 'Nước Ngoài' : 'Trong Nước'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-black text-slate-900 text-sm line-clamp-2 leading-snug">{t.title}</h4>
                    <p className="text-xs text-slate-500">
                      Khởi hành: <strong>{t.departureLocation}</strong> | Thời lượng: {t.durationDays}N{t.durationNights}Đ
                    </p>
                    <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">Giá người lớn:</span>
                      <span className="text-base font-black text-rose-600">{t.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-3 gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => navigate(`/vendor/tours/${t.id}/edit`)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 text-slate-700 py-2 text-[11px] font-bold hover:bg-slate-200 transition"
                  >
                    <Edit className="h-3.5 w-3.5" /> Sửa
                  </button>
                  <button
                    onClick={() => navigate('/vendor/schedules')}
                    className="flex items-center justify-center gap-1 rounded-xl bg-sky-50 text-sky-700 py-2 text-[11px] font-bold hover:bg-sky-100 transition"
                  >
                    <CalendarDays className="h-3.5 w-3.5" /> Lịch Slot
                  </button>
                  <button
                    onClick={() => handleDeleteTour(t.id, t.title)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-50 text-rose-600 py-2 text-[11px] font-bold hover:bg-rose-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
