import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { User } from '../types/auth';
import { Tour, TourStatus } from '../types/tour';
import { AdminStats, VendorSettlement, PaymentRecord } from '../types/admin';

export const adminService = {
  getDashboardStats: async (): Promise<ApiResponse<AdminStats>> => {
    return await axiosClient.get('/admin/dashboard/stats');
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return await axiosClient.get<any, ApiResponse<User[]>>('/admin/users');
  },

  toggleUserStatus: async (userId: number, enabled?: boolean): Promise<ApiResponse<User>> => {
    const params = enabled !== undefined ? `?enabled=${enabled}` : '';
    return await axiosClient.put(`/admin/users/${userId}/status${params}`);
  },

  getTours: async (status?: TourStatus | string): Promise<ApiResponse<Tour[]>> => {
    const params = status ? `?status=${status}` : '';
    return await axiosClient.get<any, ApiResponse<Tour[]>>(`/admin/tours${params}`);
  },

  moderateTour: async (tourId: number, status: TourStatus | string, reason?: string): Promise<ApiResponse<Tour>> => {
    return await axiosClient.put(`/admin/tours/${tourId}/moderation`, { status, reason });
  },

  getAllBookings: async (): Promise<ApiResponse<any[]>> => {
    return await axiosClient.get('/admin/bookings');
  },

  getAllPayments: async (): Promise<ApiResponse<PaymentRecord[]>> => {
    return await axiosClient.get('/admin/payments');
  },

  getVendorSettlements: async (): Promise<ApiResponse<VendorSettlement[]>> => {
    return await axiosClient.get('/admin/settlements');
  },

  settleVendor: async (vendorId: number): Promise<ApiResponse<VendorSettlement>> => {
    return await axiosClient.post(`/admin/settlements/${vendorId}/settle`);
  },

  resetRevenue: async (): Promise<ApiResponse<number>> => {
    return await axiosClient.delete('/admin/revenue/reset');
  },
};
