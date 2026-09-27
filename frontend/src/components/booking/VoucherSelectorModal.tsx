import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import { Voucher } from '../../types/voucher';
import { formatCurrency } from '../../utils/formatters';

interface VoucherSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number;
  selectedCode?: string;
  onSelectVoucher: (code: string) => void;
}

export const VoucherSelectorModal: React.FC<VoucherSelectorModalProps> = ({
  isOpen,
  onClose,
  orderTotal,
  selectedCode,
  onSelectVoucher,
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>('');
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVouchers();
    }
  }, [isOpen]);

  const fetchAvailableVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getAvailableVouchers();
      if (res.data) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error('Failed to load available vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleManualApply = () => {
    if (!manualCode.trim()) {
      setManualError('Vui lòng nhập mã voucher');
      return;
    }
    setManualError(null);
    onSelectVoucher(manualCode.trim().toUpperCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-lg bg-[#0a111d] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/15 text-white relative space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Mã Khuyến Mãi & Ưu Đãi SmartTravel
              </h3>
              <p className="text-[11px] text-slate-400">
                Chọn mã ưu đãi sàn tốt nhất áp dụng cho đơn đặt tour của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Manual Voucher Input */}
        <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập mã ưu đãi riêng của bạn..."
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase());
                  setManualError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleManualApply()}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 font-mono font-bold text-xs uppercase focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="button"
              onClick={handleManualApply}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition cursor-pointer shadow-md"
            >
              Áp Dụng
            </button>
          </div>
          {manualError && (
            <p className="text-[11px] text-rose-400 font-medium pl-1">{manualError}</p>
          )}
        </div>

        {/* Order total reminder */}
        <div className="flex items-center justify-between text-xs px-2 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 flex-shrink-0">
          <span>Tổng tiền tạm tính đơn tour:</span>
          <span className="font-black text-white">{formatCurrency(orderTotal)}</span>
        </div>

        {/* Voucher List Scrollable */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Đang tải các chương trình ưu đãi...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Ticket className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-xs">Hiện chưa có mã ưu đãi công khai nào đang mở.</p>
              <p className="text-[11px] text-slate-500 mt-1">Bạn có thể nhập trực tiếp mã khuyến mãi vào ô phía trên.</p>
            </div>
          ) : (
            vouchers.map((v) => {
              const isPercent = v.discountPercent != null && v.discountPercent > 0;
              const isEligible = orderTotal >= (v.minOrderValue || 0);
              const isSelected = selectedCode?.toUpperCase() === v.code.toUpperCase();
              const diffAmount = (v.minOrderValue || 0) - orderTotal;

              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : isEligible
                      ? 'bg-white/[0.03] border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.05]'
                      : 'bg-white/[0.01] border-white/5 opacity-60'
                  }`}
                >
                  {/* Left coupon shape */}
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-black shadow-md border ${
                      isPercent 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/40 text-white' 
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/40 text-white'
                    }`}>
                      {isPercent ? (
                        <>
                          <span className="text-sm leading-none">{v.discountPercent}%</span>
                          <span className="text-[9px] uppercase font-bold tracking-tighter mt-0.5">GIẢM</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" />
                          <span className="text-[9px] uppercase font-bold tracking-tighter">VOUCHER</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                          {v.code}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Đang áp dụng
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs text-white leading-tight">
                        {v.title}
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>
                          {isPercent && v.maxDiscountAmount ? (
                            <span>Giảm tối đa <strong>{formatCurrency(v.maxDiscountAmount)}</strong> • </span>
                          ) : !isPercent ? (
                            <span>Giảm ngay <strong>{formatCurrency(v.discountAmount || 0)}</strong> • </span>
                          ) : null}
                          <span>Đơn tối thiểu {formatCurrency(v.minOrderValue || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-2.5 w-2.5" />
                          <span>Hạn dùng: {v.expiryDate}</span>
                        </div>
                      </div>

                      {!isEligible && (
                        <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pt-0.5">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>Cần thêm {formatCurrency(diffAmount)} để dùng mã này</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="self-end sm:self-center">
                    {isEligible ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectVoucher(v.code);
                          onClose();
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isSelected ? 'Đang Chọn' : 'Dùng Ngay'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 font-semibold">
                        Chưa đủ ĐK
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Mã khuyến mãi được Sàn du lịch SmartTravel tài trợ trực tiếp trên hóa đơn
          </p>
        </div>

      </div>
    </div>
  );
};
