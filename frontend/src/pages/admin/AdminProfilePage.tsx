import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ProfileAccountCard } from '../../components/common/ProfileAccountCard';

export const AdminProfilePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] flex items-center gap-3 tracking-tight">
          <span className="p-2 rounded-2xl bg-[#0B3B49] text-[#5EEAD4] shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </span>
          Hồ sơ Quản trị viên
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#526071]">
          Cập nhật ảnh đại diện, thông tin cá nhân và mật khẩu bảo mật cho tài khoản Admin SmartTravel
        </p>
      </div>

      <ProfileAccountCard roleBadge="Administrator" defaultDisplayName="System Administrator" />
    </div>
  );
};
