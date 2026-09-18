import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { User } from '../types/auth';
import { Tour, TourStatus } from '../types/tour';
import { AdminStats, VendorSettlement, PaymentRecord } from '../types/admin';
import { MOCK_TOURS } from '../data/mockTours';
import { getDeletedTourIds } from './tourService';

export const adminService = {
  getDashboardStats: async (): Promise<ApiResponse<AdminStats>> => {
    return await axiosClient.get('/admin/dashboard/stats');
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return await axiosClient.get('/admin/users');
  },

  toggleUserStatus: async (userId: number, enabled?: boolean): Promise<ApiResponse<User>> => {
    const params = enabled !== undefined ? `?enabled=${enabled}` : '';
    return await axiosClient.put(`/admin/users/${userId}/status${params}`);
  },

  getTours: async (status?: TourStatus | string): Promise<ApiResponse<Tour[]>> => {
    const params = status ? `?status=${status}` : '';
    let apiTours: Tour[] = [];
    try {
      const res = await axiosClient.get<any, ApiResponse<Tour[]>>(`/admin/tours${params}`);
      if (res && res.data && Array.isArray(res.data)) {
        apiTours = res.data;
      }
    } catch {
      // Fallback
    }
    const combined: Tour[] = [...apiTours];
    for (const m of MOCK_TOURS) {
      if (!combined.some(c => c.id === m.id || c.title.trim().toLowerCase() === m.title.trim().toLowerCase())) {
        combined.push(m);
      }
    }

    const deletedIds = getDeletedTourIds();
    const finalTours = combined.filter(
      t => !deletedIds.includes(t.id) && t.id !== 11 && !t.title.toLowerCase().includes('vietqr')
    );

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: finalTours,
      timestamp: new Date().toISOString(),
    };
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
};
