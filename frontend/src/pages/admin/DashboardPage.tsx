import React from 'react';
import { Users, Compass, ShoppingBag, DollarSign } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Tổng quan tình hình kinh doanh và chỉ số hoạt động hệ thống</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Người dùng</div>
            <div className="text-2xl font-extrabold text-slate-900">1,248</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng Tour Hoạt động</div>
            <div className="text-2xl font-extrabold text-slate-900">156</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Đơn Booking Mới</div>
            <div className="text-2xl font-extrabold text-slate-900">432</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Doanh thu Tháng</div>
            <div className="text-2xl font-extrabold text-slate-900">850M đ</div>
          </div>
        </div>
      </div>
    </div>
  );
};
