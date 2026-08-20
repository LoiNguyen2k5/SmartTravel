import axiosClient from './axiosClient';
import { Tour, TourCreateRequest, TourSearchParams } from '../types/tour';
import { ApiResponse } from '../types/common';

export const tourService = {
  getAllTours: async (): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get('/tours');
  },

  searchTours: async (params: TourSearchParams): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get('/tours/search', { params });
  },

  getTourById: async (id: number): Promise<ApiResponse<Tour>> => {
    return await axiosClient.get(`/tours/${id}`);
  },

  createTour: async (data: TourCreateRequest): Promise<ApiResponse<Tour>> => {
    return await axiosClient.post('/tours', data);
  },

  getMyTours: async (): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get('/tours/my-tours');
  },
};
