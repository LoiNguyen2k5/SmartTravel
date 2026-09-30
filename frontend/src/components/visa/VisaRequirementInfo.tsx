import React from 'react';
import { ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { VisaRequirementResponse } from '../../types/visa';

interface Props {
  requirements: VisaRequirementResponse[];
}

export const VisaRequirementInfo: React.FC<Props> = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-sky-950/40 via-[#0c1628] to-indigo-950/30 border border-sky-500/25 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
            <ShieldAlert className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              Thủ Tục Hồ Sơ Visa
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Bắt Buộc
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hành trình quốc tế này yêu cầu Visa hợp lệ. Dưới đây là danh sách giấy tờ bạn cần chuẩn bị:
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {requirements.map((req) => (
          <div
            key={req.id}
            className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-sky-500/40 rounded-xl p-4 transition-all duration-200 flex items-start gap-3"
          >
            <div className="mt-0.5 p-1 rounded-lg bg-sky-500/15 text-sky-400 shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                  {req.documentName}
                </h4>
                {req.isMandatory ? (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    Bắt buộc
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    Tự chọn
                  </span>
                )}
              </div>
              {req.description && (
                <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                  {req.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notice footer */}
      <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-200/90 p-3.5 rounded-xl text-xs leading-relaxed">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
        <p>
          <strong>Lưu ý:</strong> Quý khách có thể nộp bản mềm (ảnh chụp/scan rõ nét hoặc PDF) ngay sau khi đặt tour thành công tại mục{' '}
          <span className="text-amber-300 font-semibold underline underline-offset-2">Lịch sử đặt tour</span>. Đội ngũ chuyên viên SmartTravel sẽ thẩm định sơ bộ và liên hệ hỗ trợ hoàn tất thủ tục Lãnh sự.
        </p>
      </div>
    </div>
  );
};

