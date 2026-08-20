import React, { useState } from 'react';
import { Building2, CreditCard, ShieldCheck, Save, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VendorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(user?.fullName || 'Công Ty TNHH Du Lịch SmartTravel Partner');
  const [businessLicense, setBusinessLicense] = useState('0316889988-GP');
  const [taxCode, setTaxCode] = useState('0316889988');
  const [phone, setPhone] = useState(user?.phone || '0988776655');
  const [email, setEmail] = useState(user?.email || 'vendor@smarttravel.com');
  const [address, setAddress] = useState('123 Đường Nguyễn Huệ, Quận 1, TP.Hồ Chí Minh');
  const [representative, setRepresentative] = useState('Nguyễn Văn Quản Lý');

  // Banking info
  const [bankName, setBankName] = useState('Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam');
  const [accountNumber, setAccountNumber] = useState('998877665544');
  const [accountHolder, setAccountHolder] = useState('CONG TY TNHH DU LICH SMARTTRAVEL PARTNER');
  const [bankBranch, setBankBranch] = useState('Chi nhánh TP.Hồ Chí Minh');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-emerald-600" /> Hồ Sơ Doanh Nghiệp & Ngân Hàng
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Cập nhật thông tin đại lý tour, giấy phép kinh doanh và tài khoản nhận doanh thu bán tour
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-5 w-5 text-emerald-600" /> Đã cập nhật thông tin hồ sơ doanh nghiệp thành công!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: HỒ SƠ CÔNG TY */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Thông tin Pháp lý & Đại lý</h3>
              <p className="text-xs text-slate-500">Giấy phép hoạt động lữ hành và thông tin liên hệ chính thức</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên Doanh nghiệp / Đại lý *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Người đại diện pháp luật *</label>
              <input
                type="text"
                required
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã số GP Kinh doanh Lữ hành *</label>
              <input
                type="text"
                required
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã số thuế doanh nghiệp *</label>
              <input
                type="text"
                required
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hotline hỗ trợ khách hàng *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email nhận đơn đặt tour *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ trụ sở chính *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TÀI KHOẢN NHẬN TIỀN */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Tài Khoản Nhận Thanh Toán (Payout)</h3>
              <p className="text-xs text-slate-500">Tài khoản ngân hàng chính thức để nhận thanh toán quyết toán từ hệ thống</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên Ngân hàng *</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Chi nhánh *</label>
              <input
                type="text"
                required
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Số tài khoản ngân hàng *</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên chủ tài khoản (Viết hoa không dấu) *</label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm uppercase font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition"
          >
            <Save className="h-4 w-4" /> Lưu Hồ Sơ Doanh Nghiệp
          </button>
        </div>
      </form>
    </div>
  );
};
