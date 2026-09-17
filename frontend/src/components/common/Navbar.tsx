import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  LogOut, 
  User as UserIcon, 
  Phone, 
  Clock, 
  ChevronDown, 
  CalendarDays, 
  Building2, 
  ShieldCheck,
  Menu,
  X,
  Bell,
  Headphones,
  CheckCheck,
  Trash2,
  Mail,
  Sparkles
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { notificationService, NotificationItem } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = () => {
    const list = notificationService.getNotifications(user?.email);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('smarttravel_notification_updated', handleUpdate);
    return () => window.removeEventListener('smarttravel_notification_updated', handleUpdate);
  }, [user?.email]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isVendor = user?.roles?.includes('ROLE_VENDOR');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const navLinks = [
    { path: '/', label: 'Trang chu' },
    { path: '/about', label: 'Gioi thieu' },
    { path: '/tours', label: 'Tour du lich' },
    { path: '/services', label: 'Dich vu' },
    { path: '/blogs', label: 'Cam nang' },
    { path: '/contact', label: 'Lien he' },
  ];

  const navLabels: Record<string, string> = {
    '/': 'Trang chủ',
    '/about': 'Giới thiệu',
    '/tours': 'Tour du lịch',
    '/services': 'Dịch vụ',
    '/contact': 'Liên hệ',
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      

      {/* 2. Main Navigation Bar */}
      <div
        className="border-b transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(2,2,8,0.94)' : 'rgba(4,6,14,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: scrolled ? 'rgba(56,189,248,0.10)' : 'rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(56,189,248,0.06)' : 'none',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className="text-cyan-300 p-2.5 rounded-2xl group-hover:scale-105 transition-transform duration-200"
              style={{
                background: 'linear-gradient(135deg, #0a2a37 0%, #04465a 100%)',
                boxShadow: '0 0 16px rgba(34,211,238,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Compass className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-display text-xl font-extrabold text-white tracking-tight leading-none group-hover:text-cyan-200 transition-colors"
                style={{ textShadow: '0 0 20px rgba(34,211,238,0.15)' }}
              >
                SMART TRAVEL
              </span>
              <span className="text-[10px] tracking-wider text-sky-400/70 font-semibold mt-0.5 uppercase">
                Khám phá thông minh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-0.5 text-[13px] font-semibold text-slate-400">
            {Object.entries(navLabels).map(([path, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 relative ${
                    isActive ? 'text-white font-bold' : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.9) 50%, rgba(34,211,238,0) 100%)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Contact Info & User Auth Section */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Phone */}
            <a
              href="tel:0941899554"
              className="hidden xl:flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/25 transition">
                <Phone className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hotline</span>
                <span className="text-xs font-extrabold text-amber-400 group-hover:text-amber-300 transition tracking-wide">0941 899 554</span>
              </div>
            </a>

            {/* Divider */}
            <div className="hidden xl:block w-px h-7 bg-white/10" />

            {/* Hours */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-sky-400" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Giờ làm việc</span>
                <span className="text-xs font-extrabold text-sky-300 tracking-wide">8:00 — 17:30</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-7 bg-white/10" />

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                
                {/* NOTIFICATION BELL */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition focus:outline-none cursor-pointer"
                    title="Thông báo & Tin nhắn CSKH"
                    aria-label="Thông báo"
                  >
                    <Bell className="h-4 w-4 text-cyan-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION DROPDOWN PANEL */}
                  {notifDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/12 py-3 text-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      style={{ background: 'rgba(10,17,29,0.98)', backdropFilter: 'blur(25px)' }}
                    >
                      {/* Header */}
                      <div className="px-4 pb-3 border-b border-white/8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => notificationService.markAllAsRead(user?.email)}
                            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                          >
                            <CheckCheck className="h-3 w-3" /> Đọc tất cả
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-white/5 py-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            Bạn chưa có thông báo nào
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                notificationService.markAsRead(n.id, user?.email);
                                setSelectedNotif(n);
                              }}
                              className={`px-4 py-3 hover:bg-white/[0.04] transition cursor-pointer flex items-start gap-3 group relative ${
                                !n.isRead ? 'bg-sky-500/[0.06]' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                n.type === 'CSKH_REPLY' 
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}>
                                {n.type === 'CSKH_REPLY' ? (
                                  <Headphones className="h-4 w-4" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="text-xs font-bold text-white truncate">{n.title}</div>
                                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">{n.createdAt}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                                {n.replyContent && (
                                  <div className="mt-1.5 text-[10px] font-semibold text-sky-400 flex items-center gap-1">
                                    <span>👉 Bấm để xem phản hồi chi tiết</span>
                                  </div>
                                )}
                              </div>

                              {/* Unread indicator dot */}
                              {!n.isRead && (
                                <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer notice */}
                      <div className="pt-2 px-4 border-t border-white/8 text-center">
                        <span className="text-[10px] text-slate-500">
                          Phản hồi cũng được gửi đồng thời vào hòm thư email của bạn
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white transition focus:outline-none cursor-pointer"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[110px] truncate text-xs font-bold">{user?.fullName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-sky-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-white/10 py-2 text-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      style={{ background: 'rgba(10,17,29,0.98)', backdropFilter: 'blur(20px)' }}
                    >
                      {/* Header info */}
                      <div className="px-4 py-3 border-b border-white/8 bg-white/[0.03] rounded-t-2xl">
                        <div className="text-xs font-bold text-white truncate">{user?.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5 space-y-0.5 px-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-sky-500/10 hover:text-sky-300 transition"
                        >
                          <UserIcon className="h-4 w-4 text-sky-400" />
                          <span>Thông tin cá nhân</span>
                        </Link>

                        <Link
                          to="/my-bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition"
                        >
                          <CalendarDays className="h-4 w-4 text-emerald-400" />
                          <span>Lịch sử đặt tour</span>
                        </Link>

                        {/* Notification item in User Menu */}
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setNotifDropdownOpen(true);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="h-4 w-4 text-cyan-400" />
                            <span>Thông báo của tôi</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                              {unreadCount}
                            </span>
                          )}
                        </button>

                        {isVendor && (
                          <Link
                            to="/vendor"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition border-t border-white/8 mt-1 pt-2"
                          >
                            <Building2 className="h-4 w-4 text-amber-400" />
                            <span>Kênh Nhà Cung Cấp</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-violet-300 hover:bg-violet-500/10 transition border-t border-white/8 mt-1 pt-2"
                          >
                            <ShieldCheck className="h-4 w-4 text-violet-400" />
                            <span>Trang Quản Trị Admin</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="pt-1.5 border-t border-white/8 px-1.5">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-400" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
                >
                  Đăng nhập
                </Link>
                <span className="text-white/20">|</span>
                <Link 
                  to="/register" 
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-white/8 hover:text-white transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Hamburger only (small screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-slate-400 hover:bg-white/8 hover:text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t border-white/8 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3 duration-200"
            style={{ background: 'rgba(4,6,14,0.98)', backdropFilter: 'blur(20px)' }}
          >
            {/* User status in mobile drawer */}
            <div className="p-3 mb-2 rounded-2xl bg-white/[0.04] border border-white/8">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold uppercase shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{user?.fullName}</span>
                      <span className="text-[11px] text-slate-400">{user?.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/8">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-slate-300 text-center hover:bg-sky-500/15 hover:text-sky-300 transition"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-slate-300 text-center hover:bg-emerald-500/15 hover:text-emerald-300 transition"
                    >
                      Đơn đặt
                    </Link>
                  </div>
                  {isVendor && (
                    <Link
                      to="/vendor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-xl bg-amber-500/10 text-xs font-semibold text-amber-300 text-center hover:bg-amber-500/20 transition"
                    >
                      Kênh Nhà Cung Cấp
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-xl bg-violet-500/10 text-xs font-semibold text-violet-300 text-center hover:bg-violet-500/20 transition"
                    >
                      Trang Quản Trị Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-rose-500/10 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Nav links */}
            {Object.entries(navLabels).map(([path, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-sky-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Hotline on mobile */}
            <div className="pt-3 border-t border-white/8 flex items-center justify-between text-xs px-2 text-slate-400">
              <a href="tel:0941899554" className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Phone className="h-3.5 w-3.5" /> 0941 899 554
              </a>
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Clock className="h-3.5 w-3.5" /> 8:00 — 17:30
              </span>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION DETAIL MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a111d] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-[0_24px_70px_rgba(0,0,0,0.9)] text-white relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm sm:text-base">
                <div className={`p-1.5 rounded-lg border ${
                  selectedNotif.type === 'CSKH_REPLY' 
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' 
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}>
                  {selectedNotif.type === 'CSKH_REPLY' ? (
                    <Headphones className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <span>{selectedNotif.type === 'CSKH_REPLY' ? 'Phản hồi từ Bộ phận CSKH' : 'Thông báo từ Smart Travel'}</span>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">{selectedNotif.title}</h3>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{selectedNotif.createdAt}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">{selectedNotif.sender || 'Smart Travel'}</span>
                </div>
              </div>

              <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
                {selectedNotif.replyContent || selectedNotif.message}
              </div>

              {selectedNotif.type === 'CSKH_REPLY' && (
                <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-[11px] text-sky-300 flex items-start gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-sky-400" />
                  <div>
                    Hệ thống cũng đã gửi một bản sao phản hồi đầy đủ tới hòm thư email của bạn. Vui lòng kiểm tra hộp thư đến (Inbox) hoặc mục Spam!
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a 
                href="tel:0941899554"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5" /> Gọi Hotline
              </a>
              <button
                onClick={() => setSelectedNotif(null)}
                className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
