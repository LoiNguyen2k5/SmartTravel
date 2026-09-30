export type VisaApplicationStatus = 'PENDING_DOCS' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
export type VisaDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

export interface VisaDocumentResponse {
  id: number;
  requirementId: number;
  documentName: string;
  fileUrl: string;
  status: VisaDocumentStatus;
  vendorFeedback?: string;
}

export interface VisaApplicationResponse {
  id: number;
  bookingId: number;
  tourId?: number;
  tourTitle?: string;
  customerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: VisaApplicationStatus;
  notes?: string;
  documents: VisaDocumentResponse[];
}
