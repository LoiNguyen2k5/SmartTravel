export enum PaymentMethod {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentRequest {
  bookingId: number;
  paymentMethod: PaymentMethod;
  amount?: number;
  bankCode?: string;
}

export interface PaymentResponse {
  id?: number;
  bookingId: number;
  bookingCode: string;
  transactionId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentUrl?: string;
  paymentTime?: string;
}
