import React from 'react';
import { MapPin, Plus } from 'lucide-react';

export const DestinationManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Điểm đến Du lịch</h1>
          <p className="mt-1 text-sm text-slate-600">Thêm mới và cập nhật danh sách các điểm đến trên hệ thống</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-500 shadow-sm transition">
          <Plus className="h-4 w-4" /> Thêm điểm đến
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
          <MapPin className="h-5 w-5 text-sky-600" />
          <span className="text-sm font-medium">Danh sách các điểm đến du lịch đã tải thành công.</span>
        </div>
      </div>
    </div>
  );
};
