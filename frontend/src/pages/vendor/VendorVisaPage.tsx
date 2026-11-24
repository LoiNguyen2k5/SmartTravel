import React, { useState, useEffect, useCallback } from "react";
import {
  Globe, FileText, Clock, CheckCircle2, XCircle,
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Search, Filter, Eye, Lock, BookOpen, TrendingUp,
  CalendarDays, Users, AlertOctagon
} from "lucide-react";
import { visaService } from "../../services/visaService";
import {
  VisaApplicationResponse,
  VisaApplicationStatus,
  VisaDocumentStatus,
  VisaTemplate,
  VisaTemplateDocument,
  VisaTemplateRequest,
} from "../../types/visa";
import { VisaDocumentReviewModal } from "../../components/visa/VisaDocumentReviewModal";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

const calcDeadline = (app: VisaApplicationResponse): Date | null => {
  if (app.visaDeadline) {
    return new Date(app.visaDeadline);
  }
  if (!app.departureDate) return null;
  const dep = new Date(app.departureDate);
  dep.setDate(dep.getDate() - ((app.processingDays ?? 7) + (app.bufferDays ?? 3)));
  return dep;
};

const getDeadlineBadge = (app: VisaApplicationResponse) => {
  if (app.status === "APPROVED" || app.status === "REJECTED") return null;
  const dl = calcDeadline(app);
  if (!dl) return null;
  const diffDays = Math.ceil((dl.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return { label: `Trễ ${Math.abs(diffDays)} ngày!`, color: "bg-red-500/20 text-red-300 border-red-500/30" };
  if (diffDays <= 3) return { label: `Còn ${diffDays} ngày`, color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
  if (diffDays <= 7) return { label: `Còn ${diffDays} ngày`, color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
  return { label: `Còn ${diffDays} ngày`, color: "bg-slate-700 text-slate-300 border-slate-600" };
};

const STATUS_MAP: Record<VisaApplicationStatus, { label: string; color: string }> = {
  PENDING_DOCS:   { label: "Chờ tải bản mềm",                    color: "bg-slate-700/60 text-slate-300 border-slate-600" },
  REVIEWING:      { label: "Chờ Đại lý sơ duyệt",                color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  NEED_MORE_DOCS: { label: "Bước 1 • Chờ khách bổ sung",         color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  SUBMITTED:      { label: "Bước 2 • Đại lý đã nộp ĐSQ",         color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  PROCESSING:     { label: "Bước 3 • Chờ kết quả từ ĐSQ",        color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  APPROVED:       { label: "Bước 4 • ĐSQ đã cấp Visa ✅",        color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  REJECTED:       { label: "Bước 5 • ĐSQ từ chối Visa ❌",       color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

type Tab = "applications" | "templates";

export const VendorVisaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [applications, setApplications] = useState<VisaApplicationResponse[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<VisaApplicationResponse | null>(null);

  const [templates, setTemplates] = useState<VisaTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<VisaTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await visaService.getAllApplications();
      setApplications(res || []);
    } catch (err) {
      console.error("Lỗi tải hồ sơ visa:", err);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const list = await visaService.getTemplates();
      setTemplates(list || []);
    } catch (err) {
      console.error("Lỗi tải thư viện mẫu visa:", err);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchTemplates();
  }, [fetchApplications, fetchTemplates]);

  const stats = {
    waiting: applications.filter(a => ["PENDING_DOCS", "REVIEWING", "NEED_MORE_DOCS"].includes(a.status)).length,
    processing: applications.filter(a => ["SUBMITTED", "PROCESSING"].includes(a.status)).length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
    urgent: applications.filter(a => {
      const dl = calcDeadline(a);
      if (!dl || a.status === "APPROVED" || a.status === "REJECTED") return false;
      return (dl.getTime() - Date.now()) / 86400000 <= 3;
    }).length,
  };

  const handleUpdateDoc = async (docId: number, status: VisaDocumentStatus, feedback?: string) => {
    if (!selectedApp) return;
    try {
      const updated = await visaService.updateDocumentStatus(docId, status, feedback);
      if (updated) {
        setSelectedApp(updated);
      }
      await fetchApplications();
    } catch (e: any) {
      alert(e?.message || "Không thể cập nhật trạng thái giấy tờ.");
      await fetchApplications();
    }
  };

  const handleUpdateAppStatus = async (
    status: VisaApplicationStatus,
    notes?: string,
    embassyReceiptCode?: string
  ): Promise<boolean> => {
    if (!selectedApp) return false;
    try {
      await visaService.updateApplicationStatus(
        selectedApp.id,
        status,
        notes,
        embassyReceiptCode
      );
      await fetchApplications();
      setSelectedApp(null);
      return true;
    } catch (e: any) {
      alert(e?.message || "Không thể cập nhật tiến độ hồ sơ.");
      return false;
    }
  };

  const filteredApps = applications.filter(a => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      a.bookingId.toString().includes(searchTerm) ||
      (a.bookingCode?.toLowerCase().includes(q) ?? false) ||
      (a.customerName?.toLowerCase().includes(q) ?? false) ||
      (a.tourTitle?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  const handleSaveTemplate = async (req: VisaTemplateRequest, editingId?: number) => {
    try {
      if (editingId) {
        await visaService.updateTemplate(editingId, req);
      } else {
        await visaService.createTemplate(req);
      }
      await fetchTemplates();
      setEditingTemplate(null);
      setShowTemplateForm(false);
    } catch (err: any) {
      alert(err?.message || "Không thể lưu mẫu Visa.");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa mẫu Visa này?")) return;
    try {
      await visaService.deleteTemplate(id);
      await fetchTemplates();
    } catch (err: any) {
      alert(err?.message || "Không thể xóa mẫu Visa.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Globe className="h-5 w-5 text-[#0F172A]" />
          </span>
          Quản Lý Dịch Vụ Ủy Quyền Hồ Sơ Visa
        </h1>
        <p className="text-[#526071] text-sm mt-2">
          Chuyên viên Đại lý sơ duyệt bản mềm trực tuyến, đại diện đoàn nộp trực tiếp tại ĐSQ/LSQ và ghi nhận kết quả trả về
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Sơ duyệt / Bổ sung", value: stats.waiting, Icon: Clock, col: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30", txt: "text-yellow-300" },
          { label: "Đã nộp ĐSQ (Offline)", value: stats.processing, Icon: CalendarDays, col: "from-sky-500/20 to-blue-600/20 border-sky-500/30", txt: "text-sky-300" },
          { label: "Sắp tới hạn nộp", value: stats.urgent, Icon: AlertOctagon, col: "from-orange-500/20 to-red-600/20 border-orange-500/30", txt: "text-orange-300" },
          { label: "ĐSQ đã cấp Visa", value: stats.approved, Icon: CheckCircle2, col: "from-emerald-500/20 to-teal-600/20 border-emerald-500/30", txt: "text-emerald-300" },
          { label: "ĐSQ từ chối Visa", value: stats.rejected, Icon: XCircle, col: "from-red-500/20 to-rose-600/20 border-red-500/30", txt: "text-red-300" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.col} border rounded-2xl p-4 flex items-center gap-3`}>
            <s.Icon className={`h-8 w-8 ${s.txt} shrink-0`} />
            <div>
              <p className={`text-2xl font-black ${s.txt}`}>{s.value}</p>
              <p className="text-[11px] text-[#526071] leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-700/50 rounded-xl p-1 w-fit">
        {([
          { key: "applications" as Tab, label: "Sơ Duyệt & Theo Dõi Hồ Sơ", Icon: FileText },
          { key: "templates" as Tab, label: "Thư Viện Mẫu Visa Quốc Gia", Icon: BookOpen },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.Icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Xử lý hồ sơ */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#526071]" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã booking, tên khách, tên tour..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-700/50 rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-sky-500/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#526071] shrink-0" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-700/50 rounded-xl text-sm text-[#0F172A] py-2.5 px-3 focus:outline-none focus:border-sky-500/60"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING_DOCS">Chờ tải bản mềm</option>
                <option value="REVIEWING">Chờ Đại lý sơ duyệt</option>
                <option value="NEED_MORE_DOCS">Chờ khách bổ sung</option>
                <option value="SUBMITTED">Đại lý đã nộp ĐSQ (Offline)</option>
                <option value="PROCESSING">Chờ kết quả ĐSQ</option>
                <option value="APPROVED">ĐSQ đã cấp Visa</option>
                <option value="REJECTED">ĐSQ từ chối Visa</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {["Mã Booking", "Khách Hàng", "Tour", "Bản Mềm", "Hạn Nộp Hồ Sơ", "Trạng Thái", "Thao Tác"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-[#526071] uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {loadingApps ? (
                    <tr><td colSpan={7} className="text-center py-12 text-[#526071]">Đang tải dữ liệu từ máy chủ...</td></tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <Globe className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-[#526071] font-medium">Chưa có hồ sơ ủy quyền Visa nào</p>
                        <p className="text-slate-500 text-sm mt-1">Hồ sơ của khách đặt các tour quốc tế thuộc quản lý của Đại lý bạn sẽ hiển thị tại đây</p>
                      </td>
                    </tr>
                  ) : filteredApps.map(app => {
                    const cfg = STATUS_MAP[app.status] || STATUS_MAP.PENDING_DOCS;
                    const dl = calcDeadline(app);
                    const dlBadge = getDeadlineBadge(app);
                    const docsApproved = app.documents.filter(d => d.status === "APPROVED").length;
                    const docsTotal = app.documents.length;
                    return (
                      <tr key={app.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-mono text-[#0D9488] font-bold text-sm">
                            #{app.bookingCode || app.bookingId}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-[#0F172A] text-sm">{app.customerName || "Khách hàng"}</p>
                          {app.contactEmail && <p className="text-xs text-[#526071] mt-0.5">{app.contactEmail}</p>}
                        </td>
                        <td className="px-4 py-4 max-w-[180px]">
                          <p className="text-sm text-[#334155] line-clamp-2 leading-snug">{app.tourTitle || "—"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full transition-all"
                                style={{ width: docsTotal > 0 ? `${(docsApproved / docsTotal) * 100}%` : "0%" }}
                              />
                            </div>
                            <span className="text-xs text-[#526071] whitespace-nowrap">{docsApproved}/{docsTotal}</span>
                          </div>
                          {app.documents.some(d => d.status === "REJECTED") && (
                            <span className="text-[11px] text-red-400 mt-1 block">Cần khách bổ sung lại</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {dl ? (
                            <div>
                              <p className="text-sm text-[#475569]">
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
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {app.status === "APPROVED" || app.status === "REJECTED" ? (
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-[#475569] border border-slate-600/50 rounded-lg text-xs font-bold transition-all"
                            >
                              <Lock className="h-3.5 w-3.5" /> Xem hồ sơ (Đã chốt)
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-[#0B3B49] border border-sky-500/20 rounded-lg text-xs font-bold transition-all"
                            >
                              <Eye className="h-3.5 w-3.5" /> Kiểm tra & Cập nhật
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredApps.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-700/30 text-xs text-[#526071]">
                Hiển thị {filteredApps.length}/{applications.length} hồ sơ thuộc tour của Đại lý
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Thư viện mẫu */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[#526071] text-sm">
              Quản lý mẫu hồ sơ Visa theo quốc gia trên Database (tách bạch Phí dịch vụ Đại lý và Lệ phí Lãnh sự).
            </p>
            <button
              onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/25"
            >
              <Plus className="h-4 w-4" /> Thêm Mẫu Mới
            </button>
          </div>

          {showTemplateForm && (
            <TemplateForm
              initial={editingTemplate}
              onSave={(req) => handleSaveTemplate(req, editingTemplate?.id)}
              onCancel={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
            />
          )}

          {loadingTemplates ? (
            <div className="text-center py-12 text-[#526071] text-sm">Đang tải thư viện mẫu Visa...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-white border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{t.flagEmoji}</span>
                      <div>
                        <h3 className="font-black text-[#0F172A] text-base">{t.country}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#526071]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.processingDays} ngày ĐSQ + {t.bufferDays ?? 3} ngày sơ duyệt
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-700" />
                            <span className="text-emerald-700 font-bold">DV: {fmtCurrency(t.visaFee)}</span>
                          </span>
                          {(t.consularFee ?? 0) > 0 && (
                            <span className="text-amber-800">Lãnh sự: {fmtCurrency(t.consularFee ?? 0)}</span>
                          )}
                          {t.tourCount !== undefined && (
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.tourCount} tour</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingTemplate(t); setShowTemplateForm(true); }}
                        className="p-2 text-[#526071] hover:text-[#0F172A] hover:bg-[#FAF8F5] rounded-lg transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="p-2 text-[#526071] hover:text-red-400 hover:bg-red-500/5 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)}
                        className="p-2 text-[#526071] hover:text-[#0F172A] hover:bg-[#FAF8F5] rounded-lg transition"
                      >
                        {expandedTemplate === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {expandedTemplate === t.id && (
                    <div className="p-5 space-y-2.5">
                      {t.notes && (
                        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-[#0B3B49]">
                          <strong>Hướng dẫn nộp tại ĐSQ/Trung tâm thị thực:</strong> {t.notes}
                        </div>
                      )}
                      <p className="text-xs font-bold text-[#526071] uppercase tracking-wider">
                        Danh mục giấy tờ ({t.documents.length})
                      </p>
                      {t.documents.map((doc, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <span
                            className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              doc.isMandatory ? "bg-red-500/20 text-red-300" : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {doc.isMandatory ? "!" : "o"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {doc.documentName}
                              {doc.isMandatory && (
                                <span className="ml-2 text-[10px] font-black text-red-400 border border-red-500/30 rounded px-1">
                                  BẮT BUỘC
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#526071] mt-0.5">{doc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal sơ duyệt & cập nhật tiến độ */}
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
  { code: "EU", flag: "🇪🇺", name: "Khối Schengen (Châu Âu)" },
  { code: "CN", flag: "🇨🇳", name: "Trung Quốc" },
  { code: "TW", flag: "🇹🇼", name: "Đài Loan" },
  { code: "US", flag: "🇺🇸", name: "Mỹ" },
  { code: "AU", flag: "🇦🇺", name: "Úc" },
  { code: "GB", flag: "🇬🇧", name: "Anh" },
  { code: "OTHER", flag: "🌍", name: "Quốc gia khác" },
];

interface TemplateFormProps {
  initial: VisaTemplate | null;
  onSave: (t: VisaTemplateRequest) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ initial, onSave, onCancel }) => {
  const [country, setCountry] = useState(initial?.country ?? "");
  const [countryCode, setCountryCode] = useState(initial?.countryCode ?? "JP");
  const [flagEmoji, setFlagEmoji] = useState(initial?.flagEmoji ?? "🌍");
  const [processingDays, setProcessingDays] = useState(initial?.processingDays ?? 7);
  const [bufferDays, setBufferDays] = useState(initial?.bufferDays ?? 3);
  const [visaFee, setVisaFee] = useState(initial?.visaFee ?? 1000000);
  const [consularFee, setConsularFee] = useState(initial?.consularFee ?? 600000);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [docs, setDocs] = useState<Omit<VisaTemplateDocument, "id">[]>(
    initial?.documents.map(d => ({
      documentName: d.documentName,
      description: d.description,
      isMandatory: d.isMandatory,
    })) ?? [{ documentName: "Hộ chiếu (còn hạn ít nhất 6 tháng)", description: "Scan trang ảnh rõ nét.", isMandatory: true }]
  );

  const pickFlag = (opt: typeof FLAG_OPTIONS[0]) => {
    setFlagEmoji(opt.flag);
    setCountryCode(opt.code);
    if (!country) setCountry(opt.name);
  };

  const addDoc = () => setDocs([...docs, { documentName: "", description: "", isMandatory: true }]);
  const removeDoc = (i: number) => setDocs(docs.filter((_, idx) => idx !== i));
  const updateDoc = (i: number, field: keyof typeof docs[0], value: any) =>
    setDocs(docs.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));

  const handleSubmit = () => {
    if (!country.trim() || docs.length === 0) return;
    onSave({
      country: country.trim(),
      countryCode: (countryCode || "XX").trim(),
      flagEmoji,
      processingDays,
      bufferDays,
      visaFee,
      consularFee,
      notes,
      documents: docs.filter(d => d.documentName.trim() !== ""),
    });
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/60";

  return (
    <div className="bg-white border border-sky-500/30 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#0F172A] text-base">
          {initial ? "Chỉnh Sửa Mẫu Hồ Sơ Visa" : "Thêm Mẫu Hồ Sơ Visa Mới"}
        </h3>
        <button onClick={onCancel} className="p-2 text-[#526071] hover:text-[#0F172A] rounded-lg transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#526071] uppercase tracking-wider mb-2">Chọn quốc gia nhanh</label>
        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              type="button"
              onClick={() => pickFlag(opt)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                countryCode === opt.code
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                  : "bg-slate-800 border-slate-700/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              {opt.flag} {opt.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Tên quốc gia *</label>
          <input value={country} onChange={e => setCountry(e.target.value)} placeholder="VD: Nhật Bản" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Mã quốc gia (ISO)</label>
          <input value={countryCode} onChange={e => setCountryCode(e.target.value.toUpperCase())} placeholder="JP" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Emoji cờ</label>
          <input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇯🇵" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Số ngày ĐSQ xử lý</label>
          <input type="number" min={1} max={60} value={processingDays} onChange={e => setProcessingDays(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Số ngày Đại lý sơ duyệt (Buffer)</label>
          <input type="number" min={0} max={30} value={bufferDays} onChange={e => setBufferDays(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#526071] mb-1">Phí dịch vụ Đại lý (VND)</label>
          <input type="number" min={0} value={visaFee} onChange={e => setVisaFee(Number(e.target.value))} className={inputCls} />
        </div>
        <div className="col-span-2 lg:col-span-3">
          <label className="block text-xs font-bold text-amber-800 mb-1">
            Lệ phí Lãnh sự tham khảo (VND - Để riêng theo quy định ĐSQ, không cộng gộp vào giá thanh toán online)
          </label>
          <input type="number" min={0} value={consularFee} onChange={e => setConsularFee(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#526071] mb-1">
          Ghi chú địa điểm Đại lý nộp hồ sơ (VFS Global / KVAC / Lãnh sự quán)
        </label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Đại lý nộp hồ sơ đoàn tại KVAC Quận 1..." className={inputCls} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#526071] uppercase tracking-wider">Danh mục giấy tờ ({docs.length})</label>
          <button
            type="button"
            onClick={addDoc}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm giấy tờ
          </button>
        </div>
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={doc.documentName}
                  onChange={e => updateDoc(i, "documentName", e.target.value)}
                  placeholder="Tên loại giấy tờ"
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-sky-500/60"
                />
                <input
                  value={doc.description}
                  onChange={e => updateDoc(i, "description", e.target.value)}
                  placeholder="Hướng dẫn chi tiết cho khách"
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-sky-500/60"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#526071]">
                  <input
                    type="checkbox"
                    checked={doc.isMandatory}
                    onChange={e => updateDoc(i, "isMandatory", e.target.checked)}
                    className="accent-red-500"
                  />
                  Bắt buộc
                </label>
                <button type="button" onClick={() => removeDoc(i)} className="p-1 text-slate-500 hover:text-red-400 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-[#334155] rounded-xl text-sm font-bold transition">
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!country.trim() || docs.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-sky-500/25"
        >
          <Save className="h-4 w-4" /> Lưu Mẫu Visa
        </button>
      </div>
    </div>
  );
};
