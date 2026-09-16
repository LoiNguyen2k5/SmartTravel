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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, settlementsRes] = await Promise.all([
        adminService.getAllPayments(),
        adminService.getVendorSettlements()
      ]);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (settlementsRes.data) setSettlements(settlementsRes.data);
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
    setSettlements(prev => prev.map(s => s.vendorId === vendorId ? { ...s, settlementStatus: 'SETTLED' } : s));
    setPayoutModal({ isOpen: false, vendor: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-8 w-8 text-sky-600" />
            Quản Lý Giao Dịch & Đối Soát Hoa Hồng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi dòng tiền thanh toán toàn sàn, thiết lập tỷ lệ chiết khấu hoa hồng và đối soát chi trả doanh thu cho Vendor
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Doanh Số Toàn Sàn</span>
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">
            {formatCurrency(totalGrossRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Gross Merchandise Value (GMV)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hoa Hồng Sàn Giữ Lại (10%)</span>
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <Percent className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600">
            {formatCurrency(totalPlatformFees)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Doanh thu phí dịch vụ nền tảng</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Chi Trả Cho Vendor (90%)</span>
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
              <ArrowDownRight className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-indigo-600">
            {formatCurrency(totalNetPayouts)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Thực nhận của các nhà cung cấp</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab('SETTLEMENTS'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'SETTLEMENTS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Bảng Đối Soát Doanh Thu Vendor ({settlements.length})
        </button>

        <button
          onClick={() => { setActiveTab('PAYMENTS'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'PAYMENTS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition"
        />
      </div>

      {/* Content for Tab 1: Settlements */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
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
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                      Đang tính toán đối soát...
                    </td>
                  </tr>
                ) : filteredSettlements.length > 0 ? (
                  filteredSettlements.map((s) => {
                    const isSettled = s.settlementStatus === 'SETTLED';

                    return (
                      <tr key={s.vendorId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-indigo-600" />
                            {s.vendorName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {s.vendorEmail}</span>
                            {s.vendorPhone && <span className="flex items-center gap-1">• <Phone className="h-3 w-3" /> {s.vendorPhone}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-bold text-slate-800">{s.totalTours} tour hoạt động</div>
                          <div className="text-xs text-slate-500">{s.totalBookings} đơn đặt chỗ</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatCurrency(s.totalGrossRevenue)}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-amber-600 text-xs">
                          {formatCurrency(s.platformFee)}
                        </td>

                        <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                          {formatCurrency(s.netPayout)}
                        </td>

                        <td className="py-3.5 px-4">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Đã quyết toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <Clock className="h-3 w-3" /> Chờ đối soát
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isSettled ? (
                            <button
                              onClick={() => setPayoutModal({ isOpen: true, vendor: s })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition active:scale-95"
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
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                <tr>
                  <th className="py-3.5 px-4">Mã Giao Dịch</th>
                  <th className="py-3.5 px-4">Mã Đơn Booking</th>
                  <th className="py-3.5 px-4">Số Tiền Thanh Toán</th>
                  <th className="py-3.5 px-4">Phương Thức</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => {
                    const isPaid = p.paymentStatus === 'PAID' || p.paymentStatus === 'SUCCESS';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-800">
                          {p.transactionId || `TX-${p.id}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-sky-600">
                          {p.bookingCode || `#BK-${p.bookingId}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {p.paymentMethod || 'VNPAY'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <Clock className="h-3 w-3" /> {p.paymentStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác Nhận Quyết Toán Doanh Thu</h3>
                <p className="text-xs text-slate-500">
                  Đối tác: <strong className="text-slate-800">{payoutModal.vendor.vendorName}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng doanh thu bán tour:</span>
                <span className="font-bold text-slate-800">{formatCurrency(payoutModal.vendor.totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phí sàn khấu trừ (10%):</span>
                <span className="font-bold text-amber-600">-{formatCurrency(payoutModal.vendor.platformFee)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                <span className="font-extrabold text-slate-800">Số tiền chi trả Vendor:</span>
                <span className="font-black text-emerald-600">{formatCurrency(payoutModal.vendor.netPayout)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPayoutModal({ isOpen: false, vendor: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleConfirmPayout(payoutModal.vendor!.vendorId)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition active:scale-95"
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
