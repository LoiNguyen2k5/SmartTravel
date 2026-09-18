import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Sparkles, Star, ChevronRight, ShieldCheck, QrCode, Bot } from 'lucide-react';
import { Tour } from '../../types/tour';
import { MOCK_TOURS } from '../../data/mockTours';

interface LuxuryHero3DProps {
  tours?: Tour[];
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
  tours = MOCK_TOURS,
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
  const ringRef = useRef<HTMLDivElement>(null);
  const stARef = useRef<HTMLDivElement>(null);
  const stBRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 1. Starfield background generation
  useEffect(() => {
    if (stARef.current && stBRef.current) {
      const listA: string[] = [];
      for (let i = 0; i < 140; i++) {
        const x = (Math.random() * 100).toFixed(2);
        const y = (Math.random() * 100).toFixed(2);
        const a = (0.05 + Math.random() * 0.25).toFixed(3);
        listA.push(`${x}vw ${y}vh 0px 0 rgba(255,255,255,${a})`);
      }
      stARef.current.style.boxShadow = listA.join(',');

      const listB: string[] = [];
      for (let i = 0; i < 18; i++) {
        const x = (Math.random() * 100).toFixed(2);
        const y = (Math.random() * 100).toFixed(2);
        const a = (0.35 + Math.random() * 0.35).toFixed(3);
        listB.push(`${x}vw ${y}vh 1.2px 0 rgba(255,255,255,${a})`);
      }
      stBRef.current.style.boxShadow = listB.join(',');
    }
  }, []);

  // 2. 3D Perspective Cylinder Carousel — infinite smooth loop
  useEffect(() => {
    const ringEl = ringRef.current;
    if (!ringEl) return;

    const cards = Array.from(ringEl.children) as HTMLElement[];
    const N_CARDS = cards.length;
    if (N_CARDS === 0) return;

    // Cylinder radius & angular slot between cards
    const R = 700;
    const STEP = 360 / N_CARDS; // degrees per card slot

    // Visibility window: cards within ±VISIBLE_DEG of front are shown
    const VISIBLE_DEG = 78;

    // Rotation speed in degrees per second (positive = left-to-right sweep)
    const DEG_PER_SEC = 22;

    let phase = 0; // accumulated rotation in degrees
    let lastTime = performance.now();
    let animId: number;

    const placeCards = () => {
      for (let i = 0; i < N_CARDS; i++) {
        const el = cards[i];

        // Angle of this card in the ring (normalised to -180..+180)
        const rawAngle = i * STEP + phase;
        const a = ((rawAngle % 360) + 540) % 360 - 180;

        if (Math.abs(a) > VISIBLE_DEG) {
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
          continue;
        }

        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';

        const rad = (a * Math.PI) / 180;
        const sinVal = Math.sin(rad);
        const cosVal = Math.cos(rad); // 1 at front, -1 at back

        // Horizontal translation along the arc
        const tx = R * sinVal;
        // Push back cards further away (z = 0 at front, R at back of ring)
        const tz = R * (1 - cosVal);

        // Counter-rotate card face so it always faces viewer
        const rotY = -a;

        el.style.transform = `translate3d(${tx.toFixed(2)}px, 0px, ${tz.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;

        // Brightness: 1.0 at front (cosVal≈1), dims toward sides
        const bright = Math.max(0.35, cosVal * 0.95 + 0.05);
        // Scale: slightly larger at front
        const scale = Math.max(0.72, 0.72 + 0.28 * cosVal);
        el.style.filter = `brightness(${bright.toFixed(3)})`;
        el.style.scale = scale.toFixed(3);
        // z-index ordering: front cards on top
        el.style.zIndex = String(Math.round(cosVal * 100 + 100));
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08); // cap dt to avoid jumps
      lastTime = now;
      if (!isPaused) {
        phase -= DEG_PER_SEC * dt; // negative = cards flow left
      }
      placeCards();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, tours]);

  // Fill the ring with enough virtual cards — 12 slots gives nice spacing
  const N_SLOTS = 12;
  const activeTours = tours.length > 0 ? tours : MOCK_TOURS;
  const cardsList = Array.from({ length: N_SLOTS }, (_, i) => activeTours[i % activeTours.length]);

  return (
    <div className="relative bg-[#020204] text-white overflow-hidden w-full select-none pt-6 pb-12">
      {/* Background radial atmosphere gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'linear-gradient(180deg, rgba(25,127,255,0) 38%, rgba(25,127,255,.05) 54%, rgba(25,127,255,.06) 68%, rgba(2,2,4,1) 100%)'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Starfield div layers */}
      <div ref={stARef} className="absolute left-0 top-0 w-[1px] h-[1px] rounded-full bg-white pointer-events-none z-0" />
      <div ref={stBRef} className="absolute left-0 top-0 w-[1px] h-[1px] rounded-full bg-white pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* =====================================================================
            HERO HEADLINE & SUBTITLE
            ===================================================================== */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-normal drop-shadow-[0_0_34px_rgba(130,180,255,0.25)] max-w-4xl pt-4">
          KHÁM PHÁ THẾ GIỚI
          <span 
            className="block mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-cyan-200"
            style={{ paddingTop: '0.2em', paddingBottom: '0.25em' }}
          >
            TRỌN VẸN HÀNH TRÌNH
          </span>
        </h1>

        <p className="mt-4 text-xs sm:text-sm md:text-base font-normal text-slate-300/90 max-w-2xl leading-relaxed">
          <b>Đặt tour du lịch trực tuyến hiện đại</b> • Tích hợp thanh toán quét mã VietQR tự động, quản lý hồ sơ Visa quốc tế và AI đề xuất lịch trình thông minh.
        </p>

        {/* =====================================================================
            PIXEL CONTRACT B: GLOW BUTTONS (.btn)
            ===================================================================== */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 z-30">
          {/* Main Glow Button */}
          <button
            type="button"
            onClick={() => navigate('/tours')}
            className="group relative overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            style={{
              background: 'linear-gradient(to top, #9ad9ec 1px, #79e0f1 3px, #14a8c6 6px, #038aa8 8px, #006180 10px, #04465a 14px, #0a2a37 18px, #0a111d 34px, #0a111d 100%)',
              boxShadow: 'inset 0 3px 3px -2px rgba(180,228,255,.10), inset 1px 0 0 rgba(255,255,255,.09), inset -1px 0 0 rgba(255,255,255,.09), 0 0 12px rgba(60,190,235,.25), 0 4px 10px -2px rgba(90,220,255,.4)'
            }}
          >
            {/* Top thin light streak */}
            <span 
              className="absolute left-[22%] right-[38%] top-[1px] h-[1.8px] blur-[0.5px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(120,225,255,0) 0%, rgba(160,240,255,.74) 50%, rgba(120,225,255,0) 100%)'
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Khám phá Tour ngay
              <ChevronRight className="h-4 w-4 text-cyan-200 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={() => {
              // Trigger floating AI assistant widget if available
              const aiTrigger = document.querySelector('[data-ai-chat-trigger]') as HTMLElement;
              if (aiTrigger) aiTrigger.click();
              else navigate('/tours');
            }}
            className="group relative overflow-hidden rounded-2xl px-7 py-3.5 text-sm font-semibold text-white/90 bg-white/5 border border-white/15 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/30"
          >
            <span className="relative z-10 flex items-center gap-2 text-sky-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Tư vấn cùng AI Chatbot
            </span>
          </button>
        </div>

        {/* =====================================================================
            3D PERSPECTIVE CYLINDER SHOWCASE RING (Horizon & True 3D Depth)
            ===================================================================== */}
        <div 
          className="relative w-full h-[460px] sm:h-[500px] mt-6 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 3D Ring Viewport container */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[1500px] h-full"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '750px 240px',
              transformStyle: 'preserve-3d',
              pointerEvents: 'none'
            }}
          >
            <div ref={ringRef} className="relative w-full h-full pointer-events-auto">
              {cardsList.map((tour, idx) => {
                const isForeign = tour.category === 'NUOC_NGOAI';
                return (
                  <div
                    key={`${tour.id}-${idx}`}
                    onClick={() => navigate(`/tours/${tour.id}`)}
                    className="absolute left-[750px] top-[240px] w-[210px] h-[310px] -ml-[105px] -mt-[155px] rounded-2xl overflow-hidden bg-[#0d1117] cursor-pointer group shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:shadow-cyan-500/20"
                    style={{
                      backfaceVisibility: 'hidden',
                      willChange: 'transform'
                    }}
                    title={tour.title}
                  >
                    {/* Tour image */}
                    <img 
                      src={tour.thumbnailUrl} 
                      alt={tour.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

                    {/* Top Tag Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md ${
                        isForeign ? 'bg-rose-500/90 text-white' : 'bg-sky-500/90 text-white'
                      }`}>
                        {isForeign ? 'QUỐC TẾ' : 'TRONG NƯỚC'}
                      </span>
                      <div className="flex items-center gap-0.5 text-[12px] font-bold text-amber-300 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{tour.averageRating || 5.0}</span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1 text-left">
                      <h4 className="text-[13px] font-bold text-white line-clamp-2 leading-tight uppercase group-hover:text-sky-300 transition-colors">
                        {tour.title}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                        <span className="text-[10px] text-slate-400">{tour.durationDays}N{tour.durationNights}Đ</span>
                        <span className="text-[13px] font-extrabold text-cyan-300">
                          {Math.round(tour.price / 1000000)}tr đ
                        </span>
                      </div>
                    </div>

                    {/* Edge subtle inner border */}
                    <div className="absolute inset-0 rounded-2xl border border-white/15 pointer-events-none group-hover:border-sky-400/50 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================================
            FOREGROUND SEARCH / BOOKING INTERFACE CARD
            ===================================================================== */}
        <div className="relative w-full max-w-5xl mt-6 sm:mt-8 z-30">
          <div className="bg-slate-900/95 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-5">
            
            {/* Top Bar: Tabs & Guarantee Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              {/* Segmented Filter Tab */}
              <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSearchTab('DOMESTIC')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    searchTab === 'DOMESTIC'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🏖️ Du lịch trong nước
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('INTERNATIONAL')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    searchTab === 'INTERNATIONAL'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ✈️ Du lịch nước ngoài
                </button>
              </div>

              {/* Live Status indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hệ thống giữ chỗ Real-time &amp; Đối soát VietQR 24/7</span>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={onSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-left">
              {/* Departure */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Điểm khởi hành
                </label>
                <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 focus-within:bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs transition">
                  <MapPin className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="bg-transparent w-full text-white font-semibold focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option value="TP.Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Điểm đến mong muốn
                </label>
                <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 focus-within:bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs transition">
                  <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-transparent w-full text-white font-semibold focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option value="">Tất cả điểm đến</option>
                    <option value="Phượng Hoàng Cổ Trấn">Ân Thi — Phượng Hoàng Cổ Trấn</option>
                    <option value="Thượng Hải">Thượng Hải — Tây Sách Ô Trấn</option>
                    <option value="Đà Lạt">Đà Lạt — Thành phố ngàn hoa</option>
                    <option value="Miền Tây">Miền Tây — Cần Thơ &amp; Cà Mau</option>
                    <option value="Châu Đốc">Châu Đốc — An Giang</option>
                    <option value="Núi Chứa Chan">Đồng Nai — Núi Chứa Chan</option>
                  </select>
                </div>
              </div>

              {/* Departure Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ngày khởi hành
                </label>
                <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 focus-within:bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs transition">
                  <Calendar className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="bg-transparent w-full text-white font-semibold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black py-3 px-5 text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                <span>Tìm kiếm hành trình</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            {/* Bottom Service Badges Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-white/10 text-[11px] font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <QrCode className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                <span>Quét mã VietQR tức thì</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Thủ tục Visa trọn gói</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                <span>Trợ lý ảo Gemini AI 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span>Lịch trình tối ưu chi phí</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
