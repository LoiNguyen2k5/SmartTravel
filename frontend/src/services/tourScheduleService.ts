export interface TourScheduleItem {
  id: number;
  tourId: number;
  startDate: string; // YYYY-MM-DD or DD-MM-YYYY
  endDate: string;   // YYYY-MM-DD or DD-MM-YYYY
  maxParticipants: number;
  bookedCount: number;
  note?: string;
  seasonalPriceMultiplier?: number;
}

const STORAGE_PREFIX = 'smart_travel_tour_schedules_';

// Check if a date string is today or in the future
export const isUpcomingSchedule = (dateStr: string): boolean => {
  if (!dateStr) return false;
  try {
    const parts = dateStr.trim().split('-');
    let day: number, month: number, year: number;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
    const scheduleDate = new Date(year, month, day, 23, 59, 59);
    const now = new Date();
    return scheduleDate.getTime() >= now.getTime();
  } catch {
    return true;
  }
};

// Normalize date to DD-MM-YYYY for display
export const formatScheduleDate = (dStr: string): string => {
  if (!dStr) return '';
  const parts = dStr.trim().split('-');
  if (parts[0].length === 4) {
    // YYYY-MM-DD -> DD-MM-YYYY
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dStr;
};

// Default template schedules for any tour
const getDefaultSchedulesForTour = (tourId: number): TourScheduleItem[] => {
	if ([14, 17, 18, 19, 20].includes(tourId)) {
	  const start = new Date();
	  start.setHours(12, 0, 0, 0);
	  start.setDate(start.getDate() + 14);

	  const end = new Date(start);
	  end.setDate(end.getDate() + 4);

	  const toDateString = (date: Date): string => {
	    const year = date.getFullYear();
	    const month = String(date.getMonth() + 1).padStart(2, '0');
	    const day = String(date.getDate()).padStart(2, '0');
	    return `${year}-${month}-${day}`;
	  };

	  return [
	    {
	      id: 1401,
	      tourId,
	      startDate: toDateString(start),
	      endDate: toDateString(end),
	      maxParticipants: 40,
	      bookedCount: 0,
	      note: 'Lịch mẫu để kiểm tra giao diện',
	    },
	  ];
	}
  return [
    {
      id: Number(`${tourId}01`),
      tourId,
      startDate: '2026-08-30',
      endDate: '2026-09-02',
      maxParticipants: 40,
      bookedCount: 12,
      note: 'Lễ Quốc Khánh 2/9 (+15% giá)',
    },
    {
      id: Number(`${tourId}02`),
      tourId,
      startDate: '2026-09-15',
      endDate: '2026-09-18',
      maxParticipants: 35,
      bookedCount: 8,
      note: 'Khởi hành giữa tháng',
    },
    {
      id: Number(`${tourId}03`),
      tourId,
      startDate: '2026-10-01',
      endDate: '2026-10-04',
      maxParticipants: 40,
      bookedCount: 0,
      note: 'Mùa thu vàng',
    },
    {
      id: Number(`${tourId}04`),
      tourId,
      startDate: '2026-10-15',
      endDate: '2026-10-18',
      maxParticipants: 40,
      bookedCount: 0,
      note: 'Lễ hội & ngắm hoa',
    },
  ];
};

export const tourScheduleService = {
  // Lấy tất cả lịch khởi hành của tour (dành cho Vendor quản lý)
  getSchedulesForTour: (tourId: number): TourScheduleItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + tourId);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading tour schedules', e);
    }
    const defaults = getDefaultSchedulesForTour(tourId);
    try {
      localStorage.setItem(STORAGE_PREFIX + tourId, JSON.stringify(defaults));
    } catch (e) {
      console.error(e);
    }
    return defaults;
  },

  // Lấy các lịch khởi hành tương lai có thể đặt (dành cho User / Khách hàng)
  getUpcomingSchedulesForUser: (tourId: number): TourScheduleItem[] => {
    const all = tourScheduleService.getSchedulesForTour(tourId);
    // Tự động loại bỏ các lịch đã qua ngày theo thời gian thực
    return all.filter((s) => isUpcomingSchedule(s.startDate));
  },

  // Lấy lịch khởi hành gần nhất trong tương lai (để hiển thị trên card tour trang chủ & danh sách tour)
  getNearestUpcomingSchedule: (tourId: number): TourScheduleItem | null => {
    const upcoming = tourScheduleService.getUpcomingSchedulesForUser(tourId);
    if (upcoming.length === 0) return null;
    // Sắp xếp theo ngày tăng dần
    const sorted = [...upcoming].sort((a, b) => {
      return a.startDate.localeCompare(b.startDate);
    });
    return sorted[0];
  },

  // Kiểm tra tour còn lịch khởi hành hợp lệ trong tương lai không
  hasUpcomingSchedule: (tourId: number): boolean => {
    return tourScheduleService.getUpcomingSchedulesForUser(tourId).length > 0;
  },

  // Lấy số chỗ còn trống của đợt khởi hành sắp tới
  getTourAvailableSeats: (tourId: number, defaultSeats?: number): number => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId);
    if (!nearest) return defaultSeats !== undefined ? 0 : 0;
    return Math.max(0, nearest.maxParticipants - nearest.bookedCount);
  },

  // Lấy ngày khởi hành hiển thị định dạng DD-MM-YYYY
  getTourDepartureDateDisplay: (tourId: number): string => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId);
    if (!nearest) return 'Đã hết lịch';
    return formatScheduleDate(nearest.startDate);
  },

  // Lưu danh sách lịch khởi hành của tour
  saveSchedulesForTour: (tourId: number, schedules: TourScheduleItem[]): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + tourId, JSON.stringify(schedules));
      // Notify other components/tabs
      window.dispatchEvent(new CustomEvent('tour_schedules_updated', { detail: { tourId } }));
    } catch (e) {
      console.error('Error saving tour schedules', e);
    }
  },

  // Thêm lịch khởi hành mới (từ Vendor)
  addSchedule: (
    tourId: number, 
    data: Omit<TourScheduleItem, 'id' | 'tourId' | 'bookedCount'>
  ): TourScheduleItem => {
    const current = tourScheduleService.getSchedulesForTour(tourId);
    const newSchedule: TourScheduleItem = {
      id: Date.now(),
      tourId,
      startDate: data.startDate,
      endDate: data.endDate,
      maxParticipants: data.maxParticipants,
      bookedCount: 0,
      note: data.note || 'Khởi hành định kỳ',
      seasonalPriceMultiplier: data.seasonalPriceMultiplier || 1.0,
    };
    const updated = [newSchedule, ...current];
    tourScheduleService.saveSchedulesForTour(tourId, updated);
    return newSchedule;
  },

  // Xóa lịch khởi hành (từ Vendor)
  deleteSchedule: (tourId: number, scheduleId: number): void => {
    const current = tourScheduleService.getSchedulesForTour(tourId);
    const updated = current.filter((s) => s.id !== scheduleId);
    tourScheduleService.saveSchedulesForTour(tourId, updated);
  },

  // Trừ slot / ghế khi du khách đặt tour thành công
  bookSeatsForSchedule: (tourId: number, scheduleId: number, guestCount: number): boolean => {
    const schedules = tourScheduleService.getSchedulesForTour(tourId);
    let updated = false;
    const next = schedules.map((s) => {
      if (s.id === scheduleId) {
        updated = true;
        return {
          ...s,
          bookedCount: Math.min(s.maxParticipants, s.bookedCount + guestCount),
        };
      }
      return s;
    });
    if (updated) {
      tourScheduleService.saveSchedulesForTour(tourId, next);
    }
    return updated;
  },
};
