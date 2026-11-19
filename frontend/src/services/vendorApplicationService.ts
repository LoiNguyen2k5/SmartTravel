import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import {
  VendorApplicationRequest,
  VendorApplicationReviewRequest,
  VendorApplicationResponse,
  VendorApplicationStatus,
} from '../types/vendorApplication';

const syncCurrentUserRolesFromApplication = (app: VendorApplicationResponse | null) => {
  if (!app) return;
  try {
    const savedUserStr = localStorage.getItem('user');
    if (!savedUserStr) return;
    const user = JSON.parse(savedUserStr);
    if (!user || user.email !== app.userEmail) return;

    const hasVendor = (user.roles || []).some((r: any) =>
      typeof r === 'string' ? r === 'ROLE_VENDOR' : r.name === 'ROLE_VENDOR'
    );

    if (app.status === 'APPROVED' && !hasVendor) {
      user.roles = [...(user.roles || []), 'ROLE_VENDOR'];
      localStorage.setItem('user', JSON.stringify(user));
    } else if (app.status === 'REVOKED' && hasVendor) {
      user.roles = (user.roles || []).filter((r: any) =>
        typeof r === 'string' ? r !== 'ROLE_VENDOR' : r.name !== 'ROLE_VENDOR'
      );
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch {
    // Ignore storage parse error
  }
};

export const vendorApplicationService = {
  // 1. Khách hàng nộp đơn đăng ký đại lý
  submitApplication: async (data: VendorApplicationRequest): Promise<ApiResponse<VendorApplicationResponse>> => {
    const res = await axiosClient.post<any, ApiResponse<VendorApplicationResponse>>(
      '/vendor-applications/submit',
      data
    );
    window.dispatchEvent(new Event('smarttravel_vendor_apps_updated'));
    return res;
  },

  // 2. Khách hàng kiểm tra đơn gần nhất của mình
  getMyApplication: async (): Promise<ApiResponse<VendorApplicationResponse | null>> => {
    const res = await axiosClient.get<any, ApiResponse<VendorApplicationResponse | null>>(
      '/vendor-applications/my-status'
    );
    if (res && res.data) {
      syncCurrentUserRolesFromApplication(res.data);
    }
    return res;
  },

  // 3. Admin lấy danh sách hồ sơ (có filter theo status)
  getAllApplications: async (
    status?: VendorApplicationStatus
  ): Promise<ApiResponse<VendorApplicationResponse[]>> => {
    const params = status ? `?status=${status}` : '';
    return await axiosClient.get<any, ApiResponse<VendorApplicationResponse[]>>(
      `/admin/vendor-applications${params}`
    );
  },

  // 4. Admin xem chi tiết 1 hồ sơ
  getApplicationById: async (id: number): Promise<ApiResponse<VendorApplicationResponse>> => {
    return await axiosClient.get<any, ApiResponse<VendorApplicationResponse>>(
      `/admin/vendor-applications/${id}`
    );
  },

  // 5. Admin phê duyệt hoặc từ chối hồ sơ
  reviewApplication: async (
    id: number,
    review: VendorApplicationReviewRequest
  ): Promise<ApiResponse<VendorApplicationResponse>> => {
    const res = await axiosClient.put<any, ApiResponse<VendorApplicationResponse>>(
      `/admin/vendor-applications/${id}/review`,
      review
    );
    window.dispatchEvent(new Event('smarttravel_vendor_apps_updated'));
    return res;
  },

  // 6. Admin thu hồi quyền Vendor và chuyển tài khoản về Khách hàng thường
  revokeVendor: async (id: number): Promise<ApiResponse<VendorApplicationResponse>> => {
    const res = await axiosClient.put<any, ApiResponse<VendorApplicationResponse>>(
      `/admin/vendor-applications/${id}/revoke`
    );
    if (res && res.data) {
      syncCurrentUserRolesFromApplication(res.data);
    }
    window.dispatchEvent(new Event('smarttravel_vendor_apps_updated'));
    return res;
  },
};
