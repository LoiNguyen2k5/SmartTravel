import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  CalendarDays, 
  Building2, 
  LogOut, 
  Globe, 
  QrCode,
  Stamp,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VendorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Tổng Quan & Thống Kê', path: '/vendor', icon: LayoutDashboard, end: true },
    { label: 'Quản Lý Tour', path: '/vendor/tours', icon: Compass },
    { label: 'Lịch Khởi Hành & Slot', path: '/vendor/schedules', icon: CalendarDays },
    { label: 'Đơn Đặt & QR Check-in', path: '/vendor/bookings', icon: QrCode },
    { label: 'Thủ Tục Visa', path: '/vendor/visas', icon: Stamp },
    { label: 'Hồ Sơ Đại Lý & Ngân Hàng', path: '/vendor/profile', icon: Building2 },
  ];

  const currentNavLabel =
    navItems.find((item) =>
      item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
    )?.label || 'Vendor Portal';

  return (
    <div className="flex h-screen supports-[height:100dvh]:h-dvh bg-[#FAF8F5] text-[#0F172A] overflow-hidden font-sans ocean-portal relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Deep Ocean Sidebar (Slide-over drawer on mobile/tablet, static on lg+) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-[#0B3B49] border-r border-[#082E3A] text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0 overflow-y-auto transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Portal Name */}
          <div className="flex items-center justify-between gap-2 px-2 py-3 border-b border-white/15 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0D9488] flex items-center justify-center font-black text-white text-xl shadow-md shrink-0">
                V
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-wide">SMARTTRAVEL</h2>
                <span className="text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest">Vendor Portal</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Đóng menu đại lý"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D95D39] text-white shadow-md'
                        : 'text-slate-200/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="border-t border-white/15 pt-4 mt-4 space-y-3">
          <NavLink
            to="/vendor/profile"
            onClick={() => setSidebarOpen(false)}
            className="p-2.5 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center gap-3"
            title="Chỉnh sửa hồ sơ Đại lý & Ảnh đại diện"
          >
            <div className="h-9 w-9 rounded-full bg-[#0D9488] flex items-center justify-center font-bold text-white text-xs overflow-hidden border-2 border-[#5EEAD4] shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || 'Vendor'}
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.fullName?.trim().charAt(0).toUpperCase() || 'V')
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Nhà Cung Cấp Tour'}</p>
              <p className="text-[10px] text-slate-300 truncate">{user?.email}</p>
            </div>
          </NavLink>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200 hover:text-white hover:bg-white/15 transition"
            >
              <Globe className="h-3.5 w-3.5" /> Trang chủ
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-[11px] font-bold text-rose-200 hover:bg-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Right Column: Mobile Top Bar + Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-[#0B3B49] text-white border-b border-[#082E3A] shadow-md shrink-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Mở menu đại lý"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[#0D9488] flex items-center justify-center font-black text-white text-xs shrink-0">
                V
              </div>
              <div className="truncate">
                <span className="font-extrabold text-sm text-white block leading-tight">Vendor Portal</span>
                <span className="text-[10px] font-semibold text-[#5EEAD4] block truncate">{currentNavLabel}</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10 bg-[#FAF8F5] min-w-0">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
