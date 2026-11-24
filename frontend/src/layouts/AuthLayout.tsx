import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] flex flex-col font-sans relative overflow-hidden">
      {/* Subtle Warm Ocean Ambient Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[260px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full border-b border-[#E6E1DA] bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3 sm:py-3.5 sticky top-0 z-30 shadow-subtle">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
            <div className="bg-[#0B3B49] text-[#5EEAD4] p-1.5 sm:p-2 rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#0B3B49] text-base sm:text-lg tracking-tight leading-none">
                SMART TRAVEL
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-wider text-[#0D9488] font-bold mt-0.5 uppercase">
                Khám phá thông minh
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-[#0B3B49] transition">Trang chủ</Link>
            <Link to="/tours" className="hover:text-[#0B3B49] transition">Tour du lịch</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              to="/login"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                isLoginPage
                  ? 'border-[#0B3B49] text-[#0B3B49] bg-[#E6F4F1]'
                  : 'border-[#CBD5E1] text-slate-700 hover:border-[#0B3B49] hover:text-[#0B3B49] bg-white'
              }`}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap ${
                !isLoginPage
                  ? 'bg-[#C24E2D] text-white'
                  : 'bg-[#D95D39] hover:bg-[#C24E2D] text-white'
              }`}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full" style={{ maxWidth: '460px' }}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-[#E6E1DA] bg-white relative z-10">
        © 2026 SmartTravel.com · Hotline: 0941 899 554 · Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
};
