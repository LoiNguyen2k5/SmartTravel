import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  MapPin, 
  LogOut, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Tổng quan (Dashboard)', path: '/admin', icon: LayoutDashboard },
    { label: 'Kiểm duyệt Tour', path: '/admin/tours', icon: Compass },
    { label: 'Quản lý Đơn hàng', path: '/admin/bookings', icon: ShoppingBag },
    { label: 'Điểm đến & Danh mục', path: '/admin/destinations', icon: MapPin },
    { label: 'Giao dịch & Đối soát', path: '/admin/settlements', icon: CreditCard },
    { label: 'Tài khoản & Vendor', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">SmartTravel</span>
              <span className="block text-[11px] font-bold text-sky-400 uppercase tracking-widest">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="px-2 py-1 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-bold text-sky-400 text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.fullName || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@smarttravel.com'}</div>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Trang khách
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
