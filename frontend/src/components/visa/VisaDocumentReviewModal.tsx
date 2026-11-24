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
    badgeClass: 'bg-slate-700/70 text-slate-200 border-slate-600',
  },
  REVIEWING: {
    label: 'Đại lý đang sơ duyệt bản mềm',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
  },
  NEED_MORE_DOCS: {
    label: 'Bước 1 — Yêu cầu khách bổ sung / nộp lại bản mềm',
    badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  },
  SUBMITTED: {
    label: 'Bước 2 — Đại lý đã mang nộp tại ĐSQ (Offline)',
    badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
  },
  PROCESSING: {
    label: 'Bước 3 — ĐSQ đang xét duyệt (Chờ trả hộ chiếu)',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
  },
  APPROVED: {
    label: 'Bước 4 — Đã cấp Visa ✅ (Đã chốt kết quả)',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  },
  REJECTED: {
    label: 'Bước 5 — Từ chối cấp Visa ❌ (Đã chốt kết quả)',
    badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
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
    baseClass: 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20',
    activeClass: 'bg-amber-500/25 text-amber-100 border-amber-400 ring-2 ring-amber-400/30',
    pillClass: 'bg-amber-400/25 text-amber-100 border-amber-300/40',
  },
  {
    step: 2,
    status: 'SUBMITTED',
    label: '2. Xác nhận Đại lý đã mang nộp tại ĐSQ (Offline)',
    showSendIcon: true,
    baseClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25',
    activeClass: 'bg-sky-500/30 text-sky-100 border-sky-400 ring-2 ring-sky-400/30',
    pillClass: 'bg-sky-400/25 text-sky-100 border-sky-300/40',
  },
  {
    step: 3,
    status: 'PROCESSING',
    label: '3. ĐSQ đang xét duyệt hồ sơ (Chờ trả hộ chiếu)',
    baseClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
    activeClass: 'bg-indigo-500/30 text-indigo-100 border-indigo-400 ring-2 ring-indigo-400/30',
    pillClass: 'bg-indigo-400/25 text-indigo-100 border-indigo-300/40',
  },
  {
    step: 4,
    status: 'APPROVED',
    label: '4. Ghi nhận kết quả ĐSQ trả về: Đã cấp Visa ✅',
    isFinal: true,
    baseClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 font-bold',
    activeClass: 'bg-emerald-500/30 text-emerald-100 border-emerald-400 ring-2 ring-emerald-400/30 font-bold',
    pillClass: 'bg-emerald-400/25 text-emerald-100 border-emerald-300/40',
  },
  {
    step: 5,
    status: 'REJECTED',
    label: '5. Ghi nhận kết quả ĐSQ trả về: Từ chối cấp Visa ❌',
    isFinal: true,
    baseClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25 font-bold',
    activeClass: 'bg-rose-500/30 text-rose-100 border-rose-400 ring-2 ring-rose-400/30 font-bold',
    pillClass: 'bg-rose-400/25 text-rose-100 border-rose-300/40',
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
    badgeClass: 'bg-slate-700 text-slate-200 border-slate-600',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2.5 sm:p-4">
      <div className="bg-[#131d30] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92dvh] overflow-hidden flex flex-col border border-slate-700/60">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 sm:gap-4 p-4 sm:p-6 border-b border-slate-700/50">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
              Sơ Duyệt & Theo Dõi Ủy Quyền Visa — {application.customerName || `Booking #${application.bookingId}`}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">Đang ở bước:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentMeta.badgeClass}`}
              >
                {isFinalized && <Lock size={12} />}
                {currentMeta.label}
              </span>
              {application.visaDeadline && (
                <span className="text-xs text-amber-300">
                  • Hạn nộp: {new Date(application.visaDeadline).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c1424] flex flex-col lg:flex-row gap-6">
          {/* Left Column: Documents List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Bước 1: Nhân viên Đại lý kiểm tra tính hợp lệ của từng bản mềm
            </h3>

            {localDocs.length === 0 ? (
              <div className="text-center py-8 bg-[#131d30] rounded-xl border border-slate-700/50">
                <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
                <p className="text-slate-300 text-sm">Khách hàng chưa tải bản mềm giấy tờ nào lên hệ thống.</p>
              </div>
            ) : (
              localDocs.map((doc) => (
                <div key={doc.id} className="bg-[#131d30] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                  <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{doc.documentName}</h4>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {doc.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle size={13} /> Bản mềm đạt chuẩn
                            </span>
                          ) : doc.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <XCircle size={13} /> Yêu cầu chụp/tải lại
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock size={13} /> Chờ Đại lý kiểm tra
                            </span>
                          )}
                          {doc.reviewedBy && (
                            <span className="text-[11px] text-slate-400">bởi {doc.reviewedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.hasFile !== false && !doc.filePurged ? (
                        <button
                          type="button"
                          onClick={() => visaService.openDocumentInNewTab(doc.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg transition-colors border border-sky-500/20"
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
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                            activeDocId === doc.id
                              ? 'bg-sky-500 text-white border-sky-400'
                              : 'text-slate-300 bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          {doc.status === 'PENDING' ? 'Kiểm tra' : 'Đổi kết quả'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isFinalized && activeDocId === doc.id && (
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Ghi chú yêu cầu khách chụp/bổ sung lại (bắt buộc nếu từ chối bản mềm)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="VD: Ảnh chụp hộ chiếu bị lóa góc dưới, vui lòng scan hoặc chụp rõ nét lại..."
                        className="w-full px-3 py-2 border border-slate-700/50 rounded-md text-xs bg-[#131d30] text-white placeholder-slate-500 mb-3"
                        rows={2}
                      />
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                          className="flex items-center gap-1 px-4 py-2 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl font-bold text-xs transition-colors"
                        >
                          <XCircle size={15} /> Yêu cầu khách tải lại
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle size={15} /> Xác nhận bản mềm đạt
                        </button>
                      </div>
                    </div>
                  )}

                  {doc.status === 'REJECTED' && doc.vendorFeedback && (
                    <div className="p-3 bg-red-500/10 text-xs text-red-300 border-t border-red-500/20">
                      <strong>Yêu cầu bổ sung:</strong> {doc.vendorFeedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Column: Agency Offline Workflow Update */}
          <div className="w-full lg:w-96 space-y-4">
            <div className="bg-[#131d30] p-5 rounded-xl border border-slate-700/50 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sky-400">
                <Building2 size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider">
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
                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-600/60 text-xs text-slate-300 flex items-start gap-2">
                  <Lock size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Hồ sơ đã ghi nhận kết quả cuối cùng từ ĐSQ (Bước 4 hoặc Bước 5) và đã được <strong>khóa</strong>. Không thể thay đổi tiến độ nữa.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sau khi bấm chọn một bước tiến độ bên dưới, hệ thống sẽ lưu, gửi Email cho khách và tự động đóng cửa sổ này. Bước 4 & 5 là kết quả cuối, sau khi chọn sẽ khóa hồ sơ.
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mã biên nhận nộp hồ sơ VFS / KVAC / ĐSQ (nếu có)
                </label>
                <input
                  type="text"
                  value={receiptCode}
                  disabled={isFinalized || isUpdatingStatus}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  placeholder="VD: VFS-JP-2026-08912"
                  className="w-full px-3 py-2 border border-slate-700/50 rounded-lg text-xs bg-slate-800/60 text-white placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ghi chú gửi tới Email & Tracker của khách hàng
                </label>
                <textarea
                  value={appNotes}
                  disabled={isFinalized || isUpdatingStatus}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="VD: Đại lý đã nộp bộ hồ sơ đoàn tại VFS sáng nay, dự kiến 7 ngày làm việc có kết quả..."
                  className="w-full px-3 py-2 border border-slate-700/50 rounded-lg text-xs bg-slate-800/60 text-white placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                />
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-slate-300">
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
                      className={`w-full text-left px-3.5 py-2.5 border rounded-lg transition-all font-semibold text-xs flex items-center justify-between gap-2 ${
                        isCurrent ? step.activeClass : step.baseClass
                      } ${
                        disabled
                          ? isCurrent
                            ? 'cursor-not-allowed'
                            : 'opacity-40 cursor-not-allowed hover:bg-transparent'
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
