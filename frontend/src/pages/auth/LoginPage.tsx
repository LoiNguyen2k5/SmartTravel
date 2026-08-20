import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getSavedAccounts, removeSavedAccount, saveAccount, SavedAccount } from '../../utils/savedAccounts';
import { Eye, EyeOff, ShieldCheck, Store, Trash2, User, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Dropdown danh sách tài khoản đã lưu
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Load danh sách tài khoản đã lưu khi component mount
  useEffect(() => {
    setSavedAccounts(getSavedAccounts());
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý submit Đăng nhập
  const handleLoginSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError('');

    const targetEmail = customEmail || email;
    const targetPassword = customPass || password;

    if (!targetEmail || !targetPassword) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      await login({ email: targetEmail, password: targetPassword });
      
      // Lưu lại tài khoản & mật khẩu khi đăng nhập thành công
      saveAccount(targetEmail, targetPassword);

      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        const roles: string[] = savedUser.roles || [];
        if (roles.includes('ROLE_ADMIN')) {
          navigate('/admin');
          return;
        }
        if (roles.includes('ROLE_VENDOR')) {
          navigate('/vendor');
          return;
        }
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    }
  };

  // Chọn 1 tài khoản từ dropdown gợi ý
  const handleSelectAccount = (acc: SavedAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setShowSavedDropdown(false);
  };

  // Xóa 1 tài khoản khỏi danh sách lưu
  const handleRemoveAccount = (e: React.MouseEvent, accEmail: string) => {
    e.stopPropagation();
    const updated = removeSavedAccount(accEmail);
    setSavedAccounts(updated);
  };

  // Test đăng nhập nhanh theo vai trò
  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setShowSavedDropdown(false);
    handleLoginSubmit(undefined, testEmail, testPass);
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60 space-y-6">
      {/* Title */}
      <div className="text-center pt-2">
        <h2 className="text-xl font-bold text-slate-800">Welcome Back, Log In</h2>
        <p className="text-xs text-slate-400 mt-1">Đăng nhập tài khoản Smart Travel</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100 text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleLoginSubmit(e)} className="space-y-4">
        {/* Textbox Email với Menu Gợi ý Tài khoản Đã Lưu */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
            <span>Email</span>
            {savedAccounts.length > 0 && (
              <span className="text-[11px] font-normal text-sky-600 cursor-pointer hover:underline" onClick={() => setShowSavedDropdown(!showSavedDropdown)}>
                💡 {showSavedDropdown ? 'Ẩn tài khoản đã lưu' : 'Hiện tài khoản đã lưu (' + savedAccounts.length + ')'}
              </span>
            )}
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setShowSavedDropdown(true)}
            placeholder="Enter Your email here"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-sky-400 focus:outline-none transition"
          />

          {/* Dropdown gợi ý tài khoản & mật khẩu (hiện ẩn) */}
          {showSavedDropdown && savedAccounts.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                <span>🔑 Tài khoản đã lưu (Click để điền)</span>
                <span>Mật khẩu</span>
              </div>

              {savedAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAccount(acc)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50/70 text-xs cursor-pointer group transition border border-transparent hover:border-sky-100"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-100 text-slate-600 group-hover:text-sky-600 transition">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800 truncate group-hover:text-sky-700">
                      {acc.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mật khẩu hiển thị dạng ẩn •••••••• */}
                    <span className="font-mono text-slate-400 group-hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] tracking-widest">
                      ••••••••
                    </span>
                    <button
                      type="button"
                      title="Xóa tài khoản đã lưu"
                      onClick={(e) => handleRemoveAccount(e, acc.email)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Textbox Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your password"
              className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-sky-400 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-300 hover:text-slate-500 transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#7caec0] hover:bg-[#6a9eb0] py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Đang xác thực...' : 'Login'}
        </button>

        <div className="flex items-center justify-between text-xs pt-1">
          <Link to="/forgot-password" className="text-slate-500 hover:text-rose-500 font-semibold hover:underline">
            Quên mật khẩu?
          </Link>
          <Link to="/register" className="text-slate-400 hover:underline">
            Đăng ký tài khoản
          </Link>
        </div>
      </form>

      {/* Quick Role Login */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Test nhanh theo vai trò
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@smarttravel.com', '123456')}
            className="flex items-center justify-center gap-1 p-2 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('vendor@smarttravel.com', '123456')}
            className="flex items-center justify-center gap-1 p-2 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition"
          >
            <Store className="h-3.5 w-3.5" /> Vendor
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('user@smarttravel.com', '123456')}
            className="flex items-center justify-center gap-1 p-2 rounded-lg border border-sky-100 bg-sky-50/50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold transition"
          >
            <UserCheck className="h-3.5 w-3.5" /> User
          </button>
        </div>
      </div>
    </div>
  );
};
