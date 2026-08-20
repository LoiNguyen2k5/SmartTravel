import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, ShoppingBag, LogOut, ArrowLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="font-extrabold text-xl text-sky-400">Admin Portal</span>
          </div>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              <LayoutDashboard className="h-5 w-5 text-sky-400" /> Dashboard
            </Link>
            <Link to="/admin/tours" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              <Compass className="h-5 w-5 text-sky-400" /> Quản lý Tour
            </Link>
            <Link to="/admin/bookings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              <ShoppingBag className="h-5 w-5 text-sky-400" /> Quản lý Booking
            </Link>
            <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              <Users className="h-5 w-5 text-sky-400" /> Quản lý User
            </Link>
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> Quay lại Trang khách
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
