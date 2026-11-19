import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import {
  VisaApplicationResponse,
  VisaApplicationStatus,
  VisaDocumentStatus,
  VisaRequirementRequest,
  VisaRequirementResponse,
  VisaTemplate,
  VisaTemplateRequest,
} from '../types/visa';

/**
 * Helper mở khóa data từ ApiResponse<T> của axiosClient
 */
function unwrap<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

export const visaService = {
  // ==========================================
  // PUBLIC API (/api/v1/tours/**)
  // ==========================================

  getRequirements: async (tourId: number): Promise<VisaRequirementResponse[]> => {
    const res = await axiosClient.get<any, ApiResponse<VisaRequirementResponse[]>>(
      `/tours/${tourId}/visa-requirements`
    );
    return unwrap(res) || [];
  },

  // ==========================================
  // CUSTOMER API (/api/v1/user/**)
  // ==========================================

  createApplication: async (bookingId: number): Promise<VisaApplicationResponse> => {
    const res = await axiosClient.post<any, ApiResponse<VisaApplicationResponse>>(
      `/user/bookings/${bookingId}/visa-application`
    );
    return unwrap(res);
  },

  getApplication: async (bookingId: number): Promise<VisaApplicationResponse> => {
    const res = await axiosClient.get<any, ApiResponse<VisaApplicationResponse>>(
      `/user/bookings/${bookingId}/visa-application`
    );
    return unwrap(res);
  },

  uploadDocument: async (
    applicationId: number,
    requirementId: number,
    file: File
  ): Promise<VisaApplicationResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<any, ApiResponse<VisaApplicationResponse>>(
      `/user/visa-applications/${applicationId}/documents?requirementId=${requirementId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap(res);
  },

  submitApplication: async (applicationId: number): Promise<VisaApplicationResponse> => {
    const res = await axiosClient.post<any, ApiResponse<VisaApplicationResponse>>(
      `/user/visa-applications/${applicationId}/submit`
    );
    return unwrap(res);
  },

  // ==========================================
  // VENDOR / ADMIN API (/api/v1/vendor/**)
  // ==========================================

  getTemplates: async (suggestCountry?: string): Promise<VisaTemplate[]> => {
    const res = await axiosClient.get<any, ApiResponse<VisaTemplate[]>>('/vendor/visa-templates', {
      params: suggestCountry ? { country: suggestCountry } : undefined,
    });
    return unwrap(res) || [];
  },

  createTemplate: async (request: VisaTemplateRequest): Promise<VisaTemplate> => {
    const res = await axiosClient.post<any, ApiResponse<VisaTemplate>>('/vendor/visa-templates', request);
    return unwrap(res);
  },

  updateTemplate: async (id: number, request: VisaTemplateRequest): Promise<VisaTemplate> => {
    const res = await axiosClient.put<any, ApiResponse<VisaTemplate>>(`/vendor/visa-templates/${id}`, request);
    return unwrap(res);
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await axiosClient.delete(`/vendor/visa-templates/${id}`);
  },

  saveRequirements: async (
    tourId: number,
    requests: VisaRequirementRequest[]
  ): Promise<VisaRequirementResponse[]> => {
    const res = await axiosClient.post<any, ApiResponse<VisaRequirementResponse[]>>(
      `/vendor/tours/${tourId}/visa-requirements`,
      requests
    );
    return unwrap(res) || [];
  },

  assignTemplateToTour: async (tourId: number, templateId: number | null): Promise<void> => {
    await axiosClient.put(`/vendor/tours/${tourId}/visa-template`, null, {
      params: templateId != null ? { templateId } : {},
    });
  },

  getAllApplications: async (): Promise<VisaApplicationResponse[]> => {
    const res = await axiosClient.get<any, ApiResponse<VisaApplicationResponse[]>>(
      '/vendor/visa-applications'
    );
    return unwrap(res) || [];
  },

  updateDocumentStatus: async (
    documentId: number,
    status: VisaDocumentStatus,
    feedback?: string
  ): Promise<VisaApplicationResponse> => {
    const res = await axiosClient.put<any, ApiResponse<VisaApplicationResponse>>(
      `/vendor/visa-documents/${documentId}/status`,
      null,
      { params: { status, vendorFeedback: feedback || undefined } }
    );
    return unwrap(res);
  },

  updateApplicationStatus: async (
    applicationId: number,
    status: VisaApplicationStatus,
    notes?: string,
    embassyReceiptCode?: string
  ): Promise<VisaApplicationResponse> => {
    const res = await axiosClient.put<any, ApiResponse<VisaApplicationResponse>>(
      `/vendor/visa-applications/${applicationId}/status`,
      null,
      {
        params: {
          status,
          notes: notes || undefined,
          embassyReceiptCode: embassyReceiptCode || undefined,
        },
      }
    );
    return unwrap(res);
  },

  // ==========================================
  // AUTHENTICATED PRIVATE FILE ACCESS
  // ==========================================

  fetchDocumentBlobUrl: async (documentId: number): Promise<string> => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const response = await fetch(`${baseUrl}/visa-documents/${documentId}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error('Không thể tải tệp giấy tờ bảo mật hoặc bạn không có quyền truy cập.');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  openDocumentInNewTab: async (documentId: number): Promise<void> => {
    const blobUrl = await visaService.fetchDocumentBlobUrl(documentId);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  },
};
