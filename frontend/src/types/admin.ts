import { Booking } from './booking';

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalActiveTours: number;
  totalPendingTours: number;
  totalBookings: number;
  successfulBookings: number;
  totalGrossRevenue: number;
  totalPlatformCommission: number;
  defaultCommissionRate: number;
  monthlyRevenue: Record<string, number>;
  topDestinations: Array<{
    id: number;
    name: string;
    city: string;
    imageUrl?: string;
    tourCount: number;
  }>;
  recentBookings: Booking[];
}

export interface VendorSettlement {
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  totalTours: number;
  totalBookings: number;
  totalGrossRevenue: number;
  commissionRate: number;
  platformFee: number;
  netPayout: number;
  settlementStatus: string;
}

export interface PaymentRecord {
  id: number;
  bookingId?: number;
  bookingCode?: string;
  transactionId?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentTime?: string;
}

export interface DestinationItem {
  id?: number;
  name: string;
  description?: string;
  city: string;
  country: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}
