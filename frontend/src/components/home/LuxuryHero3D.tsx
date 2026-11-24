import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MapPin, Calendar, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Tour } from '../../types/tour';

interface LuxuryHero3DProps {
  tours: Tour[];
  searchTab: 'DOMESTIC' | 'INTERNATIONAL';
  setSearchTab: (tab: 'DOMESTIC' | 'INTERNATIONAL') => void;
  departure: string;
  setDeparture: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  departDate: string;
  setDepartDate: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const LuxuryHero3D: React.FC<LuxuryHero3DProps> = ({
  searchTab,
  setSearchTab,
  departure,
  setDeparture,
  destination,
  setDestination,
  departDate,
  setDepartDate,
  onSearchSubmit,
}) => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0B3B49] text-white overflow-hidden">
      {/* Subtle Architectural Ocean Glow */}
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#0D9488]/20 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[380px] h-[220px] rounded-full bg-[#D95D39]/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 relative z-10 space-y-8">
        {/* Top Row: Editorial Copy + Live Boarding Pass & Visa Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#134E5E] border border-[#5EEAD4]/25 text-[#5EEAD4] text-[11px] font-extrabold uppercase tracking-wider">
              <span>Trọn gói vé máy bay đoàn</span>
              <span className="opacity-50">·</span>
              <span>Ủy quyền hồ sơ Visa</span>
              <span className="opacity-50">·</span>
              <span>Đặt cọc 30% VietQR</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.15] tracking-tight text-white">
              Bay trọn gói theo đoàn, <br className="hidden sm:inline" />
              lo luôn hồ sơ Visa
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
              Giá tour đã gồm vé máy bay khứ hồi &amp; 20–23kg hành lý ký gửi. Trưởng đoàn đón làm thủ tục tại sân bay, giữ chỗ chỉ với 30%.
            </p>
          </div>

          {/* Right Live Boarding Pass Preview */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative h-48 sm:h-52">
              <img
                src="/images/tours/phuong-hoang-co-tran-truong-gia-gioi/01.jpg"
                alt="Hành trình du lịch trọn gói SmartTravel"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B49]/75 via-[#0B3B49]/10 to-transparent" />
            </div>

            {/* Floating Live Boarding Pass Card */}
            <div className="relative -mt-12 mx-2 sm:mx-3 rounded-xl bg-white text-[#0F172A] border-2 border-[#99F6E4] shadow-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B3B49]">
                  <Plane className="h-4 w-4 text-[#0D9488]" />
                  <span>VÉ ĐOÀN MẪU #BKX1B00C</span>
                </div>
                <span className="text-[11px] font-black text-[#0F5264] bg-[#E6F4F1] px-2 py-0.5 rounded-md">
                  SGN → ICN · Vietnam Airlines
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#0D9488]">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Đã gồm 07kg xách tay + 23kg ký gửi
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Đón tại Cột 10 Ga Quốc tế TSN
                </span>
              </div>

              <div className="text-[11px] font-bold text-[#D95D39]">
                • Đã cọc 30% VietQR · Tiến độ Visa: Đại lý hỗ trợ nộp ĐSQ Hàn Quốc
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Crisp White Search Box Card */}
        <form
          onSubmit={onSearchSubmit}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-float border border-[#E6E1DA] text-[#0F172A]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            {/* Điểm khởi hành */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-[#526071] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0D9488]" /> Điểm khởi hành
              </label>
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-sm font-semibold text-[#0F172A] focus:border-[#0D9488] focus:bg-white focus:outline-none transition"
              >
                <option value="TP.Hồ Chí Minh">TP. Hồ Chí Minh (Sân bay TSN / Q.1)</option>
                <option value="Hà Nội">Hà Nội (Sân bay Nội Bài)</option>
                <option value="Đà Nẵng">Đà Nẵng (Sân bay Đà Nẵng)</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            {/* Điểm đến mong muốn */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-[#526071] uppercase tracking-wider flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-[#0D9488]" /> Điểm đến mong muốn
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Hàn Quốc, Nhật Bản, Đà Nẵng, Phú Quốc..."
                className="w-full h-12 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* Ngày khởi hành */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-[#526071] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#0D9488]" /> Ngày khởi hành
              </label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-sm font-semibold text-[#0F172A] focus:border-[#0D9488] focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* Loại tour & Phương tiện */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-[#526071] uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="h-3.5 w-3.5 text-[#0D9488]" /> Loại hành trình
              </label>
              <select
                value={searchTab}
                onChange={(e) => setSearchTab(e.target.value as 'DOMESTIC' | 'INTERNATIONAL')}
                className="w-full h-12 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-sm font-semibold text-[#0F172A] focus:border-[#0D9488] focus:bg-white focus:outline-none transition"
              >
                <option value="DOMESTIC">Tour Trong nước</option>
                <option value="INTERNATIONAL">Tour Quốc tế (Bay)</option>
              </select>
            </div>

            {/* Coral CTA Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#D95D39] hover:bg-[#C24E2D] active:scale-[0.99] text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Tìm tour</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Action Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> 19 Tour trọn gói đang mở bán
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" /> Tự động xuất Vé điện tử E-Ticket QR
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tours')}
            className="text-[#5EEAD4] hover:text-white font-bold transition cursor-pointer"
          >
            Xem toàn bộ danh sách tour →
          </button>
        </div>
      </div>
    </section>
  );
};
