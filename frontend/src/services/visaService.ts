import axios from 'axios';
import { VisaApplicationResponse, VisaRequirementRequest, VisaRequirementResponse, VisaDocumentStatus, VisaApplicationStatus } from '../types/visa';

// Thay đổi URL này nếu Backend của cậu chạy ở port khác (mặc định Spring Boot là 8080)
const API_URL = 'http://localhost:8080/api'; 

// Cấu hình axios để luôn gửi kèm Token (nếu có)
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor: Tự động đính kèm JWT Token vào Header của mọi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Lấy token từ LocalStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const visaService = {
  // ==========================================
  // CUSTOMER / PUBLIC API
  // ==========================================
  
  // 1. Lấy danh sách giấy tờ yêu cầu cho 1 Tour (Khách xem trước)
  getRequirements: async (tourId: number): Promise<VisaRequirementResponse[]> => {
    // MOCK FOR DEMO - Luôn trả về 4 giấy tờ chuẩn để UI đẹp và đầy đủ
    return [
      {
        id: 1, tourId: tourId, documentName: 'Hộ chiếu (Trang thông tin)',
        description: 'Chụp hoặc scan rõ nét trang có ảnh và thông tin cá nhân. Hộ chiếu phải còn hạn ít nhất 6 tháng.',
        isMandatory: true
      },
      {
        id: 2, tourId: tourId, documentName: 'Ảnh thẻ 4x6',
        description: 'Ảnh chụp phông nền trắng, không đeo kính, mới chụp trong vòng 6 tháng.',
        isMandatory: true
      },
      {
        id: 3, tourId: tourId, documentName: 'Căn cước công dân (CCCD)',
        description: 'Chụp rõ nét mặt trước và mặt sau của CCCD.',
        isMandatory: true
      },
      {
        id: 4, tourId: tourId, documentName: 'Chứng minh tài chính (Tuỳ chọn nộp trước)',
        description: 'Sổ tiết kiệm (Tối thiểu 100tr) hoặc Sao kê tài khoản. Giúp chúng tôi thẩm định khả năng đậu Visa của bạn sớm hơn.',
        isMandatory: false
      }
    ];
  },

  // 2. Khởi tạo hồ sơ xin Visa (Khi đặt tour xong)
  createApplication: async (bookingId: number, bookingData?: any): Promise<VisaApplicationResponse> => {
    try {
      const res = await axiosInstance.post(`/customer/bookings/${bookingId}/visa-application`);
      return res.data;
    } catch (e) {
      // MOCK FALLBACK FOR DEMO
      const apps: VisaApplicationResponse[] = JSON.parse(localStorage.getItem('mock_visa_apps') || '[]');
      const existing = apps.find(a => a.bookingId === bookingId);
      if (existing) return existing;

      const newApp: VisaApplicationResponse = {
        id: Date.now(),
        bookingId: bookingId,
        tourId: bookingData?.tourId,
        tourTitle: bookingData?.tourTitle,
        customerName: bookingData?.contactName || bookingData?.userName,
        contactEmail: bookingData?.contactEmail,
        contactPhone: bookingData?.contactPhone,
        status: 'PENDING_DOCS',
        documents: [],
        notes: ''
      };
      localStorage.setItem('mock_visa_apps', JSON.stringify([...apps, newApp]));
      return newApp;
    }
  },

  // 3. Xem tiến độ hồ sơ Visa của mình
  getApplication: async (bookingId: number): Promise<VisaApplicationResponse> => {
    try {
      const res = await axiosInstance.get(`/customer/bookings/${bookingId}/visa-application`);
      return res.data;
    } catch (e) {
      // MOCK FALLBACK FOR DEMO
      const apps: VisaApplicationResponse[] = JSON.parse(localStorage.getItem('mock_visa_apps') || '[]');
      const app = apps.find(a => a.bookingId === bookingId);
      if (app) return app;
      throw new Error("Not found");
    }
  },

  // 4. Khách hàng Upload ảnh/file giấy tờ
  uploadDocument: async (applicationId: number, requirementId: number, file: File): Promise<VisaApplicationResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axiosInstance.post(`/customer/visa-applications/${applicationId}/documents?requirementId=${requirementId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (e) {
      // MOCK FALLBACK FOR DEMO
      const apps: VisaApplicationResponse[] = JSON.parse(localStorage.getItem('mock_visa_apps') || '[]');
      const appIndex = apps.findIndex(a => a.id === applicationId);
      if (appIndex >= 0) {
        const app = apps[appIndex];
        const docIndex = app.documents.findIndex(d => d.requirementId === requirementId);
        const docUrl = URL.createObjectURL(file); // Mock uploaded URL
        
        if (docIndex >= 0) {
          app.documents[docIndex].fileUrl = docUrl;
          app.documents[docIndex].status = 'PENDING';
        } else {
          // Lấy tên requirement thực tế để lưu (Liên kết dữ liệu)
          let realDocName = "Giấy tờ tải lên";
          if (app.tourId) {
            const reqs = await visaService.getRequirements(app.tourId);
            const r = reqs.find(x => x.id === requirementId);
            if (r) realDocName = r.documentName;
          }
          app.documents.push({
            id: Date.now(),
            requirementId: requirementId,
            documentName: realDocName,
            fileUrl: docUrl,
            status: 'PENDING'
          });
        }
        
        // Khách hàng mới tải lên 1 giấy tờ, trạng thái tổng của hồ sơ vẫn là PENDING_DOCS
        // Admin sẽ duyệt và đổi trạng thái sau.
        
        apps[appIndex] = app;
        localStorage.setItem('mock_visa_apps', JSON.stringify(apps));
        return app;
      }
      throw new Error("Not found");
    }
  },

  // ==========================================
  // VENDOR / ADMIN API
  // ==========================================

  // 1. Vendor cấu hình danh sách giấy tờ cho Tour
  saveRequirements: async (tourId: number, requests: VisaRequirementRequest[]): Promise<VisaRequirementResponse[]> => {
    const res = await axiosInstance.post(`/vendor/tours/${tourId}/visa-requirements`, requests);
    return res.data;
  },

  // 2. Lấy tất cả hồ sơ để quản lý
  getAllApplications: async (): Promise<VisaApplicationResponse[]> => {
    try {
      const res = await axiosInstance.get(`/vendor/visa-applications`);
      if (res.data && res.data.length > 0) return res.data;
      throw new Error("Empty from API, fallback to mock");
    } catch (e) {
      const mockStr = localStorage.getItem('mock_visa_apps');
      if (!mockStr) return [];
      const apps: VisaApplicationResponse[] = JSON.parse(mockStr);
      // Lọc trùng lặp phòng trường hợp user click nhiều lần tạo duplicate
      const uniqueApps = Array.from(new Map(apps.map(app => [app.bookingId, app])).values());
      if (uniqueApps.length !== apps.length) {
         localStorage.setItem('mock_visa_apps', JSON.stringify(uniqueApps));
      }
      return uniqueApps;
    }
  },

  // 3. Vendor duyệt/từ chối 1 loại giấy tờ
  updateDocumentStatus: async (documentId: number, status: VisaDocumentStatus, feedback?: string): Promise<VisaApplicationResponse> => {
    try {
      const url = `/vendor/visa-documents/${documentId}/status?status=${status}${feedback ? `&vendorFeedback=${encodeURIComponent(feedback)}` : ''}`;
      const res = await axiosInstance.put(url);
      return res.data;
    } catch (e) {
      const apps: VisaApplicationResponse[] = JSON.parse(localStorage.getItem('mock_visa_apps') || '[]');
      let updatedApp = null;
      for (const app of apps) {
        const doc = app.documents.find(d => Number(d.id) === Number(documentId) || d.id === documentId);
        if (doc) {
          doc.status = status;
          doc.vendorFeedback = feedback;
          updatedApp = app;
          break;
        }
      }
      if (updatedApp) {
        localStorage.setItem('mock_visa_apps', JSON.stringify(apps));
        return updatedApp;
      }
      throw new Error("Application not found for document");
    }
  },

  // 4. Vendor cập nhật trạng thái tổng thể (Đang xử lý, Rớt, Đậu)
  updateApplicationStatus: async (applicationId: number, status: VisaApplicationStatus, notes?: string): Promise<VisaApplicationResponse> => {
    try {
      const url = `/vendor/visa-applications/${applicationId}/status?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`;
      const res = await axiosInstance.put(url);
      return res.data;
    } catch (e) {
      const apps: VisaApplicationResponse[] = JSON.parse(localStorage.getItem('mock_visa_apps') || '[]');
      const appIndex = apps.findIndex(a => a.id === applicationId);
      if (appIndex !== -1) {
        apps[appIndex].status = status;
        if (notes) apps[appIndex].notes = notes;
        localStorage.setItem('mock_visa_apps', JSON.stringify(apps));
        return apps[appIndex];
      }
      throw new Error("Application not found");
    }
  }
};
