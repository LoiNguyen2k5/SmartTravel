export type VisaApplicationStatus =
  | 'PENDING_DOCS'
  | 'REVIEWING'
  | 'NEED_MORE_DOCS'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED';

export type VisaDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─────────────────────────────────────────────────────────────
// MẪU VISA THEO QUỐC GIA (Visa Template)
// Vendor tạo mẫu 1 lần trên Backend, gắn vào nhiều tour cùng quốc gia
// ─────────────────────────────────────────────────────────────
export interface VisaTemplateDocument {
  id?: number;
  documentName: string;
  description: string;
  isMandatory: boolean;
}

export interface VisaTemplate {
  id: number;
  country: string;           // Tên quốc gia (VD: "Nhật Bản", "Hàn Quốc", "Schengen")
  countryCode: string;       // ISO code (VD: "JP", "KR", "EU")
  flagEmoji: string;         // Emoji cờ (VD: "🇯🇵")
  processingDays: number;    // Số ngày ĐSQ/LSQ xử lý dự kiến
  bufferDays?: number;       // Số ngày Đại lý sơ duyệt & chuẩn bị nộp (mặc định 3)
  visaFee: number;           // Phí dịch vụ hỗ trợ của Đại lý (cộng vào đơn hàng)
  consularFee?: number;      // Lệ phí Lãnh sự tham khảo (tách riêng, không gộp vào giá tour)
  notes?: string;            // Ghi chú thêm (nơi Đại lý đại diện nộp: VFS, KVAC, LSQ...)
  vendorId?: number;
  isSystemDefault?: boolean;
  documents: VisaTemplateDocument[];
  tourCount?: number;        // Số tour đang dùng template này
}

export interface VisaTemplateRequest {
  country: string;
  countryCode: string;
  flagEmoji?: string;
  processingDays: number;
  bufferDays?: number;
  visaFee: number;
  consularFee?: number;
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
  visaFee?: number;
  consularFee?: number;
  processingDays?: number;
  bufferDays?: number;
}

// ─────────────────────────────────────────────────────────────
// HỒ SƠ ỦY QUYỀN XIN VISA CỦA KHÁCH HÀNG (Visa Application)
// ─────────────────────────────────────────────────────────────
export interface VisaDocumentResponse {
  id: number;
  requirementId: number;
  documentName: string;
  originalFileName?: string;
  contentType?: string;
  fileSize?: number;
  fileUrl?: string | null;
  hasFile?: boolean;
  filePurged?: boolean;
  status: VisaDocumentStatus;
  vendorFeedback?: string;
  reviewedAt?: string;       // Thời điểm chuyên viên Đại lý sơ duyệt
  reviewedBy?: string;       // Tên chuyên viên Đại lý đã kiểm tra
}

export interface VisaStatusLog {
  id: number;
  fromStatus?: VisaApplicationStatus | null;
  toStatus: VisaApplicationStatus;
  note?: string;
  actorEmail?: string;
  actorRole?: string;
  createdAt: string;
}

export interface VisaApplicationResponse {
  id: number;
  bookingId: number;
  bookingCode?: string;
  tourId?: number;
  tourTitle?: string;
  departureDate?: string;    // Ngày khởi hành
  visaDeadline?: string;     // Hạn chót nộp hồ sơ do Backend tính (departureDate - processingDays - bufferDays)
  templateId?: number;       // ID của mẫu visa đang dùng
  country?: string;
  processingDays?: number;   // Số ngày ĐSQ xử lý (kéo từ template)
  bufferDays?: number;       // Số ngày Đại lý sơ duyệt
  visaFee?: number;
  consularFee?: number;
  customerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: VisaApplicationStatus;
  notes?: string;
  embassyReceiptCode?: string; // Mã biên nhận VFS / KVAC / ĐSQ khi Đại lý đi nộp offline
  submittedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  documents: VisaDocumentResponse[];
  statusLogs?: VisaStatusLog[];
}
