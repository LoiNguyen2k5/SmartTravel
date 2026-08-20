export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  errors?: ValidationErrorDetail[];
  timestamp: string;
}
