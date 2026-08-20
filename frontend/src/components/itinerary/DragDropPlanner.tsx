import React, { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';

interface DragItem {
  id: number;
  name: string;
  location: string;
  time: string;
  cost: number;
}

interface DragDropPlannerProps {
  dayNumber: number;
  items: DragItem[];
  onReorder?: (items: DragItem[]) => void;
  onAddItem?: (item: Omit<DragItem, 'id'>) => void;
}

export const DragDropPlanner: React.FC<DragDropPlannerProps> = ({
  dayNumber,
  items,
  onReorder,
  onAddItem,
}) => {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleDragStart = (id: number) => setDraggedId(id);

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const from = items.findIndex((i) => i.id === draggedId);
    const to = items.findIndex((i) => i.id === targetId);
    const reordered = [...items];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    onReorder?.(reordered);
    setDraggedId(null);
  };

  const handleAdd = () => {
    if (!newName) return;
    onAddItem?.({ name: newName, location: newLocation, time: newTime, cost: 0 });
    setNewName('');
    setNewLocation('');
    setNewTime('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ngày {dayNumber} — Kéo thả để sắp xếp</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            className={`flex items-center gap-3 rounded-xl border bg-white p-3 cursor-grab active:cursor-grabbing transition shadow-sm
              ${draggedId === item.id ? 'opacity-40 scale-95' : ''}`}
          >
            <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700">{item.time || '--:--'}</span>
            <span className="text-sm font-medium text-slate-800 flex-1">{item.name}</span>
            <span className="text-xs text-slate-500">{item.location}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Giờ" className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none" />
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tên hoạt động" className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none" />
        <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Địa điểm" className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none" />
        <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
