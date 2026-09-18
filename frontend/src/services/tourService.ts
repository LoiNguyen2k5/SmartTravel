import axiosClient from './axiosClient';
import { Tour, TourCreateRequest, TourSearchParams } from '../types/tour';
import { ApiResponse } from '../types/common';
import { MOCK_TOURS } from '../data/mockTours';

const CUSTOM_TOURS_KEY = 'smart_travel_custom_tours';

export const getCustomToursFromStorage = (): Tour[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_TOURS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomToursToStorage = (tours: Tour[]): void => {
  try {
    localStorage.setItem(CUSTOM_TOURS_KEY, JSON.stringify(tours));
    window.dispatchEvent(new CustomEvent('custom_tours_updated'));
  } catch (e) {
    console.error('Error saving custom tours', e);
  }
};

export const tourService = {
  getAllTours: async (): Promise<ApiResponse<Tour[]>> => {
    const customTours = getCustomToursFromStorage();
    let apiTours: Tour[] = [];
    try {
      const res = await axiosClient.get<any, ApiResponse<Tour[]>>('/tours');
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        apiTours = res.data;
      }
    } catch {
      // Backend offline or fallback
    }

    // Gộp theo thứ tự: Custom tours (tạo local) + API tours (database) + Mock tours (9 tour mới và tour chuẩn)
    const combined: Tour[] = [...customTours];

    for (const t of apiTours) {
      if (!combined.some(c => c.id === t.id)) {
        combined.push(t);
      }
    }

    for (const m of MOCK_TOURS) {
      const alreadyExists = combined.some(
        c => c.id === m.id || c.title.trim().toLowerCase() === m.title.trim().toLowerCase()
      );
      if (!alreadyExists) {
        combined.push(m);
      }
    }

    return {
      status: 200,
      success: true,
      message: 'Success',
      data: combined,
      timestamp: new Date().toISOString(),
    };
  },

  searchTours: async (params: TourSearchParams): Promise<ApiResponse<Tour[]>> => {
    try {
      return await axiosClient.get('/tours/search', { params });
    } catch {
      return await tourService.getAllTours();
    }
  },

  getTourById: async (id: number): Promise<ApiResponse<Tour>> => {
    const customTours = getCustomToursFromStorage();
    const foundCustom = customTours.find(t => t.id === id);
    if (foundCustom) {
      return {
        status: 200,
        success: true,
        message: 'Success',
        data: foundCustom,
        timestamp: new Date().toISOString(),
      };
    }
    try {
      const res = await axiosClient.get<any, ApiResponse<Tour>>(`/tours/${id}`);
      if (res && res.data) {
        return res;
      }
    } catch {
      // Fallback
    }
    const foundMock = MOCK_TOURS.find(t => t.id === id) || MOCK_TOURS[0];
    return {
      status: 200,
      success: true,
      message: 'Success',
      data: foundMock,
      timestamp: new Date().toISOString(),
    };
  },

  createTour: async (data: TourCreateRequest): Promise<ApiResponse<Tour>> => {
    const newId = Date.now();
    const newTour: Tour = {
      id: newId,
      tourCode: data.tourCode || `TOUR-${newId.toString().slice(-6)}`,
      title: data.title,
      description: data.description || '',
      price: data.price,
      childPrice: data.childPrice || Math.round(data.price * 0.7),
      durationDays: data.durationDays || 1,
      durationNights: data.durationNights || 0,
      departureLocation: data.departureLocation || 'TP.Hồ Chí Minh',
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80',
      category: data.category || ('DOMESTIC' as any),
      remainingSeats: data.remainingSeats ?? 40,
      viewCount: 1,
      averageRating: 5.0,
      totalReviews: 0,
      status: 'ACTIVE' as any,
      gallery: [data.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80'],
    };

    // Save locally
    const existing = getCustomToursFromStorage();
    saveCustomToursToStorage([newTour, ...existing]);

    try {
      const res = await axiosClient.post<any, ApiResponse<Tour>>('/tours', data);
      return res;
    } catch {
      return {
        status: 201,
        success: true,
        message: 'Tạo tour du lịch thành công',
        data: newTour,
        timestamp: new Date().toISOString(),
      };
    }
  },

  getMyTours: async (): Promise<ApiResponse<Tour[]>> => {
    const customTours = getCustomToursFromStorage();
    let apiTours: Tour[] = [];
    try {
      const res = await axiosClient.get<any, ApiResponse<Tour[]>>('/tours/my-tours');
      if (res && res.data && Array.isArray(res.data)) {
        apiTours = res.data;
      }
    } catch {
      // Fallback
    }
    const combined: Tour[] = [...customTours];
    for (const t of apiTours) {
      if (!combined.some(c => c.id === t.id)) {
        combined.push(t);
      }
    }
    for (const m of MOCK_TOURS) {
      const alreadyExists = combined.some(
        c => c.id === m.id || c.title.trim().toLowerCase() === m.title.trim().toLowerCase()
      );
      if (!alreadyExists) {
        combined.push(m);
      }
    }
    return {
      status: 200,
      success: true,
      message: 'Success',
      data: combined,
      timestamp: new Date().toISOString(),
    };
  },

  updateTour: async (id: number, data: Partial<TourCreateRequest>): Promise<ApiResponse<Tour>> => {
    const customTours = getCustomToursFromStorage();
    let updatedTour: Tour | null = null;
    const nextCustom = customTours.map(t => {
      if (t.id === id) {
        updatedTour = { ...t, ...data } as Tour;
        return updatedTour;
      }
      return t;
    });

    if (!updatedTour) {
      // If modifying a mock tour, clone it into custom tours
      const mockFound = MOCK_TOURS.find(t => t.id === id);
      if (mockFound) {
        updatedTour = { ...mockFound, ...data } as Tour;
        nextCustom.unshift(updatedTour);
      }
    }

    saveCustomToursToStorage(nextCustom);

    try {
      return await axiosClient.put(`/tours/${id}`, data);
    } catch {
      return {
        status: 200,
        success: true,
        message: 'Cập nhật tour thành công',
        data: updatedTour || ({} as Tour),
        timestamp: new Date().toISOString(),
      };
    }
  },

  deleteTour: async (id: number): Promise<ApiResponse<void>> => {
    const customTours = getCustomToursFromStorage();
    saveCustomToursToStorage(customTours.filter(t => t.id !== id));
    try {
      return await axiosClient.delete(`/tours/${id}`);
    } catch {
      return {
        status: 200,
        success: true,
        message: 'Xóa tour thành công',
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

