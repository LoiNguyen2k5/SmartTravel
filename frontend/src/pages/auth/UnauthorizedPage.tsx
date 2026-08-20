import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex h-[75vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-red-100 p-6 text-red-600 mb-4">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">403 - Truy cập bị từ chối</h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        Tài khoản của bạn không có đủ quyền hạn để truy cập vào trang này. Vui lòng liên hệ Administrator nếu bạn tin rằng đây là sự nhầm lẫn.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Quay về Trang chủ
      </Link>
    </div>
  );
};
