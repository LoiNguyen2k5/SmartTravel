import React from 'react';
import { Table } from '../../components/common/Table';

export const TourManagementPage: React.FC = () => {
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Tên Tour' },
    { key: 'price', header: 'Giá', render: (v: number) => `${v?.toLocaleString('vi-VN')} đ` },
    { key: 'status', header: 'Trạng thái', render: (v: string) => (
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${v === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{v}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Tour (Admin)</h1>
      <Table columns={columns} data={[]} emptyMessage="Chưa có tour nào trong hệ thống." />
    </div>
  );
};
