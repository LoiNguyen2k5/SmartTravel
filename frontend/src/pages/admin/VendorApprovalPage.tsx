import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Globe, 
  X,
  Send,
  RotateCcw,
  UserX
} from 'lucide-react';
import { vendorApplicationService } from '../../services/vendorApplicationService';
import { VendorApplicationResponse, VendorApplicationStatus } from '../../types/vendorApplication';
import { formatDate } from '../../utils/formatters';

export const VendorApprovalPage: React.FC = () => {
  const [applications, setApplications] = useState<VendorApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Detail State
  const [selectedApp, setSelectedApp] = useState<VendorApplicationResponse | null>(null);

  // Zoom Image Lightbox State
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Approval / Rejection Action State
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await vendorApplicationService.getAllApplications();
      if (res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    const handleUpdate = () => fetchApplications();
    window.addEventListener('smarttravel_vendor_apps_updated', handleUpdate);
    return () => window.removeEventListener('smarttravel_vendor_apps_updated', handleUpdate);
  }, []);

  // Filtered List
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.taxCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.representativeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.hotline?.includes(searchTerm);

    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Counters
  const countPending = applications.filter(a => a.status === 'PENDING_REVIEW').length;
  const countApproved = applications.filter(a => a.status === 'APPROVED').length;
  const countRejected = applications.filter(a => a.status === 'REJECTED').length;

  // Handle Approve
  const handleApprove = async (app: VendorApplicationResponse) => {
    if (!window.confirm(`Xác nhận PHÊ DUYỆT hồ sơ cho "${app.businessName}"?\n\nHệ thống sẽ tự động cấp quyền ROLE_VENDOR cho tài khoản [${app.userEmail}] và gửi email thông báo kích hoạt.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await vendorApplicationService.reviewApplication(app.id, {
        status: 'APPROVED',
      });
      if (res.data) {
        setApplications(prev => prev.map(a => a.id === app.id ? res.data : a));
        setSelectedApp(res.data);
        setActionSuccessMsg(`Đã phê duyệt thành công hồ sơ của "${app.businessName}". Quyền ROLE_VENDOR đã được cấp!`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể phê duyệt hồ sơ. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để gửi thông báo hướng dẫn đối tác.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await vendorApplicationService.reviewApplication(selectedApp.id, {
        status: 'REJECTED',
        reason: rejectionReason.trim(),
      });
      if (res.data) {
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? res.data : a));
        setSelectedApp(res.data);
        setShowRejectModal(false);
        setRejectionReason('');
        setActionSuccessMsg(`Đã từ chối hồ sơ #${selectedApp.id} và gửi email thông báo lý do tới đối tác.`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể từ chối hồ sơ. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Revoke Vendor Role
  const handleRevoke = async (app: VendorApplicationResponse) => {
    if (!window.confirm(`Xác nhận THU HỒI QUYỀN VENDOR của đối tác "${app.businessName}"?\n\nTài khoản [${app.userEmail}] sẽ bị tước bỏ quyền ROLE_VENDOR và trở về thành tài khoản Khách hàng thường.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await vendorApplicationService.revokeVendor(app.id);
      if (res.data) {
        setApplications(prev => prev.map(a => a.id === app.id ? res.data : a));
        setSelectedApp(res.data);
        setActionSuccessMsg(`Đã thu hồi quyền Vendor của "${app.businessName}". Tài khoản đã trở về Khách hàng thường!`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể thu hồi quyền. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: VendorApplicationStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 animate-pulse text-amber-400" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Đã phê duyệt</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Từ chối</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <UserX className="w-3 h-3 text-purple-400" />
            <span>Đã thu hồi quyền</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Phê Duyệt Hồ Sơ Đối Tác (Vendor Approvals)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Thẩm định giấy phép kinh doanh lữ hành, CCCD người đại diện và cấp quyền ROLE_VENDOR tự động
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300 border border-white/10 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.15)]'
              : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số hồ sơ</div>
          <div className="text-2xl font-black text-white mt-1.5">{applications.length}</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('PENDING_REVIEW')}
          className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
            selectedStatus === 'PENDING_REVIEW'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>Chờ thẩm định</span>
            {countPending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1.5">{countPending}</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('APPROVED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatus === 'APPROVED'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Đã phê duyệt</div>
          <div className="text-2xl font-black text-emerald-300 mt-1.5">{countApproved}</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('REJECTED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatus === 'REJECTED'
              ? 'bg-rose-500/15 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Đã từ chối</div>
          <div className="text-2xl font-black text-rose-300 mt-1.5">{countRejected}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên cty, MST, email, người đại diện..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'Tất cả', val: 'ALL' },
            { label: `Chờ duyệt (${countPending})`, val: 'PENDING_REVIEW' },
            { label: 'Đã duyệt', val: 'APPROVED' },
            { label: 'Từ chối', val: 'REJECTED' },
            { label: 'Đã thu hồi', val: 'REVOKED' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setSelectedStatus(tab.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedStatus === tab.val
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="rounded-2xl border border-white/10 bg-[#070c18] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Doanh nghiệp & MST</th>
                <th className="py-3.5 px-4">Đại diện & Hotline</th>
                <th className="py-3.5 px-4">Tài khoản User</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày nộp</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
                    <span>Đang tải danh sách hồ sơ đối tác...</span>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không có hồ sơ đối tác nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.03] transition group">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{app.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white max-w-xs truncate">{app.businessName}</div>
                      <div className="text-[11px] text-sky-400 font-mono mt-0.5">MST: {app.taxCode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{app.representativeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.hotline}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 truncate max-w-[160px]">{app.userFullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">{app.userEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(app.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Thẩm định</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CHI TIẾT HỒ SƠ ĐỐI TÁC & THẨM ĐỊNH                */}
      {/* ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0a111d] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      Hồ sơ đăng ký #{selectedApp.id}
                    </h3>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ngày nộp: {formatDate(selectedApp.createdAt)} • Người nộp: {selectedApp.userFullName} ({selectedApp.userEmail})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Thông tin pháp nhân */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>1. Thông tin doanh nghiệp lữ hành</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tên doanh nghiệp:</span>
                    <strong className="text-white text-sm font-extrabold">{selectedApp.businessName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã số thuế (MST):</span>
                    <strong className="text-sky-300 font-mono text-xs">{selectedApp.taxCode}</strong>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Trụ sở chính:</span>
                    <span className="text-slate-200">{selectedApp.businessAddress}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Hotline CSKH:</span>
                    <span className="text-slate-200 font-mono font-bold">{selectedApp.hotline}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Email liên hệ:</span>
                    <span className="text-slate-200 font-mono">{selectedApp.contactEmail || 'Theo tài khoản user'}</span>
                  </div>

                  {selectedApp.website && (
                    <div className="sm:col-span-2 flex items-center gap-1.5 text-sky-400">
                      <Globe className="w-3.5 h-3.5" />
                      <a href={selectedApp.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {selectedApp.website}
                      </a>
                    </div>
                  )}

                  {selectedApp.description && (
                    <div className="sm:col-span-2 pt-2 border-t border-white/6">
                      <span className="text-slate-400 block text-[11px] mb-1">Mô tả doanh nghiệp & thế mạnh:</span>
                      <p className="text-slate-300 italic leading-relaxed">{selectedApp.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin người đại diện & Giấy tờ */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Người đại diện pháp luật & Giấy tờ thẩm định</span>
                </h4>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Người đại diện pháp luật:</span>
                    <strong className="text-white text-sm font-bold">{selectedApp.representativeName}</strong>
                  </div>

                  {/* Giấy phép & CCCD Thumbnails */}
                  <div className="space-y-2">
                    <span className="text-slate-300 font-bold block text-[11px]">
                      Hình ảnh hồ sơ pháp lý (Bấm vào ảnh để phóng to kiểm tra):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* GPKD */}
                      <div 
                        onClick={() => setZoomedImage({ url: selectedApp.businessLicenseUrl, title: 'Giấy phép kinh doanh lữ hành' })}
                        className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 cursor-pointer group hover:border-sky-400 transition"
                      >
                        <div className="p-2 text-[10px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                          <span>Giấy phép lữ hành</span>
                          <ExternalLink className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100" />
                        </div>
                        <img src={selectedApp.businessLicenseUrl} alt="GPKD" className="w-full h-32 object-cover group-hover:scale-105 transition duration-300" />
                      </div>

                      {/* CCCD Front */}
                      <div 
                        onClick={() => setZoomedImage({ url: selectedApp.idCardFrontUrl, title: 'CCCD Người đại diện (Mặt trước)' })}
                        className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 cursor-pointer group hover:border-sky-400 transition"
                      >
                        <div className="p-2 text-[10px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                          <span>CCCD Mặt trước</span>
                          <ExternalLink className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100" />
                        </div>
                        <img src={selectedApp.idCardFrontUrl} alt="CCCD Front" className="w-full h-32 object-cover group-hover:scale-105 transition duration-300" />
                      </div>

                      {/* CCCD Back */}
                      {selectedApp.idCardBackUrl ? (
                        <div 
                          onClick={() => setZoomedImage({ url: selectedApp.idCardBackUrl!, title: 'CCCD Người đại diện (Mặt sau)' })}
                          className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 cursor-pointer group hover:border-sky-400 transition"
                        >
                          <div className="p-2 text-[10px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <span>CCCD Mặt sau</span>
                            <ExternalLink className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100" />
                          </div>
                          <img src={selectedApp.idCardBackUrl} alt="CCCD Back" className="w-full h-32 object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 p-4 flex items-center justify-center text-slate-500 text-[11px] text-center">
                          Chưa đính kèm CCCD mặt sau
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử thẩm định nếu đã review */}
              {selectedApp.status !== 'PENDING_REVIEW' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
                  <div className="font-bold text-slate-300">Thông tin kết quả thẩm định:</div>
                  <div className="text-slate-400">
                    Người duyệt: <strong className="text-white">{selectedApp.reviewedBy || 'Admin'}</strong> • Thời gian: {selectedApp.reviewedAt ? formatDate(selectedApp.reviewedAt) : ''}
                  </div>
                  {selectedApp.rejectionReason && (
                    <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      <strong>Lý do từ chối:</strong> {selectedApp.rejectionReason}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Đóng cửa sổ
              </button>

              <div className="flex items-center gap-3">
                {selectedApp.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Từ chối hồ sơ</span>
                    </button>

                    <button
                      onClick={() => handleApprove(selectedApp)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 transition cursor-pointer"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang duyệt...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Phê duyệt & Cấp quyền Vendor</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {selectedApp.status === 'APPROVED' && (
                  <button
                    onClick={() => handleRevoke(selectedApp)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Thu hồi quyền & Trả về Khách hàng</span>
                  </button>
                )}

                {selectedApp.status === 'REJECTED' && (
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Xem xét lại & Phê duyệt</span>
                  </button>
                )}

                {selectedApp.status === 'REVOKED' && (
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Khôi phục quyền Vendor</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NHẬP LÝ DO TỪ CHỐI                                */}
      {/* ======================================================== */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#0a111d] border border-rose-500/40 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Từ chối hồ sơ đối tác</h3>
                <p className="text-[11px] text-slate-400">Vui lòng cung cấp lý do để đối tác hoàn thiện lại hồ sơ</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lý do từ chối (Sẽ gửi qua email cho đối tác) *
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: Ảnh Giấy phép kinh doanh bị mờ, không thấy rõ số MST. Vui lòng chụp lại bản gốc và nộp lại hồ sơ..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Gửi lý do & Từ chối</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LIGHTBOX PHÓNG TO ẢNH                             */}
      {/* ======================================================== */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-white pb-3 px-2">
              <span className="text-sm font-bold">{zoomedImage.title}</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={zoomedImage.url} 
              alt={zoomedImage.title} 
              className="max-h-[80vh] max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain bg-slate-950" 
            />
          </div>
        </div>
      )}

    </div>
  );
};
