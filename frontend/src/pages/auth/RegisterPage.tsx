import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { OtpType } from '../../types/auth';
import { saveAccount } from '../../utils/savedAccounts';
import { Eye, EyeOff, MailCheck, RefreshCw } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
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
        roles: ['ROLE_USER'],
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
    <div className="rounded-3xl border border-[#E6E1DA] bg-white backdrop-blur-xl p-8 shadow-card space-y-5 text-[#0F172A]">
      {/* Step 1: Form điền thông tin Đăng Ký */}
      {step === 'FORM' ? (
        <>
          {/* Title */}
          <div className="text-center pt-2">
            <h2 className="text-xl font-bold text-[#0F172A]">Register For Free</h2>
            <p className="text-xs text-[#526071] mt-1">Tạo tài khoản mới bằng Email thực tế</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-[#D95D39] border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Email (Email thực để nhận OTP)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your email here"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#475569]">Password</label>
                <span className={`text-[11px] font-semibold ${
                  password.length === 0 
                    ? 'text-slate-500' 
                    : password.length >= 8 
                    ? 'text-emerald-700' 
                    : 'text-[#D95D39]'
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
                  className={`w-full rounded-xl border bg-[#FAF8F5] pl-4 pr-10 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:bg-[#F4F1EC] focus:outline-none transition ${
                    password.length > 0 && password.length < 8
                      ? 'border-rose-500/50 focus:border-rose-400'
                      : 'border-[#E6E1DA] focus:border-rose-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#526071] hover:text-[#0F172A] transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu (tối thiểu 8 ký tự)"
                className="w-full rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:border-rose-400 focus:bg-[#F4F1EC] focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? 'Đang gửi mã OTP...' : 'Register'}
            </button>

            <div className="text-center pt-2 border-t border-[#E6E1DA] space-y-1.5">
              <div>
                <Link to="/login" className="text-xs text-[#526071] hover:text-[#D95D39] transition">
                  Đã có tài khoản? <span className="text-[#D95D39] underline font-semibold">Đăng nhập ngay</span>
                </Link>
              </div>
              <p className="text-[11px] text-slate-500">
                Doanh nghiệp lữ hành? Đăng ký tài khoản và nộp hồ sơ tại mục{' '}
                <Link to="/become-vendor" className="text-[#0D9488] hover:underline font-medium">
                  Trở thành Đối tác
                </Link>.
              </p>
            </div>
          </form>
        </>
      ) : (
        /* Step 2: Nhập Mã Xác Thực OTP (Countdown 60s) */
        <div className="space-y-4">
          <div className="text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-rose-500/15 border border-rose-500/30 rounded-full flex items-center justify-center text-[#D95D39] mb-2 shadow-[0_0_16px_rgba(244,63,94,0.2)]">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Xác thực Email</h2>
            <p className="text-xs text-[#526071] mt-1">
              Mã xác thực 6 chữ số đã được gửi tới email: <span className="font-bold text-rose-700">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 border border-emerald-500/20 text-center">
              {successMsg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-[#D95D39] border border-rose-500/20 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-center text-xs font-bold text-[#475569] mb-2">
                Nhập mã OTP 6 chữ số
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-bold tracking-[8px] rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] px-4 py-3 text-[#D95D39] focus:border-rose-400 focus:outline-none transition"
              />
            </div>

            {/* Countdown 60s Timer */}
            <div className="text-center text-xs font-semibold">
              {timer > 0 ? (
                <span className="text-[#526071]">
                  Mã hết hạn sau: <span className="text-[#D95D39] font-bold text-sm">{timer}s</span>
                </span>
              ) : (
                <span className="text-[#D95D39]">Mã OTP đã hết hạn! Vui lòng bấm gửi lại mã.</span>
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
                className="text-[#526071] hover:text-[#0F172A] transition"
              >
                ← Đổi email khác
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || isResending}
                className={`flex items-center gap-1 font-bold transition ${
                  timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-[#D95D39] hover:underline'
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
