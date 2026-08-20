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
  ShieldCheck 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const isVendor = user?.roles?.includes('ROLE_VENDOR');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const navLinks = [
    { path: '/', label: 'TRANG CHỦ' },
    { path: '/about', label: 'GIỚI THIỆU' },
    { path: '/tours', label: 'TOUR' },
    { path: '/planner', label: 'LẬP KẾ HOẠCH' },
    { path: '/services', label: 'DỊCH VỤ' },
    { path: '/blogs', label: 'CẨM NANG DU LỊCH' },
    { path: '/contact', label: 'LIÊN HỆ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      
      {/* Top Header Bar matching Screenshot 1 & 3 */}
      <div className="bg-sky-950 text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-sky-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Phone className="h-3.5 w-3.5" /> 0941899554
            </span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-sky-400" /> 8H00 → 17H00
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-bold hover:text-sky-300 transition py-1 focus:outline-none"
                >
                  <div className="h-6 w-6 rounded-full bg-sky-800 text-sky-200 border border-sky-600 flex items-center justify-center text-[10px] font-black uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span>{user?.fullName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-sky-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Header info */}
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <div className="text-xs font-extrabold text-slate-900 truncate">{user?.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition"
                      >
                        <UserIcon className="h-4 w-4 text-sky-600" />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition"
                      >
                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                        <span>Lịch sử đặt tour</span>
                      </Link>

                      {isVendor && (
                        <Link
                          to="/vendor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition border-t border-slate-100 my-1 pt-2"
                        >
                          <Building2 className="h-4 w-4 text-amber-600" />
                          <span>Kênh Nhà Cung Cấp</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 transition border-t border-slate-100 my-1 pt-2"
                        >
                          <ShieldCheck className="h-4 w-4 text-purple-600" />
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
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition text-left"
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
                <Link to="/login" className="hover:text-sky-300 transition">Đăng nhập</Link>
                <span>|</span>
                <Link to="/register" className="hover:text-sky-300 transition">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-black text-sky-900 text-2xl tracking-tight flex-shrink-0">
          <div className="bg-sky-900 text-amber-400 p-2 rounded-xl">
            <Compass className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black text-sky-900">SMART TRAVEL</span>
            <span className="text-[9px] tracking-widest text-slate-400 font-bold">TRAVEL & ITINERARY</span>
          </div>
        </Link>

        {/* Navigation Menu Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-black tracking-wide">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`py-1 transition relative ${
                  isActive
                    ? 'text-sky-900 font-black border-b-2 border-sky-900'
                    : 'text-slate-700 hover:text-sky-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Bạn muốn tìm ..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/tours?keyword=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }
            }}
            className="bg-transparent focus:outline-none w-28 md:w-36 text-xs text-slate-800"
          />
        </div>

      </nav>
    </header>
  );
};
