import React from 'react';
import { Table } from '../../components/common/Table';

export const UserManagementPage: React.FC = () => {
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'fullName', header: 'Họ tên' },
    { key: 'email', header: 'Email' },
    { key: 'enabled', header: 'Trạng thái', render: (v: boolean) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
        {v ? 'Hoạt động' : 'Bị khóa'}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Người dùng (Admin)</h1>
      <Table columns={columns} data={[]} emptyMessage="Chưa có người dùng nào." />
    </div>
  );
};
