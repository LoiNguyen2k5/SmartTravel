import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { DayTimeline } from './DayTimeline';
import { DragDropPlanner } from './DragDropPlanner';

interface ActivityItem {
  id: number;
  time: string;
  name: string;
  location: string;
  cost: number;
}

interface ItineraryBuilderProps {
  title?: string;
  totalDays?: number;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  title = 'Kế hoạch du lịch của tôi',
  totalDays = 3,
}) => {
  const [activeDay, setActiveDay] = useState(1);
  const [dayActivities, setDayActivities] = useState<Record<number, ActivityItem[]>>({
    1: [{ id: 1, time: '09:00', name: 'Check-in khách sạn', location: 'Đà Nẵng', cost: 0 }],
  });

  const handleAddItem = (item: Omit<ActivityItem, 'id'>) => {
    setDayActivities((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), { ...item, id: Date.now() }],
    }));
  };

  const handleDelete = (id: number) => {
    setDayActivities((prev) => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).filter((a) => a.id !== id),
    }));
  };

  const handleReorder = (items: ActivityItem[]) => {
    setDayActivities((prev) => ({ ...prev, [activeDay]: items }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Calendar className="h-5 w-5 text-sky-600" />
        <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition
              ${activeDay === day ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Ngày {day}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        <DayTimeline
          day={activeDay}
          items={dayActivities[activeDay] || []}
          onDelete={handleDelete}
        />
        <div className="border-t border-slate-100 pt-4">
          <DragDropPlanner
            dayNumber={activeDay}
            items={dayActivities[activeDay] || []}
            onReorder={handleReorder}
            onAddItem={handleAddItem}
          />
        </div>
      </div>
    </div>
  );
};
