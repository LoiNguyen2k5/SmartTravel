import React, { useState, useEffect, useCallback } from "react";
import {
  Globe, FileText, Clock, CheckCircle2, XCircle,
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Search, Filter, Eye, BookOpen, TrendingUp,
  CalendarDays, Users, AlertOctagon
} from "lucide-react";
import { visaService } from "../../services/visaService";
import {
  VisaApplicationResponse, VisaApplicationStatus,
  VisaDocumentStatus, VisaTemplate, VisaTemplateDocument
} from "../../types/visa";
import { VisaDocumentReviewModal } from "../../components/visa/VisaDocumentReviewModal";

// ─── MẪU VISA MẶC ĐỊNH ──────────────────────────────────────
const DEFAULT_TEMPLATES: VisaTemplate[] = [
  {
    id: 1, country: "Nhật Bản", countryCode: "JP", flagEmoji: "🇯🇵",
    processingDays: 7, visaFee: 1600000,
    notes: "Nộp hồ sơ tại Lãnh sự quán Nhật tại TP.HCM. Giờ nộp 8:30-11:30 thứ 2-6.",
    tourCount: 3,
    documents: [
      { id: 1, documentName: "Hộ chiếu (còn hạn ít nhất 6 tháng)", description: "Scan trang thông tin rõ nét.", isMandatory: true },
      { id: 2, documentName: "Ảnh thẻ 4x6 (nền trắng)", description: "Chụp trong vòng 6 tháng, không đeo kính.", isMandatory: true },
      { id: 3, documentName: "Sao kê tài khoản 3 tháng", description: "Số dư tối thiểu 30 triệu VND, có đóng dấu ngân hàng.", isMandatory: true },
      { id: 4, documentName: "Căn cước công dân (2 mặt)", description: "Chụp rõ, không bị che. Hoặc CMND còn hạn.", isMandatory: true },
      { id: 5, documentName: "Giấy phép lao động / Hợp đồng việc làm", description: "Xác nhận đang đi làm.", isMandatory: false },
    ],
  },
  {
    id: 2, country: "Hàn Quốc", countryCode: "KR", flagEmoji: "🇰🇷",
    processingDays: 10, visaFee: 1200000,
    notes: "Nộp tại Trung tâm Visa Hàn Quốc, 41 Mac Đinh Chi, Q.1, TP.HCM.",
    tourCount: 2,
    documents: [
      { id: 1, documentName: "Hộ chiếu (còn hạn ít nhất 6 tháng)", description: "Scan trang ảnh đầy đủ.", isMandatory: true },
      { id: 2, documentName: "Ảnh thẻ 3.5x4.5 (nền trắng)", description: "Chụp trong vòng 6 tháng.", isMandatory: true },
      { id: 3, documentName: "Đơn xin cấp Visa (điền sẵn)", description: "Mẫu do SmartTravel cung cấp.", isMandatory: true },
      { id: 4, documentName: "Sao kê tài khoản 3 tháng", description: "Tối thiểu 15 triệu VND.", isMandatory: true },
    ],
  },
  {
    id: 3, country: "Khối Schengen (Châu Âu)", countryCode: "EU", flagEmoji: "🇪🇺",
    processingDays: 15, visaFee: 3200000,
    notes: "Nộp tại ĐSQ quốc gia đầu tiên nhập cảnh hoặc quốc gia lưu trú dài nhất.",
    tourCount: 1,
    documents: [
      { id: 1, documentName: "Hộ chiếu (còn hạn ít nhất 3 tháng sau ngày về)", description: "Scan đầy đủ các trang có dấu.", isMandatory: true },
      { id: 2, documentName: "Bảo hiểm du lịch Schengen (30.000 EUR+)", description: "Có hiệu lực toàn bộ hành trình.", isMandatory: true },
      { id: 3, documentName: "Xác nhận đặt phòng khách sạn", description: "Toàn bộ hành trình.", isMandatory: true },
      { id: 4, documentName: "Sao kê tài khoản 6 tháng", description: "Tối thiểu 50 triệu VND.", isMandatory: true },
    ],
  },
  {
    id: 4, country: "Trung Quốc", countryCode: "CN", flagEmoji: "🇨🇳",
    processingDays: 5, visaFee: 900000,
    notes: "Nộp tại Trung tâm Dịch vụ Visa Trung Quốc, 175 Hai Bà Trưng, Q.3, TP.HCM.",
    tourCount: 2,
    documents: [
      { id: 1, documentName: "Hộ chiếu (còn hạn ít nhất 6 tháng)", description: "Scan rõ nét trang ảnh.", isMandatory: true },
      { id: 2, documentName: "Ảnh thẻ 3.3x4.8 (nền trắng)", description: "Ảnh màu, chụp trong 6 tháng.", isMandatory: true },
      { id: 3, documentName: "Đơn xin cấp Visa Trung Quốc", description: "Điền chính xác, ký và đóng dấu.", isMandatory: true },
      { id: 4, documentName: "Xác nhận đặt tour / Vé máy bay", description: "Từ công ty du lịch có đóng dấu.", isMandatory: true },
    ],
  },
];

const TEMPLATES_KEY = "smart_travel_visa_templates";
const loadTemplates = (): VisaTemplate[] => {
  try {
    const s = localStorage.getItem(TEMPLATES_KEY);
    return s ? JSON.parse(s) : DEFAULT_TEMPLATES;
  } catch { return DEFAULT_TEMPLATES; }
};
const saveTemplates = (t: VisaTemplate[]) => localStorage.setItem(TEMPLATES_KEY, JSON.stringify(t));

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const calcDeadline = (app: VisaApplicationResponse): Date | null => {
  if (!app.departureDate) return null;
  const dep = new Date(app.departureDate);
  dep.setDate(dep.getDate() - (app.processingDays ?? 7));
  return dep;
};

const getDeadlineBadge = (app: VisaApplicationResponse) => {
  if (app.status === "APPROVED" || app.status === "REJECTED") return null;
  const dl = calcDeadline(app);
  if (!dl) return null;
  const diffDays = Math.ceil((dl.getTime() - Date.now()) / 86400000);
  if (diffDays < 0)  return { label: `Tre ${Math.abs(diffDays)} ngay!`, color: "bg-red-500/20 text-red-300 border-red-500/30" };
  if (diffDays <= 3) return { label: `Con ${diffDays} ngay`,            color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
  if (diffDays <= 7) return { label: `Con ${diffDays} ngay`,            color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
  return { label: `Con ${diffDays} ngay`, color: "bg-slate-700 text-slate-300 border-slate-600" };
};

const STATUS_MAP: Record<VisaApplicationStatus, { label: string; color: string }> = {
  PENDING_DOCS: { label: "Cho nop ho so",    color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  PROCESSING:   { label: "Da nop - Cho DSQ", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  APPROVED:     { label: "Dau Visa",         color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  REJECTED:     { label: "Rot Visa",         color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

// Override labels with proper Vietnamese
const STATUS_LABELS: Record<VisaApplicationStatus, string> = {
  PENDING_DOCS: "Chờ nộp hồ sơ",
  PROCESSING:   "Đã nộp – Chờ ĐSQ",
  APPROVED:     "Đậu Visa ✅",
  REJECTED:     "Rớt Visa ❌",
};

type Tab = "applications" | "templates";

export const VendorVisaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [applications, setApplications] = useState<VisaApplicationResponse[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<VisaApplicationResponse | null>(null);
  const [templates, setTemplates] = useState<VisaTemplate[]>(loadTemplates);
  const [editingTemplate, setEditingTemplate] = useState<VisaTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await visaService.getAllApplications();
      const enriched = res.map((a, i) => ({
        ...a,
        departureDate: a.departureDate ?? new Date(Date.now() + (10 + i * 5) * 86400000).toISOString(),
        processingDays: a.processingDays ?? 7,
      }));
      setApplications(enriched);
    } catch (err) {
      console.error("Lỗi tải hồ sơ visa:", err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const stats = {
    waiting:    applications.filter(a => a.status === "PENDING_DOCS").length,
    processing: applications.filter(a => a.status === "PROCESSING").length,
    approved:   applications.filter(a => a.status === "APPROVED").length,
    rejected:   applications.filter(a => a.status === "REJECTED").length,
    urgent:     applications.filter(a => {
      const dl = calcDeadline(a);
      if (!dl || a.status === "APPROVED" || a.status === "REJECTED") return false;
      return (dl.getTime() - Date.now()) / 86400000 <= 3;
    }).length,
  };

  const handleUpdateDoc = async (docId: number, status: VisaDocumentStatus, feedback?: string) => {
    if (!selectedApp) return;
    // Cập nhật state selectedApp ngay lập tức để modal phản hồi tức thì
    setSelectedApp(prev => prev ? ({
      ...prev,
      documents: prev.documents.map(d => Number(d.id) === Number(docId) ? { ...d, status, vendorFeedback: feedback } : d)
    }) : null);

    try {
      const updated = await visaService.updateDocumentStatus(docId, status, feedback);
      if (updated && updated.documents) {
        setSelectedApp(updated);
      }
      await fetchApplications();
    } catch (e) {
      console.error('Lỗi khi cập nhật giấy tờ visa:', e);
      await fetchApplications();
    }
  };

  const handleUpdateAppStatus = async (status: VisaApplicationStatus, notes?: string) => {
    if (!selectedApp) return;
    try {
      const updated = await visaService.updateApplicationStatus(selectedApp.id, status, notes);
      setSelectedApp({ ...selectedApp, ...updated });
      await fetchApplications();
    } catch (e) { console.error(e); }
  };

  const filteredApps = applications.filter(a => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch = a.bookingId.toString().includes(searchTerm)
      || (a.customerName?.toLowerCase().includes(q) ?? false)
      || (a.tourTitle?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  const handleSaveTemplate = (t: VisaTemplate) => {
    const exists = templates.find(x => x.id === t.id);
    const updated = exists ? templates.map(x => x.id === t.id ? t : x) : [...templates, { ...t, id: Date.now() }];
    setTemplates(updated); saveTemplates(updated);
    setEditingTemplate(null); setShowTemplateForm(false);
  };

  const handleDeleteTemplate = (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa mẫu visa này?")) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated); saveTemplates(updated);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Globe className="h-5 w-5 text-white" />
          </span>
          Quản Lý Thủ Tục Visa
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Theo dõi hồ sơ, thẩm định giấy tờ và quản lý thư viện mẫu visa theo quốc gia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Chờ nộp hồ sơ",    value: stats.waiting,    Icon: Clock,         col: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30",  txt: "text-yellow-300" },
          { label: "Đang xử lý / ĐSQ", value: stats.processing, Icon: CalendarDays,  col: "from-sky-500/20 to-blue-600/20 border-sky-500/30",          txt: "text-sky-300" },
          { label: "Sắp trễ hạn",      value: stats.urgent,     Icon: AlertOctagon,  col: "from-orange-500/20 to-red-600/20 border-orange-500/30",     txt: "text-orange-300" },
          { label: "Đậu Visa",          value: stats.approved,   Icon: CheckCircle2,  col: "from-emerald-500/20 to-teal-600/20 border-emerald-500/30", txt: "text-emerald-300" },
          { label: "Rớt Visa",          value: stats.rejected,   Icon: XCircle,       col: "from-red-500/20 to-rose-600/20 border-red-500/30",          txt: "text-red-300" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.col} border rounded-2xl p-4 flex items-center gap-3`}>
            <s.Icon className={`h-8 w-8 ${s.txt} shrink-0`} />
            <div>
              <p className={`text-2xl font-black ${s.txt}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 w-fit">
        {([
          { key: "applications" as Tab, label: "Xử Lý Hồ Sơ Visa", Icon: FileText },
          { key: "templates"    as Tab, label: "Thư Viện Mẫu Visa", Icon: BookOpen },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}>
            <tab.Icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Xử lý hồ sơ */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã booking, tên khách, tên tour..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-white py-2.5 px-3 focus:outline-none focus:border-sky-500/60">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING_DOCS">Chờ nộp hồ sơ</option>
                <option value="PROCESSING">Đã nộp – Chờ ĐSQ</option>
                <option value="APPROVED">Đậu Visa</option>
                <option value="REJECTED">Rớt Visa</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {["Mã Booking", "Khách Hàng", "Tour", "Giấy Tờ", "Hạn Chót Nộp", "Trạng Thái", "Thao Tác"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {loadingApps ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải dữ liệu...</td></tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <Globe className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">Chưa có hồ sơ visa nào</p>
                        <p className="text-slate-500 text-sm mt-1">Khách đặt tour quốc tế và nộp giấy tờ sẽ xuất hiện ở đây</p>
                      </td>
                    </tr>
                  ) : filteredApps.map(app => {
                    const cfg = STATUS_MAP[app.status];
                    const dl = calcDeadline(app);
                    const dlBadge = getDeadlineBadge(app);
                    const docsApproved = app.documents.filter(d => d.status === "APPROVED").length;
                    const docsTotal = app.documents.length;
                    return (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-mono text-sky-400 font-bold text-sm">#{app.bookingId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white text-sm">{app.customerName || "Khách hàng"}</p>
                          {app.contactEmail && <p className="text-xs text-slate-400 mt-0.5">{app.contactEmail}</p>}
                        </td>
                        <td className="px-4 py-4 max-w-[180px]">
                          <p className="text-sm text-slate-200 line-clamp-2 leading-snug">{app.tourTitle || "—"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all"
                                style={{ width: docsTotal > 0 ? `${(docsApproved / docsTotal) * 100}%` : "0%" }} />
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">{docsApproved}/{docsTotal}</span>
                          </div>
                          {app.documents.some(d => d.status === "REJECTED") && (
                            <span className="text-[11px] text-red-400 mt-1 block">Có giấy tờ bị từ chối</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {dl ? (
                            <div>
                              <p className="text-sm text-slate-300">
                                {dl.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                              </p>
                              {dlBadge && (
                                <span className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full border ${dlBadge.color}`}>
                                  {dlBadge.label}
                                </span>
                              )}
                            </div>
                          ) : <span className="text-slate-500 text-sm">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                            {STATUS_LABELS[app.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => setSelectedApp(app)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 rounded-lg text-xs font-bold transition-all">
                            <Eye className="h-3.5 w-3.5" /> Duyệt hồ sơ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredApps.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-700/30 text-xs text-slate-400">
                Hiển thị {filteredApps.length}/{applications.length} hồ sơ
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Thư viện mẫu */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              Tạo mẫu hồ sơ visa theo từng quốc gia. Khi thêm tour, chỉ cần chọn mẫu thay vì nhập lại từ đầu.
            </p>
            <button onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/25">
              <Plus className="h-4 w-4" /> Thêm Mẫu Mới
            </button>
          </div>

          {showTemplateForm && (
            <TemplateForm
              initial={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{t.flagEmoji}</span>
                    <div>
                      <h3 className="font-black text-white text-base">{t.country}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.processingDays} ngày xử lý</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">{fmtCurrency(t.visaFee)}</span>
                        </span>
                        {t.tourCount !== undefined && (
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.tourCount} tour</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingTemplate(t); setShowTemplateForm(true); }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteTemplate(t.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                      {expandedTemplate === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {expandedTemplate === t.id && (
                  <div className="p-5 space-y-2.5">
                    {t.notes && (
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-300">
                        <strong>Ghi chú DSQ:</strong> {t.notes}
                      </div>
                    )}
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục giấy tờ ({t.documents.length})</p>
                    {t.documents.map((doc, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                        <span className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          doc.isMandatory ? "bg-red-500/20 text-red-300" : "bg-slate-700 text-slate-400"}`}>
                          {doc.isMandatory ? "!" : "o"}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {doc.documentName}
                            {doc.isMandatory && (
                              <span className="ml-2 text-[10px] font-black text-red-400 border border-red-500/30 rounded px-1">BẮT BUỘC</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal duyệt hồ sơ */}
      {selectedApp && (
        <VisaDocumentReviewModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateDocumentStatus={handleUpdateDoc}
          onUpdateApplicationStatus={handleUpdateAppStatus}
        />
      )}
    </div>
  );
};

// ─── TEMPLATE FORM ────────────────────────────────────────────
const FLAG_OPTIONS = [
  { code: "JP", flag: "🇯🇵", name: "Nhật Bản" },
  { code: "KR", flag: "🇰🇷", name: "Hàn Quốc" },
  { code: "EU", flag: "🇪🇺", name: "Schengen (EU)" },
  { code: "CN", flag: "🇨🇳", name: "Trung Quốc" },
  { code: "TW", flag: "🇹🇼", name: "Đài Loan" },
  { code: "TH", flag: "🇹🇭", name: "Thái Lan" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "HK", flag: "🇭🇰", name: "Hồng Kông" },
  { code: "US", flag: "🇺🇸", name: "Mỹ" },
  { code: "AU", flag: "🇦🇺", name: "Úc" },
  { code: "GB", flag: "🇬🇧", name: "Anh" },
  { code: "OTHER", flag: "🌍", name: "Quốc gia khác" },
];

interface TemplateFormProps {
  initial: VisaTemplate | null;
  onSave: (t: VisaTemplate) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ initial, onSave, onCancel }) => {
  const [country, setCountry] = useState(initial?.country ?? "");
  const [countryCode, setCountryCode] = useState(initial?.countryCode ?? "");
  const [flagEmoji, setFlagEmoji] = useState(initial?.flagEmoji ?? "🌍");
  const [processingDays, setProcessingDays] = useState(initial?.processingDays ?? 7);
  const [visaFee, setVisaFee] = useState(initial?.visaFee ?? 1000000);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [docs, setDocs] = useState<Omit<VisaTemplateDocument, "id">[]>(
    initial?.documents.map(d => ({ documentName: d.documentName, description: d.description, isMandatory: d.isMandatory }))
    ?? [{ documentName: "Hộ chiếu (còn hạn ít nhất 6 tháng)", description: "Scan trang ảnh rõ nét.", isMandatory: true }]
  );

  const pickFlag = (opt: typeof FLAG_OPTIONS[0]) => {
    setFlagEmoji(opt.flag); setCountryCode(opt.code);
    if (!country) setCountry(opt.name);
  };

  const addDoc    = () => setDocs([...docs, { documentName: "", description: "", isMandatory: true }]);
  const removeDoc = (i: number) => setDocs(docs.filter((_, idx) => idx !== i));
  const updateDoc = (i: number, field: keyof typeof docs[0], value: any) =>
    setDocs(docs.map((d, idx) => idx === i ? { ...d, [field]: value } : d));

  const handleSubmit = () => {
    if (!country.trim() || docs.length === 0) return;
    onSave({
      id: initial?.id ?? Date.now(), country, countryCode, flagEmoji,
      processingDays, visaFee, notes,
      tourCount: initial?.tourCount ?? 0,
      documents: docs.map((d, i) => ({ ...d, id: i + 1 })),
    });
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/60";

  return (
    <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-white text-base">{initial ? "Chỉnh Sửa Mẫu Visa" : "Thêm Mẫu Visa Mới"}</h3>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white rounded-lg transition"><X className="h-4 w-4" /></button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn quốc gia nhanh</label>
        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map(opt => (
            <button key={opt.code} onClick={() => pickFlag(opt)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                countryCode === opt.code
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                  : "bg-slate-800 border-slate-700/50 text-slate-300 hover:border-slate-500"}`}>
              {opt.flag} {opt.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Tên quốc gia *</label>
          <input value={country} onChange={e => setCountry(e.target.value)} placeholder="VD: Nhật Bản" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Emoji cờ</label>
          <input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇯🇵" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Số ngày xử lý</label>
          <input type="number" min={1} max={60} value={processingDays} onChange={e => setProcessingDays(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Phí dịch vụ Visa (VND)</label>
          <input type="number" min={0} value={visaFee} onChange={e => setVisaFee(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Ghi chú địa điểm Đại sứ quán / Lãnh sự quán</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Nộp tại 41 Mac Đinh Chi, Q.1, giờ 8:30-11:30 thứ 2-6" className={inputCls} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục giấy tờ ({docs.length})</label>
          <button onClick={addDoc} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition">
            <Plus className="h-3.5 w-3.5" /> Thêm giấy tờ
          </button>
        </div>
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={doc.documentName} onChange={e => updateDoc(i, "documentName", e.target.value)} placeholder="Tên loại giấy tờ"
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/60" />
                <input value={doc.description} onChange={e => updateDoc(i, "description", e.target.value)} placeholder="Hướng dẫn chi tiết cho khách"
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/60" />
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400">
                  <input type="checkbox" checked={doc.isMandatory} onChange={e => updateDoc(i, "isMandatory", e.target.checked)} className="accent-red-500" />
                  Bắt buộc
                </label>
                <button onClick={() => removeDoc(i)} className="p-1 text-slate-500 hover:text-red-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-bold transition">Hủy</button>
        <button onClick={handleSubmit} disabled={!country.trim() || docs.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-sky-500/25">
          <Save className="h-4 w-4" /> Lưu Mẫu Visa
        </button>
      </div>
    </div>
  );
};
