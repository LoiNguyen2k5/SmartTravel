import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  ShoppingBag, 
  CreditCard, 
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
    { label: 'Giao dịch & Đối soát', path: '/admin/settlements', icon: CreditCard },
    { label: 'Tài khoản & Vendor', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#020204] text-slate-100 overflow-hidden font-sans portal-dark relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#070c18] border-r border-white/10 text-white flex flex-col justify-between p-4 shadow-2xl flex-shrink-0 z-20">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div 
              className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white"
              style={{
                boxShadow: '0 0 20px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-bold text-sky-300 text-xs shadow-[0_0_10px_rgba(56,189,248,0.2)]">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.fullName || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@smarttravel.com'}</div>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Trang khách
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
