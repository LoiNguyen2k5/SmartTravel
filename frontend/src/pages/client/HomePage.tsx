import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, PhoneCall, Calendar, MapPin, 
  Phone, CheckCircle2, Map, Instagram, Facebook, ArrowRight, Tag,
  Star, Eye, Users, Sparkles
} from 'lucide-react';
import { ZaloIcon } from '../../components/common/ZaloIcon';
import { tourScheduleService } from '../../services/tourScheduleService';
import { MOCK_TOURS } from '../../data/mockTours';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 1. AUTO-SLIDING HERO CAROUSEL STATE (Chuyển hình tự động 4.5s)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setScheduleVer] = useState(0);
  const [allTours, setAllTours] = useState<Tour[]>(MOCK_TOURS);

  useEffect(() => {
    const handleUpdate = () => setScheduleVer((v) => v + 1);
    window.addEventListener('tour_schedules_updated', handleUpdate);
    window.addEventListener('custom_tours_updated', handleUpdate);
    return () => {
      window.removeEventListener('tour_schedules_updated', handleUpdate);
      window.removeEventListener('custom_tours_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const loadLiveTours = async () => {
      try {
        const res = await tourService.getAllTours();
        if (res.success && res.data && res.data.length > 0) {
          const merged = res.data.map(t => {
            const fallback = MOCK_TOURS.find(m => m.id === t.id);
            if (fallback) {
              return {
                ...t,
                thumbnailUrl: (t.thumbnailUrl && !t.thumbnailUrl.includes('unsplash')) ? t.thumbnailUrl : fallback.thumbnailUrl,
              };
            }
            return t;
          });
          setAllTours(merged);
        }
      } catch (e) {
        // Fallback to MOCK_TOURS
      }
    };
    loadLiveTours();
  }, []);

  const heroSlides = [
    {
      id: 0,
      title: 'TOUR KHÁCH ĐOÀN & DOANH NGHIỆP',
      subtitle: 'TEAM BUILDING • SỰ KIỆN • HỘI NGHỊ GALA DINNER • DU LỊCH THEO YÊU CẦU',
      features: [
        'Thiết kế lịch trình riêng biệt',
        'Kinh nghiệm phục vụ >1.200 khách',
        'Tư vấn & báo giá nhanh trong 15p',
        'Chi phí tối ưu, dịch vụ trọn gói'
      ],
      hotline: '0941 899 554',
      cards: [
        { label: 'Gia đình & Nhóm bạn', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80' },
        { label: 'Doanh nghiệp & Đoàn thể', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' },
        { label: 'Trường học & Ngoại khóa', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
      ]
    },
    {
      id: 1,
      title: 'DU LỊCH NƯỚC NGOÀI CAO CẤP',
      subtitle: 'TRUNG QUỐC • NHẬT BẢN • HÀN QUỐC • CHÂU ÂU • ĐÔNG NAM Á',
      features: [
        'Bao trọn gói Visa & Vé máy bay',
        'Khách sạn 4-5 sao trung tâm',
        'Hướng dẫn viên tiếng Việt suốt tuyến',
        'Bảo hiểm du lịch quốc tế tối đa'
      ],
      hotline: '0941 899 554',
      cards: [
        { label: 'Phượng Hoàng Cổ Trấn', img: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png' },
        { label: 'Thượng Hải - Ô Trấn', img: '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg' },
        { label: 'Thái Lan Chùa Vàng', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
      ]
    },
    {
      id: 2,
      title: 'KHÁM PHÁ VIỆT NAM KỲ VĨ',
      subtitle: 'PHÚ QUỐC • NHA TRANG • ĐÀ LẠT • ĐÀ NẴNG • TÂY BẮC',
      features: [
        'Ưu đãi giảm tới 30% khi đặt sớm',
        'Lịch trình khám phá văn hóa bản địa',
        'Xe đưa đón đời mới tiện nghi',
        'Hỗ trợ đặt vé trải nghiệm & resort'
      ],
      hotline: '0941 899 554',
      cards: [
        { label: 'Phú Quốc Đảo Ngọc', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80' },
        { label: 'Nha Trang Biển Xanh', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
        { label: 'Đà Lạt Mộng Mơ', img: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg' },
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // 2. SEARCH WIDGET STATE
  const [searchTab, setSearchTab] = useState<'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');
  const [departure, setDeparture] = useState('TP.Hồ Chí Minh');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tours?departure=${encodeURIComponent(departure)}&destination=${encodeURIComponent(destination)}&type=${searchTab}`);
  };

  // Real domestic tours (Núi Chứa Chan id 3, Châu Đốc id 4, Miền Tây 6 tỉnh id 5)
  const domesticTourIds = [3, 4, 5];
  const domesticTours = domesticTourIds
    .map(id => allTours.find(t => t.id === id) || MOCK_TOURS.find(t => t.id === id))
    .filter(Boolean) as Tour[];

  // Real international tours (Ân Thi id 1, Thượng Hải Ô Trấn id 2, Thái Lan id 10)
  const internationalTourIds = [1, 2, 10];
  const internationalTours = internationalTourIds
    .map(id => allTours.find(t => t.id === id) || MOCK_TOURS.find(t => t.id === id))
    .filter(Boolean) as Tour[];

  return (
    <div className="space-y-20 pb-20 relative">

      {/* 1. HERO SLIDER BANNER (Impeccable Cinematic Atmosphere) */}
      <section className="relative bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-white overflow-hidden pt-16 pb-24 transition-all duration-700">
        
        {/* Subtle decorative radial lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-3 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-accent-300 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Khởi hành hành trình mơ ước</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-sm">
              {heroSlides[currentSlide].title}
            </h1>
            
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-primary-200/90 uppercase max-w-2xl mx-auto">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          {/* Key Advantages Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto text-center">
            {heroSlides[currentSlide].features.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-white shadow-sm hover:bg-white/15 transition"
              >
                <CheckCircle2 className="h-4 w-4 text-accent-400 flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          {/* 3 Showcase Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 max-w-5xl mx-auto items-center">
            
            {/* Left Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-card group h-48">
              <img 
                src={heroSlides[currentSlide].cards[0].img} 
                alt="Highlight 1" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end justify-center p-4">
                <span className="glass-surface text-primary-950 text-xs font-extrabold px-5 py-2 rounded-full tracking-wide shadow-sm">
                  {heroSlides[currentSlide].cards[0].label}
                </span>
              </div>
            </div>

            {/* Center Featured Card with Hotline */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-accent-400/80 shadow-float group h-56 -translate-y-2">
              <img 
                src={heroSlides[currentSlide].cards[1].img} 
                alt="Highlight 2" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
              />
              
              {/* Hotline Badge */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-accent-500 text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap border border-white/40">
                <Phone className="h-3.5 w-3.5" /> 
                <span>HOTLINE: <strong className="text-white text-sm tracking-wide">{heroSlides[currentSlide].hotline}</strong></span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end justify-center p-4">
                <span className="bg-primary-900/95 border border-accent-400/80 text-accent-300 text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider shadow-lg">
                  {heroSlides[currentSlide].cards[1].label}
                </span>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-card group h-48">
              <img 
                src={heroSlides[currentSlide].cards[2].img} 
                alt="Highlight 3" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end justify-center p-4">
                <span className="glass-surface text-primary-950 text-xs font-extrabold px-5 py-2 rounded-full tracking-wide shadow-sm">
                  {heroSlides[currentSlide].cards[2].label}
                </span>
              </div>
            </div>

          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 transition-all rounded-full ${
                  currentSlide === i ? 'w-8 bg-accent-400' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

        </div>

      </section>

      {/* 2. FLOATING QUICK SEARCH WIDGET */}
      <section className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card-hover p-6 sm:p-7 space-y-5">
          
          {/* Segmented Filter Tab */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setSearchTab('DOMESTIC')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                searchTab === 'DOMESTIC'
                  ? 'bg-white text-primary-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Du lịch trong nước
            </button>
            <button
              type="button"
              onClick={() => setSearchTab('INTERNATIONAL')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                searchTab === 'INTERNATIONAL'
                  ? 'bg-white text-primary-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Du lịch nước ngoài
            </button>
          </div>

          {/* Search Form Inputs */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Điểm khởi hành
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs transition">
                <MapPin className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="TP.Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Điểm đến mong muốn
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs transition">
                <MapPin className="h-4 w-4 text-accent-500 flex-shrink-0" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả điểm đến</option>
                  <option value="Phượng Hoàng Cổ Trấn">Ân Thi — Phượng Hoàng Cổ Trấn</option>
                  <option value="Thượng Hải">Thượng Hải — Tây Sách Ô Trấn</option>
                  <option value="Thái Lan">Thái Lan — Bangkok & Pattaya</option>
                  <option value="Núi Chứa Chan">Đồng Nai — Núi Chứa Chan</option>
                  <option value="Châu Đốc">An Giang — Miếu Bà Chúa Xứ</option>
                  <option value="Cà Mau">Miền Tây — Đất Mũi Cà Mau</option>
                  <option value="Đà Lạt">Đà Lạt — Thành Phố Ngàn Hoa</option>
                  <option value="Phú Quốc">Phú Quốc — Đảo Ngọc Thiên Đường</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Ngày dự kiến đi
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs transition">
                <Calendar className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary-900 hover:bg-primary-950 active:scale-[0.98] text-white font-bold py-3 text-xs transition-all shadow-md hover:shadow-card flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" /> 
                <span>Tìm kiếm chuyến đi</span>
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* 3. SECTION: ĐIỂM ĐẾN NỔI BẬT & ĐƯỢC YÊU THÍCH (Ảnh chuẩn địa danh 100%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-accent-600 uppercase tracking-widest">Khám phá theo địa danh</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Điểm Đến Được Yêu Thích Nhất
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Hành trình trọn vẹn từ danh lam thắng cảnh Việt Nam đến những thành phố hoa lệ khắp 5 châu.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {[
            { name: 'Hà Nội', visits: 528, region: 'Miền Bắc', img: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=600&q=80' },
            { name: 'Đà Nẵng', visits: 895, region: 'Miền Trung', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80' },
            { name: 'Đà Lạt', visits: 786, region: 'Tây Nguyên', img: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg' },
            { name: 'Phú Quốc', visits: 586, region: 'Kiên Giang', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Á', visits: 655, region: 'Quốc tế', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Mỹ', visits: 345, region: 'Quốc tế', img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Âu', visits: 271, region: 'Quốc tế', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Úc', visits: 547, region: 'Quốc tế', img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=600&q=80' },
          ].map((dest, i) => (
            <div
              key={i}
              onClick={() => navigate(`/tours?destination=${encodeURIComponent(dest.name)}`)}
              className="relative h-48 rounded-3xl overflow-hidden shadow-subtle hover:shadow-card-hover transition-all duration-300 cursor-pointer group border border-slate-200/60"
            >
              <img 
                src={dest.img} 
                alt={dest.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-center">
                <span className="text-[10px] font-bold text-accent-300 uppercase tracking-wider">{dest.region}</span>
                <span className="text-white font-display font-extrabold text-base sm:text-lg drop-shadow-sm">{dest.name}</span>
                <span className="text-[11px] text-slate-300/90 font-medium">{dest.visits} lượt đặt gần đây</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: DU LỊCH TRONG NƯỚC (Editorial Tour Showcase - 100% Khớp Tour Thực Tế) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Danh lam xứ sở</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tour Du Lịch Trong Nước
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Trải nghiệm cảnh sắc tuyệt đẹp và văn hóa ẩm thực đặc sắc ba miền.
            </p>
          </div>

          <button
            onClick={() => navigate('/tours?type=DOMESTIC')}
            className="text-xs font-bold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1.5 transition self-start sm:self-auto group"
          >
            <span>Xem tất cả tour trong nước</span> 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {domesticTours.map((tour) => (
            <div 
              key={tour.id} 
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={tour.thumbnailUrl} 
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-primary-900 shadow-sm flex items-center gap-1">
                    <Tag className="h-3 w-3 text-accent-500" />
                    <span>{tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-slate-400" /> {tour.viewCount || 300}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-400" /> {tour.averageRating?.toFixed(1) || '5.0'}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Users className="h-3.5 w-3.5" /> Còn {tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats || 40)} chỗ</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <span>Khởi hành: <strong className="text-slate-800 font-bold">{tourScheduleService.getTourDepartureDateDisplay(tour.id)}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Giá trọn gói từ</span>
                      <span className="text-xl font-extrabold text-accent-600 font-display">
                        {tour.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">/ khách</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-xl bg-primary-900 hover:bg-primary-950 active:scale-[0.98] text-white font-bold text-xs py-3 transition shadow-sm"
                >
                  Xem chi tiết & Đặt chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: DU LỊCH NƯỚC NGOÀI (High-Value International Tours - 100% Khớp Tour Thực Tế) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-accent-600 uppercase tracking-widest">Hành trình thế giới</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tour Du Lịch Nước Ngoài
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Khám phá kỳ quan thế giới cùng tiêu chuẩn dịch vụ khách sạn 4–5 sao trọn gói.
            </p>
          </div>

          <button
            onClick={() => navigate('/tours?type=INTERNATIONAL')}
            className="text-xs font-bold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1.5 transition self-start sm:self-auto group"
          >
            <span>Xem tất cả tour quốc tế</span> 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internationalTours.map((tour) => (
            <div 
              key={tour.id} 
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={tour.thumbnailUrl} 
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-primary-900 shadow-sm flex items-center gap-1">
                    <Tag className="h-3 w-3 text-accent-500" />
                    <span>{tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-slate-400" /> {tour.viewCount || 300}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-400" /> 5.0</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Users className="h-3.5 w-3.5" /> Còn {tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats || 35)} chỗ</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <span>Khởi hành: <strong className="text-slate-800 font-bold">{tourScheduleService.getTourDepartureDateDisplay(tour.id)}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Giá trọn gói từ</span>
                      <span className="text-xl font-extrabold text-accent-600 font-display">
                        {tour.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">/ khách</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-xl bg-primary-900 hover:bg-primary-950 active:scale-[0.98] text-white font-bold text-xs py-3 transition shadow-sm"
                >
                  Xem chi tiết & Đặt chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SECTION: PROMO SERVICE BANNER (Bespoke Warm & Navy Luxury Presentation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 rounded-3xl overflow-hidden shadow-float p-8 sm:p-12 text-white relative border border-primary-800">
          
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-400/30 text-accent-300 text-xs font-bold uppercase tracking-wider">
              <span>Smart Travel Partner</span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase leading-tight tracking-tight">
              Dịch vụ lữ hành toàn diện <br />
              <span className="text-accent-400">An toàn • Sáng tạo • Xứng tầm</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Tổ chức tour đoàn, team building và hội nghị chuyên nghiệp với hơn 15 năm uy tín trong ngành du lịch & sự kiện tại Việt Nam.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-200 pt-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Team Building gắn kết</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Tour khách đoàn & Gala</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Tổ chức hội nghị sự kiện</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Xe du lịch đời mới 100%</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Vé máy bay & Dịch vụ Visa</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-400" /> Bảo hiểm du lịch cao cấp</div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/about')}
                className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white font-bold px-7 py-3 rounded-2xl text-xs uppercase shadow-md transition-all"
              >
                Liên hệ tư vấn ngay
              </button>
              <div className="text-xs text-slate-300">
                Hotline hỗ trợ 24/7: <a href="tel:0941899554" className="text-accent-400 text-sm font-extrabold hover:underline ml-1">0941 899 554</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: LÊN KẾ HOẠCH CHUYẾN ĐI (Brand Story & Trust) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="relative text-center">
            <div className="relative inline-block">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                alt="Travel Planning Inspiration"
                className="w-72 sm:w-88 md:w-96 h-72 sm:h-88 md:h-96 object-cover rounded-3xl shadow-float border-4 border-white mx-auto"
              />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-card px-5 py-3 rounded-2xl flex items-center gap-3 text-xs text-slate-800 whitespace-nowrap">
                <div className="h-8 w-8 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Đường dây nóng</div>
                  <div className="text-primary-950 font-black text-sm">0941 899 554</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            <span className="text-xs font-bold text-accent-600 uppercase tracking-widest block">Gửi gắm trọn vẹn niềm tin</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Lên kế hoạch kỳ nghỉ hoàn hảo với SMART TRAVEL
            </h2>
            <p>
              SMART TRAVEL được dẫn dắt bởi ban lãnh đạo có hơn 15 năm kinh nghiệm thực chiến trong lĩnh vực Du lịch lữ hành và Quản lý sự kiện. Sự thấu hiểu sâu sắc cùng khả năng tiên phong ứng dụng công nghệ giúp chúng tôi kiến tạo những hải trình đáng nhớ nhất.
            </p>
            <p>
              Đội ngũ chuyên viên tư vấn luôn đồng hành từ khâu lên ý tưởng, cá nhân hóa lịch trình cho đến hỗ trợ trực tiếp trong suốt chuyến đi của bạn.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/about')}
                className="rounded-2xl bg-primary-900 hover:bg-primary-950 active:scale-[0.98] text-white font-bold px-6 py-3 text-xs transition shadow-sm"
              >
                Khám phá câu chuyện của chúng tôi
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 8. SECTION: TIN TỨC & CẨM NANG DU LỊCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-accent-600 uppercase tracking-widest">Kinh nghiệm & Bí quyết</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cẩm Nang & Tin Tức Du Lịch Mới Nhất
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Cập nhật xu hướng xê dịch, mẹo tiết kiệm chi phí và hướng dẫn chuẩn bị hành trang tốt nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Tour Tây Ninh lễ 2/9 – Chinh phục nóc nhà Nam Bộ núi Bà Đen 1 ngày',
              date: '14/08/2026',
              author: 'Ban Biên Tập Smart Travel',
              summary: 'Khám phá quần thể tâm linh đỉnh Bà Đen hùng vĩ, trải nghiệm cáp treo hiện đại và thưởng thức đặc sản bò tơ nức tiếng.',
              img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'
            },
            {
              title: 'Kinh nghiệm du lịch đảo Phú Quý tự túc trọn gói từ A đến Z',
              date: '13/08/2026',
              author: 'Ban Biên Tập Smart Travel',
              summary: 'Khám phá hòn ngọc biển xanh nguyên sơ, những cung đường ven biển tuyệt đẹp và lịch trình ngắm hoàng hôn lý tưởng.',
              img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
            },
            {
              title: 'Côn Đảo huyền bí – Hành trình về miền lịch sử và biển cả thiêng liêng',
              date: '12/08/2026',
              author: 'Ban Biên Tập Smart Travel',
              summary: 'Lịch trình 2 ngày kết hợp nghỉ dưỡng bên bờ biển thanh bình và viếng mộ chị Võ Thị Sáu cùng các di tích lịch sử anh hùng.',
              img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80'
            }
          ].map((news, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle hover:shadow-card-hover transition-all duration-300 p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="h-44 rounded-2xl overflow-hidden">
                  <img 
                    src={news.img} 
                    alt={news.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                </div>
                
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span>📅 {news.date}</span>
                  <span>•</span>
                  <span>✍️ {news.author}</span>
                </div>

                <h4 className="font-display font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
                  {news.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {news.summary}
                </p>
              </div>

              <div className="pt-4">
                <span className="text-xs font-bold text-primary-600 group-hover:text-primary-800 inline-flex items-center gap-1 transition">
                  Đọc bài viết <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FLOATING CONTACT SPEED DIAL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        <a
          href="https://zalo.me/0941899554"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl overflow-hidden shadow-card-hover hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-white border border-slate-100"
          title="Tư vấn qua Zalo (0941 899 554)"
        >
          <ZaloIcon className="h-11 w-11" />
        </a>

        <a
          href="https://www.facebook.com/loiii.nguyen.397715"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-card-hover hover:scale-110 active:scale-95 transition-all"
          title="Trang Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>

        <a
          href="https://www.instagram.com/loiiinguyen/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-card-hover hover:scale-110 active:scale-95 transition-all"
          title="Instagram"
        >
          <Instagram className="h-5 w-5" />
        </a>

        <a
          href="tel:0941899554"
          className="h-11 w-11 rounded-2xl bg-accent-500 text-white flex items-center justify-center shadow-card-hover hover:scale-110 active:scale-95 transition-all"
          title="Gọi Hotline: 0941 899 554"
        >
          <Phone className="h-5 w-5 fill-white" />
        </a>

        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-primary-900 text-white flex items-center justify-center shadow-card-hover hover:scale-110 active:scale-95 transition-all"
          title="Địa chỉ công ty"
        >
          <Map className="h-5 w-5" />
        </a>
      </div>

    </div>
  );
};
