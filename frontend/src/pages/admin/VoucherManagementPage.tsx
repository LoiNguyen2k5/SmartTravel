import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Check, 
  Copy, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Tag, 
  Percent, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import { Voucher, VoucherRequest } from '../../types/voucher';
import { formatCurrency } from '../../utils/formatters';

export const VoucherManagementPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherRequest>({
    code: '',
    title: '',
    description: '',
    discountPercent: null,
    discountAmount: null,
    maxDiscountAmount: null,
    minOrderValue: 0,
    usageLimit: 500,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
  });
  const [discountType, setDiscountType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getAllVouchers();
      if (res.data) {
        setVouchers(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching vouchers:', err);
      showToast('Lỗi khi tải danh sách mã giảm giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountPercent: 10,
      discountAmount: null,
      maxDiscountAmount: 300000,
      minOrderValue: 1000000,
      usageLimit: 500,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
    });
    setDiscountType('PERCENT');
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    const isPercent = voucher.discountPercent != null && voucher.discountPercent > 0;
    setDiscountType(isPercent ? 'PERCENT' : 'AMOUNT');
    setFormData({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description || '',
      discountPercent: voucher.discountPercent,
      discountAmount: voucher.discountAmount,
      maxDiscountAmount: voucher.maxDiscountAmount,
      minOrderValue: voucher.minOrderValue || 0,
      usageLimit: voucher.usageLimit || 500,
      startDate: voucher.startDate || '',
      expiryDate: voucher.expiryDate,
      active: voucher.active,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await voucherService.toggleVoucherActive(id);
      if (res.data) {
        setVouchers(prev => prev.map(v => v.id === id ? res.data : v));
        showToast(res.message || 'Cập nhật trạng thái thành công!');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}" không?`)) return;
    try {
      await voucherService.deleteVoucher(id);
      setVouchers(prev => prev.filter(v => v.id !== id));
      showToast(`Đã xóa thành công mã "${code}"`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Lỗi khi xóa mã giảm giá', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError('Vui lòng nhập mã voucher');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề khuyến mãi');
      return;
    }
    if (!formData.expiryDate) {
      setFormError('Vui lòng chọn ngày hết hạn');
      return;
    }

    if (discountType === 'PERCENT') {
      if (!formData.discountPercent || formData.discountPercent <= 0 || formData.discountPercent > 100) {
        setFormError('Phần trăm giảm giá phải từ 1 đến 100%');
        return;
      }
    } else {
      if (!formData.discountAmount || formData.discountAmount <= 0) {
        setFormError('Số tiền giảm giá phải lớn hơn 0đ');
        return;
      }
    }

    const payload: VoucherRequest = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountPercent: discountType === 'PERCENT' ? Number(formData.discountPercent) : null,
      discountAmount: discountType === 'AMOUNT' ? Number(formData.discountAmount) : null,
      maxDiscountAmount: discountType === 'PERCENT' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      minOrderValue: Number(formData.minOrderValue) || 0,
      usageLimit: Number(formData.usageLimit) || 500,
    };

    try {
      setSubmitting(true);
      if (editingVoucher) {
        const res = await voucherService.updateVoucher(editingVoucher.id, payload);
        if (res.data) {
          setVouchers(prev => prev.map(v => v.id === editingVoucher.id ? res.data : v));
          showToast(`Cập nhật mã "${res.data.code}" thành công!`);
        }
      } else {
        const res = await voucherService.createVoucher(payload);
        if (res.data) {
          setVouchers(prev => [res.data, ...prev]);
          showToast(`Khởi tạo mã "${res.data.code}" thành công!`);
        }
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu mã giảm giá');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = 
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return v.active;
    if (statusFilter === 'INACTIVE') return !v.active;
    return true;
  });

  // Calculate statistics
  const totalVouchers = vouchers.length;
  const activeCount = vouchers.filter(v => v.active).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

  return (
    <div className="space-y-7">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/95 border-rose-500/40 text-rose-200'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-[#0a111d] to-[#0a111d] p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Ticket className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Quản Lý Khuyến Mãi & Voucher Toàn Sàn
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 ml-11">
            Điều phối chiến dịch ưu đãi, tạo mã giảm giá kích cầu và quản lý ngân sách khuyến mãi do Sàn tài trợ
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs transition shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tạo Mã Voucher Mới
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#0a111d]/90 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng chương trình</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5">{totalVouchers}</h3>
            </div>
            <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-2xl text-blue-400">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Bao gồm mã giảm % và tiền mặt cố định
          </div>
        </div>

        <div className="bg-[#0a111d]/90 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đang kích hoạt</p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-300/80">
            Khách hàng có thể áp dụng ngay khi đặt tour
          </div>
        </div>

        <div className="bg-[#0a111d]/90 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lượt khách đã dùng</p>
              <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1.5">{totalUsed}</h3>
            </div>
            <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Tăng trưởng kích cầu đặt tour toàn sàn
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0a111d]/90 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-2xl border border-white/10 text-xs self-stretch sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({vouchers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đang chạy ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'INACTIVE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạm dừng ({vouchers.length - activeCount})
          </button>

          <button
            onClick={fetchVouchers}
            title="Làm mới dữ liệu"
            className="p-1.5 text-slate-400 hover:text-white transition ml-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0a111d]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-5">Mã Voucher</th>
                <th className="py-4 px-5">Tiêu Đề & Mô Tả</th>
                <th className="py-4 px-5">Mức Giảm Giá</th>
                <th className="py-4 px-5">Đơn Tối Thiểu</th>
                <th className="py-4 px-5">Lượt Đã Dùng</th>
                <th className="py-4 px-5">Thời Hạn</th>
                <th className="py-4 px-5 text-center">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Ticket className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    Không tìm thấy mã giảm giá nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const isExpired = v.expiryDate && new Date(v.expiryDate) < new Date();
                  const isPercent = v.discountPercent != null && v.discountPercent > 0;
                  const usagePercent = v.usageLimit ? Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100)) : 0;

                  return (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition">
                      {/* Code */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-xl text-xs tracking-wider">
                            {v.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(v.code)}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="Sao chép mã"
                          >
                            {copiedCode === v.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Title & Desc */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-white text-xs">{v.title}</div>
                        {v.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{v.description}</div>
                        )}
                      </td>

                      {/* Discount Amount */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {isPercent ? (
                          <div>
                            <span className="font-black text-emerald-400 text-xs bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                              Giảm {v.discountPercent}%
                            </span>
                            {v.maxDiscountAmount && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                Tối đa {formatCurrency(v.maxDiscountAmount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-black text-amber-400 text-xs bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            Giảm {formatCurrency(v.discountAmount || 0)}
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-300 font-medium">
                        {v.minOrderValue > 0 ? formatCurrency(v.minOrderValue) : 'Không giới hạn'}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{v.usedCount} đã dùng</span>
                            <span>{v.usageLimit ? `/ ${v.usageLimit}` : ''}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`} 
                              style={{ width: `${usagePercent}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="py-4 px-5 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>Đến {v.expiryDate}</span>
                        </div>
                        {isExpired && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 rounded">
                            Đã hết hạn
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(v.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                            v.active
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${v.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          {v.active ? 'Đang chạy' : 'Tạm dừng'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(v)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
                            title="Chỉnh sửa voucher"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id, v.code)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 transition cursor-pointer border border-rose-500/20"
                            title="Xóa voucher"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in" style={{ zIndex: 9999 }}>
          <div className="w-full max-w-xl bg-[#0a111d] rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-5 border border-white/15 text-white relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingVoucher ? `Chỉnh Sửa Mã: ${editingVoucher.code}` : 'Tạo Mới Mã Giảm Giá Sàn'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cấu hình điều kiện ưu đãi cho khách hàng đặt tour
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Mã Voucher (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: HE2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-cyan-300 font-mono font-bold text-xs uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Tiêu Đề Khuyến Mãi (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Ưu Đãi Mùa Hè Rực Rỡ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Mô Tả / Điều Kiện Sử Dụng</label>
                <input
                  type="text"
                  placeholder="Áp dụng cho mọi tour nội địa và quốc tế khởi hành trong tháng..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Discount Type Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-slate-300">Hình Thức Chiết Khấu (*)</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('PERCENT');
                      setFormData(prev => ({ ...prev, discountAmount: null, discountPercent: 10 }));
                    }}
                    className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      discountType === 'PERCENT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Percent className="h-3.5 w-3.5" /> Giảm Theo Phần Trăm (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('AMOUNT');
                      setFormData(prev => ({ ...prev, discountPercent: null, maxDiscountAmount: null, discountAmount: 100000 }));
                    }}
                    className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      discountType === 'AMOUNT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="h-3.5 w-3.5" /> Giảm Số Tiền Cố Định (VNĐ)
                  </button>
                </div>
              </div>

              {/* Discount Inputs based on type */}
              {discountType === 'PERCENT' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-950/20 border border-emerald-500/25 p-3.5 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-300">% Giảm Giá (1 - 100)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      placeholder="10"
                      value={formData.discountPercent || ''}
                      onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-300">Mức Giảm Tối Đa (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      placeholder="VD: 500000"
                      value={formData.maxDiscountAmount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/20 border border-amber-500/25 p-3.5 rounded-2xl space-y-1">
                  <label className="text-[11px] font-bold text-amber-300">Số Tiền Giảm Cố Định (VNĐ)</label>
                  <input
                    type="number"
                    min={10000}
                    step={50000}
                    required
                    placeholder="VD: 100000"
                    value={formData.discountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-amber-500/30 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Conditions: Min Order & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Đơn Hàng Tối Thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    required
                    placeholder="VD: 2000000"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Giới Hạn Lượt Sử Dụng</label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="VD: 500"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Ngày Bắt Đầu Hiệu Lực</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Ngày Hết Hạn (*)</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="voucherActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="voucherActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Kích hoạt mã khuyến mãi này ngay sau khi lưu
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingVoucher ? 'Cập Nhật Voucher' : 'Tạo Voucher Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
