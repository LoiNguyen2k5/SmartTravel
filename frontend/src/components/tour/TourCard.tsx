import React from 'react';
import { Tour } from '../../types/tour';
import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-slate-200">
        {tour.thumbnailUrl ? (
          <img
            src={tour.thumbnailUrl}
            alt={tour.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300 text-4xl">✈</div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-sky-600/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {tour.durationDays}N{tour.durationNights}Đ
        </span>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition">
          {tour.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-500" /> {tour.departureLocation}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 4.8
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400">Giá từ</div>
            <div className="text-lg font-extrabold text-sky-600">
              {tour.price?.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <Link
            to={`/tours/${tour.id}`}
            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition shadow"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};
