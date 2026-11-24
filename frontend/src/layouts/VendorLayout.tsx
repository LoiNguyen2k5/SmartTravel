import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  CalendarDays, 
  Building2, 
  LogOut, 
  Globe, 
  QrCode,
  Stamp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VendorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="flex h-screen bg-[#FAF8F5] text-[#0F172A] overflow-hidden font-sans ocean-portal relative">
      {/* Deep Ocean Sidebar */}
      <aside className="w-64 bg-[#0B3B49] border-r border-[#082E3A] text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0 z-20">
        <div>
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/15 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#0D9488] flex items-center justify-center font-black text-white text-xl shadow-md">
              V
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">SMARTTRAVEL</h2>
              <span className="text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest">Vendor Portal</span>
            </div>
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
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D95D39] text-white shadow-md'
                        : 'text-slate-200/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="border-t border-white/15 pt-4 space-y-3">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName}
              className="h-9 w-9 rounded-full object-cover border-2 border-[#5EEAD4]"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Nhà Cung Cấp Tour'}</p>
              <p className="text-[10px] text-slate-300 truncate">{user?.email}</p>
            </div>
          </div>

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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 bg-[#FAF8F5]">
        <Outlet />
      </main>
    </div>
  );
};
