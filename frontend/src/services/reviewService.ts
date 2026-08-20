import axiosClient from './axiosClient';
import { Review, ReviewCreateRequest } from '../types/review';
import { ApiResponse } from '../types/common';

export const reviewService = {
  createReview: async (data: ReviewCreateRequest): Promise<ApiResponse<Review>> => {
    return await axiosClient.post('/reviews', data);
  },

  getReviewsByTourId: async (tourId: number): Promise<ApiResponse<Review[]>> => {
    return await axiosClient.get(`/reviews/tour/${tourId}`);
  },

  checkEligibility: async (tourId: number): Promise<ApiResponse<boolean>> => {
    return await axiosClient.get('/reviews/check-eligibility', { params: { tourId } });
  },
};
