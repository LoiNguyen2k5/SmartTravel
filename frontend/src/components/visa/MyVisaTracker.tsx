import React, { useRef, useState } from 'react';
import {
  UploadCloud, CheckCircle2, XCircle, Clock, FileText,
  AlertTriangle, Eye, RefreshCw, Sparkles, Send
} from 'lucide-react';
import { VisaApplicationResponse, VisaRequirementResponse, VisaDocumentStatus } from '../../types/visa';

interface Props {
  application: VisaApplicationResponse;
  requirements: VisaRequirementResponse[];
  onUploadFile: (requirementId: number, file: File) => Promise<void>;
  onSubmitApplication?: () => Promise<void>;
}

export const MyVisaTracker: React.FC<Props> = ({ application, requirements, onUploadFile, onSubmitApplication }) => {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedReqIdRef = useRef<number | null>(null);

  const isLocked = application.status === 'PROCESSING' || application.status === 'APPROVED';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const reqId = selectedReqIdRef.current;
    if (e.target.files && e.target.files.length > 0 && reqId) {
      const file = e.target.files[0];
      setUploadingId(reqId);
      try {
        await onUploadFile(reqId, file);
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

  const getStepStatus = (status: string) => {
    const steps = ['PENDING_DOCS', 'PROCESSING', 'APPROVED'];
    const currentIndex = steps.indexOf(status === 'REJECTED' ? 'PENDING_DOCS' : status);

    return steps.map((s, idx) => ({
      name: s === 'PENDING_DOCS' ? 'Nộp hồ sơ' : s === 'PROCESSING' ? 'Đang xử lý (ĐSQ)' : 'Đã cấp Visa',
      active: idx <= currentIndex,
      current: idx === currentIndex,
      isRejected: status === 'REJECTED' && idx === currentIndex,
    }));
  };

  const getDocStatusBadge = (status: VisaDocumentStatus | undefined) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 size={12} /> Hợp lệ
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <XCircle size={12} /> Cần bổ sung
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <Clock size={12} /> Chờ duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-700/50 text-slate-400 border border-slate-600/40">
        Chưa nộp
      </span>
    );
  };

  return (
    <div className="bg-[#0b1322] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white">
      {/* Tracker Header */}
      <div className="bg-gradient-to-r from-sky-950 via-[#0e1a2f] to-indigo-950 p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-400">Tiến Độ Thủ Tục Visa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Hồ Sơ Visa Booking #{application.bookingId}</h2>
          </div>
          {application.tourTitle && (
            <p className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 max-w-xs truncate">
              {application.tourTitle}
            </p>
          )}
        </div>

        {/* Stepper */}
        <div className="mt-8 flex items-center justify-between relative px-2 sm:px-6">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
          {getStepStatus(application.status).map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-lg ${
                  step.isRejected
                    ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                    : step.current
                    ? 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white ring-4 ring-sky-400/30 scale-110'
                    : step.active
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {step.isRejected ? '!' : idx + 1}
              </div>
              <span
                className={`text-[11px] font-bold text-center ${
                  step.current ? 'text-sky-300' : step.active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {application.status === 'REJECTED' && (
        <div className="m-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 text-rose-200">
          <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-rose-300">Rất tiếc, hồ sơ xin Visa của bạn đã bị từ chối</h4>
            <p className="text-xs text-rose-200/90 mt-1">{application.notes || 'Vui lòng liên hệ bộ phận hỗ trợ khách hàng để được tư vấn thêm.'}</p>
          </div>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-sky-400" /> Danh sách giấy tờ cần nộp Online
          </h3>
          <span className="text-xs text-slate-400">
            {application.documents.filter(d => d.status === 'APPROVED').length}/{requirements.length} đã hợp lệ
          </span>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 text-xs text-sky-200 flex items-start gap-2.5">
          <Sparkles className="shrink-0 text-sky-400 mt-0.5" size={16} />
          <p>
            Quý khách tải lên bản chụp rõ nét hoặc file scan (PDF/ảnh). Nếu <strong>chọn nhầm file</strong>, bạn có thể nhấp trực tiếp vào ảnh hoặc bấm <strong>"Đổi file khác"</strong> bất cứ lúc nào!
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf"
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
                    <h4 className="font-bold text-white text-sm">
                      {req.documentName}
                    </h4>
                    {req.isMandatory ? (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Tự chọn</span>
                    )}
                    {getDocStatusBadge(uploadedDoc?.status)}
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{req.description}</p>
                  )}

                  {uploadedDoc && uploadedDoc.status === 'REJECTED' && uploadedDoc.vendorFeedback && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                      <strong>Lý do yêu cầu nộp lại:</strong> {uploadedDoc.vendorFeedback}
                    </div>
                  )}
                </div>

                {/* Upload action area */}
                <div className="shrink-0 flex items-center gap-3">
                  {!uploadedDoc ? (
                    <button
                      onClick={() => openFilePicker(req.id)}
                      disabled={isUploading || isLocked}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/20 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Đang tải lên...
                        </span>
                      ) : (
                        <>
                          <UploadCloud size={16} /> Chọn File Tải Lên
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Thumbnail Preview - Click to re-select file if wrong */}
                      <div
                        onClick={() => {
                          if (!isLocked && !isUploading) {
                            openFilePicker(req.id);
                          }
                        }}
                        title={isLocked ? "Hồ sơ đang xử lý" : "Nhấp vào đây để chọn lại file khác nếu chọn nhầm"}
                        className={`relative group w-14 h-14 rounded-xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center ${
                          isLocked ? 'cursor-default' : 'cursor-pointer hover:border-sky-400 ring-2 ring-transparent hover:ring-sky-400/30'
                        } transition-all`}
                      >
                        <img
                          src={uploadedDoc.fileUrl}
                          alt="Document Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
                          }}
                        />
                        {!isLocked && (
                          <div className="absolute inset-0 bg-sky-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                            <RefreshCw size={16} className="text-sky-300 animate-spin-once" />
                            <span className="text-[9px] font-bold text-sky-200 mt-1">Đổi file</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5">
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => openFilePicker(req.id)}
                            disabled={isUploading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-bold transition"
                          >
                            <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
                            {isUploading ? 'Đang đổi...' : 'Chọn lại file'}
                          </button>
                        )}
                        <a
                          href={uploadedDoc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 text-slate-400 hover:text-white text-[11px] font-semibold transition"
                        >
                          <Eye size={12} /> Xem file
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Application Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Tiến độ chuẩn bị:</span>
              <span className="text-xs font-black text-sky-400">
                {application.documents.length}/{requirements.length} giấy tờ
              </span>
              <span className="text-[11px] text-slate-400">
                (Bắt buộc: {requirements.filter(r => r.isMandatory && application.documents.some(d => d.requirementId === r.id)).length}/{requirements.filter(r => r.isMandatory).length})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {requirements.filter(r => r.isMandatory).every(r => application.documents.some(d => d.requirementId === r.id))
                ? 'Đã tải đủ các giấy tờ bắt buộc. Bạn có thể bấm nộp hồ sơ ngay.'
                : 'Vui lòng tải lên đủ các giấy tờ có nhãn BẮT BUỘC trước khi nộp.'}
            </p>
          </div>

          <button
            type="button"
            disabled={
              isLocked ||
              isSubmitting ||
              !requirements.filter(r => r.isMandatory).every(r => application.documents.some(d => d.requirementId === r.id))
            }
            onClick={async () => {
              const missingMandatory = requirements
                .filter(r => r.isMandatory && !application.documents.some(d => d.requirementId === r.id))
                .map(r => r.documentName);

              if (missingMandatory.length > 0) {
                alert(`Bạn còn thiếu các giấy tờ bắt buộc sau:\n- ${missingMandatory.join('\n- ')}\n\nVui lòng tải lên đầy đủ trước khi nộp!`);
                return;
              }

              try {
                setIsSubmitting(true);
                if (onSubmitApplication) {
                  await onSubmitApplication();
                }
                setSubmittedSuccess(true);
                setTimeout(() => setSubmittedSuccess(false), 5000);
              } catch (err) {
                console.error(err);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
              requirements.filter(r => r.isMandatory).every(r => application.documents.some(d => d.requirementId === r.id))
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 scale-100 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi hồ sơ...
              </>
            ) : (
              <>
                <Send size={15} />
                Nộp Toàn Bộ Hồ Sơ Cho Đại Lý
              </>
            )}
          </button>
        </div>

        {submittedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p>Đã nộp toàn bộ hồ sơ Visa thành công!</p>
              <p className="font-normal text-[11px] text-emerald-200/80 mt-0.5">
                Đại lý SmartTravel đã tiếp nhận đầy đủ giấy tờ và sẽ tiến hành thẩm định trong thời gian sớm nhất.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

