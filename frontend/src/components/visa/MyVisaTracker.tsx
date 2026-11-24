import React, { useRef, useState } from 'react';
import {
  UploadCloud, CheckCircle2, XCircle, Clock, FileText,
  AlertTriangle, Eye, RefreshCw, ShieldCheck, Send, History
} from 'lucide-react';
import { VisaApplicationResponse, VisaRequirementResponse, VisaDocumentStatus } from '../../types/visa';
import { visaService } from '../../services/visaService';

interface Props {
  application: VisaApplicationResponse;
  requirements: VisaRequirementResponse[];
  onUploadFile: (requirementId: number, file: File) => Promise<void>;
  onSubmitApplication?: () => Promise<void>;
}

const STEP_FLOW = [
  { key: 'PENDING_DOCS', label: '1. Nộp bản mềm' },
  { key: 'REVIEWING',    label: '2. Đại lý sơ duyệt' },
  { key: 'SUBMITTED',    label: '3. Đại lý nộp ĐSQ' },
  { key: 'PROCESSING',   label: '4. Chờ kết quả ĐSQ' },
  { key: 'APPROVED',     label: '5. Kết quả Visa' },
] as const;

export const MyVisaTracker: React.FC<Props> = ({
  application,
  requirements,
  onUploadFile,
  onSubmitApplication,
}) => {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedReqIdRef = useRef<number | null>(null);

  const isLocked = ['SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED'].includes(application.status);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const reqId = selectedReqIdRef.current;
    if (e.target.files && e.target.files.length > 0 && reqId) {
      const file = e.target.files[0];
      setErrorMsg('');
      setUploadingId(reqId);
      try {
        await onUploadFile(reqId, file);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Không thể tải tệp lên. Chỉ chấp nhận PDF/JPG/PNG tối đa 5MB.');
      } finally {
        setUploadingId(null);
        selectedReqIdRef.current = null;
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const openFilePicker = (reqId: number) => {
    selectedReqIdRef.current = reqId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const getStepItems = () => {
    const st = application.status;
    let currentIdx = 0;
    if (st === 'PENDING_DOCS') currentIdx = 0;
    else if (st === 'REVIEWING' || st === 'NEED_MORE_DOCS') currentIdx = 1;
    else if (st === 'SUBMITTED') currentIdx = 2;
    else if (st === 'PROCESSING') currentIdx = 3;
    else if (st === 'APPROVED' || st === 'REJECTED') currentIdx = 4;

    return STEP_FLOW.map((step, idx) => ({
      name:
        st === 'NEED_MORE_DOCS' && idx === 1
          ? '2. Cần bổ sung giấy tờ'
          : st === 'REJECTED' && idx === 4
          ? '5. Trượt Visa'
          : st === 'APPROVED' && idx === 4
          ? '5. Đã có Visa'
          : step.label,
      active: idx <= currentIdx,
      current: idx === currentIdx,
      isWarning: st === 'NEED_MORE_DOCS' && idx === 1,
      isRejected: st === 'REJECTED' && idx === 4,
    }));
  };

  const getDocStatusBadge = (status: VisaDocumentStatus | undefined) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 size={12} /> Bản mềm đạt chuẩn
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <XCircle size={12} /> Cần chụp / tải lại
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <Clock size={12} /> Chờ Đại lý kiểm tra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-700/50 text-slate-400 border border-slate-600/40">
        Chưa tải lên
      </span>
    );
  };

  const mandatoryReqs = requirements.filter((r) => r.isMandatory);
  const allMandatoryUploaded = mandatoryReqs.every((r) =>
    application.documents.some((d) => d.requirementId === r.id && d.hasFile !== false && d.status !== 'REJECTED')
  );

  return (
    <div className="bg-[#0b1322] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white">
      {/* Tracker Header */}
      <div className="bg-gradient-to-r from-sky-950 via-[#0e1a2f] to-indigo-950 p-4 sm:p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-sky-400">
                Dịch Vụ Ủy Quyền Đại Lý Hỗ Trợ Hồ Sơ Visa
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
              Hồ Sơ Visa #{application.bookingCode || application.bookingId}
            </h2>
          </div>
          <div className="text-left sm:text-right space-y-1">
            {application.visaDeadline && (
              <div className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1 inline-block">
                Hạn nộp bản mềm: {new Date(application.visaDeadline).toLocaleDateString('vi-VN')}
              </div>
            )}
            {application.embassyReceiptCode && (
              <div className="text-[11px] text-cyan-300 font-mono block">
                Mã biên nhận VFS/ĐSQ: <strong>{application.embassyReceiptCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Stepper 5 bước */}
        <div className="mt-6 overflow-x-auto pb-1">
          <div className="min-w-[420px] grid grid-cols-5 gap-2 relative">
            {getStepItems().map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-lg ${
                    step.isRejected
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                      : step.isWarning
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30'
                      : step.current
                      ? 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white ring-4 ring-sky-400/30 scale-105'
                      : step.active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-white/10'
                  }`}
                >
                  {step.isRejected || step.isWarning ? '!' : idx + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                    step.current ? 'text-sky-300' : step.active ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {application.notes && (
        <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 p-3.5 bg-sky-500/10 border border-sky-500/25 rounded-xl text-xs text-sky-200">
          <strong>Ghi chú tiến độ từ Đại lý:</strong> {application.notes}
        </div>
      )}

      {application.status === 'REJECTED' && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 text-rose-200">
          <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-rose-300">Thông báo kết quả từ ĐSQ: Không đạt thị thực</h4>
            <p className="text-xs text-rose-200/90 mt-1">
              Chuyên viên Đại lý sẽ liên hệ trực tiếp với bạn để hướng dẫn thủ tục hoàn/đổi tour theo chính sách bảo vệ khách hàng.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Document Upload Section */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-sky-400" /> Danh mục bản mềm giấy tờ gửi Đại lý sơ duyệt
          </h3>
          <span className="text-xs text-slate-400">
            {application.documents.filter((d) => d.status === 'APPROVED').length}/{requirements.length} bản mềm hợp lệ
          </span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="shrink-0 text-emerald-400 mt-0.5" size={16} />
          <p>
            <strong>Bảo mật giấy tờ cá nhân:</strong> Các tệp hộ chiếu/CCCD/sao kê (PDF, JPG, PNG tối đa 5MB) được lưu trữ riêng tư có kiểm quyền và tự động hủy sau khi kết thúc quy trình. Đại sứ quán không truy cập hệ thống này — chuyên viên Đại lý kiểm tra bản mềm trước khi đại diện đoàn nộp trực tiếp tại ĐSQ.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />

        <div className="space-y-3">
          {requirements.map((req) => {
            const uploadedDoc = application.documents.find((d) => d.requirementId === req.id);
            const isUploading = uploadingId === req.id;

            return (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl gap-4 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">{req.documentName}</h4>
                    {req.isMandatory ? (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Bổ trợ (Tùy chọn)</span>
                    )}
                    {getDocStatusBadge(uploadedDoc?.status)}
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{req.description}</p>
                  )}

                  {uploadedDoc?.originalFileName && (
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      Tệp đã nộp: {uploadedDoc.originalFileName}
                      {uploadedDoc.filePurged ? ' (Đã xóa bảo mật sau khi hoàn tất)' : ''}
                    </p>
                  )}

                  {uploadedDoc && uploadedDoc.status === 'REJECTED' && uploadedDoc.vendorFeedback && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                      <strong>Chuyên viên Đại lý yêu cầu chụp/tải lại:</strong> {uploadedDoc.vendorFeedback}
                    </div>
                  )}
                </div>

                {/* Upload / View action area */}
                <div className="shrink-0 flex items-center gap-2.5">
                  {!uploadedDoc ? (
                    <button
                      onClick={() => openFilePicker(req.id)}
                      disabled={isUploading || isLocked}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/20 disabled:opacity-50"
                    >
                      <UploadCloud size={15} />
                      {isUploading ? 'Đang tải lên...' : 'Tải bản mềm'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {uploadedDoc.hasFile !== false && !uploadedDoc.filePurged && (
                        <button
                          type="button"
                          onClick={() => visaService.openDocumentInNewTab(uploadedDoc.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-semibold transition"
                        >
                          <Eye size={13} /> Xem tệp
                        </button>
                      )}
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => openFilePicker(req.id)}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-bold transition"
                        >
                          <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
                          {isUploading ? 'Đang đổi...' : 'Đổi tệp'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Application Action Bar */}
        {!isLocked && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Tiến độ chuẩn bị bản mềm:</span>
                <span className="text-xs font-black text-sky-400">
                  {application.documents.length}/{requirements.length} tài liệu
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {allMandatoryUploaded
                  ? 'Đã đủ giấy tờ bắt buộc hợp lệ. Bấm gửi để chuyên viên Đại lý sơ duyệt hồ sơ.'
                  : 'Vui lòng tải đủ các giấy tờ BẮT BUỘC (và tải lại giấy tờ bị từ chối nếu có) trước khi gửi Đại lý.'}
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting || !allMandatoryUploaded}
              onClick={async () => {
                setErrorMsg('');
                try {
                  setIsSubmitting(true);
                  if (onSubmitApplication) {
                    await onSubmitApplication();
                  }
                  setSubmittedSuccess(true);
                  setTimeout(() => setSubmittedSuccess(false), 5000);
                } catch (err: any) {
                  setErrorMsg(err?.message || 'Không thể gửi hồ sơ sơ duyệt.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
                allMandatoryUploaded
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
              {isSubmitting
                ? 'Đang gửi cho Đại lý...'
                : application.status === 'REVIEWING'
                ? 'Cập nhật lại cho Đại lý sơ duyệt'
                : 'Gửi Bản Mềm Cho Đại Lý Sơ Duyệt'}
            </button>
          </div>
        )}

        {submittedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p>Đã gửi bản mềm cho chuyên viên Đại lý sơ duyệt!</p>
              <p className="font-normal text-[11px] text-emerald-200/80 mt-0.5">
                Sau khi kiểm tra đạt chuẩn, Đại lý sẽ đại diện đoàn nộp hồ sơ trực tiếp tại ĐSQ / Lãnh sự quán và cập nhật mã biên nhận tại đây.
              </p>
            </div>
          </div>
        )}

        {/* Lịch sử cập nhật trạng thái (VisaStatusLog) */}
        {application.statusLogs && application.statusLogs.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} className="text-sky-400" /> Nhật ký xử lý hồ sơ
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {application.statusLogs.map((log) => (
                <div key={log.id} className="text-[11px] bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex justify-between gap-3">
                  <span className="text-slate-300">
                    <strong className="text-sky-300">[{log.actorRole === 'VENDOR' ? 'Đại lý' : log.actorRole === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}]</strong>{' '}
                    {log.note || log.toStatus}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
