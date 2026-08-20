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
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60 space-y-5">
      {/* Step 1: Form điền thông tin Đăng Ký */}
      {step === 'FORM' ? (
        <>
          {/* Title */}
          <div className="text-center pt-2">
            <h2 className="text-xl font-bold text-slate-800">Register For Free</h2>
            <p className="text-xs text-slate-400 mt-1">Tạo tài khoản mới bằng Email thực tế</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedRole('ROLE_USER')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                selectedRole === 'ROLE_USER' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" /> Khách Du Lịch
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ROLE_VENDOR')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                selectedRole === 'ROLE_VENDOR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="h-3.5 w-3.5" /> Nhà Cung Cấp
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email (Email thực để nhận OTP)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your email here"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your password"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu</label>
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
              disabled={isLoading}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Đang gửi mã OTP...' : 'Register'}
            </button>

            <div className="text-center pt-1">
              <Link to="/login" className="text-xs text-slate-400 hover:underline">
                Đã có tài khoản? Đăng nhập ngay
              </Link>
            </div>
          </form>
        </>
      ) : (
        /* Step 2: Nhập Mã Xác Thực OTP (Countdown 60s) */
        <div className="space-y-4">
          <div className="text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Xác thực Email</h2>
            <p className="text-xs text-slate-500 mt-1">
              Mã xác thực 6 chữ số đã được gửi tới email: <span className="font-bold text-slate-700">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-100 text-center">
              {successMsg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                Nhập mã OTP 6 chữ số
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-bold tracking-[8px] rounded-xl border border-slate-200 px-4 py-3 text-rose-600 focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            {/* Countdown 60s Timer */}
            <div className="text-center text-xs font-semibold">
              {timer > 0 ? (
                <span className="text-slate-500">
                  Mã hết hạn sau: <span className="text-rose-500 font-bold text-sm">{timer}s</span>
                </span>
              ) : (
                <span className="text-rose-600">Mã OTP đã hết hạn! Vui lòng bấm gửi lại mã.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực & Kích hoạt'}
            </button>

            {/* Resend OTP Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ← Đổi email khác
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
        </div>
      )}
    </div>
  );
};
