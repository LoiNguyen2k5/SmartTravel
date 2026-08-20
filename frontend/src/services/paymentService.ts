import axiosClient from './axiosClient';
import { PaymentRequest, PaymentResponse } from '../types/payment';
import { ApiResponse } from '../types/common';

export const paymentService = {
  createVNPayPayment: async (data: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    return await axiosClient.post('/payments/create-vnpay', data);
  },

  handleVNPayCallback: async (queryParams: Record<string, string>): Promise<ApiResponse<PaymentResponse>> => {
    return await axiosClient.get('/payments/vnpay-callback', { params: queryParams });
  },
};
