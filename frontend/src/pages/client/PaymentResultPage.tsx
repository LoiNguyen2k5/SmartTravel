import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { PaymentResponse } from '../../types/payment';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const paramsMap: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsMap[key] = value;
    });

    if (Object.keys(paramsMap).length > 0) {
      paymentService.handleVNPayCallback(paramsMap)
        .then((res) => {
          if (res.data) setResult(res.data);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  const isSuccess = searchParams.get('vnp_ResponseCode') === '00';

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-6">
        {isSuccess ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-10 w-10" />
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-slate-900">
          {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Thất bại'}
        </h2>

        <p className="text-xs text-slate-600">
          {isSuccess
            ? `Cảm ơn bạn! Đơn đặt tour ${result?.bookingCode || ''} đã được xác nhận thanh toán.`
            : 'Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
};
