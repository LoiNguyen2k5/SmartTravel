import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Lock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
} from 'lucide-react';

interface ProfileAccountCardProps {
  roleBadge?: string;
  defaultDisplayName?: string;
  showPasswordSection?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const AVATAR_SIZE_PX = 320;

const compressImageFileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh đã chọn.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Tệp hình ảnh không hợp lệ hoặc bị hỏng.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_SIZE_PX;
        canvas.height = AVATAR_SIZE_PX;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Trình duyệt không hỗ trợ xử lý hình ảnh.'));
          return;
        }
        // Center-crop square avatar for clean framing
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const ProfileAccountCard: React.FC<ProfileAccountCardProps> = ({
  roleBadge,
  defaultDisplayName = 'Thành viên SmartTravel',
  showPasswordSection = true,
}) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isEditing && user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, isEditing]);

  const handleOpenFilePicker = () => {
    setProfileMsg(null);
    if (!isEditing) {
      setIsEditing(true);
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setProfileMsg(null);
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ text: 'Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WEBP, GIF).', type: 'error' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setProfileMsg({ text: 'Kích thước ảnh tối đa là 5MB. Vui lòng chọn ảnh nhỏ hơn.', type: 'error' });
      return;
    }

    setProcessingAvatar(true);
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file);
      setAvatarUrl(compressedDataUrl);
      setIsEditing(true);
    } catch (err: any) {
      setProfileMsg({ text: err?.message || 'Không thể xử lý ảnh đại diện.', type: 'error' });
    } finally {
      setProcessingAvatar(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setAvatarUrl(user?.avatarUrl || '');
    setProfileMsg(null);
    setIsEditing(false);
  };

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
        updateUser(res.data);
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

  const displayedAvatar = avatarUrl;
  const fallbackInitial = (fullName || user?.fullName || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Profile Info Card */}
      <div className="rounded-3xl border border-[#E6E1DA] bg-white p-5 sm:p-8 shadow-card space-y-6 text-[#0F172A]">
        {/* Avatar & User Header */}
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#0B3B49] to-[#0D9488] flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-md border-2 border-[#CBD5E1]">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : (
                fallbackInitial
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenFilePicker}
              disabled={processingAvatar}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center shadow-md hover:bg-[#E6F4F1] text-[#0B3B49] transition cursor-pointer disabled:opacity-50"
              title="Chọn ảnh đại diện từ máy"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="font-extrabold text-lg sm:text-xl text-[#0F172A] break-words">
                {fullName || user?.fullName || defaultDisplayName}
              </div>
              {roleBadge && (
                <span className="inline-flex items-center rounded-full bg-[#E6F4F1] border border-[#99F6E4] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B3B49]">
                  {roleBadge}
                </span>
              )}
            </div>
            <div className="text-xs text-[#0D9488] font-mono mt-0.5 break-all">{user?.email}</div>
            {isEditing && (
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  disabled={processingAvatar}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#E6F4F1] border border-[#99F6E4] px-3 py-1.5 text-xs font-bold text-[#0B3B49] hover:bg-[#CCF0E8] transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {processingAvatar ? 'Đang xử lý ảnh...' : 'Chọn ảnh từ máy'}
                </button>
                {displayedAvatar && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh
                  </button>
                )}
                <span className="text-[11px] text-[#526071]">Hỗ trợ JPG, PNG, WEBP (tối đa 5MB)</span>
              </div>
            )}
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
            {profileMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
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
              className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none transition disabled:bg-[#FAF8F5] disabled:border-[#E6E1DA] disabled:text-[#526071] disabled:cursor-not-allowed"
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
              className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none transition disabled:bg-[#FAF8F5] disabled:border-[#E6E1DA] disabled:text-[#526071] disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-[#E6E1DA]">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile || processingAvatar}
                className="flex-1 rounded-xl bg-[#0B3B49] hover:bg-[#0D4D5E] py-2.5 text-sm font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingProfile}
                className="rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#F4F1EC] hover:text-[#0F172A] transition cursor-pointer"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setProfileMsg(null);
                setIsEditing(true);
              }}
              className="rounded-xl bg-[#E6F4F1] border border-[#99F6E4] text-[#0B3B49] hover:bg-[#CCF0E8] px-6 py-2.5 text-sm font-bold transition cursor-pointer"
            >
              Chỉnh sửa thông tin
            </button>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      {showPasswordSection && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-[#E6E1DA] bg-white p-5 sm:p-8 shadow-card space-y-5 text-[#0F172A]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E6F4F1] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] shrink-0">
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
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
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
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E6E1DA]">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-[#E6F4F1] border border-[#99F6E4] text-[#0B3B49] hover:bg-[#CCF0E8] px-6 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
