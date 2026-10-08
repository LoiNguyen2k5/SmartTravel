import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { 
  VendorApplicationRequest, 
  VendorApplicationReviewRequest, 
  VendorApplicationResponse, 
  VendorApplicationStatus 
} from '../types/vendorApplication';

const LOCAL_STORAGE_KEY = 'smarttravel_vendor_applications';

// Dữ liệu mẫu dự phòng ban đầu
const INITIAL_MOCK_APPLICATIONS: VendorApplicationResponse[] = [
  {
    id: 1,
    userId: 3,
    userEmail: 'user@smarttravel.com',
    userFullName: 'Nguyễn Văn Du Khách',
    userPhone: '0912345678',
    businessName: 'Công Ty TNHH Du Lịch Quốc Tế Á Châu (Asia Travel)',
    taxCode: '0318998877',
    businessAddress: '128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    hotline: '02838229988',
    contactEmail: 'contact@asiatravel.vn',
    website: 'https://asiatravel.vn',
    description: 'Chuyên tổ chức các tour du lịch sinh thái miền Tây, tour xuyên Việt và các tour Đông Nam Á cao cấp.',
    representativeName: 'Nguyễn Văn Du Khách',
    businessLicenseUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 2,
    userId: 2,
    userEmail: 'vendor@smarttravel.com',
    userFullName: 'Vietravel Official',
    userPhone: '0908888999',
    businessName: 'Công Ty Cổ Phần Du Lịch & Tiếp Thị GTVT Việt Nam (Vietravel)',
    taxCode: '0300456321',
    businessAddress: '190 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    hotline: '19001839',
    contactEmail: 'info@vietravel.com',
    website: 'https://vietravel.com',
    description: 'Tập đoàn du lịch hàng đầu Việt Nam cung cấp các tour nội địa và quốc tế chuyên nghiệp.',
    representativeName: 'Nguyễn Quốc Kỳ',
    businessLicenseUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    status: 'APPROVED',
    reviewedBy: 'admin@smarttravel.com',
    reviewedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  }
];

const getStoredApplications = (): VendorApplicationResponse[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_APPLICATIONS));
    return INITIAL_MOCK_APPLICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MOCK_APPLICATIONS;
  }
};

const saveStoredApplications = (apps: VendorApplicationResponse[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
  window.dispatchEvent(new Event('smarttravel_vendor_apps_updated'));
};

export const vendorApplicationService = {
  // 1. Khách hàng nộp đơn đăng ký đại lý
  submitApplication: async (data: VendorApplicationRequest): Promise<ApiResponse<VendorApplicationResponse>> => {
    try {
      const res = await axiosClient.post<any, ApiResponse<VendorApplicationResponse>>('/vendor-applications/submit', data);
      if (res && res.data) {
        // Cập nhật cả cache local
        const apps = getStoredApplications();
        apps.unshift(res.data);
        saveStoredApplications(apps);
        return res;
      }
    } catch (err: any) {
      console.warn('Backend /vendor-applications/submit failed, falling back to local simulation:', err);
      // Nếu là lỗi validation hoặc nghiệp vụ từ backend có status thì rethrow
      if (err?.response?.data?.message || err?.message?.includes('đã là')) {
        throw err;
      }
    }

    // Fallback simulation nếu backend offline
    const savedUserStr = localStorage.getItem('user');
    const user = savedUserStr ? JSON.parse(savedUserStr) : null;
    const newApp: VendorApplicationResponse = {
      id: Date.now(),
      userId: user?.id || 1,
      userEmail: user?.email || 'user@smarttravel.com',
      userFullName: user?.fullName || 'Khách hàng SmartTravel',
      userPhone: user?.phone || data.hotline,
      businessName: data.businessName,
      taxCode: data.taxCode,
      businessAddress: data.businessAddress,
      hotline: data.hotline,
      contactEmail: data.contactEmail || user?.email,
      website: data.website,
      description: data.description,
      representativeName: data.representativeName,
      businessLicenseUrl: data.businessLicenseUrl,
      idCardFrontUrl: data.idCardFrontUrl,
      idCardBackUrl: data.idCardBackUrl,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const apps = getStoredApplications();
    // Thay thế đơn cũ của user này nếu có
    const filtered = apps.filter(a => a.userEmail !== newApp.userEmail);
    filtered.unshift(newApp);
    saveStoredApplications(filtered);

    return {
      status: 201,
      success: true,
      message: 'Nộp hồ sơ đăng ký đối tác thành công. Vui lòng chờ Ban Quản Trị xét duyệt.',
      data: newApp,
      timestamp: new Date().toISOString(),
    };
  },

  // 2. Khách hàng kiểm tra đơn gần nhất của mình
  getMyApplication: async (): Promise<ApiResponse<VendorApplicationResponse | null>> => {
    try {
      const res = await axiosClient.get<any, ApiResponse<VendorApplicationResponse>>('/vendor-applications/my-status');
      if (res && res.data) {
        // Tự động đồng bộ vai trò user trong localStorage nếu hồ sơ là APPROVED hoặc REVOKED
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          const user = JSON.parse(savedUserStr);
          if (res.data.status === 'APPROVED' && !user.roles?.includes('ROLE_VENDOR')) {
            user.roles = [...(user.roles || []), 'ROLE_VENDOR'];
            localStorage.setItem('user', JSON.stringify(user));
          } else if (res.data.status === 'REVOKED' && user.roles?.some((r: any) => (typeof r === 'string' ? r === 'ROLE_VENDOR' : r.name === 'ROLE_VENDOR'))) {
            user.roles = (user.roles || []).filter((r: any) => (typeof r === 'string' ? r !== 'ROLE_VENDOR' : r.name !== 'ROLE_VENDOR'));
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        return res;
      }
    } catch {
      // Fallback
    }

    const savedUserStr = localStorage.getItem('user');
    const user = savedUserStr ? JSON.parse(savedUserStr) : null;
    const apps = getStoredApplications();
    const myApp = apps.find(a => a.userEmail === user?.email) || null;

    // Tự động đồng bộ vai trò user nếu hồ sơ được duyệt hoặc thu hồi trong chế độ demo
    if (user && myApp) {
      if (myApp.status === 'APPROVED' && !user.roles?.includes('ROLE_VENDOR')) {
        user.roles = [...(user.roles || []), 'ROLE_VENDOR'];
        localStorage.setItem('user', JSON.stringify(user));
      } else if (myApp.status === 'REVOKED' && user.roles?.some((r: any) => (typeof r === 'string' ? r === 'ROLE_VENDOR' : r.name === 'ROLE_VENDOR'))) {
        user.roles = (user.roles || []).filter((r: any) => (typeof r === 'string' ? r !== 'ROLE_VENDOR' : r.name !== 'ROLE_VENDOR'));
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: myApp,
      timestamp: new Date().toISOString(),
    };
  },

  // 3. Admin lấy danh sách hồ sơ (có filter theo status)
  getAllApplications: async (status?: VendorApplicationStatus): Promise<ApiResponse<VendorApplicationResponse[]>> => {
    const params = status ? `?status=${status}` : '';
    try {
      const res = await axiosClient.get<any, ApiResponse<VendorApplicationResponse[]>>(`/admin/vendor-applications${params}`);
      if (res && res.data && Array.isArray(res.data)) {
        if (!status) {
          saveStoredApplications(res.data);
        }
        return res;
      }
    } catch {
      // Fallback
    }

    const apps = getStoredApplications();
    const filtered = status ? apps.filter(a => a.status === status) : apps;

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: filtered,
      timestamp: new Date().toISOString(),
    };
  },

  // 4. Admin xem chi tiết 1 hồ sơ
  getApplicationById: async (id: number): Promise<ApiResponse<VendorApplicationResponse>> => {
    try {
      const res = await axiosClient.get<any, ApiResponse<VendorApplicationResponse>>(`/admin/vendor-applications/${id}`);
      if (res && res.data) {
        return res;
      }
    } catch {
      // Fallback
    }

    const apps = getStoredApplications();
    const found = apps.find(a => a.id === id);
    if (!found) {
      throw new Error('Không tìm thấy hồ sơ đăng ký.');
    }

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: found,
      timestamp: new Date().toISOString(),
    };
  },

  // 5. Admin phê duyệt hoặc từ chối hồ sơ
  reviewApplication: async (id: number, review: VendorApplicationReviewRequest): Promise<ApiResponse<VendorApplicationResponse>> => {
    try {
      const res = await axiosClient.put<any, ApiResponse<VendorApplicationResponse>>(`/admin/vendor-applications/${id}/review`, review);
      if (res && res.data) {
        // Cập nhật cả cache local
        const apps = getStoredApplications();
        const index = apps.findIndex(a => a.id === id);
        if (index !== -1) {
          apps[index] = res.data;
          saveStoredApplications(apps);
        }
        return res;
      }
    } catch (err: any) {
      console.warn('Backend /admin/vendor-applications/review failed, falling back to local simulation:', err);
      if (err?.response?.data?.message) {
        throw err;
      }
    }

    const apps = getStoredApplications();
    const target = apps.find(a => a.id === id);
    if (!target) {
      throw new Error('Không tìm thấy hồ sơ đăng ký.');
    }

    const savedUserStr = localStorage.getItem('user');
    const adminUser = savedUserStr ? JSON.parse(savedUserStr) : null;

    target.status = review.status;
    target.reviewedBy = adminUser?.email || 'admin@smarttravel.com';
    target.reviewedAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();

    if (review.status === 'REJECTED') {
      target.rejectionReason = review.reason || 'Thông tin giấy tờ chưa hợp lệ';
    } else if (review.status === 'APPROVED') {
      target.rejectionReason = undefined;
      // Nâng cấp quyền tài khoản nếu người dùng hiện tại đang đăng nhập là tài khoản này
      if (savedUserStr && adminUser && adminUser.email === target.userEmail) {
        if (!adminUser.roles.includes('ROLE_VENDOR')) {
          adminUser.roles.push('ROLE_VENDOR');
          localStorage.setItem('user', JSON.stringify(adminUser));
        }
      }
    }

    saveStoredApplications(apps);

    return {
      status: 200,
      success: true,
      message: review.status === 'APPROVED' ? 'Đã phê duyệt hồ sơ đối tác' : 'Đã từ chối hồ sơ đối tác',
      data: target,
      timestamp: new Date().toISOString(),
    };
  },

  // 6. Admin thu hồi quyền Vendor và chuyển tài khoản về Khách hàng thường
  revokeVendor: async (id: number): Promise<ApiResponse<VendorApplicationResponse>> => {
    try {
      const res = await axiosClient.put<any, ApiResponse<VendorApplicationResponse>>(`/admin/vendor-applications/${id}/revoke`);
      if (res && res.data) {
        const apps = getStoredApplications();
        const index = apps.findIndex(a => a.id === id);
        if (index !== -1) {
          apps[index] = res.data;
          saveStoredApplications(apps);
        }
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (u.email === res.data.userEmail) {
            u.roles = (u.roles || []).filter((r: any) => (typeof r === 'string' ? r !== 'ROLE_VENDOR' : r.name !== 'ROLE_VENDOR'));
            localStorage.setItem('user', JSON.stringify(u));
          }
        }
        return res;
      }
    } catch (err: any) {
      console.warn('Backend /admin/vendor-applications/revoke failed, falling back to local simulation:', err);
    }

    const apps = getStoredApplications();
    const target = apps.find(a => a.id === id);
    if (!target) {
      throw new Error('Không tìm thấy hồ sơ đăng ký.');
    }

    target.status = 'REVOKED';
    target.rejectionReason = 'Thu hồi tư cách đối tác Vendor bởi Admin';
    target.updatedAt = new Date().toISOString();

    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      const currentUser = JSON.parse(savedUserStr);
      if (currentUser.email === target.userEmail) {
        currentUser.roles = (currentUser.roles || []).filter((r: any) => (typeof r === 'string' ? r !== 'ROLE_VENDOR' : r.name !== 'ROLE_VENDOR'));
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    }

    saveStoredApplications(apps);

    return {
      status: 200,
      success: true,
      message: 'Đã thu hồi quyền Vendor và chuyển tài khoản về Khách hàng thường thành công',
      data: target,
      timestamp: new Date().toISOString(),
    };
  }
};
