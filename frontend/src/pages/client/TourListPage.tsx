import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';
import { Filter, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { MOCK_TOURS } from '../../data/mockTours';
import { tourScheduleService } from '../../services/tourScheduleService';
import { getTourTransportInfo, TourTransportMode } from '../../utils/tourTransport';
import { BoardingPassTourCard } from '../../components/tour/BoardingPassTourCard';

export const TourListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const PAGE_SIZE = 9;

  const getInitialPage = (): number => {
    const pageInUrl = searchParams.get('page');
    if (pageInUrl) {
      const p = parseInt(pageInUrl, 10);
      if (!isNaN(p) && p > 0) return p;
    }
    const saved = sessionStorage.getItem('smart_travel_tour_page');
    if (saved) {
      const p = parseInt(saved, 10);
      if (!isNaN(p) && p > 0) return p;
    }
    return 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage);

  const totalPages = Math.max(1, Math.ceil(tours.length / PAGE_SIZE));
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (activePage - 1) * PAGE_SIZE;

  const visibleTours = tours.slice(startIndex, startIndex + PAGE_SIZE);
  const firstItem = tours.length === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + PAGE_SIZE, tours.length);

  // Filters state
  const [departure, setDeparture] = useState<string>(() => searchParams.get('departure') || 'Tất cả');
  const [destination, setDestination] = useState<string>(() => searchParams.get('destination') || 'Tất cả');
  const [transportFilter, setTransportFilter] = useState<'ALL' | TourTransportMode>(() => {
    const raw = searchParams.get('transport')?.toUpperCase();
    return raw === 'FLIGHT' || raw === 'LAND_SEA' ? raw : 'ALL';
  });
  const [durationFilter, setDurationFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>(() => parseCategoryFromParams(searchParams));
  const [budgetFilter, setBudgetFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const isMountedRef = React.useRef(false);
  const prevFiltersRef = React.useRef({
    departure,
    destination,
    transportFilter,
    durationFilter,
    categoryFilter,
    budgetFilter,
    sortBy,
  });

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    sessionStorage.setItem('smart_travel_tour_page', String(newPage));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage > 1) {
        next.set('page', String(newPage));
      } else {
        next.delete('page');
      }
      return next;
    });
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  useEffect(() => {
    const newCategory = parseCategoryFromParams(searchParams);
    if (newCategory !== categoryFilter) {
      setCategoryFilter(newCategory);
    }

    const newDest = searchParams.get('destination') || 'Tất cả';
    if (newDest !== destination) {
      setDestination(newDest);
    }

    const newDep = searchParams.get('departure') || 'Tất cả';
    if (newDep !== departure) {
      setDeparture(newDep);
    }

    const pageInUrl = searchParams.get('page');
    const p = pageInUrl ? parseInt(pageInUrl, 10) : 1;
    if (!isNaN(p) && p > 0 && p !== currentPage) {
      setCurrentPage(p);
      sessionStorage.setItem('smart_travel_tour_page', String(p));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      fetchTours();
      return;
    }

    const prev = prevFiltersRef.current;
    const filterChanged =
      prev.departure !== departure ||
      prev.destination !== destination ||
      prev.transportFilter !== transportFilter ||
      prev.durationFilter !== durationFilter ||
      prev.categoryFilter !== categoryFilter ||
      prev.budgetFilter !== budgetFilter ||
      prev.sortBy !== sortBy;

    if (filterChanged) {
      prevFiltersRef.current = {
        departure,
        destination,
        transportFilter,
        durationFilter,
        categoryFilter,
        budgetFilter,
        sortBy,
      };
      setCurrentPage(1);
      sessionStorage.setItem('smart_travel_tour_page', '1');
      setSearchParams((prevParams) => {
        const next = new URLSearchParams(prevParams);
        next.delete('page');
        return next;
      });
    }

    fetchTours();
  }, [departure, destination, transportFilter, durationFilter, categoryFilter, budgetFilter, sortBy]);

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
      await tourScheduleService.syncFromServer();
      const res = await tourService.getAllTours();
      let liveTours: Tour[] = res.success && Array.isArray(res.data) ? [...res.data] : [];

      liveTours = liveTours.map((t) => {
        const assetMeta = MOCK_TOURS.find((m) => m.id === t.id);
        if (assetMeta) {
          return {
            ...t,
            thumbnailUrl:
              t.thumbnailUrl && !t.thumbnailUrl.includes('unsplash') ? t.thumbnailUrl : assetMeta.thumbnailUrl,
            gallery: t.gallery && t.gallery.length > 0 ? t.gallery : assetMeta.gallery,
          };
        }
        return t;
      });

      liveTours = liveTours.filter((t) => tourScheduleService.hasUpcomingSchedule(t.id));

      if (departure !== 'Tất cả') {
        liveTours = liveTours.filter((t) =>
          t.departureLocation?.toLowerCase().includes(departure.toLowerCase())
        );
      }
      if (destination !== 'Tất cả') {
        liveTours = liveTours.filter((t) => t.title.toLowerCase().includes(destination.toLowerCase()));
      }
      if (transportFilter !== 'ALL') {
        liveTours = liveTours.filter((t) => getTourTransportInfo(t).mode === transportFilter);
      }
      if (durationFilter === '1_DAY') {
        liveTours = liveTours.filter((t) => t.durationDays === 1);
      } else if (durationFilter === '1_TO_3') {
        liveTours = liveTours.filter((t) => t.durationDays >= 1 && t.durationDays <= 3);
      } else if (durationFilter === 'OVER_3') {
        liveTours = liveTours.filter((t) => t.durationDays > 3);
      }

      if (categoryFilter !== 'ALL') {
        liveTours = liveTours.filter((t) => t.category === categoryFilter);
      }

      if (budgetFilter === 'UNDER_5M') {
        liveTours = liveTours.filter((t) => t.price < 5000000);
      } else if (budgetFilter === '5M_TO_10M') {
        liveTours = liveTours.filter((t) => t.price >= 5000000 && t.price <= 10000000);
      } else if (budgetFilter === 'OVER_10M') {
        liveTours = liveTours.filter((t) => t.price > 10000000);
      }

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
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setDeparture('Tất cả');
    setDestination('Tất cả');
    setTransportFilter('ALL');
    setDurationFilter('ALL');
    setCategoryFilter('ALL');
    setBudgetFilter('ALL');
    setSortBy('FEATURED');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-16 text-[#0F172A]">
      {/* Deep Ocean Top Banner Header (Matching Preview Image 2) */}
      <div className="relative overflow-hidden py-9 px-4 sm:px-6 lg:px-8 bg-[#0B3B49] text-white">
        <div className="absolute -top-20 right-1/4 w-[500px] h-[220px] bg-[#0D9488]/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto space-y-2">
          <nav className="flex items-center gap-2 text-xs text-[#5EEAD4] font-semibold">
            <span className="hover:underline cursor-pointer transition" onClick={() => navigate('/')}>
              Trang Chủ
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/90">Danh sách Tour</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
            Danh sách Tour Du Lịch Trọn Gói
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Hiển thị minh bạch phương tiện (Máy bay khứ hồi / Xe Limousine), lịch khởi hành, thủ tục Visa và mức đặt cọc 30%.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Mobile Collapsible Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-[#E6E1DA] shadow-card text-sm font-extrabold text-[#0B3B49] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#0D9488]" />
              <span>Bộ Lọc Tìm Kiếm</span>
              {[departure !== 'Tất cả', destination !== 'Tất cả', transportFilter !== 'ALL', durationFilter !== 'ALL', categoryFilter !== 'ALL', budgetFilter !== 'ALL'].filter(Boolean).length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D95D39] text-white text-[10px] font-black">
                  {[departure !== 'Tất cả', destination !== 'Tất cả', transportFilter !== 'ALL', durationFilter !== 'ALL', categoryFilter !== 'ALL', budgetFilter !== 'ALL'].filter(Boolean).length}
                </span>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">
          {/* Left Sidebar Filter Section (Collapsible on mobile, sticky on lg+) */}
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-[#E6E1DA] shadow-card space-y-5 self-start lg:sticky lg:top-24`}>
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3.5">
              <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-base">
                <Filter className="h-4 w-4 text-[#0D9488]" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#D95D39] hover:text-[#C24E2D] flex items-center gap-1 font-bold transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Xóa lọc
              </button>
            </div>

            {/* Điểm khởi hành */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Điểm Khởi Hành
              </label>
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#0D9488] focus:bg-white focus:outline-none"
              >
                <option value="Tất cả">Tất cả điểm khởi hành</option>
                <option value="TP.Hồ Chí Minh">TP.Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            {/* Điểm đến */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Điểm Đến
              </label>
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
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#0D9488] focus:bg-white focus:outline-none"
              >
                <option value="Tất cả">Tất cả điểm đến</option>
                <option value="Hàn Quốc">Hàn Quốc (Seoul – Nami)</option>
                <option value="Nhật Bản">Nhật Bản (Tokyo – Phú Sĩ)</option>
                <option value="Thái Lan">Thái Lan (Bangkok – Pattaya)</option>
                <option value="Singapore">Singapore – Malaysia</option>
                <option value="Phượng Hoàng Cổ Trấn">Phượng Hoàng Cổ Trấn / Ân Thi</option>
                <option value="Thượng Hải">Thượng Hải – Ô Trấn</option>
                <option value="Đà Nẵng">Đà Nẵng – Hội An – Huế</option>
                <option value="Phú Quốc">Phú Quốc – Nam Đảo</option>
                <option value="Hà Nội">Hà Nội – Hạ Long – Sa Pa</option>
                <option value="Đà Lạt">Đà Lạt (Lâm Đồng)</option>
                <option value="Miền Tây">Miền Tây sông nước (6 tỉnh / Cà Mau)</option>
                <option value="Châu Đốc">Châu Đốc – An Giang</option>
                <option value="Nam Du">Đảo Nam Du</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
                <option value="Phú Yên">Phú Yên – Quy Nhơn</option>
                <option value="Núi Chứa Chan">Núi Chứa Chan – Đồng Nai</option>
                {destination !== 'Tất cả' &&
                  ![
                    'Hàn Quốc',
                    'Nhật Bản',
                    'Thái Lan',
                    'Singapore',
                    'Phượng Hoàng Cổ Trấn',
                    'Thượng Hải',
                    'Đà Nẵng',
                    'Phú Quốc',
                    'Hà Nội',
                    'Đà Lạt',
                    'Miền Tây',
                    'Châu Đốc',
                    'Nam Du',
                    'Vũng Tàu',
                    'Phú Yên',
                    'Núi Chứa Chan',
                  ].includes(destination) && <option value={destination}>{destination}</option>}
              </select>
            </div>

            {/* Phương Tiện Di Chuyển */}
            <div className="space-y-2 pt-3 border-t border-[#E6E1DA]">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Phương Tiện Di Chuyển
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'Tất cả phương tiện' },
                  { id: 'FLIGHT', label: 'Máy bay khứ hồi + Ô tô' },
                  { id: 'LAND_SEA', label: 'Xe Limousine / Tàu cao tốc' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 cursor-pointer text-xs transition ${
                      transportFilter === opt.id
                        ? 'font-extrabold text-[#0B3B49]'
                        : 'font-medium text-slate-600 hover:text-[#0B3B49]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="transport"
                      checked={transportFilter === opt.id}
                      onChange={() => {
                        const modeVal = opt.id as 'ALL' | TourTransportMode;
                        setTransportFilter(modeVal);
                        const newParams = new URLSearchParams(searchParams);
                        if (modeVal === 'ALL') {
                          newParams.delete('transport');
                        } else {
                          newParams.set('transport', modeVal);
                        }
                        setSearchParams(newParams, { replace: true });
                      }}
                      className="accent-[#0B3B49] h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Khoảng Thời Gian */}
            <div className="space-y-2 pt-3 border-t border-[#E6E1DA]">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Khoảng Thời Gian
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'Tất cả thời lượng' },
                  { id: '1_DAY', label: '1 ngày' },
                  { id: '1_TO_3', label: '1 đến 3 ngày' },
                  { id: 'OVER_3', label: 'Trên 3 ngày' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 cursor-pointer text-xs transition ${
                      durationFilter === opt.id
                        ? 'font-extrabold text-[#0B3B49]'
                        : 'font-medium text-slate-600 hover:text-[#0B3B49]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      checked={durationFilter === opt.id}
                      onChange={() => setDurationFilter(opt.id)}
                      className="accent-[#0B3B49] h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Loại Tour */}
            <div className="space-y-2 pt-3 border-t border-[#E6E1DA]">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Loại Tour
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'Tất cả loại tour' },
                  { id: 'DOMESTIC', label: 'Domestic (Trong nước)' },
                  { id: 'NUOC_NGOAI', label: 'Tour nước ngoài' },
                  { id: 'LE_2_9', label: 'Tour Lễ 2/9' },
                  { id: 'KHUYEN_MAI', label: 'Tour Khuyến Mãi' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 cursor-pointer text-xs transition ${
                      categoryFilter === opt.id
                        ? 'font-extrabold text-[#0B3B49]'
                        : 'font-medium text-slate-600 hover:text-[#0B3B49]'
                    }`}
                  >
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
                      className="accent-[#0B3B49] h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Ngân Sách */}
            <div className="space-y-2 pt-3 border-t border-[#E6E1DA]">
              <label className="text-[11px] font-extrabold text-[#526071] uppercase tracking-wider">
                Ngân Sách
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'Tất cả mức giá' },
                  { id: 'UNDER_5M', label: 'Dưới 5 triệu' },
                  { id: '5M_TO_10M', label: 'Từ 5 đến 10 triệu' },
                  { id: 'OVER_10M', label: 'Trên 10 triệu' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 cursor-pointer text-xs transition ${
                      budgetFilter === opt.id
                        ? 'font-extrabold text-[#0B3B49]'
                        : 'font-medium text-slate-600 hover:text-[#0B3B49]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      checked={budgetFilter === opt.id}
                      onChange={() => setBudgetFilter(opt.id)}
                      className="accent-[#0B3B49] h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Main Content Listing */}
          <main className="lg:col-span-3 space-y-6">
            {/* Top Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-subtle">
              <span className="text-sm font-semibold text-[#526071]">
                Hiển thị{' '}
                <span className="font-extrabold text-[#0F172A]">
                  {tours.length > 0 ? `${firstItem}–${lastItem}` : '0'}
                </span>{' '}
                trên tổng số <span className="font-extrabold text-[#0F172A]">{tours.length}</span> tour trọn gói
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#526071]">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-[#0F172A] border border-[#CBD5E1] bg-[#F8FAFC] rounded-xl px-3 py-2 focus:border-[#0D9488] focus:outline-none cursor-pointer"
                >
                  <option value="FEATURED">Nổi bật nhất</option>
                  <option value="PRICE_ASC">Giá tăng dần</option>
                  <option value="PRICE_DESC">Giá giảm dần</option>
                  <option value="VIEWS">Lượt xem nhiều nhất</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E6E1DA] bg-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0D9488] border-t-transparent" />
              </div>
            ) : tours.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-16 text-center text-[#526071] space-y-3">
                <p className="text-lg font-extrabold text-[#0F172A]">Không tìm thấy tour phù hợp</p>
                <p className="text-sm">Vui lòng thử điều chỉnh bộ lọc để xem các hành trình khác.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 rounded-xl bg-[#D95D39] hover:bg-[#C24E2D] px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleTours.map((tour) => (
                  <BoardingPassTourCard
                    key={tour.id}
                    tour={tour}
                    onSelect={(id) => navigate(`/tours/${id}`, { state: { fromPage: activePage } })}
                  />
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
                  onClick={() => changePage(activePage - 1)}
                  className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0B3B49] hover:bg-[#E6F4F1] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
                      onClick={() => changePage(page)}
                      className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-bold transition cursor-pointer ${
                        activePage === page
                          ? 'border-[#0B3B49] bg-[#0B3B49] text-white shadow-sm'
                          : 'border-[#CBD5E1] bg-white text-slate-700 hover:border-[#0B3B49] hover:bg-[#E6F4F1]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => changePage(activePage + 1)}
                  className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0B3B49] hover:bg-[#E6F4F1] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
