export enum RoleEnum {
  ROLE_USER = 'ROLE_USER',
  ROLE_VENDOR = 'ROLE_VENDOR',
  ROLE_ADMIN = 'ROLE_ADMIN',
}

export enum OtpType {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  enabled: boolean;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roles?: string[];
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  type: OtpType;
}

export interface ResendOtpRequest {
  email: string;
  type: OtpType;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}
