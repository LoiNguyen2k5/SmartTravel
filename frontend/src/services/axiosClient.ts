import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Tự động gắn JWT Token vào Header Authorization
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý tập trung response và các mã lỗi 401, 403, 500
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về trực tiếp data từ API nếu bọc bởi ApiResponse
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Clear local storage khi token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Không redirect nếu đang ở trang auth
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      } else if (status === 403) {
        console.error('Lỗi 403: Bạn không có quyền truy cập chức năng này.');
      } else if (status >= 500) {
        console.error('Lỗi 500: Lỗi hệ thống máy chủ.');
      }
    } else if (error.request) {
      console.error('Lỗi kết nối mạng: Máy chủ Backend không phản hồi.');
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
