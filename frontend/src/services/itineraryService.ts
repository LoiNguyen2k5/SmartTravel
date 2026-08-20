import axiosClient from './axiosClient';
import { Itinerary, ItineraryCreateRequest, ItineraryItem } from '../types/itinerary';
import { ApiResponse } from '../types/common';

export const itineraryService = {
  createItinerary: async (data: ItineraryCreateRequest): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.post('/itineraries', data);
  },

  getMyItineraries: async (): Promise<ApiResponse<Itinerary[]>> => {
    return await axiosClient.get('/itineraries/my-itineraries');
  },

  getItineraryById: async (id: number): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.get(`/itineraries/${id}`);
  },

  getItineraryByShareToken: async (token: string): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.get(`/itineraries/share/${token}`);
  },

  addItem: async (itineraryId: number, dayId: number, item: Partial<ItineraryItem>): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.post(`/itineraries/${itineraryId}/days/${dayId}/items`, item);
  },

  deleteItem: async (itineraryId: number, itemId: number): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.delete(`/itineraries/${itineraryId}/items/${itemId}`);
  },

  reorderItems: async (itineraryId: number, dayId: number, itemIdsInOrder: number[]): Promise<ApiResponse<Itinerary>> => {
    return await axiosClient.put(`/itineraries/${itineraryId}/days/${dayId}/reorder`, itemIdsInOrder);
  },

  generateShareLink: async (itineraryId: number): Promise<ApiResponse<{ shareToken: string; shareUrl: string }>> => {
    return await axiosClient.post(`/itineraries/${itineraryId}/generate-share-link`);
  },
};
