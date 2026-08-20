export type BookingStatusType = 'PENDING' | 'DEPOSITED' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: number;
  bookingCode: string;
  tourId: number;
  tourTitle: string;
  tourThumbnailUrl?: string;
  tourCode?: string;
  durationDays?: number;
  durationNights?: number;
  departureLocation?: string;
  userId: number;
  userName: string;
  numberOfAdults: number;
  numberOfChildren: number;
  adultPrice?: number;
  childPrice?: number;
  voucherCode?: string;
  discountAmount?: number;
  totalPrice: number;
  status: BookingStatusType;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  departureDate?: string;
  qrCodeUrl?: string;
  createdAt: string;
}

export interface BookingCreateRequest {
  tourId: number;
  tourScheduleId?: number;
  numberOfAdults: number;
  numberOfChildren?: number;
  departureDate?: string;
  paymentMethod?: string;
  voucherCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  note?: string;
}
