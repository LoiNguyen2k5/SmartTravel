import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { OtpType } from '../../types/auth';
import { ArrowLeft, Eye, EyeOff, KeyRound, MailCheck, RefreshCw } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'EMAIL' | 'OTP_RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Bộ đếm ngược 60s
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP_RESET' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Bước 1: Yêu cầu gửi mã OTP quên mật khẩu
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setStep('OTP_RESET');
      setTimer(60);
      setSuccessMsg('Đã gửi mã OTP khôi phục mật khẩu (hiệu lực 60s) đến email của bạn.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Khôi phục mật khẩu thất bại. Vui lòng kiểm tra lại email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Nhập OTP và Đặt lại mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        code: otpCode.trim(),
        newPassword,
      });
      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError('');
    setSuccessMsg('');
    setIsResending(true);

    try {
      await authService.resendOtp({
        email,
        type: OtpType.FORGOT_PASSWORD,
      });
      setTimer(60);
      setSuccessMsg('Mã OTP mới (60s) đã được gửi đến email của bạn.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60 space-y-5">
      {step === 'EMAIL' ? (
        /* Bước 1: Nhập Email */
        <>
          <div className="text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Quên mật khẩu</h2>
            <p className="text-xs text-slate-400 mt-1">Nhập Email để nhận mã OTP 60s xác thực</p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng ký</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'Đang gửi mã OTP...' : 'Gửi mã xác thực OTP'}
            </button>

            <div className="text-center pt-1">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        </>
      ) : (
        /* Bước 2: Nhập OTP & Mật khẩu mới */
        <>
          <div className="text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Đặt lại mật khẩu</h2>
            <p className="text-xs text-slate-500 mt-1">
              Mã xác thực đã được gửi tới: <span className="font-bold text-slate-700">{email}</span>
            </p>
          </div>

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-100 text-center">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-center text-xs font-bold text-slate-700 mb-1">
                Mã OTP 6 chữ số
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-bold tracking-[8px] rounded-xl border border-slate-200 px-4 py-2 text-rose-600 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            {/* Countdown 60s */}
            <div className="text-center text-xs font-semibold">
              {timer > 0 ? (
                <span className="text-slate-500">
                  Mã hết hạn sau: <span className="text-rose-500 font-bold text-sm">{timer}s</span>
                </span>
              ) : (
                <span className="text-rose-600">Mã OTP đã hết hạn! Vui lòng bấm gửi lại.</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới ít nhất 6 ký tự"
                  className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-300 hover:text-slate-500 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 mt-1"
            >
              {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu & Đăng nhập'}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ← Nhập email khác
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || isResending}
                className={`flex items-center gap-1 font-bold transition ${
                  timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-rose-500 hover:underline'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
