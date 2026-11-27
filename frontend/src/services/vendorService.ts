import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { Tour } from '../types/tour';

export const vendorService = {
  getDashboardStats: async (): Promise<ApiResponse<Record<string, any>>> => {
    return await axiosClient.get('/vendor/dashboard');
  },

  getVendorTours: async (): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get('/vendor/tours');
  },

  getBusinessProfile: async (): Promise<ApiResponse<Record<string, string>>> => {
    return await axiosClient.get('/vendor/profile');
  },

  updateBusinessProfile: async (data: Record<string, string>): Promise<ApiResponse<Record<string, string>>> => {
    return await axiosClient.put('/vendor/profile', data);
  },
};
