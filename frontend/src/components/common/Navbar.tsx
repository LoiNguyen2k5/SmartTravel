import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  LogOut, 
  User as UserIcon, 
  Phone, 
  Clock, 
  Search, 
  ChevronDown, 
  CalendarDays, 
  Building2, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isVendor = user?.roles?.includes('ROLE_VENDOR');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/about', label: 'Giới thiệu' },
    { path: '/tours', label: 'Tour du lịch' },
    { path: '/services', label: 'Dịch vụ' },
    { path: '/blogs', label: 'Cẩm nang' },
    { path: '/contact', label: 'Liên hệ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      
      {/* 1. Top Announcement & Support Bar */}
      <div className="bg-primary-950 text-white text-[11px] font-medium py-2 px-4 sm:px-6 lg:px-8 border-b border-primary-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a 
              href="tel:0941899554" 
              className="flex items-center gap-1.5 font-bold text-accent-400 hover:text-accent-300 transition"
            >
              <Phone className="h-3.5 w-3.5" /> 0941 899 554
            </a>
            <span className="hidden sm:flex items-center gap-1 text-slate-300/80">
              <Clock className="h-3.5 w-3.5 text-primary-300" /> 8:00 — 17:30 (Thứ 2 - Thứ 7)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-semibold hover:text-primary-200 transition py-0.5 focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="h-6 w-6 rounded-full bg-primary-800 text-primary-100 border border-primary-600 flex items-center justify-center text-[10px] font-bold uppercase shadow-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{user?.fullName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-primary-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-slate-200/80 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Header info */}
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
                      <div className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-primary-50/80 hover:text-primary-900 transition"
                      >
                        <UserIcon className="h-4 w-4 text-primary-600" />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-primary-50/80 hover:text-primary-900 transition"
                      >
                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                        <span>Lịch sử đặt tour</span>
                      </Link>

                      {isVendor && (
                        <Link
                          to="/vendor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-accent-700 hover:bg-accent-50 transition border-t border-slate-100 my-1 pt-2"
                        >
                          <Building2 className="h-4 w-4 text-accent-600" />
                          <span>Kênh Nhà Cung Cấp</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition border-t border-slate-100 my-1 pt-2"
                        >
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                          <span>Trang Quản Trị Admin</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="h-4 w-4 text-rose-600" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 font-semibold">
                <Link to="/login" className="hover:text-primary-200 transition">Đăng nhập</Link>
                <span className="text-slate-500">|</span>
                <Link to="/register" className="hover:text-primary-200 transition">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar with Glassmorphic Backdrop */}
      <div className="glass-surface border-b border-slate-200/80 shadow-subtle">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-accent-400 p-2.5 rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold text-primary-950 tracking-tight leading-none group-hover:text-primary-700 transition-colors">
                SMART TRAVEL
              </span>
              <span className="text-[10px] tracking-wider text-slate-500 font-semibold mt-0.5 uppercase">
                Khám phá thông minh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-slate-700">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 relative ${
                    isActive
                      ? 'text-primary-900 font-bold bg-primary-50/80 shadow-sm'
                      : 'hover:text-primary-700 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 hover:bg-white focus-within:bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 px-3.5 py-2 rounded-full border border-slate-200 text-xs transition-all duration-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tour, địa danh..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/tours?keyword=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  }
                }}
                className="bg-transparent focus:outline-none w-28 md:w-40 text-xs text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-3 duration-200">
            <div className="sm:hidden mb-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyến đi..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMobileMenuOpen(false);
                      navigate(`/tours?keyword=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                    }
                  }}
                  className="bg-transparent focus:outline-none w-full text-xs text-slate-800"
                />
              </div>
            </div>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-900 font-bold border-l-4 border-primary-600'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </header>
  );
};
