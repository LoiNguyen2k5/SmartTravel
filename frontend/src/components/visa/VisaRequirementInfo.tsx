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
    <div className="bg-white border-2 border-[#99F6E4] rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="bg-[#0B3B49] px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 border border-[#5EEAD4]/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="text-[#5EEAD4] h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              Thủ Tục Hồ Sơ Visa
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#D95D39] text-white">
                Bắt Buộc
              </span>
            </h3>
            <p className="text-xs text-slate-200 mt-0.5">
              Hành trình quốc tế này yêu cầu Visa hợp lệ. Dưới đây là danh sách giấy tờ bạn cần chuẩn bị:
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Grid of Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="group bg-[#FAF8F5] hover:bg-[#E6F4F1]/60 border border-[#E6E1DA] hover:border-[#0D9488] rounded-xl p-4 transition-all duration-200 flex items-start gap-3"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-[#E6F4F1] text-[#0D9488] border border-[#99F6E4] shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-[#0F172A] text-xs sm:text-sm tracking-tight truncate">
                    {req.documentName}
                  </h4>
                  {req.isMandatory ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      Bắt buộc
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E6F4F1] text-[#0B3B49] border border-[#99F6E4] shrink-0">
                      Tùy chọn
                    </span>
                  )}
                </div>
                {req.description && (
                  <p className="text-xs text-[#526071] mt-1 leading-relaxed">
                    {req.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Notice footer */}
        <div className="flex items-start gap-2.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] p-3.5 rounded-xl text-xs leading-relaxed">
          <Info size={16} className="shrink-0 mt-0.5 text-[#D97706]" />
          <p>
            <strong>Lưu ý:</strong> Quý khách có thể nộp bản mềm (ảnh chụp/scan rõ nét hoặc PDF) ngay sau khi đặt tour thành công tại mục{' '}
            <span className="text-[#0B3B49] font-extrabold underline underline-offset-2">Lịch sử đặt tour</span>. Đội ngũ chuyên viên SmartTravel sẽ thẩm định sơ bộ và liên hệ hỗ trợ hoàn tất thủ tục Lãnh sự.
          </p>
        </div>
      </div>
    </div>
  );
};
