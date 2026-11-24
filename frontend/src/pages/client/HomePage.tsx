import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posts } from '../../data/blogPosts';
import {
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Plane,
  ShieldCheck,
  QrCode,
  Compass,
} from 'lucide-react';
import { tourScheduleService } from '../../services/tourScheduleService';
import { tourService } from '../../services/tourService';
import { Tour } from '../../types/tour';
import { LuxuryHero3D } from '../../components/home/LuxuryHero3D';
import { BoardingPassTourCard } from '../../components/tour/BoardingPassTourCard';
import { MOCK_TOURS } from '../../data/mockTours';
import { getTourTransportInfo } from '../../utils/tourTransport';

const homeBlogPosts = posts.filter((post) => [112, 115, 120].includes(post.id));

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [, setScheduleVer] = useState(0);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'FLIGHT' | 'VISA' | 'NO_VISA' | 'DEPOSIT'>('ALL');

  useEffect(() => {
    void tourScheduleService.syncFromServer();
    tourService
      .getAllTours()
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          const normalized = response.data.map((t) => {
            const meta = MOCK_TOURS.find((m) => m.id === t.id);
            if (meta) {
              return {
                ...t,
                thumbnailUrl:
                  t.thumbnailUrl && !t.thumbnailUrl.includes('unsplash') ? t.thumbnailUrl : meta.thumbnailUrl,
                gallery: t.gallery && t.gallery.length > 0 ? t.gallery : meta.gallery,
              };
            }
            return t;
          });
          setAllTours(normalized);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách tour từ máy chủ:', err);
      });

    const handleScheduleUpdate = () => {
      setScheduleVer((v) => v + 1);
    };
    window.addEventListener('tour_schedules_updated', handleScheduleUpdate);
    return () => window.removeEventListener('tour_schedules_updated', handleScheduleUpdate);
  }, []);

  // Search Widget State
  const [searchTab, setSearchTab] = useState<'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');
  const [departure, setDeparture] = useState('TP.Hồ Chí Minh');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/tours?departure=${encodeURIComponent(departure)}&destination=${encodeURIComponent(destination)}&type=${searchTab}`
    );
  };

  const flightCount = allTours.filter((t) => getTourTransportInfo(t).mode === 'FLIGHT').length;
  const visaCount = allTours.filter((t) => t.requiresVisa).length;
  const noVisaCount = Math.max(0, allTours.length - visaCount);

  const applyQuickFilter = (list: Tour[]) => {
    if (quickFilter === 'FLIGHT') return list.filter((t) => getTourTransportInfo(t).mode === 'FLIGHT');
    if (quickFilter === 'VISA') return list.filter((t) => t.requiresVisa);
    if (quickFilter === 'NO_VISA') return list.filter((t) => !t.requiresVisa);
    return list;
  };

  // Real international tours from DB (show up to 4 cards like approved mockup)
  const internationalPool = applyQuickFilter(allTours.filter((t) => t.category === 'NUOC_NGOAI'));
  const preferredIntlIds = [18, 19, 10, 17, 1, 2];
  const orderedInternational = [
    ...preferredIntlIds.map((id) => internationalPool.find((t) => t.id === id)).filter(Boolean),
    ...internationalPool.filter((t) => !preferredIntlIds.includes(t.id)),
  ] as Tour[];
  const internationalTours = orderedInternational.slice(0, 4);

  // Real domestic tours from DB (show up to 4 cards like approved mockup)
  const domesticPool = applyQuickFilter(allTours.filter((t) => t.category !== 'NUOC_NGOAI'));
  const preferredDomIds = [15, 16, 6, 13, 12, 5, 3];
  const orderedDomestic = [
    ...preferredDomIds.map((id) => domesticPool.find((t) => t.id === id)).filter(Boolean),
    ...domesticPool.filter((t) => !preferredDomIds.includes(t.id)),
  ] as Tour[];
  const domesticTours = orderedDomestic.slice(0, 4);

  return (
    <div className="bg-[#FAF8F5] text-[#0F172A] min-h-screen pb-20 font-sans">
      {/* 1. DEEP OCEAN EDITORIAL HERO & SEARCH BAR */}
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

      {/* 2. QUICK FILTER PILLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7">
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { id: 'ALL' as const, label: `Tất cả ${allTours.length || 19} Tour trọn gói` },
            { id: 'FLIGHT' as const, label: `Tour bay khứ hồi (${flightCount || 13})` },
            { id: 'VISA' as const, label: `Có đại lý lo Visa (${visaCount || 5})` },
            { id: 'NO_VISA' as const, label: `Miễn Visa / Nội địa (${noVisaCount || 14})` },
            { id: 'DEPOSIT' as const, label: 'Đặt cọc 30% giữ chỗ' },
          ].map((pill) => {
            const active = quickFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setQuickFilter(pill.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  active
                    ? 'bg-[#0B3B49] text-white border-[#0B3B49] shadow-sm'
                    : 'bg-white text-[#0F172A] border-[#E6E1DA] hover:border-[#0D9488] hover:text-[#0B3B49]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="space-y-16 pt-10">
        {/* 3. SECTION: TOUR NƯỚC NGOÀI NỔI BẬT (Boarding Pass Cards) */}
        {internationalTours.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-[#0D9488] uppercase tracking-widest">
                  Hành trình quốc tế trọn gói
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Tour nước ngoài nổi bật (Đã gồm vé máy bay khứ hồi &amp; hành lý)
                </h2>
              </div>

              <button
                onClick={() => navigate('/tours?type=INTERNATIONAL')}
                className="text-sm font-extrabold text-[#D95D39] hover:text-[#C24E2D] inline-flex items-center gap-1.5 transition self-start sm:self-auto group cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {internationalTours.map((tour) => (
                <BoardingPassTourCard
                  key={tour.id}
                  tour={tour}
                  onSelect={(id) => navigate(`/tours/${id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. SECTION: TOUR TRONG NƯỚC ĐƯỢC ĐẶT NHIỀU (Boarding Pass Cards) */}
        {domesticTours.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-[#0D9488] uppercase tracking-widest">
                  Danh lam 3 miền Việt Nam
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Tour trong nước được đặt nhiều (Máy bay khứ hồi &amp; Xe Limousine)
                </h2>
              </div>

              <button
                onClick={() => navigate('/tours?type=DOMESTIC')}
                className="text-sm font-extrabold text-[#D95D39] hover:text-[#C24E2D] inline-flex items-center gap-1.5 transition self-start sm:self-auto group cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {domesticTours.map((tour) => (
                <BoardingPassTourCard
                  key={tour.id}
                  tour={tour}
                  onSelect={(id) => navigate(`/tours/${id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. THREE DIFFERENTIATOR PILLARS (Matching Preview Image 1) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#E6F4F1] text-[#0B3B49] flex items-center justify-center shrink-0 border border-[#99F6E4]">
                <Plane className="h-5 w-5 text-[#0D9488]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#0B3B49]">
                  Vé máy bay đoàn &amp; Trưởng đoàn đón sân bay
                </h3>
                <p className="text-xs text-[#526071] leading-relaxed">
                  Giá tour đã gồm vé khứ hồi &amp; 20–23kg ký gửi. HDV đón tại sân bay làm thủ tục check-in trọn gói.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                <ShieldCheck className="h-5 w-5 text-[#D97706]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#0B3B49]">Ủy quyền hồ sơ Visa theo đoàn</h3>
                <p className="text-xs text-[#526071] leading-relaxed">
                  Tách bạch phí dịch vụ đại lý &amp; lệ phí lãnh sự. Tải giấy tờ online, theo dõi tiến độ xét duyệt 5 bước.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#FFF0EB] text-[#D95D39] flex items-center justify-center shrink-0 border border-[#FBC2AE]">
                <QrCode className="h-5 w-5 text-[#D95D39]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#0B3B49]">Đặt cọc 30% &amp; Đối soát VietQR 24/7</h3>
                <p className="text-xs text-[#526071] leading-relaxed">
                  Giữ chỗ sớm chỉ với 30%, tự động xuất Vé điện tử E-Ticket QR &amp; Hóa đơn GTGT PDF gửi qua email.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SECTION: ĐIỂM ĐẾN ĐƯỢC YÊU THÍCH NHẤT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold text-[#0D9488] uppercase tracking-widest">
              Khám phá theo địa danh
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Điểm Đến Được Yêu Thích Nhất
            </h2>
            <p className="text-xs sm:text-sm text-[#526071]">
              Hành trình trọn vẹn từ danh lam thắng cảnh Việt Nam đến những thành phố hoa lệ khắp 5 châu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Đà Lạt',
                visits: 786,
                region: 'Tây Nguyên',
                img: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
                target: 'Đà Lạt',
              },
              {
                name: 'Miền Tây',
                visits: 642,
                region: 'ĐB. Sông Cửu Long',
                img: '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg',
                target: 'Miền Tây',
              },
              {
                name: 'Phượng Hoàng Cổ Trấn',
                visits: 855,
                region: 'Quốc Tế (Trung Quốc)',
                img: '/images/tours/phuong-hoang-co-tran-truong-gia-gioi/01.jpg',
                target: 'Phượng Hoàng Cổ Trấn',
              },
              {
                name: 'Thượng Hải',
                visits: 685,
                region: 'Quốc Tế (Trung Quốc)',
                img: '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
                target: 'Thượng Hải',
              },
            ].map((dest, i) => (
              <div
                key={i}
                onClick={() => navigate(`/tours?destination=${encodeURIComponent(dest.target)}`)}
                className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group border border-[#E6E1DA] shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B49]/95 via-[#0B3B49]/35 to-transparent flex flex-col justify-end p-5 text-center">
                  <span className="text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest">
                    {dest.region}
                  </span>
                  <span className="text-white font-display font-extrabold text-base sm:text-lg">
                    {dest.name}
                  </span>
                  <span className="text-[11px] text-slate-200 font-medium">
                    {dest.visits} lượt đặt gần đây
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SECTION: PROMO SERVICE BANNER (Deep Ocean Editorial) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B3B49] rounded-3xl overflow-hidden shadow-float p-6 sm:p-10 lg:p-12 text-white relative border border-[#0F5264]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D9488]/20 blur-3xl pointer-events-none rounded-full" />

            <div className="max-w-3xl space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-teal-300/30 text-[#5EEAD4] text-xs font-bold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5" />
                <span>Smart Travel Partner</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight">
                Dịch vụ lữ hành toàn diện <br />
                <span className="text-[#5EEAD4]">An toàn · Sáng tạo · Xứng tầm</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                Tổ chức tour đoàn, team building và hội nghị chuyên nghiệp với hơn 15 năm uy tín trong ngành du lịch &amp; sự kiện tại Việt Nam.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold text-slate-100 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Team Building gắn kết
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Tour khách đoàn &amp; Gala
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Tổ chức hội nghị sự kiện
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Xe du lịch đời mới 100%
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Vé máy bay &amp; Dịch vụ Visa
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Bảo hiểm du lịch cao cấp
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-[#D95D39] hover:bg-[#C24E2D] active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-xl text-xs uppercase shadow-md transition-all cursor-pointer"
                >
                  Liên hệ tư vấn ngay
                </button>
                <div className="text-xs text-slate-200">
                  Hotline hỗ trợ 24/7:{' '}
                  <a href="tel:0941899554" className="text-[#FDE68A] text-sm font-extrabold hover:underline ml-1">
                    0941 899 554
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SECTION: LÊN KẾ HOẠCH CHUYẾN ĐI (Brand Story & Trust) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#E6E1DA] shadow-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative text-center">
              <div className="relative inline-block w-full max-w-[288px] sm:max-w-[320px] md:max-w-[384px]">
                <img
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                  alt="Travel Planning Inspiration"
                  className="w-full aspect-square object-cover rounded-3xl shadow-card border border-[#E6E1DA] mx-auto"
                />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#0B3B49] border-2 border-white shadow-xl px-5 py-3 rounded-2xl flex items-center gap-3 text-xs text-white whitespace-nowrap">
                  <div className="h-8 w-8 rounded-xl bg-[#0D9488] text-white flex items-center justify-center">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-[#5EEAD4] font-bold uppercase">Đường dây nóng</div>
                    <div className="text-white font-black text-sm">0941 899 554</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#526071] leading-relaxed max-w-xl">
              <span className="text-[11px] font-extrabold text-[#0D9488] uppercase tracking-widest block">
                Gửi gắm trọn vẹn niềm tin
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight leading-snug">
                Lên kế hoạch kỳ nghỉ hoàn hảo với SMART TRAVEL
              </h2>
              <p>
                SMART TRAVEL được dẫn dắt bởi ban lãnh đạo có hơn 15 năm kinh nghiệm thực chiến trong lĩnh vực Du lịch lữ hành và Quản lý sự kiện. Sự thấu hiểu sâu sắc cùng khả năng tiên phong ứng dụng công nghệ giúp chúng tôi kiến tạo những hải trình đáng nhớ nhất.
              </p>
              <p>
                Đội ngũ chuyên viên tư vấn luôn đồng hành từ khâu lên ý tưởng, cá nhân hóa lịch trình, xử lý hồ sơ Visa cho đến hỗ trợ trực tiếp tại sân bay trong suốt chuyến đi của bạn.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/about')}
                  className="rounded-xl bg-[#0B3B49] hover:bg-[#0F5264] active:scale-[0.98] text-white font-bold px-6 py-3 text-xs transition shadow-sm cursor-pointer"
                >
                  Khám phá câu chuyện của chúng tôi →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 9. SECTION: TIN TỨC & CẨM NANG DU LỊCH */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold text-[#0D9488] uppercase tracking-widest">
              Kinh nghiệm &amp; Bí quyết
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Cẩm Nang Du Lịch
            </h2>
            <p className="text-xs sm:text-sm text-[#526071]">
              Khám phá điểm đến, bí quyết chuẩn bị hồ sơ Visa và kinh nghiệm bay theo đoàn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeBlogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blogs/${post.id}`}
                className="bg-white rounded-2xl border border-[#E6E1DA] shadow-card hover:shadow-card-hover hover:border-[#99F6E4] transition-all duration-300 p-4 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1.5 px-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#E6F4F1] text-[#0B3B49] text-[10px] font-extrabold uppercase">
                      {post.tag}
                    </span>
                    <h3 className="font-display font-extrabold text-sm text-[#0F172A] group-hover:text-[#0B3B49] line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#526071] line-clamp-2 leading-relaxed">{post.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E6E1DA] flex items-center justify-between text-xs font-bold text-[#D95D39] px-1">
                  <span>Đọc chi tiết</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
