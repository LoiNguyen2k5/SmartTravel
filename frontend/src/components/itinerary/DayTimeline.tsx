import React from 'react';
import { Clock, MapPin, Trash2 } from 'lucide-react';

interface ItineraryItemType {
  id: number;
  time: string;
  name: string;
  location: string;
  cost: number;
}

interface DayTimelineProps {
  day: number;
  items: ItineraryItemType[];
  onDelete?: (id: number) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ day, items, onDelete }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span className="rounded-lg bg-sky-600 px-2 py-0.5 text-xs text-white">Ngày {day}</span>
      </h3>

      <div className="relative pl-6 space-y-3">
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200" />
        {items.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow transition">
            <div className="absolute -left-[22px] top-4 h-4 w-4 rounded-full border-2 border-sky-500 bg-white" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                  <Clock className="inline h-3 w-3 mr-0.5" />{item.time || '--:--'}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" /> {item.location}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-700">{item.cost.toLocaleString('vi-VN')}đ</span>
              {onDelete && (
                <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
