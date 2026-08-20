import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';

export interface Destination {
  id: number;
  name: string;
  description?: string;
  city: string;
  country: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export const destinationService = {
  getAllDestinations: async (): Promise<ApiResponse<Destination[]>> => {
    return await axiosClient.get('/destinations');
  },

  getDestinationById: async (id: number): Promise<ApiResponse<Destination>> => {
    return await axiosClient.get(`/destinations/${id}`);
  },

  createDestination: async (data: Partial<Destination>): Promise<ApiResponse<Destination>> => {
    return await axiosClient.post('/destinations', data);
  },
};
