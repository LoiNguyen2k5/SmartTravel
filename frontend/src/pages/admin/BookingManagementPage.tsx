import React from 'react';
import { Table } from '../../components/common/Table';

export const BookingManagementPage: React.FC = () => {
  const columns = [
    { key: 'bookingCode', header: 'Mã đơn' },
    { key: 'tourTitle', header: 'Tour' },
    { key: 'userName', header: 'Khách hàng' },
    { key: 'totalPrice', header: 'Tổng tiền', render: (v: number) => `${v?.toLocaleString('vi-VN')} đ` },
    { key: 'status', header: 'Trạng thái' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Booking (Admin)</h1>
      <Table columns={columns} data={[]} emptyMessage="Chưa có đơn đặt tour nào." />
    </div>
  );
};
