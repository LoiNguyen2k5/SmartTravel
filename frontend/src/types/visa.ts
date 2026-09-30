export type VisaApplicationStatus = 'PENDING_DOCS' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
export type VisaDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─────────────────────────────────────────────────────────────
// MẪU VISA THEO QUỐC GIA (Visa Template)
// Vendor tạo mẫu 1 lần, gắn vào nhiều tour cùng quốc gia
// ─────────────────────────────────────────────────────────────
export interface VisaTemplateDocument {
  id: number;
  documentName: string;
  description: string;
  isMandatory: boolean;
}

export interface VisaTemplate {
  id: number;
  country: string;           // Tên quốc gia (VD: "Nhật Bản", "Hàn Quốc", "Schengen")
  countryCode: string;       // ISO code (VD: "JP", "KR", "EU")
  flagEmoji: string;         // Emoji cờ (VD: "🇯🇵")
  processingDays: number;    // Số ngày xử lý dự kiến (VD: 7 cho Nhật)
  visaFee: number;           // Phí dịch vụ visa (VND)
  notes?: string;            // Ghi chú thêm (ĐSQ địa chỉ, giờ nộp...)
  documents: VisaTemplateDocument[];
  tourCount?: number;        // Số tour đang dùng template này
}

export interface VisaTemplateRequest {
  country: string;
  countryCode: string;
  flagEmoji: string;
  processingDays: number;
  visaFee: number;
  notes?: string;
  documents: Omit<VisaTemplateDocument, 'id'>[];
}

// ─────────────────────────────────────────────────────────────
// YÊU CẦU GIẤY TỜ VISA CHO TỪNG TOUR
// ─────────────────────────────────────────────────────────────
export interface VisaRequirementRequest {
  documentName: string;
  description: string;
  isMandatory: boolean;
}

export interface VisaRequirementResponse {
  id: number;
  tourId: number;
  documentName: string;
  description: string;
  isMandatory: boolean;
}

// ─────────────────────────────────────────────────────────────
// HỒ SƠ XIN VISA CỦA KHÁCH HÀNG (Visa Application)
// ─────────────────────────────────────────────────────────────
export interface VisaDocumentResponse {
  id: number;
  requirementId: number;
  documentName: string;
  fileUrl: string;
  status: VisaDocumentStatus;
  vendorFeedback?: string;
  reviewedAt?: string;       // Thời điểm vendor duyệt
  reviewedBy?: string;       // Tên vendor/staff đã duyệt
}

export interface VisaApplicationResponse {
  id: number;
  bookingId: number;
  tourId?: number;
  tourTitle?: string;
  departureDate?: string;    // Ngày khởi hành (để tính deadline)
  templateId?: number;       // ID của mẫu visa đang dùng
  processingDays?: number;   // Số ngày xử lý (kéo từ template)
  customerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: VisaApplicationStatus;
  notes?: string;
  submittedAt?: string;      // Khi nào khách nộp đủ
  updatedAt?: string;
  documents: VisaDocumentResponse[];
}

