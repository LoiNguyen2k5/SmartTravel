import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { User as UserIcon, Mail, Phone, Camera } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  return (
    <div className="min-h-screen bg-[#020204] text-white py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Hồ sơ Cá nhân</h1>
          <p className="text-xs text-slate-400 mt-1">Quản lý thông tin tài khoản và bảo mật trải nghiệm Smart Travel</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0a111d]/90 backdrop-blur-xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-6 text-white">
          {/* Avatar & User Header */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.3)] border-2 border-white/20">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.fullName?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#0d1626] border border-white/20 flex items-center justify-center shadow-md hover:bg-white/15 text-slate-300 hover:text-white transition"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <div className="font-extrabold text-xl text-white">{user?.fullName || 'Khách Hàng SmartTravel'}</div>
              <div className="text-xs text-sky-400/80 font-mono mt-0.5">{user?.email}</div>
            </div>
          </div>

          {/* Info Fields */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                <UserIcon className="inline h-3.5 w-3.5 mr-1 text-sky-400" /> Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ và tên"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.08] focus:outline-none transition disabled:bg-white/[0.02] disabled:border-white/5 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                <Mail className="inline h-3.5 w-3.5 mr-1 text-sky-400" /> Email (Cố định tài khoản)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-sky-400" /> Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="0912345678"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.08] focus:outline-none transition disabled:bg-white/[0.02] disabled:border-white/5 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-white/8">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition cursor-pointer"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 hover:text-white px-6 py-2.5 text-sm font-bold shadow-[0_0_15px_rgba(14,165,233,0.2)] transition cursor-pointer"
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
