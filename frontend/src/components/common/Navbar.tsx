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
  Mail,
  Sparkles,
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
  const mobileNotifBtnRef = useRef<HTMLButtonElement>(null);
  const mobileNotifPanelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      const clickedDesktopNotif = notifDropdownRef.current?.contains(target) ?? false;
      const clickedMobileBtn = mobileNotifBtnRef.current?.contains(target) ?? false;
      const clickedMobilePanel = mobileNotifPanelRef.current?.contains(target) ?? false;
      if (!clickedDesktopNotif && !clickedMobileBtn && !clickedMobilePanel) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const isVendor = user?.roles?.includes('ROLE_VENDOR');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const navLabels: Record<string, string> = {
    '/': 'Trang chủ',
    '/about': 'Giới thiệu',
    '/tours': 'Tour du lịch',
    '/services': 'Dịch vụ',
    '/blogs': 'Cẩm nang',
    '/contact': 'Liên hệ',
  };

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div
        className={`border-b transition-all duration-300 bg-white/95 backdrop-blur-xl ${
          scrolled ? 'border-[#E6E1DA] shadow-[0_6px_24px_-8px_rgba(11,59,73,0.12)]' : 'border-[#E6E1DA]'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="bg-[#0B3B49] text-[#5EEAD4] p-2 rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-extrabold text-[#0B3B49] tracking-tight whitespace-nowrap">
                SMART TRAVEL
              </span>
              <span className="text-[9px] font-bold tracking-wider text-[#0D9488] uppercase mt-0.5 whitespace-nowrap">
                Khám phá thông minh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Merged Tour du lịch) */}
          <div className="hidden lg:flex items-center gap-0.5 text-[13px] font-semibold text-slate-600 flex-1 justify-center">
            {Object.entries(navLabels).map(([path, label]) => {
              const isActive = isNavActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`px-2.5 py-2 rounded-xl transition-all duration-150 relative whitespace-nowrap ${
                    isActive
                      ? 'text-[#0B3B49] font-extrabold'
                      : 'text-slate-600 hover:text-[#0B3B49] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2.5px] rounded-full bg-[#D95D39]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Contact Info & User Auth Section */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Hotline & Working Hours Group (Shown cleanly at xl/2xl to prevent iPad landscape / 1024px crowding) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              {/* Hotline Warm Gold Pill */}
              <a
                href="tel:0941899554"
                className="hidden 2xl:flex items-center gap-2 h-10 px-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] transition group whitespace-nowrap shrink-0"
              >
                <Phone className="h-3.5 w-3.5 text-[#D97706] flex-shrink-0" />
                <div className="flex flex-col justify-center leading-none gap-0.5">
                  <span className="text-[9px] font-extrabold text-[#B45309] uppercase tracking-wider whitespace-nowrap">
                    Hotline
                  </span>
                  <span className="text-xs font-extrabold text-[#D97706] tracking-wide whitespace-nowrap">
                    0941 899 554
                  </span>
                </div>
              </a>

              {/* Working Hours Soft Teal Pill */}
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#E6F4F1] border border-[#99F6E4] whitespace-nowrap shrink-0">
                <Clock className="h-3.5 w-3.5 text-[#0F5264] flex-shrink-0" />
                <div className="flex flex-col justify-center leading-none gap-0.5">
                  <span className="text-[9px] font-extrabold text-[#0F5264] uppercase tracking-wider whitespace-nowrap">
                    Giờ làm việc
                  </span>
                  <span className="text-xs font-extrabold text-[#0B3B49] tracking-wide whitespace-nowrap">
                    8:00 – 17:30
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Divider separating info pills from action buttons */}
            <div className="hidden xl:block h-7 w-px bg-[#E6E1DA] mx-1.5 shrink-0" />

            {/* Action Buttons Group (Bell + Profile / Login-Register) */}
            <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell (Always crisp Lucide Bell icon) */}
            {isAuthenticated && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setDropdownOpen(false);
                  }}
                  className="relative h-9 w-9 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#E6F4F1] hover:border-[#0D9488] text-slate-700 hover:text-[#0B3B49] transition flex items-center justify-center focus:outline-none cursor-pointer"
                  title="Thông báo & Tin nhắn CSKH"
                  aria-label="Thông báo"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN PANEL */}
                {notifDropdownOpen && (
                  <div className="fixed top-[4.5rem] left-3 right-3 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-96 rounded-2xl shadow-float border border-[#E6E1DA] bg-white py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 pb-3 border-b border-[#E6E1DA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#0D9488]" />
                        <span className="text-xs font-extrabold text-[#0B3B49] uppercase tracking-wider">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F4F1] text-[#0B3B49] border border-[#99F6E4]">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => notificationService.markAllAsRead(user?.email)}
                          className="text-[11px] text-slate-500 hover:text-[#0D9488] flex items-center gap-1 transition cursor-pointer font-semibold"
                        >
                          <CheckCheck className="h-3.5 w-3.5" /> Đọc tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
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
                            className={`px-4 py-3 hover:bg-[#FAF8F5] transition cursor-pointer flex items-start gap-3 group relative ${
                              !n.isRead ? 'bg-[#E6F4F1]/45' : ''
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                n.type === 'CSKH_REPLY'
                                  ? 'bg-[#E6F4F1] text-[#0D9488] border border-[#99F6E4]'
                                  : 'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}
                            >
                              {n.type === 'CSKH_REPLY' ? (
                                <Headphones className="h-4 w-4" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="text-xs font-bold text-[#0F172A] truncate">{n.title}</div>
                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.createdAt}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              {n.replyContent && (
                                <div className="mt-1.5 text-[10px] font-bold text-[#0D9488]">
                                  Bấm để xem phản hồi chi tiết →
                                </div>
                              )}
                            </div>

                            {!n.isRead && (
                              <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-[#D95D39]" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 px-4 border-t border-[#E6E1DA] text-center">
                      <span className="text-[10px] text-slate-500">
                        Phản hồi cũng được gửi đồng thời vào hòm thư email của bạn
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#99F6E4] bg-[#E6F4F1] hover:bg-[#CCF0E8] text-[#0B3B49] transition focus:outline-none cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <div className="h-7 w-7 rounded-full bg-[#0B3B49] text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.fullName || 'Avatar'} className="h-full w-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="max-w-[115px] truncate text-xs font-extrabold">{user?.fullName}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#0B3B49] transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-float border border-[#E6E1DA] bg-white py-2 text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-[#E6E1DA] bg-[#FAF8F5] rounded-t-2xl">
                      <div className="text-xs font-extrabold text-[#0B3B49] truncate">{user?.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</div>
                    </div>

                    <div className="py-1.5 space-y-0.5 px-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#E6F4F1] hover:text-[#0B3B49] transition"
                      >
                        <UserIcon className="h-4 w-4 text-[#0D9488]" />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#E6F4F1] hover:text-[#0B3B49] transition"
                      >
                        <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                        <span>Lịch sử đặt tour</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setNotifDropdownOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#E6F4F1] hover:text-[#0B3B49] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="h-4 w-4 text-[#0D9488]" />
                          <span>Thông báo của tôi</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {!isVendor && !isAdmin && (
                        <Link
                          to="/become-vendor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition border-t border-[#E6E1DA] mt-1 pt-2"
                        >
                          <Building2 className="h-4 w-4 text-amber-600" />
                          <span>Đăng ký làm Đại lý (Vendor)</span>
                        </Link>
                      )}

                      {isVendor && (
                        <Link
                          to="/vendor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition border-t border-[#E6E1DA] mt-1 pt-2"
                        >
                          <Building2 className="h-4 w-4 text-amber-600" />
                          <span>Kênh Nhà Cung Cấp</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0B3B49] hover:bg-[#E6F4F1] transition border-t border-[#E6E1DA] mt-1 pt-2"
                        >
                          <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                          <span>Trang Quản Trị Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#E6E1DA] px-1.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-600" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-[#0B3B49] text-[#0B3B49] bg-white hover:bg-[#E6F4F1] transition whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#D95D39] hover:bg-[#C24E2D] text-white transition shadow-sm whitespace-nowrap"
                >
                  Đăng ký
                </Link>
              </div>
            )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-[#FAF8F5] hover:text-[#0B3B49] transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Quick Actions (small screens < sm) */}
          <div className="sm:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button
                ref={mobileNotifBtnRef}
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setMobileMenuOpen(false);
                }}
                className="relative h-9 w-9 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-slate-700 hover:text-[#0B3B49] transition flex items-center justify-center"
                aria-label="Thông báo"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotifDropdownOpen(false);
              }}
              className="p-2 rounded-xl text-slate-600 hover:bg-[#FAF8F5] hover:text-[#0B3B49] transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Notification Panel (< sm) */}
        {isAuthenticated && notifDropdownOpen && (
          <div
            ref={mobileNotifPanelRef}
            className="sm:hidden fixed top-[4.5rem] left-3 right-3 rounded-2xl shadow-float border border-[#E6E1DA] bg-white py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="px-4 pb-3 border-b border-[#E6E1DA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#0D9488]" />
                <span className="text-xs font-extrabold text-[#0B3B49] uppercase tracking-wider">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F4F1] text-[#0B3B49] border border-[#99F6E4]">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={() => notificationService.markAllAsRead(user?.email)}
                    className="text-[11px] text-slate-500 hover:text-[#0D9488] flex items-center gap-1 transition cursor-pointer font-semibold"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setNotifDropdownOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Bạn chưa có thông báo nào
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      notificationService.markAsRead(n.id, user?.email);
                      setSelectedNotif(n);
                      setNotifDropdownOpen(false);
                    }}
                    className={`px-4 py-3 hover:bg-[#FAF8F5] transition cursor-pointer flex items-start gap-3 relative ${
                      !n.isRead ? 'bg-[#E6F4F1]/45' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.type === 'CSKH_REPLY'
                          ? 'bg-[#E6F4F1] text-[#0D9488] border border-[#99F6E4]'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {n.type === 'CSKH_REPLY' ? (
                        <Headphones className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="text-xs font-bold text-[#0F172A] truncate">{n.title}</div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-[#D95D39]" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E6E1DA] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg max-h-[calc(100dvh-4.25rem)] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
            <div className="p-3 mb-2 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA]">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#0B3B49] text-white flex items-center justify-center text-sm font-bold uppercase overflow-hidden shrink-0">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user?.fullName || 'Avatar'} className="h-full w-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#0F172A]">{user?.fullName}</span>
                      <span className="text-[11px] text-slate-500">{user?.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E1DA]">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E1DA] text-xs font-semibold text-slate-700 text-center hover:border-[#0D9488]"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E1DA] text-xs font-semibold text-slate-700 text-center hover:border-[#0D9488]"
                    >
                      Đơn đặt
                    </Link>
                  </div>
                  {isVendor && (
                    <Link
                      to="/vendor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 text-center"
                    >
                      Kênh Nhà Cung Cấp
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-xl bg-[#E6F4F1] border border-[#99F6E4] text-xs font-semibold text-[#0B3B49] text-center"
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
                    className="w-full px-3 py-1.5 rounded-xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-[#0B3B49] bg-white border border-[#0B3B49]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-white bg-[#D95D39]"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {Object.entries(navLabels).map(([path, label]) => {
              const isActive = isNavActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#E6F4F1] text-[#0B3B49] font-extrabold border-l-4 border-[#D95D39]'
                      : 'text-slate-600 hover:bg-[#FAF8F5] hover:text-[#0B3B49]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[#E6E1DA] flex items-center justify-between text-xs px-2 text-slate-600">
              <a href="tel:0941899554" className="flex items-center gap-1.5 text-[#D97706] font-bold">
                <Phone className="h-3.5 w-3.5" /> 0941 899 554
              </a>
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Clock className="h-3.5 w-3.5" /> 8:00 – 17:30
              </span>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION DETAIL MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-float text-slate-800 relative">
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
              <div className="flex items-center gap-2.5 text-[#0B3B49] font-extrabold text-sm sm:text-base">
                <div
                  className={`p-1.5 rounded-lg border ${
                    selectedNotif.type === 'CSKH_REPLY'
                      ? 'bg-[#E6F4F1] border-[#99F6E4] text-[#0D9488]'
                      : 'bg-amber-50 border-amber-200 text-amber-600'
                  }`}
                >
                  {selectedNotif.type === 'CSKH_REPLY' ? (
                    <Headphones className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <span>
                  {selectedNotif.type === 'CSKH_REPLY' ? 'Phản hồi từ Bộ phận CSKH' : 'Thông báo từ Smart Travel'}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition font-bold cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A] mb-1">{selectedNotif.title}</h3>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{selectedNotif.createdAt}</span>
                  <span>•</span>
                  <span className="text-[#0D9488] font-bold">{selectedNotif.sender || 'Smart Travel'}</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E6E1DA] p-4 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                {selectedNotif.replyContent || selectedNotif.message}
              </div>

              {selectedNotif.type === 'CSKH_REPLY' && (
                <div className="rounded-xl bg-[#E6F4F1] border border-[#99F6E4] p-3 text-[11px] text-[#0B3B49] flex items-start gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-[#0D9488]" />
                  <div>
                    Hệ thống cũng đã gửi một bản sao phản hồi đầy đủ tới hòm thư email của bạn. Vui lòng kiểm tra hộp thư đến (Inbox) hoặc mục Spam!
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href="tel:0941899554"
                className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5" /> Gọi Hotline
              </a>
              <button
                onClick={() => setSelectedNotif(null)}
                className="rounded-xl bg-[#0B3B49] hover:bg-[#0F5264] text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer"
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
