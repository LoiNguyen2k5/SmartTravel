import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Lock, 
  Unlock, 
  RefreshCw,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types/auth';
import { formatDate } from '../../utils/formatters';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal confirm lock/unlock
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    nextState: boolean;
  }>({ isOpen: false, user: null, nextState: false });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User, nextState: boolean) => {
    try {
      setActionLoadingId(user.id);
      const res = await adminService.toggleUserStatus(user.id, nextState);
      if (res.data) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: nextState } : u));
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
      setConfirmModal({ isOpen: false, user: null, nextState: false });
    }
  };

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const hasRole = (role: string) => user.roles?.some(r => typeof r === 'string' ? r.includes(role) : (r as any).name?.includes(role));

    let matchesRole = true;
    if (selectedRole === 'ROLE_VENDOR') matchesRole = hasRole('VENDOR');
    else if (selectedRole === 'ROLE_USER') matchesRole = hasRole('USER') && !hasRole('VENDOR') && !hasRole('ADMIN');
    else if (selectedRole === 'ROLE_ADMIN') matchesRole = hasRole('ADMIN');

    let matchesStatus = true;
    if (selectedStatus === 'ACTIVE') matchesStatus = user.enabled === true;
    else if (selectedStatus === 'BANNED') matchesStatus = user.enabled === false;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const countVendors = users.filter(u => u.roles?.some(r => typeof r === 'string' ? r.includes('VENDOR') : (r as any).name?.includes('VENDOR'))).length;
  const countCustomers = users.filter(u => u.roles?.some(r => typeof r === 'string' ? r.includes('USER') : (r as any).name?.includes('USER'))).length;
  const countBanned = users.filter(u => u.enabled === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-8 w-8 text-sky-600" />
            Quản Lý Tài Khoản Người Dùng & Đối Tác
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm soát danh sách tài khoản khách hàng, phê duyệt và khóa/mở khóa tài khoản vi phạm (Blacklist)
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setSelectedRole('ALL'); setSelectedStatus('ALL'); }}
          className={`cursor-pointer rounded-xl border p-4 transition ${selectedRole === 'ALL' && selectedStatus === 'ALL' ? 'border-sky-500 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Tài Khoản</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
        </div>

        <div 
          onClick={() => { setSelectedRole('ROLE_USER'); setSelectedStatus('ALL'); }}
          className={`cursor-pointer rounded-xl border p-4 transition ${selectedRole === 'ROLE_USER' ? 'border-sky-500 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách Hàng</div>
          <div className="text-2xl font-black text-sky-600 mt-1">{countCustomers}</div>
        </div>

        <div 
          onClick={() => { setSelectedRole('ROLE_VENDOR'); setSelectedStatus('ALL'); }}
          className={`cursor-pointer rounded-xl border p-4 transition ${selectedRole === 'ROLE_VENDOR' ? 'border-sky-500 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhà Cung Cấp (Vendor)</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{countVendors}</div>
        </div>

        <div 
          onClick={() => { setSelectedRole('ALL'); setSelectedStatus('BANNED'); }}
          className={`cursor-pointer rounded-xl border p-4 transition ${selectedStatus === 'BANNED' ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bị Khóa (Blacklist)</div>
          <div className="text-2xl font-black text-red-600 mt-1">{countBanned}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ROLE_USER">Khách hàng</option>
            <option value="ROLE_VENDOR">Vendor</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="BANNED">Đã bị khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
              <tr>
                <th className="py-3.5 px-4">Người Dùng</th>
                <th className="py-3.5 px-4">Liên Hệ</th>
                <th className="py-3.5 px-4">Vai Trò</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tham Gia</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isVendor = user.roles?.some(r => typeof r === 'string' ? r.includes('VENDOR') : (r as any).name?.includes('VENDOR'));
                  const isAdmin = user.roles?.some(r => typeof r === 'string' ? r.includes('ADMIN') : (r as any).name?.includes('ADMIN'));
                  const isLocked = user.enabled === false;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0 overflow-hidden border border-slate-200">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                            ) : (
                              user.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {user.fullName || 'Chưa đặt tên'}
                              {isAdmin && <ShieldCheck className="h-4 w-4 text-sky-600" />}
                              {isVendor && <Building2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {isAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                              Quản trị viên
                            </span>
                          ) : isVendor ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                              Vendor Đối tác
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              Khách hàng
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <Lock className="h-3 w-3" /> Đã khóa (Blacklist)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <UserCheck className="h-3 w-3" /> Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {user.createdAt ? formatDate(user.createdAt) : 'Gần đây'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isAdmin && (
                          <button
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              user,
                              nextState: isLocked ? true : false,
                            })}
                            disabled={actionLoadingId === user.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                              isLocked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {isLocked ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                Khóa tài khoản
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${confirmModal.nextState ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {confirmModal.nextState ? <Unlock className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {confirmModal.nextState ? 'Mở Khóa Tài Khoản?' : 'Khóa Tài Khoản (Blacklist)?'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tài khoản: <strong className="text-slate-800">{confirmModal.user.fullName} ({confirmModal.user.email})</strong>
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {confirmModal.nextState
                ? 'Người dùng này sẽ được phép đăng nhập lại và thực hiện các giao dịch trên hệ thống như bình thường.'
                : 'Tài khoản sau khi khóa sẽ bị chặn đăng nhập và ngừng tất cả các hoạt động trên hệ thống cho đến khi được Admin mở khóa lại.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, user: null, nextState: false })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleToggleStatus(confirmModal.user!, confirmModal.nextState)}
                disabled={actionLoadingId !== null}
                className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md transition active:scale-95 ${
                  confirmModal.nextState ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoadingId !== null ? 'Đang xử lý...' : confirmModal.nextState ? 'Xác Nhận Mở Khóa' : 'Xác Nhận Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
