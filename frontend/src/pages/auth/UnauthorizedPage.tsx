import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex h-[75vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-rose-500/15 border border-rose-500/30 p-6 text-rose-400 mb-4 shadow-[0_0_24px_rgba(244,63,94,0.25)]">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">403 - Truy cập bị từ chối</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        Tài khoản của bạn không có đủ quyền hạn để truy cập vào trang này. Vui lòng liên hệ Administrator nếu bạn tin rằng đây là sự nhầm lẫn.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(244,63,94,0.3)] transition"
      >
        <ArrowLeft className="h-4 w-4" /> Quay về Trang chủ
      </Link>
    </div>
  );
};
