import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-[#E6E1DA] bg-white backdrop-blur-xl p-5 sm:p-8 shadow-card text-[#0F172A]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F172A]">Đặt lại mật khẩu</h2>
          <p className="mt-1 text-xs text-[#526071]">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-[#D95D39]">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5" /> Đặt lại mật khẩu thành công! Đang chuyển hướng...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#475569]">Mật khẩu mới</label>
                <span className={`text-[11px] font-semibold ${
                  password.length === 0 ? 'text-slate-500' : password.length >= 8 ? 'text-emerald-700' : 'text-[#D95D39]'
                }`}>
                  {password.length === 0 ? 'Tối thiểu 8 ký tự' : password.length >= 8 ? '✓ Đạt chuẩn' : `${password.length}/8 ký tự`}
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#526071]" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
                  placeholder="Nhập tối thiểu 8 ký tự"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#475569]">Xác nhận mật khẩu</label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[11px] font-semibold ${
                    confirmPassword === password ? 'text-emerald-700' : 'text-[#D95D39]'
                  }`}>
                    {confirmPassword === password ? '✓ Mật khẩu khớp' : '✕ Chưa khớp'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#526071]" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 py-3 font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition text-sm cursor-pointer"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
