import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { User as UserIcon, Mail, Phone, Camera, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveProfile = async () => {
    setProfileMsg(null);
    if (!fullName.trim()) {
      setProfileMsg({ text: 'Họ và tên không được để trống.', type: 'error' });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      if (res?.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      setIsEditing(false);
      setProfileMsg({ text: 'Đã cập nhật thông tin hồ sơ thành công!', type: 'success' });
    } catch (err: any) {
      setProfileMsg({
        text: err?.response?.data?.message || 'Không thể cập nhật thông tin hồ sơ.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ text: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Mật khẩu mới phải có ít nhất 6 ký tự.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ text: 'Đổi mật khẩu thành công!', type: 'success' });
    } catch (err: any) {
      setPasswordMsg({
        text: err?.response?.data?.message || 'Mật khẩu hiện tại không chính xác hoặc không thể đổi mật khẩu.',
        type: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      

      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Hồ sơ Cá nhân</h1>
          <p className="text-xs text-[#526071] mt-1">Quản lý thông tin tài khoản và bảo mật trải nghiệm Smart Travel</p>
        </div>

        <div className="rounded-3xl border border-[#E6E1DA] bg-white backdrop-blur-xl p-5 sm:p-8 shadow-card space-y-6 text-[#0F172A]">
          {/* Avatar & User Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.3)] border-2 border-[#CBD5E1]">
                {avatarUrl || user?.avatarUrl ? (
                  <img src={avatarUrl || user?.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  (fullName || user?.fullName)?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center shadow-md hover:bg-[#E6F4F1] text-[#475569] hover:text-[#0F172A] transition"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-lg sm:text-xl text-[#0F172A] break-words">{fullName || user?.fullName || 'Khách Hàng SmartTravel'}</div>
              <div className="text-xs text-[#0D9488]/80 font-mono mt-0.5 break-all">{user?.email}</div>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-700'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Info Fields */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                <UserIcon className="inline h-3.5 w-3.5 mr-1 text-[#0D9488]" /> Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ và tên"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:bg-[#F4F1EC] focus:outline-none transition disabled:bg-[#FAF8F5] disabled:border-[#E6E1DA] disabled:text-[#526071] disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                <Mail className="inline h-3.5 w-3.5 mr-1 text-[#0D9488]" /> Email (Cố định tài khoản)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-[#0D9488]" /> Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="0912345678"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:bg-[#F4F1EC] focus:outline-none transition disabled:bg-[#FAF8F5] disabled:border-[#E6E1DA] disabled:text-[#526071] disabled:cursor-not-allowed"
              />
            </div>
            {isEditing && (
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  <Camera className="inline h-3.5 w-3.5 mr-1 text-[#0D9488]" /> URL Ảnh đại diện
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:bg-[#F4F1EC] focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-[#E6E1DA]">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#F4F1EC] hover:text-[#0F172A] transition cursor-pointer"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-sky-500/15 border border-sky-500/30 text-[#0B3B49] hover:bg-sky-500/25 hover:text-[#0F172A] px-6 py-2.5 text-sm font-bold shadow-[0_0_15px_rgba(14,165,233,0.2)] transition cursor-pointer"
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-[#E6E1DA] bg-white backdrop-blur-xl p-5 sm:p-8 shadow-card space-y-5 text-[#0F172A]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#0D9488]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Đổi Mật Khẩu Bảo Mật</h2>
              <p className="text-xs text-[#526071]">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-700'
              }`}
            >
              {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E6E1DA]">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-sky-500/20 border border-sky-500/40 text-[#0B3B49] hover:bg-sky-500/30 hover:text-[#0F172A] px-6 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>

        {/* Vendor Partner Status Card */}
        <div className="rounded-3xl border border-[#E6E1DA] bg-white backdrop-blur-xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
