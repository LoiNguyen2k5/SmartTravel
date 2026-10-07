export type VendorApplicationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export interface VendorApplicationRequest {
  businessName: string;
  taxCode: string;
  businessAddress: string;
  hotline: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  representativeName: string;
  businessLicenseUrl: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
}

export interface VendorApplicationReviewRequest {
  status: VendorApplicationStatus;
  reason?: string;
}

export interface VendorApplicationResponse {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  userPhone?: string;
  businessName: string;
  taxCode: string;
  businessAddress: string;
  hotline: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  representativeName: string;
  businessLicenseUrl: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
  status: VendorApplicationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
