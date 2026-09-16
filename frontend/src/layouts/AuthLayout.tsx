import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-sky-600 tracking-tight">
            <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-800">SmartTravel<span className="text-sky-500">.com</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-sky-600 transition">Trang chủ</Link>
            <Link to="/tours" className="hover:text-sky-600 transition">Tour du lịch</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition ${
                isLoginPage
                  ? 'border-sky-500 text-sky-600 bg-sky-50'
                  : 'border-sky-400 text-sky-600 hover:bg-sky-50'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-1.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Compact Centered Form Container */}
      <main className="flex-1 flex items-start justify-center px-4 py-10 bg-slate-50">
        <div className="w-full" style={{ maxWidth: '440px' }}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        © 2026 SmartTravel.com. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
};
