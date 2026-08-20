import axiosClient from './axiosClient';
import { Booking, BookingCreateRequest } from '../types/booking';
import { ApiResponse } from '../types/common';

export const bookingService = {
  createBooking: async (data: BookingCreateRequest): Promise<ApiResponse<Booking>> => {
    return await axiosClient.post('/bookings', data);
  },

  getMyBookings: async (): Promise<ApiResponse<Booking[]>> => {
    return await axiosClient.get('/bookings/my-bookings');
  },

  getBookingById: async (id: number): Promise<ApiResponse<Booking>> => {
    return await axiosClient.get(`/bookings/${id}`);
  },

  cancelBooking: async (id: number): Promise<ApiResponse<Booking>> => {
    return await axiosClient.post(`/bookings/${id}/cancel`);
  },

  updateBookingStatus: async (id: number, status: string): Promise<ApiResponse<Booking>> => {
    return await axiosClient.put(`/bookings/${id}/status?status=${status}`);
  },

  getVendorBookings: async (): Promise<ApiResponse<Booking[]>> => {
    return await axiosClient.get('/vendor/bookings');
  },

  validateVoucher: async (code: string, originalTotal: number): Promise<ApiResponse<{ voucherCode: string; discountAmount: number; finalTotal: number }>> => {
    return await axiosClient.post('/bookings/validate-voucher', { code, originalTotal });
  },
};
