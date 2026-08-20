import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, PhoneCall, Calendar, MapPin, 
  Phone, CheckCircle2, Map, Instagram, Facebook, ArrowRight, Tag
} from 'lucide-react';
import { ZaloIcon } from '../../components/common/ZaloIcon';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 1. AUTO-SLIDING HERO CAROUSEL STATE (Chuyển hình tự động 4.5s)
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 0,
      title: 'TOUR KHÁCH ĐOÀN',
      subtitle: 'TEAM BUILDING | SỰ KIỆN | HỘI NGHỊ | GALA DINNER | NGOẠI KHÓA',
      features: [
        'THIẾT KẾ RIÊNG THEO YÊU CẦU',
        'ĐÃ TỔ CHỨC TOUR HƠN 1200 KHÁCH',
        'TƯ VẤN & HỖ TRỢ NHANH CHÓNG',
        'DỊCH VỤ TRỌN GÓI TỐI ƯU CHI PHÍ'
      ],
      hotline: '0941899554',
      cards: [
        { label: 'GIA ĐÌNH', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80' },
        { label: 'DOANH NGHIỆP', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' },
        { label: 'TRƯỜNG HỌC', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
      ]
    },
    {
      id: 1,
      title: 'DU LỊCH NƯỚC NGOẢI CAO CẤP',
      subtitle: 'TRUNG QUỐC | NHẬT BẢN | HÀN QUỐC | CHÂU ÂU | ĐÔNG NAM Á',
      features: [
        'TRỌN GÓI VISA & VÉ MÁY BAY KHỨ HỒI',
        'KHÁCH SẠN 4-5 SAO TIÊU CHUẨN ĐỊA PHƯƠNG',
        'HƯỚNG DẪN VIÊN TIẾNG VIỆT SUỐT TUYẾN',
        'BẢO HIỂM DU LỊCH QUỐC TẾ CAO CẤP'
      ],
      hotline: '0941899554',
      cards: [
        { label: 'PHƯỢNG HOÀNG CỔ TRẤN', img: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png' },
        { label: 'THƯỢNG HẢI', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80' },
        { label: 'NHẬT BẢN', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
      ]
    },
    {
      id: 2,
      title: 'KHÁM PHÁ VIỆT NAM KỲ VĨ',
      subtitle: 'PHÚ QUỐC | NHA TRANG | ĐÀ LẠT | ĐÀ NẴNG | TÂY BẮC',
      features: [
        'ƯU ĐÃI GIẢM TỚI 30% KHI ĐẶT SỚM',
        'LỊCH TRÌNH KHÁM PHÁ CÁ NHÂN HÓA',
        'XE ĐƯA ĐÓN SÂN BAY VÀ THAM QUAN MỚI 100%',
        'HỖ TRỢ ĐẶT VÉ VUI CHƠI VÀ RESORT'
      ],
      hotline: '0941899554',
      cards: [
        { label: 'PHÚ QUỐC', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
        { label: 'NHA TRANG', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
        { label: 'ĐÀ LẠT', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80' },
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
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

  return (
    <div className="space-y-16 pb-16 relative bg-slate-50/50">

      {/* 1. HERO SLIDER BANNER (Khớp Screenshot 1 & Hotline 0941899554) */}
      <section className="relative bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white overflow-hidden py-12 md:py-16 transition-all duration-700">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          <div className="text-center space-y-3 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xs md:text-sm font-extrabold tracking-widest text-sky-200 uppercase">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto text-center">
            {heroSlides[currentSlide].features.map((feat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold text-white shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl group h-44">
              <img src={heroSlides[currentSlide].cards[0].img} alt="Cat 1" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center p-3">
                <span className="bg-sky-900/90 border border-sky-400 text-white text-xs font-black px-6 py-1.5 rounded-full uppercase tracking-wider">
                  {heroSlides[currentSlide].cards[0].label}
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl group h-52 -translate-y-2">
              <img src={heroSlides[currentSlide].cards[1].img} alt="Cat 2" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              
              {/* Hotline Pill with 0941899554 */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-sky-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-white">
                <Phone className="h-3.5 w-3.5 fill-sky-950" /> HOTLINE <span className="text-rose-700 font-extrabold text-sm">{heroSlides[currentSlide].hotline}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-center p-3">
                <span className="bg-sky-900 border-2 border-amber-400 text-amber-300 text-xs font-black px-6 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  {heroSlides[currentSlide].cards[1].label}
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl group h-44">
              <img src={heroSlides[currentSlide].cards[2].img} alt="Cat 3" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center p-3">
                <span className="bg-sky-900/90 border border-sky-400 text-white text-xs font-black px-6 py-1.5 rounded-full uppercase tracking-wider">
                  {heroSlides[currentSlide].cards[2].label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 transition-all rounded-full ${currentSlide === i ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40'}`}
              />
            ))}
          </div>

        </div>

      </section>

      {/* 2. FLOATING SEARCH WIDGET BAR (Khớp Screenshot 1) */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
          
          <div className="flex items-center gap-4 border-b border-slate-100 pb-3 font-black text-xs">
            <button
              type="button"
              onClick={() => setSearchTab('DOMESTIC')}
              className={`pb-2 transition ${
                searchTab === 'DOMESTIC'
                  ? 'text-sky-900 border-b-2 border-sky-900 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              DU LỊCH TRONG NƯỚC
            </button>
            <button
              type="button"
              onClick={() => setSearchTab('INTERNATIONAL')}
              className={`pb-2 transition ${
                searchTab === 'INTERNATIONAL'
                  ? 'text-sky-900 border-b-2 border-sky-900 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              DU LỊCH NƯỚC NGOẢI
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đi</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <MapPin className="h-4 w-4 text-sky-600 flex-shrink-0" />
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="TP.Hồ Chí Minh">TP.Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đến</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="">Chọn điểm đến</option>
                  <option value="Phượng Hoàng Cổ Trấn">Ân Thi - Phượng Hoàng Cổ Trấn</option>
                  <option value="Thượng Hải">Thượng Hải - Ô Trấn</option>
                  <option value="Nha Trang">Nha Trang - Bình Hưng</option>
                  <option value="Phú Quốc">Phú Quốc Đảo Ngọc</option>
                  <option value="Đà Lạt">Đà Lạt Mộng Mơ</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày đi</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <Calendar className="h-4 w-4 text-sky-600 flex-shrink-0" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 md:pt-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-extrabold py-3 text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" /> Tìm kiếm
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* 3. SECTION: ĐIỂM ĐẾN YÊU THÍCH (Khớp Screenshot 1) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">ĐIỂM ĐẾN YÊU THÍCH</h2>
          <p className="text-xs text-slate-500">Tour du lịch Trong nước với SMART TRAVEL. Hành hương đầu xuân - Tận hưởng bản sắc Việt.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Hà Nội', visits: 528, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80' },
            { name: 'Đà Nẵng', visits: 895, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80' },
            { name: 'Đà Lạt', visits: 786, img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80' },
            { name: 'Phú Quốc', visits: 586, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Á', visits: 655, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Mỹ', visits: 345, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Âu', visits: 271, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
            { name: 'Châu Úc', visits: 547, img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=600&q=80' },
          ].map((dest, i) => (
            <div
              key={i}
              onClick={() => navigate(`/tours?destination=${encodeURIComponent(dest.name)}`)}
              className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition cursor-pointer group"
            >
              <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3 text-center">
                <span className="text-white font-black text-sm drop-shadow">{dest.name}</span>
                <span className="text-[10px] text-slate-300 font-medium">Đã có {dest.visits} lượt khách</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: DU LỊCH TRONG NƯỚC (Khớp Screenshot 1) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Du lịch trong nước</h2>
          <p className="text-xs text-slate-500">Cùng SMART TRAVEL nhanh tay đặt ngay tour ngay hôm nay!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 3,
              title: 'TOUR KHÁM PHÁ NÚI CHỨA CHAN (GIA LÀO) VÀ DINH THẦY THÍM',
              departure: '23-08-2026',
              duration: '1 ngày',
              price: 790000,
              remaining: 40,
              views: 334,
              img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
            },
            {
              id: 4,
              title: 'TOUR CHÂU ĐỐC AN GIANG VIẾNG MIẾU BÀ CHÚA XỨ, NÚI CẤM & CHÙA TÀ PẠ',
              departure: '22-08-2026',
              duration: '1 ngày 1 đêm',
              price: 890000,
              remaining: 40,
              views: 289,
              img: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80'
            },
            {
              id: 5,
              title: 'TOUR DU LỊCH MỸ THO - BẾN TRE - CẦN THƠ - CÀ MAU ĐẤT MŨI - BẠC LIÊU - SÓC TRĂNG',
              departure: '20-08-2026',
              duration: '3 ngày 2 đêm',
              price: 2990000,
              remaining: 35,
              views: 415,
              img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80'
            }
          ].map((tour) => (
            <div key={tour.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img src={tour.img} alt={tour.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-black text-xs text-slate-900 uppercase line-clamp-2 leading-snug">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>👁 Lượt xem: {tour.views}</span>
                    <span>★ Đánh giá: 5.0/5</span>
                    <span>📌 Đặt chỗ: 0</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Khởi hành: <strong className="text-slate-800">{tour.departure}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      <span>Thời gian: <strong className="text-slate-800">{tour.duration}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400">Giá từ</div>
                    <div className="text-lg font-black text-rose-600">
                      {tour.price.toLocaleString('vi-VN')} đ <span className="text-[11px] font-normal text-slate-500">/ Khách</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      Còn lại <strong className="text-slate-900">{tour.remaining}</strong> chỗ
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-black text-xs py-2.5 transition shadow-sm"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/tours')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 transition"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 5. SECTION: DU LỊCH NƯỚC NGOẢI (Khớp Screenshot 2) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Du lịch nước ngoài</h2>
          <p className="text-xs text-slate-500">Cùng SMART TRAVEL nhanh tay đặt ngay tour ngay hôm nay!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: 'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ | DẤU ẤN XỨ TRUNG HOA',
              departure: '30-08-2026',
              duration: '6 ngày 5 đêm',
              price: 17990000,
              remaining: 20,
              views: 512,
              img: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png'
            },
            {
              id: 2,
              title: 'TOUR KHÁM PHÁ THƯỢNG HẢI - TÂY SÁCH Ô TRẤN 4 NGÀY 4 ĐÊM NOSHOPPING',
              departure: '28-08-2026',
              duration: '4 ngày 4 đêm',
              price: 18990000,
              remaining: 40,
              views: 384,
              img: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab396?auto=format&fit=crop&w=600&q=80'
            },
            {
              id: 7,
              title: 'TOUR DU LỊCH ĐẢO NAM DU 3 NGÀY 3 ĐÊM - CHẠM SÓNG BIỂN XANH',
              departure: '25-08-2026',
              duration: '3 ngày 3 đêm',
              price: 2990000,
              remaining: 30,
              views: 450,
              img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
            }
          ].map((tour) => (
            <div key={tour.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img src={tour.img} alt={tour.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-black text-xs text-slate-900 uppercase line-clamp-2 leading-snug">
                    {tour.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>👁 Lượt xem: {tour.views}</span>
                    <span>★ Đánh giá: 0/5</span>
                    <span>📌 Đặt chỗ: 0</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Khởi hành: <strong className="text-slate-800">{tour.departure}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      <span>Thời gian: <strong className="text-slate-800">{tour.duration}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400">Giá từ</div>
                    <div className="text-lg font-black text-rose-600">
                      {tour.price.toLocaleString('vi-VN')} đ <span className="text-[11px] font-normal text-slate-500">/ Khách</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      Còn lại <strong className="text-slate-900">{tour.remaining}</strong> chỗ
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate(`/tours/${tour.id}`)}
                  className="w-full rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-black text-xs py-2.5 transition shadow-sm"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/tours')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 transition"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 6. SECTION: PROMO SERVICE BANNER (Khớp Screenshot 3) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-amber-400 rounded-3xl overflow-hidden shadow-xl p-8 text-sky-950 relative border-4 border-sky-900">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-sm font-extrabold text-sky-900 uppercase tracking-wide">
              CÔNG TY TNHH DỊCH VỤ DU LỊCH VÀ SỰ KIỆN SMART TRAVEL
            </h3>
            <h2 className="text-2xl md:text-4xl font-black uppercase text-sky-950 leading-tight">
              CUNG CẤP DỊCH VỤ <br/><span className="text-white bg-sky-900 px-3 py-0.5 rounded">AN TOÀN - SÁNG TẠO - ĐÁNG GIÁ</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-extrabold text-sky-900 pt-2">
              <div>• TEAMBUILDING</div>
              <div>• TOUR KHÁCH ĐOÀN</div>
              <div>• TỔ CHỨC SỰ KIỆN</div>
              <div>• CHO THUÊ XE DU LỊCH</div>
              <div>• VÉ MÁY BAY & VISA</div>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => navigate('/about')}
                className="bg-sky-900 hover:bg-sky-950 text-white font-black px-6 py-3 rounded-xl text-xs uppercase shadow-lg transition"
              >
                ĐẶT NGAY
              </button>
              <div className="text-xs font-black text-sky-950">
                Hotline hỗ trợ: <span className="text-rose-700 text-sm font-black">0941899554</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: LÊN KẾ HOẠCH CHUYẾN ĐI (Khớp Screenshot 2) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative text-center">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
              alt="Eiffel Tower Travel Plan"
              className="w-80 md:w-96 h-80 md:h-96 object-cover rounded-full border-8 border-white shadow-2xl mx-auto"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2 text-xs text-slate-800 font-bold whitespace-nowrap">
              <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">HOTLINE NGAY</div>
                <div className="text-sky-900 font-black text-xs">0941899554</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="font-serif italic text-sky-600 text-base">Gửi gắm niềm tin</div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-snug">
              Lên kế hoạch chuyến đi của bạn với SMART TRAVEL
            </h2>
            <p>
              SMART TRAVEL được thành lập dưới sự lãnh đạo của Ban Lãnh Đạo có kinh nghiệm trên 15 năm trong lĩnh vực Du lịch và Sự kiện. Sự am hiểu sâu sắc về ngành cùng với khả năng nắm bắt xu hướng thị trường đã giúp Smart Travel xây dựng được uy tín và thương hiệu vững chắc trên thị trường.
            </p>
            <p>
              Đội ngũ nhân sự của chúng tôi không chỉ trẻ trung, đầy nhiệt huyết mà còn được đào tạo bài bản, chuyên nghiệp, luôn sẵn sàng cống hiến và mang đến cho khách hàng những dịch vụ tốt nhất.
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate('/about')}
                className="rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-extrabold px-6 py-3 text-xs transition shadow-md"
              >
                LIÊN HỆ VỚI CHÚNG TÔI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: TIN TỨC MỚI NHẤT (Khớp Screenshot 3) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Tin tức mới nhất</h2>
          <p className="text-xs text-slate-500">Tour du lịch Trong nước với SMART TRAVEL. Hành hương đầu xuân - Tận hưởng bản sắc Việt.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Tour Tây Ninh lễ 2/9 – Chinh phục núi Bà Đen 1 ngày',
              date: '2026-08-14',
              author: 'Smart Travel Editorial',
              summary: 'Tour Tây Ninh lễ 2/9 là lựa chọn phù hợp cho doanh nghiệp, cơ quan, trường học và các nhóm muốn tổ chức chuyến đi ngắn ngày nhưng vẫn trọn vẹn...',
              img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
            },
            {
              title: 'Tour đảo Phú Quý lễ 2/9 – Trải nghiệm hòn ngọc biển xanh vô tận',
              date: '2026-08-13',
              author: 'Smart Travel Editorial',
              summary: 'Tour đảo Phú Quý lễ 2/9 là lựa chọn phù hợp cho các công ty, cơ quan, hội nhóm đang tìm một hành trình biển đảo hoang sơ rực rỡ nắng vàng...',
              img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
            },
            {
              title: 'Tour Côn Đảo lễ 2/9 – Hành trình 2 ngày về vùng đất thiêng, dấu ấn lịch sử',
              date: '2026-08-12',
              author: 'Smart Travel Editorial',
              summary: 'Tour Côn Đảo lễ 2/9 là lựa chọn phù hợp cho doanh nghiệp, cơ quan và các đoàn thể muốn kết hợp nghỉ dưỡng, tham quan và dâng hương tri ân...',
              img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80'
            }
          ].map((news, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition space-y-3 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-40 rounded-xl overflow-hidden">
                  <img src={news.img} alt={news.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug">
                  {news.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>📅 {news.date}</span>
                  <span>👤 {news.author}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {news.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FLOATING CONTACT ICONS BAR (Khớp Screenshot 1, 2, 4) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-sky-400 rounded-full blur-sm opacity-75 group-hover:opacity-100 animate-pulse"></div>
          <a
            href="https://zalo.me/0941899554"
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-11 w-11 rounded-full overflow-hidden shadow-xl hover:scale-110 transition flex items-center justify-center bg-white"
            title="Zalo 0941899554"
          >
            <ZaloIcon className="h-11 w-11" />
          </a>
        </div>
        <a
          href="https://www.facebook.com/loiii.nguyen.397715"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          title="Facebook Profile"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <a
          href="https://www.instagram.com/loiiinguyen/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          title="Instagram loiiinguyen"
        >
          <Instagram className="h-5 w-5" />
        </a>
        <a
          href="tel:0941899554"
          className="h-10 w-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          title="Hotline 0941899554"
        >
          <Phone className="h-5 w-5 fill-white" />
        </a>
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          title="Địa chỉ Thủ Đức, Hồ Chí Minh"
        >
          <Map className="h-5 w-5" />
        </a>
      </div>

    </div>
  );
};
