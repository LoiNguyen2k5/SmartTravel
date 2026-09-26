import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Percent, 
  FileCheck,
  Phone,
  Mail,
  ArrowDownRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PaymentRecord, VendorSettlement } from '../../types/admin';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TransactionSettlementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'SETTLEMENTS'>('SETTLEMENTS');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settlements, setSettlements] = useState<VendorSettlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Settlement payout action state
  const [payoutModal, setPayoutModal] = useState<{
    isOpen: boolean;
    vendor: VendorSettlement | null;
  }>({ isOpen: false, vendor: null });

  // Persistent storage key for settled vendor payouts
  const SETTLED_VENDORS_STORAGE_KEY = 'smart_travel_settled_vendor_ids';

  const getSettledVendorIds = (): number[] => {
    try {
      const raw = localStorage.getItem(SETTLED_VENDORS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveSettledVendorId = (vendorId: number) => {
    try {
      const ids = getSettledVendorIds();
      if (!ids.includes(vendorId)) {
        ids.push(vendorId);
        localStorage.setItem(SETTLED_VENDORS_STORAGE_KEY, JSON.stringify(ids));
      }
    } catch (e) {
      console.error('Error saving settled vendor ID', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, settlementsRes] = await Promise.all([
        adminService.getAllPayments(),
        adminService.getVendorSettlements()
      ]);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (settlementsRes.data) {
        const settledIds = getSettledVendorIds();
        const mergedSettlements = settlementsRes.data.map(s => ({
          ...s,
          settlementStatus: (settledIds.includes(s.vendorId) || s.settlementStatus === 'SETTLED') ? 'SETTLED' : (s.settlementStatus || 'PENDING')
        }));
        setSettlements(mergedSettlements);
      }
    } catch (err) {
      console.error('Error fetching transactions & settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalGrossRevenue = settlements.reduce((sum, s) => sum + (Number(s.totalGrossRevenue) || 0), 0);
  const totalPlatformFees = settlements.reduce((sum, s) => sum + (Number(s.platformFee) || 0), 0);
  const totalNetPayouts = settlements.reduce((sum, s) => sum + (Number(s.netPayout) || 0), 0);

  const filteredPayments = payments.filter(p =>
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSettlements = settlements.filter(s =>
    s.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vendorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vendorPhone?.includes(searchTerm)
  );

  const handleConfirmPayout = (vendorId: number) => {
    saveSettledVendorId(vendorId);
    setSettlements(prev => prev.map(s => s.vendorId === vendorId ? { ...s, settlementStatus: 'SETTLED' } : s));
    setPayoutModal({ isOpen: false, vendor: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-8 w-8 text-sky-400" />
            Quản Lý Giao Dịch & Đối Soát Hoa Hồng
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Theo dõi dòng tiền thanh toán toàn sàn, thiết lập tỷ lệ chiết khấu hoa hồng và đối soát chi trả doanh thu cho Vendor
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-white/10 bg-[#070c18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Doanh Số Toàn Sàn</span>
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totalGrossRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Gross Merchandise Value (GMV)</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070c18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoa Hồng Sàn Giữ Lại (10%)</span>
            <div className="rounded-xl bg-amber-500/20 border border-amber-500/30 p-2.5 text-amber-400">
              <Percent className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-400">
            {formatCurrency(totalPlatformFees)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Doanh thu phí dịch vụ nền tảng</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070c18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Chi Trả Cho Vendor (90%)</span>
            <div className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 p-2.5 text-indigo-400">
              <ArrowDownRight className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-indigo-400">
            {formatCurrency(totalNetPayouts)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Thực nhận của các nhà cung cấp</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => { setActiveTab('SETTLEMENTS'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'SETTLEMENTS'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
              : 'bg-white/[0.04] text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Bảng Đối Soát Doanh Thu Vendor ({settlements.length})
        </button>

        <button
          onClick={() => { setActiveTab('PAYMENTS'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'PAYMENTS'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
              : 'bg-white/[0.04] text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Nhật Ký Giao Dịch Thanh Toán ({payments.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={activeTab === 'SETTLEMENTS' ? 'Tìm theo tên vendor, email hoặc số điện thoại...' : 'Tìm theo mã giao dịch, mã booking, phương thức...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#070c18] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 shadow-sm transition"
        />
      </div>

      {/* Content for Tab 1: Settlements */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="rounded-2xl border border-white/10 bg-[#070c18] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 bg-[#0d1527]">
                <tr>
                  <th className="py-3.5 px-4">Nhà Cung Cấp (Vendor)</th>
                  <th className="py-3.5 px-4">Tổng Tour & Đơn</th>
                  <th className="py-3.5 px-4">Doanh Số Bán</th>
                  <th className="py-3.5 px-4">Hoa Hồng Sàn (10%)</th>
                  <th className="py-3.5 px-4">Thực Nhận (Net Payout)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Quyết Toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-400 mb-2" />
                      Đang tính toán đối soát...
                    </td>
                  </tr>
                ) : filteredSettlements.length > 0 ? (
                  filteredSettlements.map((s) => {
                    const isSettled = s.settlementStatus === 'SETTLED';

                    return (
                      <tr key={s.vendorId} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-indigo-400" />
                            {s.vendorName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {s.vendorEmail}</span>
                            {s.vendorPhone && <span className="flex items-center gap-1">• <Phone className="h-3 w-3" /> {s.vendorPhone}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-bold text-slate-200">{s.totalTours} tour hoạt động</div>
                          <div className="text-xs text-slate-400">{s.totalBookings} đơn đặt chỗ</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-white">
                          {formatCurrency(s.totalGrossRevenue)}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-amber-400 text-xs">
                          {formatCurrency(s.platformFee)}
                        </td>

                        <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                          {formatCurrency(s.netPayout)}
                        </td>

                        <td className="py-3.5 px-4">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              <CheckCircle2 className="h-3 w-3" /> Đã quyết toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="h-3 w-3" /> Chờ đối soát
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isSettled ? (
                            <button
                              onClick={() => setPayoutModal({ isOpen: true, vendor: s })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 transition active:scale-95 shadow-sm"
                            >
                              <FileCheck className="h-3.5 w-3.5" />
                              Chi trả
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Hoàn tất</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      Chưa có dữ liệu đối soát cho nhà cung cấp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for Tab 2: Payments Log */}
      {activeTab === 'PAYMENTS' && (
        <div className="rounded-2xl border border-white/10 bg-[#070c18] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 bg-[#0d1527]">
                <tr>
                  <th className="py-3.5 px-4">Mã Giao Dịch</th>
                  <th className="py-3.5 px-4">Mã Đơn Booking</th>
                  <th className="py-3.5 px-4">Số Tiền Thanh Toán</th>
                  <th className="py-3.5 px-4">Phương Thức</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-400 mb-2" />
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => {
                    const isPaid = p.paymentStatus === 'PAID' || p.paymentStatus === 'SUCCESS';

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-300">
                          {p.transactionId || `TX-${p.id}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-sky-400">
                          {p.bookingCode || `#BK-${p.bookingId}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
                            {p.paymentMethod || 'VNPAY'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="h-3 w-3" /> {p.paymentStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {p.paymentTime ? formatDate(p.paymentTime) : 'Vừa xong'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      Chưa có giao dịch thanh toán nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Confirmation Modal */}
      {payoutModal.isOpen && payoutModal.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a111d] rounded-3xl p-6 shadow-2xl space-y-4 border border-white/15 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xác Nhận Quyết Toán Doanh Thu</h3>
                <p className="text-xs text-slate-400">
                  Đối tác: <strong className="text-white">{payoutModal.vendor.vendorName}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng doanh thu bán tour:</span>
                <span className="font-bold text-white">{formatCurrency(payoutModal.vendor.totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phí sàn khấu trừ (10%):</span>
                <span className="font-bold text-amber-400">-{formatCurrency(payoutModal.vendor.platformFee)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                <span className="font-extrabold text-white">Số tiền chi trả Vendor:</span>
                <span className="font-black text-emerald-400">{formatCurrency(payoutModal.vendor.netPayout)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPayoutModal({ isOpen: false, vendor: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleConfirmPayout(payoutModal.vendor!.vendorId)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95"
              >
                Xác Nhận Đã Chi Trả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
