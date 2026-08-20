import axiosClient from './axiosClient';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  User,
  VerifyOtpRequest,
} from '../types/auth';
import { ApiResponse } from '../types/common';

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return await axiosClient.post('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return await axiosClient.post('/auth/register', data);
  },

  verifyRegisterOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<User>> => {
    return await axiosClient.post('/auth/verify-register-otp', data);
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse<string>> => {
    return await axiosClient.post('/auth/resend-otp', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<string>> => {
    return await axiosClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    return await axiosClient.post('/auth/reset-password', data);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return await axiosClient.get('/auth/me');
  },
};
