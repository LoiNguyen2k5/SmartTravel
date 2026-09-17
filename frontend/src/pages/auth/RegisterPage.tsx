import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { OtpType } from '../../types/auth';
import { saveAccount } from '../../utils/savedAccounts';
import { Eye, EyeOff, MailCheck, RefreshCw, Store, UserCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [selectedRole, setSelectedRole] = useState<'ROLE_USER' | 'ROLE_VENDOR'>('ROLE_USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Đếm ngược 60s khi ở bước OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Xử lý gửi Form Đăng Ký
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        fullName,
        email,
        phone,
        password,
        roles: [selectedRole],
      });
      setStep('OTP');
      setTimer(60);
      setSuccessMsg('Đã gửi mã xác thực OTP (hiệu lực 60s) đến email của bạn.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Xác nhận mã OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyRegisterOtp({
        email,
        code: otpCode.trim(),
        type: OtpType.REGISTER,
      });
      // Lưu tài khoản & mật khẩu để hỗ trợ gợi ý đăng nhập tự động
      saveAccount(email, password);
      setSuccessMsg('Kích hoạt tài khoản thành công! Đang chuyển sang trang Đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Gửi lại mã OTP (60s)
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError('');
    setSuccessMsg('');
    setIsResending(true);

    try {
      await authService.resendOtp({
        email,
        type: OtpType.REGISTER,
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
    <div className="rounded-3xl border border-white/10 bg-[#0a111d]/90 backdrop-blur-xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-5 text-white">
      {/* Step 1: Form điền thông tin Đăng Ký */}
      {step === 'FORM' ? (
        <>
          {/* Title */}
          <div className="text-center pt-2">
            <h2 className="text-xl font-bold text-white">Register For Free</h2>
            <p className="text-xs text-slate-400 mt-1">Tạo tài khoản mới bằng Email thực tế</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/8">
            <button
              type="button"
              onClick={() => setSelectedRole('ROLE_USER')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                selectedRole === 'ROLE_USER'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" /> Khách Du Lịch
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ROLE_VENDOR')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                selectedRole === 'ROLE_VENDOR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Store className="h-3.5 w-3.5" /> Nhà Cung Cấp
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email (Email thực để nhận OTP)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your email here"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                <span className={`text-[11px] font-semibold ${
                  password.length === 0 
                    ? 'text-slate-500' 
                    : password.length >= 8 
                    ? 'text-emerald-400' 
                    : 'text-rose-400'
                }`}>
                  {password.length === 0 
                    ? 'Tối thiểu 8 ký tự' 
                    : password.length >= 8 
                    ? '✓ Đạt chuẩn (≥ 8 ký tự)' 
                    : `Mới có ${password.length}/8 ký tự`}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập tối thiểu 8 ký tự"
                  className={`w-full rounded-xl border bg-white/[0.05] pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:bg-white/[0.08] focus:outline-none transition ${
                    password.length > 0 && password.length < 8
                      ? 'border-rose-500/50 focus:border-rose-400'
                      : 'border-white/10 focus:border-rose-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Xác nhận mật khẩu</label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[11px] font-semibold ${
                    confirmPassword === password ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {confirmPassword === password ? '✓ Mật khẩu khớp' : '✕ Chưa khớp'}
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu (tối thiểu 8 ký tự)"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:bg-white/[0.08] focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? 'Đang gửi mã OTP...' : 'Register'}
            </button>

            <div className="text-center pt-1">
              <Link to="/login" className="text-xs text-slate-400 hover:text-rose-400 transition">
                Đã có tài khoản? <span className="text-rose-400 underline font-semibold">Đăng nhập ngay</span>
              </Link>
            </div>
          </form>
        </>
      ) : (
        /* Step 2: Nhập Mã Xác Thực OTP (Countdown 60s) */
        <div className="space-y-4">
          <div className="text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-rose-500/15 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mb-2 shadow-[0_0_16px_rgba(244,63,94,0.2)]">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Xác thực Email</h2>
            <p className="text-xs text-slate-400 mt-1">
              Mã xác thực 6 chữ số đã được gửi tới email: <span className="font-bold text-rose-300">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400 border border-emerald-500/20 text-center">
              {successMsg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-center text-xs font-bold text-slate-300 mb-2">
                Nhập mã OTP 6 chữ số
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-bold tracking-[8px] rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-rose-400 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            {/* Countdown 60s Timer */}
            <div className="text-center text-xs font-semibold">
              {timer > 0 ? (
                <span className="text-slate-400">
                  Mã hết hạn sau: <span className="text-rose-400 font-bold text-sm">{timer}s</span>
                </span>
              ) : (
                <span className="text-rose-400">Mã OTP đã hết hạn! Vui lòng bấm gửi lại mã.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực & Kích hoạt'}
            </button>

            {/* Resend OTP Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-400 hover:text-white transition"
              >
                ← Đổi email khác
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || isResending}
                className={`flex items-center gap-1 font-bold transition ${
                  timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-rose-400 hover:underline'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
