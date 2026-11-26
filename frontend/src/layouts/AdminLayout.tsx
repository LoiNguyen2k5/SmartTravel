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
  MapPin,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { vendorApplicationService } from '../services/vendorApplicationService';

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingVendorCount, setPendingVendorCount] = React.useState<number>(0);
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
    { label: 'Hồ sơ Cá nhân', path: '/admin/profile', icon: UserCircle },
  ];

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
          {/* Brand */}
          <div className="flex items-center justify-between gap-2 mb-6 lg:mb-8 px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0D9488] text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">SmartTravel</span>
                <span className="block text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest">Admin Portal</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Đóng menu quản trị"
            >
              <X className="h-5 w-5" />
            </button>
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
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D95D39] text-white shadow-md'
                      : 'text-slate-200/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#5EEAD4]'}`} />
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
        <div className="space-y-2.5 pt-4 mt-4 border-t border-white/15">
          <Link
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="p-2.5 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center gap-3"
            title="Chỉnh sửa hồ sơ Quản trị viên"
          >
            <div className="h-9 w-9 rounded-full bg-[#0D9488] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden border border-[#5EEAD4]/60">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.fullName || 'Admin'} className="h-full w-full object-cover" />
              ) : (
                (user?.fullName?.trim().charAt(0).toUpperCase() || 'AD')
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.fullName || 'Administrator'}</div>
              <div className="text-[11px] text-slate-300 truncate">{user?.email || 'admin@smarttravel.com'}</div>
            </div>
          </Link>

          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
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

      {/* Right Column: Mobile Top Bar + Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-[#0B3B49] text-white border-b border-[#082E3A] shadow-md shrink-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Mở menu quản trị"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="h-5 w-5 text-[#5EEAD4] shrink-0" />
              <div className="truncate">
                <span className="font-extrabold text-sm text-white block leading-tight">SmartTravel Admin</span>
                <span className="text-[10px] font-semibold text-[#5EEAD4] block truncate">
                  {navItems.find((i) => i.path === location.pathname)?.label || 'Admin Portal'}
                </span>
              </div>
            </div>
          </div>
          {pendingVendorCount > 0 && (
            <Link
              to="/admin/vendor-approvals"
              className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shrink-0"
            >
              {pendingVendorCount} duyệt
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10 bg-[#FAF8F5] min-w-0">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
