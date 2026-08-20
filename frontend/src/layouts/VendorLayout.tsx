import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  CalendarDays, 
  ShoppingBag, 
  Building2, 
  LogOut, 
  Globe, 
  QrCode,
  TrendingUp
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
    { label: 'Tổng quan & Thống kê', path: '/vendor', icon: LayoutDashboard, end: true },
    { label: 'Quản lý Tour', path: '/vendor/tours', icon: Compass },
    { label: 'Lịch khởi hành & Slot', path: '/vendor/schedules', icon: CalendarDays },
    { label: 'Đơn đặt & QR Check-in', path: '/vendor/bookings', icon: QrCode },
    { label: 'Hồ sơ đại lý & Ngân hàng', path: '/vendor/profile', icon: Building2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0 z-20">
        <div>
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-lg">
              V
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">SMARTTRAVEL</h2>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vendor Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
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
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName}
              className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Nhà Cung Cấp Tour'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
            <a
              href="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              <Globe className="h-3.5 w-3.5" /> Trang chủ
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-rose-950/60 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
