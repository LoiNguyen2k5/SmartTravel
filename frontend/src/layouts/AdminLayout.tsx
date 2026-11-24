import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  CreditCard, 
  LogOut, 
  ArrowLeft,
  ShieldCheck,
  Ticket,
  Building2,
  MapPin
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { vendorApplicationService } from '../services/vendorApplicationService';

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingVendorCount, setPendingVendorCount] = React.useState<number>(0);

  React.useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await vendorApplicationService.getAllApplications('PENDING_REVIEW');
        if (res.data) {
          setPendingVendorCount(res.data.length);
        }
      } catch {
        // Ignore
      }
    };
    loadPending();
    window.addEventListener('smarttravel_vendor_apps_updated', loadPending);
    return () => window.removeEventListener('smarttravel_vendor_apps_updated', loadPending);
  }, []);

  const navItems = [
    { label: 'Tổng quan (Dashboard)', path: '/admin', icon: LayoutDashboard },
    { label: 'Kiểm duyệt Tour', path: '/admin/tours', icon: Compass },
    { label: 'Quản trị Địa danh', path: '/admin/destinations', icon: MapPin },
    { label: 'Duyệt Đối tác (Vendor)', path: '/admin/vendor-approvals', icon: Building2, badge: pendingVendorCount },
    { label: 'Giao dịch & Đối soát', path: '/admin/settlements', icon: CreditCard },
    { label: 'Quản lý Khuyến mãi', path: '/admin/vouchers', icon: Ticket },
    { label: 'Tài khoản & Phân quyền', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#FAF8F5] text-[#0F172A] overflow-hidden font-sans ocean-portal relative">
      {/* Deep Ocean Sidebar */}
      <aside className="w-64 bg-[#0B3B49] border-r border-[#082E3A] text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0 z-20">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8 px-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#0D9488] text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">SmartTravel</span>
              <span className="block text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest">Admin Portal</span>
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D95D39] text-white shadow-md'
                      : 'text-slate-200/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#5EEAD4]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="space-y-2.5 pt-4 border-t border-white/15">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0D9488] flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.fullName || 'Administrator'}</div>
              <div className="text-[11px] text-slate-300 truncate">{user?.email || 'admin@smarttravel.com'}</div>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Trang khách
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 bg-[#FAF8F5]">
        <Outlet />
      </main>
    </div>
  );
};
