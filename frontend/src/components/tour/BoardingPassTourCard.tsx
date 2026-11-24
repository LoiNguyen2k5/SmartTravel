import React from 'react';
import { Plane, Bus, Star, Calendar, Eye, ArrowRight } from 'lucide-react';
import { Tour } from '../../types/tour';
import { getTourTransportInfo } from '../../utils/tourTransport';
import { tourScheduleService } from '../../services/tourScheduleService';

interface BoardingPassTourCardProps {
  tour: Tour;
  onSelect: (tourId: number) => void;
}

export const BoardingPassTourCard: React.FC<BoardingPassTourCardProps> = ({ tour, onSelect }) => {
  const transport = getTourTransportInfo(tour);
  const isFlight = transport.mode === 'FLIGHT';
  const ratio = tourScheduleService.getTourSeatRatioDisplay(tour.id, tour.category);
  const avail = tourScheduleService.getTourAvailableSeats(tour.id, tour.remainingSeats ?? 40, tour.category);
  const departureDisplay = tourScheduleService.getTourDepartureDateDisplay(tour.id, tour.category);
  const depositAmount = Math.round((tour.price || 0) * 0.3);

  const stampText = tour.requiresVisa
    ? `HỖ TRỢ VISA ${tour.visaProcessingDays || 5}N`
    : tour.category === 'NUOC_NGOAI'
      ? 'MIỄN VISA ASEAN'
      : isFlight
        ? 'BAY KHỨ HỒI'
        : 'ĐƯỜNG BỘ CAO CẤP';

  return (
    <article
      onClick={() => onSelect(tour.id)}
      className="boarding-pass-card group flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={tour.thumbnailUrl || '/images/tours/han-quoc-seoul-nami/01.jpg'}
          alt={tour.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B49]/55 via-transparent to-black/15" />

        {/* Top-left Transport Badge */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
            isFlight ? 'bg-[#0B3B49]/95' : 'bg-[#0369A1]/95'
          }`}
        >
          {isFlight ? <Plane className="h-3 w-3 text-[#5EEAD4]" /> : <Bus className="h-3 w-3 text-sky-200" />}
          {transport.badgeLabel}
        </span>

        {/* Top-right Passport Stamp Badge */}
        <span className="passport-stamp absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
          {stampText}
        </span>

        {/* Bottom-left Seat availability */}
        <span
          className={`absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md ${
            avail > 0
              ? 'bg-white/90 text-[#0B3B49]'
              : 'bg-rose-600/95 text-white'
          }`}
        >
          {avail > 0 ? `Còn ${avail}/${ratio.max} chỗ` : 'Hết chỗ'}
        </span>
      </div>

      {/* Upper Boarding Body */}
      <div className="p-4 flex-1 flex flex-col space-y-2.5">
        {/* Route Strip (SGN ✈ ICN · Vietnam Airlines) */}
        <div
          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[11px] border ${
            isFlight
              ? 'bg-[#E6F4F1] border-[#99F6E4]/70 text-[#0B3B49]'
              : 'bg-[#F0F9FF] border-sky-200/80 text-[#075985]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-black shrink-0">
            <span>{transport.fromCode}</span>
            <span className="inline-flex items-center gap-1 text-[#0D9488]">
              <span className="w-3 h-[1px] bg-current opacity-60" />
              {isFlight ? <Plane className="h-3.5 w-3.5" /> : <Bus className="h-3.5 w-3.5 text-sky-600" />}
              <span className="w-3 h-[1px] bg-current opacity-60" />
            </span>
            <span>{transport.toCode}</span>
          </div>
          <span className="text-[11px] font-semibold text-[#0F5264] truncate">
            · {transport.shortCarrierBadge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-extrabold text-[#0F172A] group-hover:text-[#0B3B49] line-clamp-2 leading-snug transition-colors">
          {tour.title}
        </h3>

        {/* Duration & Departure Meta */}
        <div className="space-y-1.5 text-[11px] text-[#526071]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#334155]">
              {tour.durationDays}N{tour.durationNights > 0 ? `${tour.durationNights}Đ` : ''} · {tour.departureLocation || 'TP.Hồ Chí Minh'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
            <span>Khởi hành:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#0B3B49] font-bold text-[10px] truncate">
              {departureDisplay}
            </span>
          </div>
        </div>

        {/* Rating & Views */}
        <div className="flex items-center justify-between text-[11px] pt-0.5 mt-auto">
          <span className="inline-flex items-center gap-1 font-bold text-[#0F172A]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {tour.totalReviews && tour.totalReviews > 0
              ? `${(tour.averageRating || 5.0).toFixed(1)} · ${tour.totalReviews} đánh giá`
              : '5.0 · Đề xuất'}
          </span>
          <span className="inline-flex items-center gap-1 text-[#526071] font-medium">
            <Eye className="h-3.5 w-3.5" />
            {tour.viewCount || 120} lượt xem
          </span>
        </div>
      </div>

      {/* Boarding Pass Perforated Tear Divider & Bottom Price Stub */}
      <div className="boarding-pass-tear px-4 py-3.5 bg-white flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[15px] font-black text-[#D95D39] leading-tight">
            {tour.price.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] font-bold text-[#0D9488] mt-0.5 truncate">
            Giữ chỗ cọc 30%: {depositAmount.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tour.id);
          }}
          className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0B3B49] hover:bg-[#0F5264] text-white text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <span>Đặt vé</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
};
