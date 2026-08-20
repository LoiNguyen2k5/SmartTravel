import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';
import { Eye, Star, Calendar, Clock, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import { MOCK_TOURS } from '../../data/mockTours';

export const TourListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [departure, setDeparture] = useState<string>('Tất cả');
  const [destination, setDestination] = useState<string>('Tất cả');
  const [durationFilter, setDurationFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [budgetFilter, setBudgetFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchTours();
  }, [departure, destination, durationFilter, categoryFilter, budgetFilter]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getAllTours();
      let liveTours: Tour[] = res.success && res.data && res.data.length > 0 ? res.data : MOCK_TOURS;

      // Chuẩn hóa đường dẫn hình ảnh thực tế từ thư mục public/images/tours/
      liveTours = liveTours.map(t => {
        const fallback = MOCK_TOURS.find(m => m.id === t.id);
        if (fallback) {
          return {
            ...t,
            thumbnailUrl: (t.thumbnailUrl && !t.thumbnailUrl.includes('unsplash')) ? t.thumbnailUrl : fallback.thumbnailUrl,
            gallery: (t.gallery && t.gallery.length > 0) ? t.gallery : fallback.gallery,
          };
        }
        return t;
      });

      // Apply client-side filter combinations
      if (departure !== 'Tất cả') {
        liveTours = liveTours.filter(t => t.departureLocation?.toLowerCase().includes(departure.toLowerCase()));
      }
      if (destination !== 'Tất cả') {
        liveTours = liveTours.filter(t => t.title.toLowerCase().includes(destination.toLowerCase()));
      }
      if (durationFilter === '1_DAY') {
        liveTours = liveTours.filter(t => t.durationDays === 1);
      } else if (durationFilter === '1_TO_3') {
        liveTours = liveTours.filter(t => t.durationDays >= 1 && t.durationDays <= 3);
      } else if (durationFilter === 'OVER_3') {
        liveTours = liveTours.filter(t => t.durationDays > 3);
      }

      if (categoryFilter !== 'ALL') {
        liveTours = liveTours.filter(t => t.category === categoryFilter);
      }

      if (budgetFilter === 'UNDER_5M') {
        liveTours = liveTours.filter(t => t.price < 5000000);
      } else if (budgetFilter === '5M_TO_10M') {
        liveTours = liveTours.filter(t => t.price >= 5000000 && t.price <= 10000000);
      } else if (budgetFilter === 'OVER_10M') {
        liveTours = liveTours.filter(t => t.price > 10000000);
      }

      setTours(liveTours);
    } catch (err) {
      console.error('Lỗi nạp danh sách tour:', err);
      setTours(MOCK_TOURS);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setDeparture('Tất cả');
    setDestination('Tất cả');
    setDurationFilter('ALL');
    setCategoryFilter('ALL');
    setBudgetFilter('ALL');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto space-y-2">
          <nav className="flex items-center gap-2 text-xs text-sky-200">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Trang Chủ</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-semibold">Danh sách Tour</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight">Danh sách Tour Du Lịch</h1>
          <p className="text-sm text-sky-100 max-w-2xl">
            Khám phá trải nghiệm tour du lịch và hơn thế nữa với thông tin hình ảnh thực tế chuẩn xác.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filter Section */}
          <aside className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 self-start sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Filter className="h-5 w-5 text-sky-600" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </div>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Xóa lọc
              </button>
            </div>

            {/* Điểm khởi hành */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Điểm Khởi Hành</label>
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
              >
                <option value="Tất cả">Tất cả điểm khởi hành</option>
                <option value="TP.Hồ Chí Minh">TP.Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            {/* Điểm đến */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Điểm Đến</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
              >
                <option value="Tất cả">Tất cả điểm đến</option>
                <option value="Đà Lạt">Đà Lạt</option>
                <option value="Trương Gia Giới">Trương Gia Giới / Trung Quốc</option>
                <option value="Thượng Hải">Thượng Hải - Ô Trấn</option>
                <option value="Châu Đốc">Châu Đốc - An Giang</option>
                <option value="Cà Mau">Cà Mau Đất Mũi</option>
                <option value="Nam Du">Đảo Nam Du</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
                <option value="Phú Yên">Phú Yên - Quy Nhơn</option>
              </select>
            </div>

            {/* Khoảng Thời Gian */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Khoảng Thời Gian</label>
              <div className="space-y-2 text-sm text-slate-700">
                {[
                  { id: 'ALL', label: 'Tất cả thời lượng' },
                  { id: '1_DAY', label: '1 ngày' },
                  { id: '1_TO_3', label: '1 đến 3 ngày' },
                  { id: 'OVER_3', label: 'Trên 3 ngày' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-600">
                    <input
                      type="radio"
                      name="duration"
                      checked={durationFilter === opt.id}
                      onChange={() => setDurationFilter(opt.id)}
                      className="text-sky-600 focus:ring-sky-500 rounded-full"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Loại Tour */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Loại Tour</label>
              <div className="space-y-2 text-sm text-slate-700 max-h-48 overflow-y-auto pr-1">
                {[
                  { id: 'ALL', label: 'Tất cả loại tour' },
                  { id: 'DOMESTIC', label: 'Domestic (Trong nước)' },
                  { id: 'NUOC_NGOAI', label: 'Tour nước ngoài' },
                  { id: 'LE_2_9', label: 'Tour Lễ 2/9' },
                  { id: 'KHUYEN_MAI', label: 'Tour Khuyến Mãi' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-600">
                    <input
                      type="radio"
                      name="category"
                      checked={categoryFilter === opt.id}
                      onChange={() => setCategoryFilter(opt.id)}
                      className="text-sky-600 focus:ring-sky-500 rounded-full"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Ngân Sách */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ngân Sách</label>
              <div className="space-y-2 text-sm text-slate-700">
                {[
                  { id: 'ALL', label: 'Tất cả mức giá' },
                  { id: 'UNDER_5M', label: 'Dưới 5 triệu' },
                  { id: '5M_TO_10M', label: 'Từ 5 đến 10 triệu' },
                  { id: 'OVER_10M', label: 'Trên 10 triệu' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-600">
                    <input
                      type="radio"
                      name="budget"
                      checked={budgetFilter === opt.id}
                      onChange={() => setBudgetFilter(opt.id)}
                      className="text-sky-600 focus:ring-sky-500 rounded-full"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Main Content Listing */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-sm font-semibold text-slate-600">
                Showing <span className="font-bold text-slate-900">1–10</span> of 137 results
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sắp xếp:</span>
                <select className="text-xs font-semibold text-slate-800 border-none bg-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-none">
                  <option>Nổi bật nhất</option>
                  <option>Giá tăng dần</option>
                  <option>Giá giảm dần</option>
                  <option>Lượt xem nhiều nhất</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-slate-200">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
              </div>
            ) : tours.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center bg-white text-slate-500 space-y-3">
                <p className="text-lg font-bold">Không tìm thấy tour phù hợp</p>
                <p className="text-sm">Vui lòng thử điều chỉnh bộ lọc để xem các hành trình khác.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <div 
                    key={tour.id} 
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Thumbnail with Departure Banner Badge */}
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      <img 
                        src={tour.thumbnailUrl} 
                        alt={tour.title} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-sky-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                        KH từ {tour.departureLocation || 'TP.Hồ Chí Minh'}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Title matching uppercase reference style */}
                        <h3 
                          onClick={() => navigate(`/tours/${tour.id}`)}
                          className="text-xs font-extrabold text-slate-900 hover:text-sky-600 cursor-pointer line-clamp-2 leading-snug uppercase"
                        >
                          {tour.title}
                        </h3>

                        {/* Stat icons row matching reference image: views, rating, booked count */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-b border-slate-100 pb-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Eye className="h-3.5 w-3.5 text-slate-400" /> {tour.viewCount || 100} Lượt xem
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {tour.averageRating || 5.0}/5 ({tour.totalReviews || 0})
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            📌 Đã chốt ({tour.totalReviews || 0})
                          </span>
                        </div>

                        {/* Tour Info Lines */}
                        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" />
                            <span>Khởi hành: <strong className="text-slate-800">30-08-2026</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" />
                            <span>Thời gian: <strong className="text-slate-800">{tour.durationDays} ngày {tour.durationNights} đêm</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Booking CTA Button */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-slate-500">Giá từ: </span>
                            <span className="text-base font-black text-rose-600">
                              {tour.price.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[10px] text-slate-400"> / Khách</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Còn {tour.id === 6 ? 28 : (tour.remainingSeats ?? 40)} chỗ
                          </span>
                        </div>

                        <button 
                          onClick={() => navigate(`/tours/${tour.id}`)}
                          className="w-full rounded-xl bg-sky-900 hover:bg-sky-950 text-white py-2.5 text-xs font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                        >
                          Đặt ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
