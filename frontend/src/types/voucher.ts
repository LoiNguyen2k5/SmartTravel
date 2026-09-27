export interface Voucher {
  id: number;
  code: string;
  title: string;
  description?: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount: number;
  startDate?: string | null;
  expiryDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherRequest {
  code: string;
  title: string;
  description?: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  startDate?: string | null;
  expiryDate: string;
  active?: boolean;
}

export interface VoucherValidateResult {
  voucherCode: string;
  title: string;
  discountAmount: number;
  finalTotal: number;
  message?: string;
}
