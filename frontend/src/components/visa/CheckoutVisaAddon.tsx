import React from 'react';
import { Globe, ShieldCheck, Info } from 'lucide-react';

interface Props {
  hasVisaConfig: boolean;
  isOptedIn: boolean;
  onToggleOptIn: (val: boolean) => void;
  visaFeePerPerson?: number;
  consularFeePerPerson?: number;
  totalGuests?: number;
  visaDeadlineText?: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const CheckoutVisaAddon: React.FC<Props> = ({
  hasVisaConfig,
  isOptedIn,
  onToggleOptIn,
  visaFeePerPerson = 0,
  consularFeePerPerson = 0,
  totalGuests = 1,
  visaDeadlineText,
}) => {
  if (!hasVisaConfig) return null;

  const totalServiceFee = visaFeePerPerson * totalGuests;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isOptedIn
          ? 'border-sky-500/60 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.12)]'
          : 'border-white/10 bg-[#0a111d]/80 hover:border-white/20'
      }`}
    >
      <label className="flex items-start gap-4 cursor-pointer">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isOptedIn}
            onChange={(e) => onToggleOptIn(e.target.checked)}
            className="w-5 h-5 accent-sky-500 rounded border-slate-600 cursor-pointer"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="text-sky-400 h-5 w-5" />
              <span className="font-bold text-white text-sm">
                Ủy quyền Đại lý hỗ trợ làm thủ tục Visa trọn gói
              </span>
            </div>
            {visaFeePerPerson > 0 && (
              <span className="text-xs font-extrabold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 rounded-full">
                +{fmt(visaFeePerPerson)} / khách ({fmt(totalServiceFee)} cho {totalGuests} khách)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Chuyên viên Visa của Đại lý sẽ <strong>sơ duyệt bản mềm trực tuyến</strong>, hướng dẫn hoàn thiện hồ sơ và{' '}
            <strong>đại diện đoàn nộp trực tiếp tại Đại sứ quán / Trung tâm thị thực</strong>. Nếu bạn đã có sẵn Visa còn hạn, có thể bỏ chọn mục này.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-[11px] text-slate-400">
            {consularFeePerPerson > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                Lệ phí Lãnh sự tham khảo: <strong className="text-amber-300">{fmt(consularFeePerPerson)}/khách</strong> (tách riêng theo quy định ĐSQ, không gộp vào phí dịch vụ)
              </span>
            )}
            {visaDeadlineText && (
              <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Hạn chót nộp bản mềm cho Đại lý: {visaDeadlineText}
              </span>
            )}
          </div>
        </div>
      </label>
    </div>
  );
};
