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
    let users: User[] = [];
    try {
      const res = await axiosClient.get<any, ApiResponse<User[]>>('/admin/users');
      if (res && res.data && Array.isArray(res.data)) {
        users = res.data;
      }
    } catch {
      // Fallback mock users nếu backend không khả dụng
      users = [
        {
          id: 1,
          email: 'admin@smarttravel.com',
          fullName: 'Quản Trị Viên Hệ Thống',
          phone: '0901234567',
          enabled: true,
          roles: ['ROLE_ADMIN'],
        },
        {
          id: 2,
          email: 'vendor@smarttravel.com',
          fullName: 'Vietravel Official',
          phone: '0908888999',
          enabled: true,
          roles: ['ROLE_VENDOR'],
        },
        {
          id: 3,
          email: 'user@smarttravel.com',
          fullName: 'Khách Hàng Thân Thiết',
          phone: '0912345678',
          enabled: true,
          roles: ['ROLE_USER'],
        },
        {
          id: 4,
          email: 'customer@smarttravel.com',
          fullName: 'Khách Hàng SmartTravel',
          phone: '0912345678',
          enabled: true,
          roles: ['ROLE_USER'],
        },
      ];
    }

    // Luôn đồng bộ vai trò ROLE_VENDOR / ROLE_USER theo trạng thái hồ sơ thẩm định mới nhất
    try {
      const appsStr = localStorage.getItem('smarttravel_vendor_applications');
      if (appsStr) {
        const apps = JSON.parse(appsStr);
        if (Array.isArray(apps)) {
          users = users.map(u => {
            const app = apps.find((a: any) => a.userEmail === u.email);
            if (!app) return u;

            let updatedRoles = [...(u.roles || [])];
            if (app.status === 'REVOKED') {
              // Đã thu hồi -> Xóa ROLE_VENDOR, đảm bảo có ROLE_USER
              updatedRoles = updatedRoles.filter(r => (typeof r === 'string' ? r !== 'ROLE_VENDOR' : (r as any).name !== 'ROLE_VENDOR'));
              if (!updatedRoles.some(r => typeof r === 'string' ? r === 'ROLE_USER' : (r as any).name === 'ROLE_USER')) {
                updatedRoles.push('ROLE_USER');
              }
            } else if (app.status === 'APPROVED') {
              // Đã duyệt -> Thêm ROLE_VENDOR
              if (!updatedRoles.some(r => typeof r === 'string' ? r === 'ROLE_VENDOR' : (r as any).name === 'ROLE_VENDOR')) {
                updatedRoles.push('ROLE_VENDOR');
              }
            }
            return { ...u, roles: updatedRoles };
          });
        }
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ vai trò người dùng:', e);
    }

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: users,
      timestamp: new Date().toISOString(),
    };
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
