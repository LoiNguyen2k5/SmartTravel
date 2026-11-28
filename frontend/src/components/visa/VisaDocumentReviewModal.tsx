import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, FileText, AlertCircle, Clock, Eye, Send, Building2, Lock } from 'lucide-react';
import { VisaApplicationResponse, VisaDocumentStatus, VisaApplicationStatus } from '../../types/visa';
import { visaService } from '../../services/visaService';

interface Props {
  application: VisaApplicationResponse;
  onClose: () => void;
  onUpdateDocumentStatus: (documentId: number, status: VisaDocumentStatus, feedback?: string) => void;
  onUpdateApplicationStatus: (
    status: VisaApplicationStatus,
    notes?: string,
    embassyReceiptCode?: string
  ) => Promise<boolean | void> | boolean | void;
}

const STATUS_META: Record<VisaApplicationStatus, { label: string; badgeClass: string }> = {
  PENDING_DOCS: {
    label: 'Chờ khách tải bản mềm',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  REVIEWING: {
    label: 'Đại lý đang sơ duyệt bản mềm',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  NEED_MORE_DOCS: {
    label: 'Bước 1 — Yêu cầu khách bổ sung / nộp lại bản mềm',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  SUBMITTED: {
    label: 'Bước 2 — Đại lý đã mang nộp tại ĐSQ (Offline)',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  PROCESSING: {
    label: 'Bước 3 — ĐSQ đang xét duyệt (Chờ trả hộ chiếu)',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  APPROVED: {
    label: 'Bước 4 — Đã cấp Visa ✅ (Đã chốt kết quả)',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  REJECTED: {
    label: 'Bước 5 — Từ chối cấp Visa ❌ (Đã chốt kết quả)',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
  },
};

const PROGRESS_STEPS: {
  step: number;
  status: VisaApplicationStatus;
  label: string;
  isFinal?: boolean;
  showSendIcon?: boolean;
  baseClass: string;
  activeClass: string;
  pillClass: string;
}[] = [
  {
    step: 1,
    status: 'NEED_MORE_DOCS',
    label: '1. Yêu cầu khách bổ sung / nộp lại bản mềm',
    baseClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    activeClass: 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40 shadow-sm',
    pillClass: 'bg-white/25 text-white border-white/40',
  },
  {
    step: 2,
    status: 'SUBMITTED',
    label: '2. Xác nhận Đại lý đã mang nộp tại ĐSQ (Offline)',
    showSendIcon: true,
    baseClass: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100',
    activeClass: 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-400/40 shadow-sm',
    pillClass: 'bg-white/25 text-white border-white/40',
  },
  {
    step: 3,
    status: 'PROCESSING',
    label: '3. ĐSQ đang xét duyệt hồ sơ (Chờ trả hộ chiếu)',
    baseClass: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100',
    activeClass: 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-400/40 shadow-sm',
    pillClass: 'bg-white/25 text-white border-white/40',
  },
  {
    step: 4,
    status: 'APPROVED',
    label: '4. Ghi nhận kết quả ĐSQ trả về: Đã cấp Visa ✅',
    isFinal: true,
    baseClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold',
    activeClass: 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/40 font-bold shadow-sm',
    pillClass: 'bg-white/25 text-white border-white/40',
  },
  {
    step: 5,
    status: 'REJECTED',
    label: '5. Ghi nhận kết quả ĐSQ trả về: Từ chối cấp Visa ❌',
    isFinal: true,
    baseClass: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100 font-bold',
    activeClass: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400/40 font-bold shadow-sm',
    pillClass: 'bg-white/25 text-white border-white/40',
  },
];

export const VisaDocumentReviewModal: React.FC<Props> = ({
  application,
  onClose,
  onUpdateDocumentStatus,
  onUpdateApplicationStatus,
}) => {
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [appNotes, setAppNotes] = useState(application.notes || '');
  const [receiptCode, setReceiptCode] = useState(application.embassyReceiptCode || '');
  const [localDocs, setLocalDocs] = useState(application.documents);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isFinalized = application.status === 'APPROVED' || application.status === 'REJECTED';
  const currentMeta = STATUS_META[application.status] || {
    label: application.status,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  useEffect(() => {
    setLocalDocs(application.documents);
    setAppNotes(application.notes || '');
    setReceiptCode(application.embassyReceiptCode || '');
  }, [application]);

  const handleDocumentAction = (documentId: number, status: VisaDocumentStatus) => {
    if (isFinalized) return;
    setLocalDocs((prev) =>
      prev.map((d) =>
        Number(d.id) === Number(documentId)
          ? { ...d, status, vendorFeedback: status === 'REJECTED' ? feedback : undefined }
          : d
      )
    );
    onUpdateDocumentStatus(documentId, status, status === 'REJECTED' ? feedback : undefined);
    setActiveDocId(null);
    setFeedback('');
  };

  const handleStatusAction = async (targetStatus: VisaApplicationStatus) => {
    if (isFinalized || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const result = await onUpdateApplicationStatus(targetStatus, appNotes, receiptCode);
      if (result !== false) {
        onClose();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2.5 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92dvh] overflow-hidden flex flex-col border border-[#E6E1DA]">
        {/* Header — Deep Ocean brand strip */}
        <div className="flex justify-between items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-[#0B3B49] via-[#0F4C5C] to-[#0D9488] text-white">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-white leading-snug">
              Sơ Duyệt & Theo Dõi Ủy Quyền Visa — {application.customerName || `Booking #${application.bookingId}`}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-[#CCFBF1] font-medium">Đang ở bước:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentMeta.badgeClass}`}
              >
                {isFinalized && <Lock size={12} />}
                {currentMeta.label}
              </span>
              {application.visaDeadline && (
                <span className="text-xs font-bold text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full">
                  Hạn nộp: {new Date(application.visaDeadline).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5] flex flex-col lg:flex-row gap-6">
          {/* Left Column: Documents List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-extrabold text-[#0B3B49] uppercase tracking-wider">
              Bước 1: Nhân viên Đại lý kiểm tra tính hợp lệ của từng bản mềm
            </h3>

            {localDocs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-[#E6E1DA]">
                <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
                <p className="text-[#475569] font-medium text-sm">Khách hàng chưa tải bản mềm giấy tờ nào lên hệ thống.</p>
              </div>
            ) : (
              localDocs.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-[#E6E1DA] overflow-hidden shadow-sm">
                  <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#E6F4F1] text-[#0D9488] rounded-xl border border-[#99F6E4]">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-sm">{doc.documentName}</h4>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {doc.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle size={13} /> Bản mềm đạt chuẩn
                            </span>
                          ) : doc.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle size={13} /> Yêu cầu chụp/tải lại
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock size={13} /> Chờ Đại lý kiểm tra
                            </span>
                          )}
                          {doc.reviewedBy && (
                            <span className="text-[11px] text-slate-500">bởi {doc.reviewedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.hasFile !== false && !doc.filePurged ? (
                        <button
                          type="button"
                          onClick={() => visaService.openDocumentInNewTab(doc.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0B3B49] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-lg transition-colors border border-[#0D9488]/30 cursor-pointer"
                        >
                          <Eye size={14} /> Mở tệp bảo mật
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Tệp đã xóa bảo mật</span>
                      )}
                      {!isFinalized && (
                        <button
                          type="button"
                          onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border cursor-pointer ${
                            activeDocId === doc.id
                              ? 'bg-[#0B3B49] text-white border-[#0B3B49]'
                              : 'text-[#0F172A] bg-slate-100 hover:bg-slate-200 border-slate-300'
                          }`}
                        >
                          {doc.status === 'PENDING' ? 'Kiểm tra' : 'Đổi kết quả'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isFinalized && activeDocId === doc.id && (
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#E6E1DA]">
                      <label className="block text-xs font-bold text-[#475569] mb-2">
                        Ghi chú yêu cầu khách chụp/bổ sung lại (bắt buộc nếu từ chối bản mềm)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="VD: Ảnh chụp hộ chiếu bị lóa góc dưới, vui lòng scan hoặc chụp rõ nét lại..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0D9488] mb-3"
                        rows={2}
                      />
                      <div className="flex gap-2.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          <XCircle size={15} /> Yêu cầu khách tải lại
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        >
                          <CheckCircle size={15} /> Xác nhận bản mềm đạt
                        </button>
                      </div>
                    </div>
                  )}

                  {doc.status === 'REJECTED' && doc.vendorFeedback && (
                    <div className="p-3 bg-rose-50 text-xs text-rose-800 border-t border-rose-200">
                      <strong>Yêu cầu bổ sung:</strong> {doc.vendorFeedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Column: Agency Offline Workflow Update */}
          <div className="w-full lg:w-96 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-[#E6E1DA] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#0B3B49]">
                <Building2 size={18} className="text-[#0D9488]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">
                  Bước 2: Đại lý cập nhật tiến độ nộp ĐSQ & Kết quả
                </h3>
              </div>

              <div className={`p-3 rounded-xl border text-xs ${currentMeta.badgeClass}`}>
                <p className="text-[11px] opacity-80 font-medium">Trạng thái tiến độ hiện tại:</p>
                <p className="font-bold mt-0.5 flex items-center gap-1.5">
                  {isFinalized && <Lock size={13} className="shrink-0" />}
                  {currentMeta.label}
                </p>
              </div>

              {isFinalized ? (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-start gap-2">
                  <Lock size={15} className="text-slate-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Hồ sơ đã ghi nhận kết quả cuối cùng từ ĐSQ (Bước 4 hoặc Bước 5) và đã được <strong>khóa</strong>. Không thể thay đổi tiến độ nữa.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#526071] leading-relaxed">
                  Sau khi bấm chọn một bước tiến độ bên dưới, hệ thống sẽ lưu, gửi Email cho khách và tự động đóng cửa sổ này. Bước 4 & 5 là kết quả cuối, sau khi chọn sẽ khóa hồ sơ.
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Mã biên nhận nộp hồ sơ VFS / KVAC / ĐSQ (nếu có)
                </label>
                <input
                  type="text"
                  value={receiptCode}
                  disabled={isFinalized || isUpdatingStatus}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  placeholder="VD: VFS-JP-2026-08912"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#0D9488] text-[#0F172A] placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Ghi chú gửi tới Email & Tracker của khách hàng
                </label>
                <textarea
                  value={appNotes}
                  disabled={isFinalized || isUpdatingStatus}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="VD: Đại lý đã nộp bộ hồ sơ đoàn tại VFS sáng nay, dự kiến 7 ngày làm việc có kết quả..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#0D9488] text-[#0F172A] placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                />
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-extrabold text-[#0F172A]">
                  Chuyển bước tiến độ (Do Đại lý thao tác):
                </p>

                {PROGRESS_STEPS.map((step) => {
                  const isCurrent = application.status === step.status;
                  const disabled = isFinalized || isUpdatingStatus;

                  return (
                    <button
                      key={step.status}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleStatusAction(step.status)}
                      className={`w-full text-left px-3.5 py-2.5 border rounded-xl transition-all font-semibold text-xs flex items-center justify-between gap-2 ${
                        isCurrent ? step.activeClass : step.baseClass
                      } ${
                        disabled
                          ? isCurrent
                            ? 'cursor-not-allowed'
                            : 'opacity-45 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <span className="leading-snug">{step.label}</span>
                      <span className="shrink-0 flex items-center gap-1.5">
                        {isCurrent && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${step.pillClass}`}
                          >
                            {isFinalized ? 'Đã chốt' : 'Đang ở bước này'}
                          </span>
                        )}
                        {!isCurrent && step.showSendIcon && <Send size={13} />}
                        {isFinalized && isCurrent && <Lock size={13} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
