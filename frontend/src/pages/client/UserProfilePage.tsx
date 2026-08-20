import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { User as UserIcon, Mail, Phone, Camera } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ Cá nhân</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-extrabold text-2xl overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                user?.fullName?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
              <Camera className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
          <div>
            <div className="font-bold text-xl text-slate-900">{user?.fullName}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <UserIcon className="inline h-3.5 w-3.5 mr-1" /> Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm disabled:bg-slate-50 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <Mail className="inline h-3.5 w-3.5 mr-1" /> Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-slate-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <Phone className="inline h-3.5 w-3.5 mr-1" /> Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm disabled:bg-slate-50 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white hover:bg-sky-500 transition"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
