import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Info,
  ExternalLink,
  Sparkles,
  PhoneCall,
  BadgeCheck,
  RefreshCw,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { vendorApplicationService } from '../../services/vendorApplicationService';
import { VendorApplicationRequest, VendorApplicationResponse } from '../../types/vendorApplication';

export const BecomeVendorPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [currentApp, setCurrentApp] = useState<VendorApplicationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  
  // Images (URLs or Base64 Data URLs)
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);

  // File input refs
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const idCardFrontInputRef = useRef<HTMLInputElement>(null);
  const idCardBackInputRef = useRef<HTMLInputElement>(null);

  const isAlreadyVendor = user?.roles?.some(r => r === 'ROLE_VENDOR' || (r as any)?.name === 'ROLE_VENDOR');

  // Load user's application status
  const loadApplication = async () => {
    if (!isAuthenticated) {
      setFetchingStatus(false);
      return;
    }
    try {
      setFetchingStatus(true);
      const res = await vendorApplicationService.getMyApplication();
      if (res.data) {
        setCurrentApp(res.data);
        // Pre-fill form if rejected or revoked
        if (res.data.status === 'REJECTED' || res.data.status === 'REVOKED') {
          setBusinessName(res.data.businessName || '');
          setTaxCode(res.data.taxCode || '');
          setBusinessAddress(res.data.businessAddress || '');
          setHotline(res.data.hotline || '');
          setContactEmail(res.data.contactEmail || user?.email || '');
          setWebsite(res.data.website || '');
          setDescription(res.data.description || '');
          setRepresentativeName(res.data.representativeName || user?.fullName || '');
          setBusinessLicenseUrl(res.data.businessLicenseUrl || '');
          setIdCardFrontUrl(res.data.idCardFrontUrl || '');
          setIdCardBackUrl(res.data.idCardBackUrl || '');
        }
      } else {
        // Pre-fill contact details from current user
        if (user) {
          setRepresentativeName(user.fullName || '');
          setContactEmail(user.email || '');
          setHotline(user.phone || '');
        }
      }
    } catch (err) {
      console.error('Error fetching vendor application:', err);
    } finally {
      setFetchingStatus(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [isAuthenticated, user?.email]);

  // Handle local image file upload & convert to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!agreeTerms) {
      setErrorMsg('Vui lòng đồng ý với Điều khoản hợp tác & quy chế hoạt động của SmartTravel.');
      return;
    }

    if (!businessLicenseUrl) {
      setErrorMsg('Vui lòng tải lên ảnh Giấy phép kinh doanh lữ hành.');
      return;
    }

    if (!idCardFrontUrl) {
      setErrorMsg('Vui lòng tải lên ảnh CCCD người đại diện (mặt trước).');
      return;
    }

    const payload: VendorApplicationRequest = {
      businessName: businessName.trim(),
      taxCode: taxCode.trim(),
      businessAddress: businessAddress.trim(),
      hotline: hotline.trim(),
      contactEmail: contactEmail.trim() || user?.email,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      representativeName: representativeName.trim(),
      businessLicenseUrl,
      idCardFrontUrl,
      idCardBackUrl: idCardBackUrl || undefined,
    };

    try {
      setLoading(true);
      const res = await vendorApplicationService.submitApplication(payload);
      if (res.data) {
        setCurrentApp(res.data);
        setSuccessMsg('Nộp hồ sơ thành công! Ban Quản Trị SmartTravel sẽ thẩm định và phản hồi qua email của bạn trong 24-48 giờ.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Submit application error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Không thể gửi hồ sơ. Vui lòng kiểm tra lại.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStatus) {
    return (
      <div className="min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
        <span className="text-xs text-slate-400 font-semibold">Đang tải thông tin hồ sơ...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020204] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#070c18] p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-slate-400">
            Bạn cần đăng nhập tài khoản SmartTravel trước khi đăng ký trở thành Nhà Cung Cấp (Vendor).
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login?redirect=/become-vendor"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/5 transition"
            >
              Chưa có tài khoản? Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 font-sans pb-20 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-slate-900/60 to-transparent pt-12 pb-14 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-bold mb-4 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Chương trình Đối Tác Chiến Lược SmartTravel</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Hợp tác cùng SmartTravel <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Tiếp cận hàng triệu du khách mọi miền
            </span>
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Mở rộng kênh bán hàng trực tuyến, tối ưu hóa quy trình quản lý lịch khởi hành, booking và hồ sơ visa với nền tảng công nghệ du lịch thông minh toàn diện.
          </p>

          {/* Quick Value Props Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2.5">
                0đ
              </div>
              <h3 className="text-xs font-bold text-white">0 Phí Kích Hoạt Gian Hàng</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Không thu phí thường niên hay phí khởi tạo. Chỉ tính hoa hồng cạnh tranh khi có đơn thành công.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white">Quản Trị Tour & Visa Tự Động</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Hệ thống thẩm định giấy tờ visa du khách, tạo lịch tour linh hoạt và xuất vé điện tử tức thì.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white">Hỗ Trợ Đối Tác 24/7</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Đội ngũ Account Manager đồng hành tối ưu hóa nội dung tour và giải ngân đối soát minh bạch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
        
        {/* Case 1: Đã là Vendor */}
        {isAlreadyVendor && (
          <div className="mb-8 p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Đối Tác Chính Thức
                </span>
                <h2 className="text-lg font-black text-white mt-1">
                  Tài khoản của bạn đã là Nhà Cung Cấp (Vendor)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bạn có đầy đủ quyền đăng tour, quản lý lịch trình và tiếp nhận khách hàng trên sàn.
                </p>
              </div>
            </div>

            <Link
              to="/vendor"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:brightness-110 transition"
            >
              <span>Vào Kênh Nhà Cung Cấp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Case 2: Hồ sơ đang chờ duyệt (PENDING_REVIEW) */}
        {!isAlreadyVendor && currentApp && currentApp.status === 'PENDING_REVIEW' && (
          <div className="mb-8 p-8 rounded-3xl border border-amber-500/30 bg-[#0d1627]/90 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Đang Chờ Thẩm Định (Pending Review)
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">
                    Hồ sơ đăng ký đối tác đã được tiếp nhận
                  </h2>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Mã hồ sơ: #{currentApp.id}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                Hồ sơ của doanh nghiệp <strong>{currentApp.businessName}</strong> đang được bộ phận Pháp chế & Quản trị kiểm tra tính hợp lệ của Giấy phép kinh doanh và thông tin người đại diện. Chúng tôi sẽ gửi email thông báo kết quả trong vòng <strong>24 - 48 giờ làm việc</strong>.
              </div>
            </div>

            {/* Chi tiết đã nộp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-2">
                <div className="text-slate-400 font-semibold">Tên doanh nghiệp:</div>
                <div className="text-white font-bold">{currentApp.businessName}</div>
                <div className="text-slate-400 font-semibold pt-1">Mã số thuế:</div>
                <div className="text-white font-mono">{currentApp.taxCode}</div>
                <div className="text-slate-400 font-semibold pt-1">Địa chỉ trụ sở:</div>
                <div className="text-white">{currentApp.businessAddress}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-2">
                <div className="text-slate-400 font-semibold">Người đại diện pháp luật:</div>
                <div className="text-white font-bold">{currentApp.representativeName}</div>
                <div className="text-slate-400 font-semibold pt-1">Hotline / Số điện thoại:</div>
                <div className="text-white font-mono">{currentApp.hotline}</div>
                <div className="text-slate-400 font-semibold pt-1">Email liên hệ:</div>
                <div className="text-sky-400 font-mono">{currentApp.contactEmail || user?.email}</div>
              </div>
            </div>

            {/* Preview giấy tờ */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300">Giấy tờ & hồ sơ pháp lý đã nộp:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 group">
                  <div className="p-2 text-[11px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span>Giấy phép lữ hành</span>
                    <a href={currentApp.businessLicenseUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <img src={currentApp.businessLicenseUrl} alt="Giấy phép kinh doanh" className="h-28 w-full object-cover" />
                </div>

                <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 group">
                  <div className="p-2 text-[11px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span>CCCD mặt trước</span>
                    <a href={currentApp.idCardFrontUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <img src={currentApp.idCardFrontUrl} alt="CCCD mặt trước" className="h-28 w-full object-cover" />
                </div>

                {currentApp.idCardBackUrl && (
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-900 group">
                    <div className="p-2 text-[11px] font-bold text-slate-300 bg-white/5 border-b border-white/10 flex items-center justify-between">
                      <span>CCCD mặt sau</span>
                      <a href={currentApp.idCardBackUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <img src={currentApp.idCardBackUrl} alt="CCCD mặt sau" className="h-28 w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Cần hỗ trợ gấp? Gọi hotline đối tác: <strong className="text-white">0941 899 554</strong>
              </span>
              <button
                onClick={loadApplication}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới trạng thái</span>
              </button>
            </div>
          </div>
        )}

        {/* Case 3: Hồ sơ bị từ chối (REJECTED) */}
        {!isAlreadyVendor && currentApp && currentApp.status === 'REJECTED' && (
          <div className="mb-8 p-6 sm:p-8 rounded-3xl border border-rose-500/40 bg-rose-950/20 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Hồ Sơ Chưa Đạt Yêu Cầu
                  </span>
                  <span className="text-xs text-slate-400">
                    Thẩm định lúc: {currentApp.reviewedAt ? new Date(currentApp.reviewedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  Đơn đăng ký đại lý cần chỉnh sửa hoặc bổ sung giấy tờ
                </h2>
                <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
                  <strong className="text-rose-400 font-bold block mb-1">Lý do từ chối từ Ban Quản Trị:</strong>
                  {currentApp.rejectionReason || 'Thông tin giấy tờ chưa hợp lệ hoặc mờ không rõ nét.'}
                </div>
                <p className="text-xs text-slate-300 mt-3">
                  Bạn có thể cập nhật lại thông tin và nộp lại hồ sơ bằng biểu mẫu bên dưới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Case 4: Hồ sơ bị thu hồi quyền (REVOKED) */}
        {!isAlreadyVendor && currentApp && currentApp.status === 'REVOKED' && (
          <div className="mb-8 p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-amber-950/25 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Đã Thu Hồi Quyền Đối Tác
                  </span>
                  <span className="text-xs text-slate-400">
                    Cập nhật lúc: {currentApp.reviewedAt ? new Date(currentApp.reviewedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  Quyền đối tác Vendor đã được chuyển về Khách hàng thường
                </h2>
                <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                  <strong className="text-amber-400 font-bold block mb-1">Ghi chú từ Quản Trị Viên:</strong>
                  {currentApp.rejectionReason || 'Quyền đối tác đã được thu hồi theo yêu cầu hoặc do kiểm toán định kỳ.'}
                </div>
                <p className="text-xs text-slate-300 mt-3">
                  Nếu muốn tiếp tục hợp tác kinh doanh, bạn có thể chỉnh sửa thông tin và nộp lại hồ sơ thẩm định bên dưới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form nộp hồ sơ (Hiển thị khi chưa là vendor & chưa có đơn pending) */}
        {(!isAlreadyVendor && (!currentApp || currentApp.status === 'REJECTED' || currentApp.status === 'REVOKED')) && (
          <div className="rounded-3xl border border-white/10 bg-[#070c18]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            <div className="border-b border-white/10 pb-6 mb-8">
              <div className="flex items-center gap-2.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Mẫu đơn đăng ký (Vendor Application Form)</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Thông tin doanh nghiệp & Hồ sơ pháp lý
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng điền thông tin chính xác theo Đăng ký kinh doanh để được phê duyệt nhanh chóng.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Phần 1: Thông tin doanh nghiệp */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/6 pb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center font-bold">1</span>
                  Thông tin pháp nhân công ty
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Tên doanh nghiệp / Đơn vị lữ hành *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="VD: Công Ty TNHH Du Lịch Quốc Tế Á Châu"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Mã số thuế (MST) *
                    </label>
                    <input
                      type="text"
                      required
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="VD: 0318998877"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none font-mono transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Địa chỉ trụ sở chính (Theo GPKD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="VD: 128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hotline hỗ trợ khách hàng *
                    </label>
                    <input
                      type="text"
                      required
                      value={hotline}
                      onChange={(e) => setHotline(e.target.value)}
                      placeholder="VD: 02838229988 hoặc 0908888999"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none font-mono transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email tiếp nhận liên hệ / đối soát
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={user?.email || "contact@doanhnghiep.vn"}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none font-mono transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Website / Fanpage (Nếu có)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://asiatravel.vn"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none font-mono transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mô tả doanh nghiệp & Thế mạnh sản phẩm tour
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả về kinh nghiệm tổ chức tour, tuyến điểm thế mạnh, chứng chỉ chất lượng dịch vụ..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Phần 2: Người đại diện & Hồ sơ pháp lý */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/6 pb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center font-bold">2</span>
                  Người đại diện & Tải lên hồ sơ pháp lý
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Họ và tên người đại diện pháp luật *
                  </label>
                  <input
                    type="text"
                    required
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Du Khách"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/[0.07] focus:outline-none transition"
                  />
                </div>

                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  
                  {/* Ảnh 1: Giấy phép kinh doanh */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-white">Giấy phép kinh doanh *</label>
                        <span className="text-[10px] text-sky-400 font-semibold">Bắt buộc</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Chụp rõ nét giấy chứng nhận ĐKKD hoặc Giấy phép kinh doanh lữ hành.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {businessLicenseUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 group">
                          <img src={businessLicenseUrl} alt="GPKD" className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => setBusinessLicenseUrl('')}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-rose-400 hover:text-white text-xs transition"
                          >
                            Đổi ảnh khác
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => licenseInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-sky-400/50 rounded-xl p-4 text-center cursor-pointer transition hover:bg-white/[0.03] flex flex-col items-center justify-center gap-2 h-32"
                        >
                          <UploadCloud className="w-6 h-6 text-sky-400" />
                          <span className="text-[11px] font-bold text-slate-300">Tải ảnh lên từ máy</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG tối đa 5MB</span>
                        </div>
                      )}

                      <input
                        ref={licenseInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setBusinessLicenseUrl)}
                      />

                      {/* Direct URL input fallback */}
                      <input
                        type="text"
                        value={businessLicenseUrl.startsWith('data:') ? '' : businessLicenseUrl}
                        onChange={(e) => setBusinessLicenseUrl(e.target.value)}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Ảnh 2: CCCD mặt trước */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-white">CCCD Mặt trước *</label>
                        <span className="text-[10px] text-sky-400 font-semibold">Bắt buộc</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Ảnh CCCD/Hộ chiếu người đại diện, rõ số và họ tên.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {idCardFrontUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 group">
                          <img src={idCardFrontUrl} alt="CCCD trước" className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => setIdCardFrontUrl('')}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-rose-400 hover:text-white text-xs transition"
                          >
                            Đổi ảnh khác
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => idCardFrontInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-sky-400/50 rounded-xl p-4 text-center cursor-pointer transition hover:bg-white/[0.03] flex flex-col items-center justify-center gap-2 h-32"
                        >
                          <UploadCloud className="w-6 h-6 text-sky-400" />
                          <span className="text-[11px] font-bold text-slate-300">Tải ảnh mặt trước</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG tối đa 5MB</span>
                        </div>
                      )}

                      <input
                        ref={idCardFrontInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setIdCardFrontUrl)}
                      />

                      <input
                        type="text"
                        value={idCardFrontUrl.startsWith('data:') ? '' : idCardFrontUrl}
                        onChange={(e) => setIdCardFrontUrl(e.target.value)}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Ảnh 3: CCCD mặt sau */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-white">CCCD Mặt sau</label>
                        <span className="text-[10px] text-slate-500">Tùy chọn</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Mặt sau CCCD có chip/ngày cấp và nơi cấp.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {idCardBackUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 group">
                          <img src={idCardBackUrl} alt="CCCD sau" className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => setIdCardBackUrl('')}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-rose-400 hover:text-white text-xs transition"
                          >
                            Đổi ảnh khác
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => idCardBackInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-sky-400/50 rounded-xl p-4 text-center cursor-pointer transition hover:bg-white/[0.03] flex flex-col items-center justify-center gap-2 h-32"
                        >
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-300">Tải ảnh mặt sau</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG tối đa 5MB</span>
                        </div>
                      )}

                      <input
                        ref={idCardBackInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setIdCardBackUrl)}
                      />

                      <input
                        type="text"
                        value={idCardBackUrl.startsWith('data:') ? '' : idCardBackUrl}
                        onChange={(e) => setIdCardBackUrl(e.target.value)}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Điều khoản & Cam kết */}
              <div className="pt-2 border-t border-white/10 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-300 leading-normal">
                    Tôi cam kết toàn bộ thông tin đăng ký và hồ sơ pháp lý đính kèm là hoàn toàn xác thực, tuân thủ Luật Du lịch Việt Nam và chịu trách nhiệm trước pháp luật. Tôi đồng ý với{' '}
                    <a href="/terms" target="_blank" className="text-sky-400 underline hover:text-sky-300">
                      Quy chế hoạt động sàn SmartTravel
                    </a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_30px_rgba(14,165,233,0.35)] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang nộp hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Gửi Hồ Sơ Đăng Ký Đại Lý</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
