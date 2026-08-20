import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';
import { User } from '../types/auth';

export const adminService = {
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return await axiosClient.get('/admin/users');
  },

  getAllBookings: async (): Promise<ApiResponse<any[]>> => {
    return await axiosClient.get('/admin/bookings');
  },
};
