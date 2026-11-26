import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ProfileAccountCard } from '../../components/common/ProfileAccountCard';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] py-10 sm:py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Hồ sơ Cá nhân</h1>
          <p className="text-xs text-[#526071] mt-1">
            Quản lý thông tin tài khoản, ảnh đại diện và bảo mật trải nghiệm Smart Travel
          </p>
        </div>

        <ProfileAccountCard defaultDisplayName="Khách Hàng SmartTravel" />

        {/* Vendor Partner Status Card */}
        <div className="rounded-3xl border border-[#E6E1DA] bg-white p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0F172A]">
                {user?.roles?.includes('ROLE_VENDOR') ? 'Đối tác Nhà Cung Cấp (Vendor)' : 'Trở thành Đối tác Du lịch'}
              </div>
              <p className="text-xs text-[#526071] mt-0.5">
                {user?.roles?.includes('ROLE_VENDOR')
                  ? 'Tài khoản của bạn đã có quyền đăng bán tour và quản lý lịch khởi hành.'
                  : 'Tiếp cận hàng triệu du khách và quản lý booking thông minh cùng SmartTravel.'}
              </p>
            </div>
          </div>

          <Link
            to={user?.roles?.includes('ROLE_VENDOR') ? '/vendor' : '/become-vendor'}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition"
          >
            {user?.roles?.includes('ROLE_VENDOR') ? 'Truy cập Kênh Vendor' : 'Nộp hồ sơ Đối tác'}
          </Link>
        </div>
      </div>
    </div>
  );
};
