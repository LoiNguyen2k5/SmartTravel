import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-[#0a111d]/90 backdrop-blur-xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Đặt lại mật khẩu</h2>
          <p className="mt-1 text-xs text-slate-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {success ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5" /> Đặt lại mật khẩu thành công! Đang chuyển hướng...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
                  placeholder="••••••••"
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
