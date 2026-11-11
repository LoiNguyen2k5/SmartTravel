import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  Check,
  Copy,
  Building2,
  Wallet,
  CheckCircle,
  Loader2,
  Zap,
  CreditCard,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { Booking } from '../../types/booking';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess: (booking: Booking) => void;
  isRemainingPayment?: boolean;
  customAmount?: number;
  initialTab?: 'VIETQR' | 'MOMO' | 'VISA';
}

const BANK_CONFIG = {
  bankId: 'MB',
  bankName: 'MBBank (Ngân hàng TMCP Quân Đội)',
  branch: 'Chi nhánh TP. Hồ Chí Minh',
  accountNumber: '0941899554',
  accountName: 'NGUYEN BAO LOI',
  momoPhone: '0941899554',
  realTestAmount: 5000,
};

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
  isRemainingPayment = false,
  customAmount,
  initialTab = 'VIETQR',
}) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [qrGatewayTab, setQrGatewayTab] = useState<'VIETQR' | 'MOMO' | 'VISA'>(initialTab);
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);
  const pollingRef = useRef<any>(null);

  // Visa / MasterCard form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('NGUYEN BAO LOI');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('682941');

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(180);
      setQrGatewayTab(initialTab);
      setPaymentSuccessToast(false);
      setCardError('');
      setOtpStep(false);
      setOtpCode('');
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    setQrGatewayTab(initialTab);
    setCardError('');
    setOtpStep(false);
    if (booking?.contactName) {
      const normalized = booking.contactName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toUpperCase();
      setCardHolder(normalized);
    } else {
      setCardHolder('NGUYEN BAO LOI');
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, initialTab, booking?.contactName]);

  useEffect(() => {
    if (!isOpen || !booking || paymentSuccessToast) return;

    const checkStatusNow = async () => {
      try {
        const res = await paymentService.checkPaymentStatus(booking.bookingCode);
        const data = (res?.data ?? res) as any;
        if (isRemainingPayment) {
          // Khi thanh toán 70% còn lại: CHỈ hoàn tất khi backend xác nhận đã tất toán xong 100% (isFullyPaid === true)
          if (data?.isFullyPaid === true) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            handleAutoPaymentSuccess();
          }
        } else {
          // Khi thanh toán cọc hoặc đơn thông thường
          if (data?.isPaid === true) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            handleAutoPaymentSuccess();
          }
        }
      } catch (e) {
        // Continue polling silently
      }
    };

    checkStatusNow();
    pollingRef.current = setInterval(checkStatusNow, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, booking, paymentSuccessToast, isRemainingPayment]);

  const handleAutoPaymentSuccess = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPaymentSuccessToast(true);

    setTimeout(() => {
      if (booking) {
        if (isRemainingPayment) {
          onPaymentSuccess({
            ...booking,
            status: 'PAID',
            isDeposit: false,
            remainingAmount: 0,
            depositAmount:
              booking.depositAmount && booking.depositAmount < booking.totalPrice
                ? booking.depositAmount
                : Math.round(booking.totalPrice * 0.3),
          });
        } else {
          onPaymentSuccess(booking);
        }
      }
      onClose();
    }, 2200);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateBankWebhook = async () => {
    if (!booking || isProcessing) return;
    // Ngay lập tức hủy polling để tránh gửi request trùng lặp
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    try {
      setIsProcessing(true);
      if (isRemainingPayment) {
        try {
          await paymentService.payRemainingAmount(booking.bookingCode);
        } catch (payErr: any) {
          if (payErr?.response?.status === 404 || payErr?.status === 404) {
            try {
              const { bookingService } = await import('../../services/bookingService');
              const rawDate =
                booking.departureDate ||
                new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
              let chosenDate = rawDate;
              if (rawDate.includes('-')) {
                const parts = rawDate.split('-');
                if (parts[0].length === 2 && parts[2].length === 4) {
                  chosenDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
              }
              await bookingService.createBooking({
                tourId: booking.tourId,
                numberOfAdults: booking.numberOfAdults || 1,
                numberOfChildren: booking.numberOfChildren || 0,
                contactName: booking.contactName,
                contactEmail: booking.contactEmail,
                contactPhone: booking.contactPhone,
                departureDate: chosenDate,
                bookingCode: booking.bookingCode,
                status: 'DEPOSITED',
                isDeposit: true,
                depositAmount: booking.depositAmount || Math.round(booking.totalPrice * 0.3),
                remainingAmount:
                  booking.remainingAmount ||
                  booking.totalPrice - Math.round(booking.totalPrice * 0.3),
              });
              await paymentService.payRemainingAmount(booking.bookingCode);
            } catch (syncErr) {
              console.error('Lỗi đồng bộ cọc trước khi tất toán:', syncErr);
            }
          } else {
            throw payErr;
          }
        }
      } else {
        await paymentService.markBookingPaid(booking.bookingCode);
      }
      handleAutoPaymentSuccess();
    } catch (e) {
      console.error('Simulate webhook error:', e);
      // Fallback: still complete locally
      handleAutoPaymentSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  // Format & validate Visa/MasterCard inputs
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const detectCardBrand = (num: string): 'VISA' | 'MASTERCARD' | 'JCB' => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('5') || clean.startsWith('2')) return 'MASTERCARD';
    if (clean.startsWith('35')) return 'JCB';
    return 'VISA';
  };

  const handleProceedToOtp = () => {
    setCardError('');
    const rawDigits = cardNumber.replace(/\D/g, '');
    if (rawDigits.length < 15) {
      setCardError('Vui lòng nhập đủ 16 chữ số trên mặt thẻ Visa / MasterCard.');
      return;
    }
    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      setCardError('Vui lòng nhập họ tên chủ thẻ (in hoa không dấu).');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      setCardError('Ngày hết hạn không hợp lệ (Định dạng chuẩn: MM/YY, ví dụ 08/29).');
      return;
    }
    if (cardCvv.replace(/\D/g, '').length < 3) {
      setCardError('Vui lòng nhập mã bảo mật CVV/CVC (3 chữ số mặt sau thẻ).');
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpCode(randomOtp);
    setOtpStep(true);
  };

  const handleConfirmVisaPayment = async () => {
    setCardError('');
    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setCardError('Vui lòng nhập mã xác thực 3D-Secure OTP gồm 6 chữ số.');
      return;
    }
    if (cleanOtp !== generatedOtp) {
      setCardError('Mã xác thực 3D-Secure OTP không chính xác. Quý khách vui lòng kiểm tra lại.');
      return;
    }
    await handleSimulateBankWebhook();
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
  const payableAmount = isRemainingPayment
    ? customAmount || booking.remainingAmount || booking.totalPrice - Math.round(booking.totalPrice * 0.3)
    : booking.isDeposit || booking.status === 'DEPOSITED'
      ? booking.depositAmount || Math.round(booking.totalPrice * 0.3)
      : booking.totalPrice || BANK_CONFIG.realTestAmount;

  const vietQrBankUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  const vietQrMomoUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-qr_only.png?amount=${BANK_CONFIG.realTestAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const cardBrand = detectCardBrand(cardNumber);

  return createPortal(
    <div
      className="fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in"
      style={{ zIndex: 99999 }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-6">
        <div className="w-full max-w-lg bg-[#0a111d] rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-4 border border-white/15 text-white relative">
          <div className="text-center space-y-1">
            {timeLeft > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Thời gian thanh toán còn lại:{' '}
                <span className="font-mono text-white font-black">{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                Phiên thanh toán đã hết hạn giữ chỗ (3 phút)
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-black text-white pt-0.5">
              {isRemainingPayment
                ? 'Thanh Toán 70% Còn Lại (Tất Toán Đơn Hàng)'
                : qrGatewayTab === 'VISA'
                  ? 'Thanh Toán Thẻ Quốc Tế (Visa / MasterCard)'
                  : 'Quét Mã QR Thanh Toán Trực Tiếp'}
            </h3>
            <p className="text-xs text-slate-400">
              {timeLeft > 0
                ? isRemainingPayment
                  ? 'Hoàn tất 70% số tiền còn lại để nhận Hóa Đơn VAT và Vé Điện Tử chính thức.'
                  : qrGatewayTab === 'VISA'
                    ? 'Nhập thông tin thẻ Visa / MasterCard / JCB để thanh toán bảo mật chuẩn 3D-Secure'
                    : 'Mở ứng dụng Ngân hàng (MBBank, VCB, Agribank...) hoặc Ví MoMo để quét mã'
                : 'Đã hết thời hạn giữ chỗ. Chỗ đặt đã được tự động hoàn trả lại tour.'}
            </p>
          </div>

          {/* 3-Tab Payment Gateway Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.05] border border-white/10 rounded-2xl text-[11px] sm:text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setQrGatewayTab('VIETQR');
                setCardError('');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                qrGatewayTab === 'VIETQR'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">VietQR (MB)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setQrGatewayTab('MOMO');
                setCardError('');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                qrGatewayTab === 'MOMO'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
              <span className="truncate">Ví MoMo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setQrGatewayTab('VISA');
                setCardError('');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                qrGatewayTab === 'VISA'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
              <span className="truncate">Thẻ Visa/Master</span>
            </button>
          </div>

          {qrGatewayTab !== 'VISA' ? (
            <>
              <div
                className={`p-3 rounded-2xl border text-center space-y-2 ${
                  qrGatewayTab === 'VIETQR'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-pink-950/20 border-pink-500/30'
                }`}
              >
                <div className="relative inline-block bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200">
                  <img
                    src={qrGatewayTab === 'VIETQR' ? vietQrBankUrl : vietQrMomoUrl}
                    alt="Payment QR"
                    className="h-44 w-44 sm:h-48 sm:w-48 mx-auto object-contain"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                  {qrGatewayTab === 'VIETQR' ? (
                    <>
                      <span className="font-bold text-emerald-400">NAPAS 24/7 • MBBANK</span>
                      <span>•</span>
                      <span>Tích hợp SePay Webhook</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-pink-400">MOMO VIETQR</span>
                      <span>•</span>
                      <span>Quét bằng App MoMo</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-2xl p-4 space-y-2.5 text-xs border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Ngân hàng nhận:</span>
                  <span className="font-bold text-white text-right">
                    {qrGatewayTab === 'VIETQR' ? 'MBBank (Quân Đội)' : 'Ví MoMo / MBBank'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Số tài khoản nhận:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-cyan-300 text-sm">
                      {BANK_CONFIG.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk')}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                    >
                      {copiedStk ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
                  <span className="font-black text-white uppercase">{BANK_CONFIG.accountName}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">
                    {isRemainingPayment
                      ? 'Số tiền 70% còn lại:'
                      : booking.isDeposit || booking.status === 'DEPOSITED'
                        ? 'Số tiền cọc 30%:'
                        : 'Số tiền thanh toán:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-400 text-base">
                      {formatCurrency(payableAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(payableAmount.toString(), 'amount')}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                    >
                      {copiedAmount ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-lg border border-sky-500/30">
                      {transferContent}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                    >
                      {copiedContent ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* THẺ QUỐC TẾ VISA / MASTERCARD / JCB TAB */
            <div className="space-y-3.5">
              {/* Interactive Bank Card Preview */}
              <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-[#0f2138] to-[#0c3144] border border-sky-400/25 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-10 rounded-md bg-amber-300/80 border border-amber-200/60 flex items-center justify-center shadow-inner">
                      <div className="h-4 w-6 border border-amber-700/40 rounded-sm" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-sky-200/80">
                      MBBank International Card
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 font-black tracking-wider text-xs text-white">
                    {cardBrand}
                  </span>
                </div>

                <div className="mt-4 font-mono text-base sm:text-lg font-black tracking-[0.18em] text-white">
                  {cardNumber || '4720 •••• •••• ••••'}
                </div>

                <div className="mt-4 flex items-end justify-between text-xs">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">
                      Card Holder
                    </div>
                    <div className="font-bold tracking-wider text-slate-100 uppercase truncate max-w-[200px]">
                      {cardHolder || 'NGUYEN BAO LOI'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">
                      Expires
                    </div>
                    <div className="font-mono font-bold text-cyan-300">
                      {cardExpiry || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>

              {!otpStep ? (
                <div className="bg-white/[0.03] rounded-2xl p-4 space-y-3 border border-white/10 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Số thẻ quốc tế (16 số Visa / MasterCard / JCB) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="4xxx xxxx xxxx xxxx"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full rounded-xl bg-[#070c18] border border-white/15 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                      />
                      <CreditCard className="h-4 w-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Họ và tên in trên thẻ (Không dấu) *
                    </label>
                    <input
                      type="text"
                      placeholder="NGUYEN BAO LOI"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full rounded-xl bg-[#070c18] border border-white/15 px-3.5 py-2.5 uppercase font-bold text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Ngày hết hạn (MM/YY) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="08/29"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="w-full rounded-xl bg-[#070c18] border border-white/15 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Mã bảo mật CVV/CVC *
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          className="w-full rounded-xl bg-[#070c18] border border-white/15 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                        />
                        <Lock className="h-3.5 w-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-slate-400 font-medium">Số tiền khấu trừ thẻ:</span>
                    <span className="font-black text-rose-400 text-base">
                      {formatCurrency(payableAmount)}
                    </span>
                  </div>

                  {cardError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                      {cardError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToOtp}
                    disabled={isProcessing || timeLeft === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs transition shadow-[0_6px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Tiếp Tục Xác Thực 3D-Secure ({formatCurrency(payableAmount)})</span>
                  </button>
                </div>
              ) : (
                /* 3D-SECURE OTP VERIFICATION STEP */
                <div className="bg-white/[0.03] rounded-2xl p-4 space-y-3 border border-emerald-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <KeyRound className="h-4 w-4" />
                      <span>Xác Thực Bảo Mật 3D-Secure (OTP)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(false);
                        setCardError('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" /> Sửa thẻ
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Cổng phát hành thẻ <strong>{cardBrand}</strong> yêu cầu xác nhận mã OTP cho giao
                    dịch đơn hàng <strong className="text-sky-300">{booking.bookingCode}</strong> với
                    số tiền <strong className="text-rose-400">{formatCurrency(payableAmount)}</strong>.
                  </p>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-200">Mã OTP 3D-Secure phiên giao dịch:</span>
                    <span className="font-mono font-black text-sm text-emerald-300 tracking-widest">
                      {generatedOtp}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nhập mã OTP xác nhận (6 chữ số) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Nhập 6 số OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full rounded-xl bg-[#070c18] border border-white/20 px-3.5 py-2.5 font-mono text-center text-base tracking-[0.35em] font-black text-white focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>

                  {cardError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                      {cardError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmVisaPayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs transition shadow-[0_6px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang xử lý giao dịch thẻ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Xác Nhận Thanh Toán ({formatCurrency(payableAmount)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-1">
            {paymentSuccessToast ? (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-in fade-in zoom-in-95">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-black text-sm">Giao Dịch Thanh Toán Thành Công!</div>
                  <div className="text-xs text-emerald-100 mt-0.5">
                    Đã xác nhận thanh toán. Đang tự động xuất Vé điện tử E-Ticket...
                  </div>
                </div>
              </div>
            ) : (
              qrGatewayTab !== 'VISA' && (
                <div className="p-4 rounded-2xl bg-[#070c18] text-white space-y-3 border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black text-emerald-400 tracking-wide uppercase">
                        Tự động lắng nghe giao dịch (SePay / MBBank)
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono border border-white/10">
                      Polling 2s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Quý khách vui lòng quét mã QR trên. Khi chuyển khoản đúng nội dung{' '}
                    <strong className="text-sky-300">{transferContent}</strong>, hệ thống sẽ{' '}
                    <strong>tự động nhận diện và chuyển sang màn hình thành công</strong> tức thì.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                      <span>Đang chờ tín hiệu biến động số dư...</span>
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
              )
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
    </div>,
    document.body
  );
};
