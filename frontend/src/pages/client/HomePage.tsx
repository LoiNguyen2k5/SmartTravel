import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, Calendar,
  Phone, CheckCircle2, Map, Instagram, Facebook, ArrowRight, Tag,
  Star, Eye, Users
} from 'lucide-react';
import { ZaloIcon } from '../../components/common/ZaloIcon';
import { tourScheduleService } from '../../services/tourScheduleService';
import { MOCK_TOURS } from '../../data/mockTours';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';
import { LuxuryHero3D } from '../../components/home/LuxuryHero3D';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [, setScheduleVer] = useState(0);
  const [allTours, setAllTours] = useState<Tour[]>(MOCK_TOURS);

  useEffect(() => {
	tourService.getAllTours().then(response => {
	  if (response.success && response.data?.length > 0) {
	    setAllTours(response.data);
	  }
	}).catch(err => {
	  console.warn("Using mock tours fallback:", err);
	});

    const handleScheduleUpdate = () => {
      setScheduleVer(v => v + 1);
    };
    window.addEventListener('tour_schedules_updated', handleScheduleUpdate);
    return () => window.removeEventListener('tour_schedules_updated', handleScheduleUpdate);
  }, []);

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

  // Real international tours (Ân Thi id 1, Thượng Hải Ô Trấn id 2)
  const internationalTourIds = [1, 2];
  const internationalTours = internationalTourIds
    .map(id => allTours.find(t => t.id === id) || MOCK_TOURS.find(t => t.id === id))
    .filter(Boolean) as Tour[];

  return (
    <div className="bg-[#020204] text-white min-h-screen space-y-20 pb-24 relative overflow-hidden font-sans">
      
      {/* Ambient Deep Space Radial Glows */}
      <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1700px] -right-40 w-[700px] h-[700px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[2800px] left-1/4 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* 1. LUXURY 3D PERSPECTIVE HERO & BOOKING INTERFACE */}
      <LuxuryHero3D
        tours={allTours}
        searchTab={searchTab}
        setSearchTab={setSearchTab}
        departure={departure}
        setDeparture={setDeparture}
        destination={destination}
        setDestination={setDestination}
        departDate={departDate}
        setDepartDate={setDepartDate}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* 3. SECTION: ĐIỂM ĐẾN NỔI BẬT & ĐƯỢC YÊU THÍCH (Space Glassmorphism Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 relative z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Khám phá theo địa danh</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_24px_rgba(56,189,248,0.15)]">
            Điểm Đến Được Yêu Thích Nhất
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hành trình trọn vẹn từ danh lam thắng cảnh Việt Nam đến những thành phố hoa lệ khắp 5 châu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { 
              name: 'Đà Lạt', 
              visits: 786, 
              region: 'Tây Nguyên', 
              img: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
              target: 'Đà Lạt'
            },
            { 
              name: 'Miền Tây', 
              visits: 642, 
              region: 'ĐB. Sông Cửu Long', 
              img: '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg',
              target: 'Miền Tây'
            },
            { 
              name: 'Phượng Hoàng Cổ Trấn', 
              visits: 855, 
              region: 'Quốc Tế (Trung Quốc)', 
              img: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png',
              target: 'Phượng Hoàng Cổ Trấn'
            },
            { 
              name: 'Thượng Hải', 
              visits: 685, 
              region: 'Quốc Tế (Trung Quốc)', 
              img: '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
              target: 'Thượng Hải'
            },
          ].map((dest, i) => (
            <div
              key={i}
              onClick={() => navigate(`/tours?destination=${encodeURIComponent(dest.target)}`)}
              className="relative h-56 rounded-3xl overflow-hidden cursor-pointer group border border-white/10 hover:border-sky-400/50 hover:shadow-[0_12px_36px_rgba(56,189,248,0.2)] transition-all duration-500 bg-[#0d121f]"
            >
              <img 
                src={dest.img} 
                alt={dest.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-5 text-center">
                <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">{dest.region}</span>
                <span className="text-white font-display font-extrabold text-base sm:text-lg drop-shadow-sm">{dest.name}</span>
                <span className="text-[11px] text-slate-300/90 font-medium">{dest.visits} lượt đặt gần đây</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: DU LỊCH TRONG NƯỚC (Dark Space Luxury Tour Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Danh lam xứ sở</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tour Du Lịch Trong Nước
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Trải nghiệm cảnh sắc tuyệt đẹp và văn hóa ẩm thực đặc sắc ba miền.
            </p>
          </div>

          <button
            onClick={() => navigate('/tours?type=DOMESTIC')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition self-start sm:self-auto group"
          >
            <span>Xem tất cả tour trong nước</span> 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {domesticTours.map((tour) => (
            <div 
              key={tour.id} 
              className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-sky-400/40 hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={tour.thumbnailUrl} 
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Tag className="h-3 w-3 text-cyan-400" />
                    <span>{tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-b border-white/10 pb-3">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-slate-400" /> {tour.viewCount || 300}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="h-3.5 w-3.5 fill-amber-400" /> {tour.averageRating?.toFixed(1) || '5.0'}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Users className="h-3.5 w-3.5" /> Còn {tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats || 40)} chỗ</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-400" />
                      <span>Khởi hành: <strong className="text-white font-bold">{tourScheduleService.getTourDepartureDateDisplay(tour.id)}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Giá trọn gói từ</span>
                      <span className="text-xl sm:text-2xl font-black text-cyan-300 font-display">
                        {tour.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">/ khách</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs py-3.5 transition-all shadow-md hover:shadow-cyan-500/25 active:scale-[0.98]"
                >
                  Xem chi tiết & Đặt chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: DU LỊCH NƯỚC NGOÀI (High-Value International Tours - Space Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Hành trình thế giới</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tour Du Lịch Nước Ngoài
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Khám phá kỳ quan thế giới cùng tiêu chuẩn dịch vụ khách sạn 4–5 sao trọn gói.
            </p>
          </div>

          <button
            onClick={() => navigate('/tours?type=INTERNATIONAL')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition self-start sm:self-auto group"
          >
            <span>Xem tất cả tour quốc tế</span> 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {internationalTours.map((tour) => (
            <div 
              key={tour.id} 
              className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-sky-400/40 hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={tour.thumbnailUrl} 
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Tag className="h-3 w-3 text-cyan-400" />
                    <span>{tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-b border-white/10 pb-3">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-slate-400" /> {tour.viewCount || 300}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="h-3.5 w-3.5 fill-amber-400" /> 5.0</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Users className="h-3.5 w-3.5" /> Còn {tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats || 35)} chỗ</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-400" />
                      <span>Khởi hành: <strong className="text-white font-bold">{tourScheduleService.getTourDepartureDateDisplay(tour.id)}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Giá trọn gói từ</span>
                      <span className="text-xl sm:text-2xl font-black text-cyan-300 font-display">
                        {tour.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">/ khách</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs py-3.5 transition-all shadow-md hover:shadow-cyan-500/25 active:scale-[0.98]"
                >
                  Xem chi tiết & Đặt chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SECTION: PROMO SERVICE BANNER (Space Navy Luxury Presentation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="bg-gradient-to-br from-[#061224] via-[#081c38] to-[#040e1e] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.12)] p-8 sm:p-12 text-white relative border border-sky-500/30">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <span>Smart Travel Partner</span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase leading-tight tracking-tight">
              Dịch vụ lữ hành toàn diện <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-cyan-200">
                An toàn • Sáng tạo • Xứng tầm
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Tổ chức tour đoàn, team building và hội nghị chuyên nghiệp với hơn 15 năm uy tín trong ngành du lịch & sự kiện tại Việt Nam.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-200 pt-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Team Building gắn kết</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Tour khách đoàn & Gala</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Tổ chức hội nghị sự kiện</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Xe du lịch đời mới 100%</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Vé máy bay & Dịch vụ Visa</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Bảo hiểm du lịch cao cấp</div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/about')}
                className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black px-7 py-3.5 rounded-2xl text-xs uppercase shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Liên hệ tư vấn ngay
              </button>
              <div className="text-xs text-slate-300">
                Hotline hỗ trợ 24/7: <a href="tel:0941899554" className="text-cyan-300 text-sm font-extrabold hover:underline ml-1">0941 899 554</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: LÊN KẾ HOẠCH CHUYẾN ĐI (Brand Story & Trust) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="relative text-center">
            <div className="relative inline-block">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                alt="Travel Planning Inspiration"
                className="w-72 sm:w-88 md:w-96 h-72 sm:h-88 md:h-96 object-cover rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border-2 border-white/20 mx-auto"
              />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-3 text-xs text-white whitespace-nowrap">
                <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Đường dây nóng</div>
                  <div className="text-white font-black text-sm">0941 899 554</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">Gửi gắm trọn vẹn niềm tin</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
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
                className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] text-white font-bold px-6 py-3 text-xs transition shadow-sm"
              >
                Khám phá câu chuyện của chúng tôi
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 8. SECTION: TIN TỨC & CẨM NANG DU LỊCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Kinh nghiệm & Bí quyết</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cẩm Nang & Tin Tức Du Lịch Mới Nhất
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
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
              onClick={() => navigate('/blogs')}
              className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-sky-400/40 hover:shadow-[0_12px_36px_rgba(56,189,248,0.15)] transition-all duration-300 p-5 flex flex-col justify-between group cursor-pointer"
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

                <h4 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                  {news.title}
                </h4>

                <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed">
                  {news.summary}
                </p>
              </div>

              <div className="pt-4">
                <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300 inline-flex items-center gap-1 transition">
                  Đọc bài viết <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 text-sky-300 hover:text-white font-bold text-xs transition duration-200 shadow-sm"
          >
            <span>Xem tất cả bài viết cẩm nang du lịch</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 9. FLOATING CONTACT SPEED DIAL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        <a
          href="https://zalo.me/0941899554"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl overflow-hidden shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-white border border-white/30"
          title="Tư vấn qua Zalo (0941 899 554)"
        >
          <ZaloIcon className="h-11 w-11" />
        </a>

        <a
          href="https://www.facebook.com/loiii.nguyen.397715"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Trang Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>

        <a
          href="https://www.instagram.com/loiiinguyen/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Instagram"
        >
          <Instagram className="h-5 w-5" />
        </a>

        <a
          href="tel:0941899554"
          className="h-11 w-11 rounded-2xl bg-accent-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Gọi Hotline: 0941 899 554"
        >
          <Phone className="h-5 w-5 fill-white" />
        </a>

        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-primary-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Địa chỉ công ty"
        >
          <Map className="h-5 w-5" />
        </a>
      </div>

    </div>
  );
};
