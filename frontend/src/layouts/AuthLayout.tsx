import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#020204] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header 
        className="w-full border-b border-white/8 px-6 sm:px-8 py-4 sticky top-0 z-30 transition-all duration-300"
        style={{
          background: 'rgba(4,6,14,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div 
              className="text-cyan-300 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200"
              style={{
                background: 'linear-gradient(135deg, #0a2a37 0%, #04465a 100%)',
                boxShadow: '0 0 14px rgba(34,211,238,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-lg tracking-tight leading-none group-hover:text-cyan-200 transition-colors">
                SMART TRAVEL
              </span>
              <span className="text-[9px] tracking-wider text-sky-400/70 font-semibold mt-0.5 uppercase">
                Khám phá thông minh
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <Link to="/tours" className="hover:text-white transition">Tour du lịch</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className={`px-5 py-1.5 rounded-full text-xs font-bold border transition ${
                isLoginPage
                  ? 'border-sky-400 text-sky-300 bg-sky-500/15 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'border-white/15 text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className={`px-5 py-1.5 rounded-full text-xs font-bold border transition ${
                !isLoginPage
                  ? 'border-rose-400 text-rose-300 bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.25)] hover:brightness-110'
              }`}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Compact Centered Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full" style={{ maxWidth: '440px' }}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-white/8 bg-[#020204]/90 relative z-10">
        © 2026 SmartTravel.com. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
};
