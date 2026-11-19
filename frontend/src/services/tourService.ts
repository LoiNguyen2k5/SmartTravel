import axiosClient from './axiosClient';
import { Tour, TourCreateRequest, TourSearchParams } from '../types/tour';
import { ApiResponse } from '../types/common';

// Giữ lại các helper rỗng tương thích ngược để không ảnh hưởng các import cũ
export const getDeletedTourIds = (): number[] => [];
export const markTourDeleted = (_id: number): void => {};
export const getCustomToursFromStorage = (): Tour[] => [];
export const saveCustomToursToStorage = (_tours: Tour[]): void => {};

export const tourService = {
  getAllTours: async (): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get<any, ApiResponse<Tour[]>>('/tours');
  },

  searchTours: async (params: TourSearchParams): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get<any, ApiResponse<Tour[]>>('/tours/search', { params });
  },

  getTourById: async (id: number): Promise<ApiResponse<Tour>> => {
    return await axiosClient.get<any, ApiResponse<Tour>>(`/tours/${id}`);
  },

  createTour: async (data: TourCreateRequest): Promise<ApiResponse<Tour>> => {
    const res = await axiosClient.post<any, ApiResponse<Tour>>('/tours', data);
    window.dispatchEvent(new CustomEvent('custom_tours_updated'));
    return res;
  },

  getMyTours: async (): Promise<ApiResponse<Tour[]>> => {
    return await axiosClient.get<any, ApiResponse<Tour[]>>('/tours/my-tours');
  },

  updateTour: async (id: number, data: Partial<TourCreateRequest>): Promise<ApiResponse<Tour>> => {
    const res = await axiosClient.put<any, ApiResponse<Tour>>(`/tours/${id}`, data);
    window.dispatchEvent(new CustomEvent('custom_tours_updated'));
    return res;
  },

  deleteTour: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<any, ApiResponse<void>>(`/tours/${id}`);
    window.dispatchEvent(new CustomEvent('tour_deleted', { detail: { id } }));
    window.dispatchEvent(new CustomEvent('custom_tours_updated'));
    return res;
  },
};
