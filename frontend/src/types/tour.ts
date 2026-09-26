export enum TourStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
  FULL = 'FULL',
}

export enum TourCategory {
  INBOUND = 'INBOUND',
  DOMESTIC = 'DOMESTIC',
  LE_2_9 = 'LE_2_9',
  TET_NGUYEN_DAN = 'TET_NGUYEN_DAN',
  KHUYEN_MAI = 'KHUYEN_MAI',
  NUOC_NGOAI = 'NUOC_NGOAI',
  HANG_TUAN = 'HANG_TUAN',
  RESORT = 'RESORT',
  ADVENTURE = 'ADVENTURE',
  FOOD = 'FOOD',
  FAMILY = 'FAMILY'
}

export interface Tour {
  id: number;
  title: string;
  description?: string;
  price: number;
  childPrice?: number;
  durationDays: number;
  durationNights: number;
  departureLocation: string;
  thumbnailUrl?: string;
  tourCode?: string;
  category?: TourCategory;
  includedServices?: string;
  excludedServices?: string;
  cancellationPolicy?: string;
  itineraryDetails?: string;
  remainingSeats?: number;
  viewCount?: number;
  status: TourStatus;
  maxGroupSize?: number;
  vendorId?: number;
  vendorName?: string;
  destinationId?: number;
  destinationName?: string;
  averageRating?: number;
  totalReviews?: number;
  ratingBreakdown?: Record<number, number>;
  gallery?: string[];
  singleRoomSurcharge?: number;
  minParticipants?: number;
}

export interface TourSearchParams {
  departure?: string;
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
}

export interface TourCreateRequest {
  title: string;
  description?: string;
  price: number;
  childPrice?: number;
  durationDays: number;
  durationNights: number;
  departureLocation: string;
  thumbnailUrl?: string;
  destinationId?: number;
  category?: TourCategory;
  tourCode?: string;
  remainingSeats?: number;
}

