import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';
import { Eye, Star, Calendar, Clock, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import { MOCK_TOURS } from '../../data/mockTours';
import { tourScheduleService } from '../../services/tourScheduleService';

export const TourListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse category from URL
  const parseCategoryFromParams = (params: URLSearchParams): string => {
    const raw = params.get('type') || params.get('category');
    if (!raw) return 'ALL';
    const upper = raw.toUpperCase();
    if (upper === 'DOMESTIC' || upper === 'TRONG_NUOC' || upper === 'TRONG NƯỚC') {
      return 'DOMESTIC';
    }
    if (upper === 'INTERNATIONAL' || upper === 'NUOC_NGOAI' || upper === 'NƯỚC NGOÀI') {
      return 'NUOC_NGOAI';
    }
    if (upper === 'LE_2_9') return 'LE_2_9';
    if (upper === 'KHUYEN_MAI') return 'KHUYEN_MAI';
    return 'ALL';
  };

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Mỗi trang hiển thị tối đa 9 tour
  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // tours là danh sách đã được lọc và sắp xếp
  const totalPages = Math.max(1, Math.ceil(tours.length / PAGE_SIZE));
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (activePage - 1) * PAGE_SIZE;

  const visibleTours = tours.slice(startIndex, startIndex + PAGE_SIZE);
  const firstItem = tours.length === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + PAGE_SIZE, tours.length);
  // Filters state
  const [departure, setDeparture] = useState<string>(() => searchParams.get('departure') || 'Tất cả');
  const [destination, setDestination] = useState<string>(() => searchParams.get('destination') || 'Tất cả');
  const [durationFilter, setDurationFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>(() => parseCategoryFromParams(searchParams));
  const [budgetFilter, setBudgetFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  // Keep state synchronized with URL search params changes
  useEffect(() => {
    const newCategory = parseCategoryFromParams(searchParams);
    setCategoryFilter(newCategory);

    const newDest = searchParams.get('destination');
    if (newDest) {
      setDestination(newDest);
    } else if (!searchParams.has('destination') && destination !== 'Tất cả') {
      setDestination('Tất cả');
    }

    const newDep = searchParams.get('departure');
    if (newDep) {
      setDeparture(newDep);
    } else if (!searchParams.has('departure') && departure !== 'Tất cả') {
      setDeparture('Tất cả');
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
    fetchTours();
  }, [departure, destination, durationFilter, categoryFilter, budgetFilter, sortBy]);

  // Listen to schedule and custom tour changes
  useEffect(() => {
    const handleUpdate = () => {
      fetchTours();
    };
    window.addEventListener('tour_schedules_updated', handleUpdate);
    window.addEventListener('custom_tours_updated', handleUpdate);
    return () => {
      window.removeEventListener('tour_schedules_updated', handleUpdate);
      window.removeEventListener('custom_tours_updated', handleUpdate);
    };
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getAllTours();
      let liveTours: Tour[] = res.success && res.data && res.data.length > 0 ? [...res.data] : [...MOCK_TOURS];

      // Đảm bảo luôn đầy đủ toàn bộ tour (kể cả 9 tour mới chuẩn HCM & quốc tế)
      for (const m of MOCK_TOURS) {
        if (!liveTours.some(t => t.id === m.id || t.title.trim().toLowerCase() === m.title.trim().toLowerCase())) {
          liveTours.push(m);
        }
      }

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

      // Tự động loại bỏ các tour có tất cả ngày khởi hành đã qua theo thời gian thực
      liveTours = liveTours.filter(t => tourScheduleService.hasUpcomingSchedule(t.id));

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

      // Xử lý sắp xếp
      if (sortBy === 'PRICE_ASC') {
        liveTours.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'PRICE_DESC') {
        liveTours.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'VIEWS') {
        liveTours.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
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
	setCurrentPage(1);
    setDeparture('Tất cả');
    setDestination('Tất cả');
    setDurationFilter('ALL');
    setCategoryFilter('ALL');
    setBudgetFilter('ALL');
    setSortBy('FEATURED');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="bg-[#020204] min-h-screen pb-16 text-white">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 border-b border-white/8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-sky-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto space-y-2">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-sky-400 cursor-pointer transition" onClick={() => navigate('/')}>Trang Chủ</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300 font-semibold">Danh sách Tour</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Danh sách Tour Du Lịch</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Khám phá trải nghiệm tour du lịch và hơn thế nữa với thông tin hình ảnh thực tế chuẩn xác.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filter Section */}
          <aside
            className="lg:col-span-1 p-6 rounded-2xl border border-white/8 space-y-6 self-start sticky top-24"
            style={{ background: 'rgba(10,17,29,0.85)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Filter className="h-5 w-5 text-sky-400" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </div>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Xóa lọc
              </button>
            </div>

            {/* Điểm khởi hành */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Khởi Hành</label>
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none text-white font-medium [&>option]:bg-slate-900"
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Đến</label>
              <select
                value={destination}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestination(val);
                  const newParams = new URLSearchParams(searchParams);
                  if (val === 'Tất cả') {
                    newParams.delete('destination');
                  } else {
                    newParams.set('destination', val);
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none text-white font-medium [&>option]:bg-slate-900"
              >
                <option value="Tất cả">Tất cả điểm đến</option>
                <option value="Đà Lạt">Đà Lạt (Lâm Đồng)</option>
                <option value="Miền Tây">Miền Tây sông nước (6 tỉnh / Cà Mau)</option>
                <option value="Phượng Hoàng Cổ Trấn">Phượng Hoàng Cổ Trấn / Ân Thi</option>
                <option value="Thái Lan">Thái Lan / Bangkok - Pattaya</option>
                <option value="Thượng Hải">Thượng Hải - Ô Trấn</option>
                <option value="Châu Đốc">Châu Đốc - An Giang</option>
                <option value="Núi Chứa Chan">Núi Chứa Chan - Đồng Nai</option>
                <option value="Nam Du">Đảo Nam Du</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
                <option value="Phú Yên">Phú Yên - Quy Nhơn</option>
                {destination !== 'Tất cả' && ![
                  'Đà Lạt', 'Miền Tây', 'Phượng Hoàng Cổ Trấn', 'Thái Lan', 
                  'Thượng Hải', 'Châu Đốc', 'Núi Chứa Chan', 'Nam Du', 'Vũng Tàu', 'Phú Yên'
                ].includes(destination) && (
                  <option value={destination}>{destination}</option>
                )}
              </select>
            </div>

            {/* Khoảng Thời Gian */}
            <div className="space-y-2 pt-2 border-t border-white/8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khoảng Thời Gian</label>
              <div className="space-y-2 text-sm text-slate-400">
                {[
                  { id: 'ALL', label: 'Tất cả thời lượng' },
                  { id: '1_DAY', label: '1 ngày' },
                  { id: '1_TO_3', label: '1 đến 3 ngày' },
                  { id: 'OVER_3', label: 'Trên 3 ngày' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-400 text-slate-400">
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
            <div className="space-y-2 pt-2 border-t border-white/8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại Tour</label>
              <div className="space-y-2 text-sm text-slate-400 max-h-48 overflow-y-auto pr-1">
                {[
                  { id: 'ALL', label: 'Tất cả loại tour' },
                  { id: 'DOMESTIC', label: 'Domestic (Trong nước)' },
                  { id: 'NUOC_NGOAI', label: 'Tour nước ngoài' },
                  { id: 'LE_2_9', label: 'Tour Lễ 2/9' },
                  { id: 'KHUYEN_MAI', label: 'Tour Khuyến Mãi' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-400 text-slate-400">
                    <input
                      type="radio"
                      name="category"
                      checked={categoryFilter === opt.id}
                      onChange={() => {
                        setCategoryFilter(opt.id);
                        const newParams = new URLSearchParams(searchParams);
                        if (opt.id === 'ALL') {
                          newParams.delete('type');
                          newParams.delete('category');
                        } else {
                          newParams.set('type', opt.id);
                        }
                        setSearchParams(newParams, { replace: true });
                      }}
                      className="text-sky-600 focus:ring-sky-500 rounded-full"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Ngân Sách */}
            <div className="space-y-2 pt-2 border-t border-white/8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngân Sách</label>
              <div className="space-y-2 text-sm text-slate-400">
                {[
                  { id: 'ALL', label: 'Tất cả mức giá' },
                  { id: 'UNDER_5M', label: 'Dưới 5 triệu' },
                  { id: '5M_TO_10M', label: 'Từ 5 đến 10 triệu' },
                  { id: 'OVER_10M', label: 'Trên 10 triệu' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-sky-400 text-slate-400">
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
            <div
              className="flex items-center justify-between p-4 rounded-2xl border border-white/8"
              style={{ background: 'rgba(10,17,29,0.85)', backdropFilter: 'blur(16px)' }}
            >
			<span className="text-sm font-semibold text-slate-400">
			  Hiển thị{' '}
			  <span className="font-bold text-white">
			    {tours.length > 0 ? `${firstItem}–${lastItem}` : '0'}
			  </span>{' '}
			  trên tổng số{' '}
			  <span className="font-bold text-white">
			    {tours.length}
			  </span>{' '}
			  tour
			</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sắp xếp:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold text-white border-none bg-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer [&>option]:bg-slate-900"
                >
                  <option value="FEATURED">Nổi bật nhất</option>
                  <option value="PRICE_ASC">Giá tăng dần</option>
                  <option value="PRICE_DESC">Giá giảm dần</option>
                  <option value="VIEWS">Lượt xem nhiều nhất</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div
                className="flex h-64 items-center justify-center rounded-2xl border border-white/8"
                style={{ background: 'rgba(10,17,29,0.85)' }}
              >
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
              </div>
            ) : tours.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed border-white/15 p-16 text-center text-slate-500 space-y-3"
                style={{ background: 'rgba(10,17,29,0.85)' }}
              >
                <p className="text-lg font-bold text-white">Không tìm thấy tour phù hợp</p>
                <p className="text-sm">Vui lòng thử điều chỉnh bộ lọc để xem các hành trình khác.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-semibold text-white transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleTours.map((tour) => (
                  <div 
                    key={tour.id} 
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 flex flex-col hover:-translate-y-1"
                    style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={tour.thumbnailUrl} 
                        alt={tour.title} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 bg-sky-500/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                        KH từ {tour.departureLocation || 'TP.Hồ Chí Minh'}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 
                          onClick={() => navigate(`/tours/${tour.id}`)}
                          className="text-xs font-extrabold text-white hover:text-sky-300 cursor-pointer line-clamp-2 leading-snug uppercase transition-colors"
                        >
                          {tour.title}
                        </h3>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-b border-white/8 pb-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Eye className="h-3.5 w-3.5" /> {tour.viewCount || 100} Lượt xem
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {tour.averageRating || 5.0}/5 ({tour.totalReviews || 0})
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            📌 Đã chốt ({tour.totalReviews || 0})
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                            <span>Khởi hành: <strong className="text-slate-200">{tourScheduleService.getTourDepartureDateDisplay(tour.id)}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                            <span>Thời gian: <strong className="text-slate-200">{tour.durationDays} ngày {tour.durationNights} đêm</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/8 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-slate-500">Giá từ: </span>
                            <span className="text-base font-black text-rose-400">
                              {tour.price.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[10px] text-slate-500"> / Khách</span>
                          </div>
                          {(() => {
                            const avail = tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats ?? 40);
                            return (
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                avail > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                              }`}>
                                {avail > 0 ? `Còn ${avail} chỗ` : 'Hết chỗ'}
                              </span>
                            );
                          })()}
                        </div>

                        <button 
                          onClick={() => navigate(`/tours/${tour.id}`)}
                          className="w-full rounded-xl py-2.5 text-xs font-bold transition hover:-translate-y-0.5 text-white"
                          style={{
                            background: 'linear-gradient(to top, #9ad9ec 1px, #14a8c6 5px, #04465a 13px, #0a111d 32px)',
                            boxShadow: '0 0 10px rgba(60,190,235,.18), 0 4px 12px -2px rgba(90,220,255,.28)',
                          }}
                        >
                          Đặt ngay
                        </button>
                      </div>
                    </div>
                  </div>
				        ))}
				      </div>
				    )}

				    {!loading && tours.length > PAGE_SIZE && (
				      <nav
				        aria-label="Phân trang danh sách tour"
				        className="flex flex-wrap items-center justify-center gap-2 pt-4"
				      >
				        <button
				          type="button"
				          disabled={activePage === 1}
				          onClick={() => setCurrentPage(activePage - 1)}
				          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
				        >
				          Trước
				        </button>

				        {Array.from({ length: totalPages }, (_, index) => {
				          const page = index + 1;

				          return (
				            <button
				              key={page}
				              type="button"
				              aria-label={`Trang ${page}`}
				              aria-current={activePage === page ? 'page' : undefined}
				              onClick={() => setCurrentPage(page)}
				              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition ${
				                activePage === page
				                  ? 'border-sky-500 bg-sky-500 text-white'
				                  : 'border-white/20 text-slate-300 hover:bg-white/10'
				              }`}
				            >
				              {page}
				            </button>
				          );
				        })}

				        <button
				          type="button"
				          disabled={activePage === totalPages}
				          onClick={() => setCurrentPage(activePage + 1)}
				          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
				        >
				          Sau
				        </button>
				      </nav>
				    )}
          </main>
        </div>
      </div>
    </div>
  );
};
