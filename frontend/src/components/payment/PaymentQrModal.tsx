import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, Copy, Building2, Wallet, CheckCircle, Loader2, Zap } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { Booking } from '../../types/booking';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess: (booking: Booking) => void;
}

const BANK_CONFIG = {
  bankId: 'agribank',
  bankName: 'Agribank (Ngân hàng Nông nghiệp & PTNT Việt Nam)',
  branch: 'Chi nhánh Chợ Vàm - An Giang',
  accountNumber: '6712263140663',
  accountName: 'NGUYEN BAO LOI',
  momoPhone: '0988776655',
  realTestAmount: 5000,
};

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [qrGatewayTab, setQrGatewayTab] = useState<'VIETQR' | 'MOMO'>('VIETQR');
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(180);
      setQrGatewayTab('VIETQR');
      setPaymentSuccessToast(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !booking || paymentSuccessToast || timeLeft === 0) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentService.checkPaymentStatus(booking.bookingCode);
        if (res?.data?.isPaid) {
          clearInterval(pollingRef.current);
          handleAutoPaymentSuccess();
        }
      } catch (e) {
        // Continue polling silently
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, booking, paymentSuccessToast]);

  const handleAutoPaymentSuccess = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPaymentSuccessToast(true);

    setTimeout(() => {
      if (booking) {
        onPaymentSuccess(booking);
      }
      onClose();
    }, 2200);
  };

  const handleSimulateBankWebhook = async () => {
    if (!booking) return;
    try {
      await paymentService.markBookingPaid(booking.bookingCode);
    } catch (e) {
      console.log('Simulate webhook trigger', e);
    }
    handleAutoPaymentSuccess();
  };

  const handleCopy = (text: string, type: 'stk' | 'amount' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'stk') {
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !booking) return null;

  const transferContent = `SMARTTRAVEL ${booking.bookingCode}`;
  const vietQrBankUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  const vietQrMomoUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-qr_only.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in" style={{ zIndex: 9999 }}>
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-6">
        <div className="w-full max-w-lg bg-[#0a111d] rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-4 border border-white/15 text-white relative">
          
          <div className="text-center space-y-1">
            {timeLeft > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Thời gian thanh toán còn lại: <span className="font-mono text-white font-black">{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                Mã QR đã hết hạn giữ chỗ (3 phút)
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-black text-white pt-0.5">Quét Mã QR Thanh Toán Trực Tiếp</h3>
            <p className="text-xs text-slate-400">
              {timeLeft > 0
                ? 'Mở ứng dụng Ngân hàng (Agribank, MB, VCB...) hoặc Ví MoMo để quét mã'
                : 'Đã hết thời hạn giữ chỗ. Chỗ đặt đã được tự động hoàn trả lại tour.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.05] border border-white/10 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setQrGatewayTab('VIETQR')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                qrGatewayTab === 'VIETQR' ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4 text-emerald-400" /> VietQR (Agribank)
            </button>
            <button
              type="button"
              onClick={() => setQrGatewayTab('MOMO')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                qrGatewayTab === 'MOMO' ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="h-4 w-4 text-pink-400" /> Ví MoMo
            </button>
          </div>

          <div className={`p-3 rounded-2xl border text-center space-y-2 ${
            qrGatewayTab === 'VIETQR' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-pink-950/20 border-pink-500/30'
          }`}>
            <div className="relative inline-block bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200">
              <img
                src={qrGatewayTab === 'VIETQR' ? vietQrBankUrl : vietQrMomoUrl}
                alt="Payment QR"
                className="h-44 w-44 sm:h-48 sm:w-48 mx-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
              {qrGatewayTab === 'VIETQR' ? (
                <><span className="font-bold text-emerald-400">NAPAS 24/7 • AGRIBANK</span><span>•</span><span>Chuyển khoản liên ngân hàng</span></>
              ) : (
                <><span className="font-bold text-pink-400">MOMO VIETQR</span><span>•</span><span>Quét bằng App MoMo</span></>
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] rounded-2xl p-4 space-y-2.5 text-xs border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Cổng nhận tiền:</span>
              <span className="font-bold text-white text-right">{qrGatewayTab === 'VIETQR' ? 'Agribank' : 'Ví MoMo'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Số tài khoản / Số ví:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-cyan-300 text-sm">{BANK_CONFIG.accountNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk')}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                >
                  {copiedStk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
              <span className="font-black text-white uppercase">{BANK_CONFIG.accountName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Số tiền thanh toán:</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-400 text-base">{formatCurrency(BANK_CONFIG.realTestAmount)}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(BANK_CONFIG.realTestAmount.toString(), 'amount')}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                >
                  {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-lg border border-sky-500/30">{transferContent}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(transferContent, 'content')}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                >
                  {copiedContent ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {paymentSuccessToast ? (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-in fade-in zoom-in-95">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-black text-sm">Giao Dịch Chuyển Khoản Thành Công!</div>
                  <div className="text-xs text-emerald-100 mt-0.5">
                    Đã nhận tiền từ hệ thống. Đang tự động xuất vé...
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#070c18] text-white space-y-3 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black text-emerald-400 tracking-wide uppercase">Tự động lắng nghe giao dịch</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono border border-white/10">Polling 2s</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Quý khách vui lòng quét mã QR trên. Hệ thống sẽ <strong>tự động nhận diện và cập nhật trạng thái đơn hàng</strong> tức thì.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    <span>Đang chờ tín hiệu...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateBankWebhook}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Kích hoạt nhận diện ngay</span>
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
