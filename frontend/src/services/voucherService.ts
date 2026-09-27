import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { Voucher, VoucherRequest, VoucherValidateResult } from '../types/voucher';

export const voucherService = {
  // === ADMIN ENDPOINTS ===
  getAllVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return await axiosClient.get('/admin/vouchers');
  },

  getVoucherById: async (id: number): Promise<ApiResponse<Voucher>> => {
    return await axiosClient.get(`/admin/vouchers/${id}`);
  },

  createVoucher: async (data: VoucherRequest): Promise<ApiResponse<Voucher>> => {
    return await axiosClient.post('/admin/vouchers', data);
  },

  updateVoucher: async (id: number, data: VoucherRequest): Promise<ApiResponse<Voucher>> => {
    return await axiosClient.put(`/admin/vouchers/${id}`, data);
  },

  toggleVoucherActive: async (id: number): Promise<ApiResponse<Voucher>> => {
    return await axiosClient.patch(`/admin/vouchers/${id}/toggle-active`);
  },

  deleteVoucher: async (id: number): Promise<ApiResponse<void>> => {
    return await axiosClient.delete(`/admin/vouchers/${id}`);
  },

  // === PUBLIC CUSTOMER ENDPOINTS ===
  getAvailableVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return await axiosClient.get('/vouchers/available');
  },

  validateVoucher: async (code: string, originalTotal: number): Promise<ApiResponse<VoucherValidateResult>> => {
    return await axiosClient.post('/vouchers/validate', { code, originalTotal });
  },
};
