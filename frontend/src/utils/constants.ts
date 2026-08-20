export const APP_NAME = 'SmartTravel';
export const API_BASE_URL = '/api/v1';

export const TOKEN_KEY = 'smart_travel_token';
export const USER_KEY = 'smart_travel_user';

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  VENDOR: 'ROLE_VENDOR',
  USER: 'ROLE_USER',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export const PAYMENT_METHOD = {
  VNPAY: 'VNPAY',
  MOMO: 'MOMO',
  ZALOPAY: 'ZALOPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CENTER: [number, number] = [16.054407, 108.202167]; // Đà Nẵng
