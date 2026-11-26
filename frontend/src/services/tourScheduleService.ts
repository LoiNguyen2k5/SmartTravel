import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';

export type TourScheduleStatus =
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'CLOSED_BOOKING'
  | 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
  | 'COMPLETED';

export interface TourScheduleItem {
  id: number;
  tourId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  minParticipants?: number;
  maxParticipants: number;
  bookedCount: number;
  note?: string;
  seasonalPriceMultiplier?: number;
  status?: TourScheduleStatus | 'OPEN' | 'CANCELLED';
  completedBookingsCount?: number;
}

// In-memory cache đồng bộ trực tiếp từ bảng tour_schedules trong CSDL MySQL/Oracle
const schedulesCache: Record<number, TourScheduleItem[]> = {};
let isSynced = false;
let syncPromise: Promise<void> | null = null;

const notifyUpdated = (tourId?: number) => {
  window.dispatchEvent(new CustomEvent('tour_schedules_updated', { detail: { tourId } }));
};

const hydrateCache = (items: TourScheduleItem[]) => {
  Object.keys(schedulesCache).forEach((k) => delete schedulesCache[Number(k)]);
  for (const item of items) {
    if (!item || !item.tourId) continue;
    if (!schedulesCache[item.tourId]) {
      schedulesCache[item.tourId] = [];
    }
    schedulesCache[item.tourId].push({
      ...item,
      minParticipants: item.minParticipants || 10,
      note: item.note || 'Khởi hành định kỳ',
    });
  }
  isSynced = true;
  notifyUpdated();
};

export const syncSchedulesFromServer = async (force = false): Promise<void> => {
  if (isSynced && !force) return;
  if (syncPromise && !force) return syncPromise;

  syncPromise = axiosClient
    .get<any, ApiResponse<TourScheduleItem[]>>('/tour-schedules')
    .then((res) => {
      if (res && Array.isArray(res.data)) {
        hydrateCache(res.data);
      } else {
        isSynced = true;
      }
    })
    .catch((err) => {
      console.error('Lỗi tải lịch khởi hành từ máy chủ:', err);
    })
    .finally(() => {
      syncPromise = null;
    });

  return syncPromise;
};

// Tự động đồng bộ 1 lần khi nạp module trên trình duyệt
if (typeof window !== 'undefined') {
  void syncSchedulesFromServer();
}

// Tính số ngày còn lại từ hôm nay đến ngày khởi hành
export const getDaysUntilDeparture = (dateStr: string): number => {
  if (!dateStr) return -999;
  try {
    const clean = dateStr.trim();
    const delimiter = clean.includes('/') ? '/' : '-';
    const parts = clean.split(delimiter);
    let day: number, month: number, year: number;
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
    const scheduleDate = new Date(year, month, day, 0, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const diffMs = scheduleDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export interface ScheduleLeadTimeConfig {
  requiresVisa?: boolean;
  visaProcessingDays?: number;
  visaBufferDays?: number;
}

// Quy định số ngày đặt trước tối thiểu (theo mẫu Visa / 7 ngày quốc tế miễn Visa / 3 ngày nội địa)
export const getBookingCutoffDays = (
  category?: string,
  visaConfig?: ScheduleLeadTimeConfig
): number => {
  if (visaConfig?.requiresVisa) {
    const proc = visaConfig.visaProcessingDays ?? 10;
    const buf = visaConfig.visaBufferDays ?? 3;
    return proc + buf;
  }
  return category === 'NUOC_NGOAI' ? 7 : 3;
};

// Tính toán trạng thái vòng đời đợt khởi hành dựa trên Business Rules
export const computeScheduleStatus = (
  schedule: TourScheduleItem,
  category?: string,
  visaConfig?: ScheduleLeadTimeConfig
): {
  status: TourScheduleStatus;
  daysRemaining: number;
  minLeadDays: number;
  reason: string;
  isBookable: boolean;
} => {
  const daysRemaining = getDaysUntilDeparture(schedule.startDate);
  const daysUntilEnd = schedule.endDate ? getDaysUntilDeparture(schedule.endDate) : daysRemaining;
  const minLeadDays = getBookingCutoffDays(category, visaConfig);
  const minParticipants = schedule.minParticipants || 10;

  if (schedule.status === 'COMPLETED' || daysUntilEnd < 0) {
    return {
      status: 'COMPLETED',
      daysRemaining,
      minLeadDays,
      reason: 'Đợt khởi hành đã hoàn tất chuyến đi',
      isBookable: false,
    };
  }

  if (schedule.status === 'CANCELLED' || schedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS') {
    return {
      status: 'CANCELLED_NOT_ENOUGH_PARTICIPANTS',
      daysRemaining,
      minLeadDays,
      reason: 'Đợt khởi hành đã bị hủy',
      isBookable: false,
    };
  }

  if (daysRemaining <= 0 && daysUntilEnd >= 0) {
    return {
      status: 'IN_PROGRESS',
      daysRemaining,
      minLeadDays,
      reason: 'Đoàn đang trong hành trình du lịch',
      isBookable: false,
    };
  }

  if (schedule.bookedCount >= schedule.maxParticipants) {
    return {
      status: 'CLOSED_BOOKING',
      daysRemaining,
      minLeadDays,
      reason: 'Đã hết chỗ trống (Full slot)',
      isBookable: false,
    };
  }

  if (daysRemaining < minLeadDays) {
    if (schedule.bookedCount < minParticipants) {
      return {
        status: 'CANCELLED_NOT_ENOUGH_PARTICIPANTS',
        daysRemaining,
        minLeadDays,
        reason: `Hủy do không đủ số lượng tối thiểu (${schedule.bookedCount}/${minParticipants} khách). Hệ thống tự động hoàn tiền 100%.`,
        isBookable: false,
      };
    }

    return {
      status: 'CLOSED_BOOKING',
      daysRemaining,
      minLeadDays,
      reason: visaConfig?.requiresVisa
        ? `Đã hết hạn nhận hồ sơ Visa cho đợt này (Cần đặt trước tối thiểu ${minLeadDays} ngày)`
        : category === 'NUOC_NGOAI'
          ? `Đã đóng cổng nhận khách quốc tế (Cần đặt trước tối thiểu ${minLeadDays} ngày)`
          : `Đã đóng cổng nhận khách (Cần đặt trước tối thiểu ${minLeadDays} ngày để chốt dịch vụ)`,
      isBookable: false,
    };
  }

  const daysLeftToBook = Math.max(0, daysRemaining - minLeadDays);
  return {
    status: 'ACTIVE',
    daysRemaining,
    minLeadDays,
    reason:
      daysLeftToBook > 0
        ? `Đang mở bán (Còn ${daysLeftToBook} ngày để đặt vé)`
        : 'Đang mở bán (Hạn chót đặt vé hôm nay)',
    isBookable: true,
  };
};

export const isUpcomingSchedule = (dateStr: string): boolean => {
  return getDaysUntilDeparture(dateStr) >= 0;
};

export const formatScheduleDate = (dStr: string): string => {
  if (!dStr) return '';
  const parts = dStr.trim().split('-');
  if (parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dStr;
};

export const tourScheduleService = {
  syncFromServer: syncSchedulesFromServer,

  fetchSchedulesForTour: async (tourId: number): Promise<TourScheduleItem[]> => {
    try {
      const res = await axiosClient.get<any, ApiResponse<TourScheduleItem[]>>(
        `/tour-schedules/tour/${tourId}`
      );
      if (res && Array.isArray(res.data)) {
        schedulesCache[tourId] = res.data.map((s) => ({
          ...s,
          minParticipants: s.minParticipants || 10,
          note: s.note || 'Khởi hành định kỳ',
        }));
        isSynced = true;
        notifyUpdated(tourId);
        return schedulesCache[tourId];
      }
    } catch (err) {
      console.error(`Lỗi tải lịch khởi hành cho tour ${tourId}:`, err);
    }
    return schedulesCache[tourId] || [];
  },

  getSchedulesForTour: (tourId: number): TourScheduleItem[] => {
    if (!isSynced && !syncPromise) {
      void syncSchedulesFromServer();
    }
    return schedulesCache[tourId] || [];
  },

  getUpcomingSchedulesForUser: (
    tourId: number,
    category?: string,
    visaConfig?: ScheduleLeadTimeConfig
  ): TourScheduleItem[] => {
    const all = tourScheduleService.getSchedulesForTour(tourId);
    return all
      .filter((s) => {
        if (s.status === 'COMPLETED' || s.status === 'CANCELLED' || s.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS') {
          return false;
        }
        return getDaysUntilDeparture(s.startDate) > 0;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((s) => {
        const computed = computeScheduleStatus(s, category, visaConfig);
        return {
          ...s,
          minParticipants: s.minParticipants || 10,
          status: computed.status,
        };
      });
  },

  getSchedulesByLifecycle: (
    tourId: number,
    category?: string,
    visaConfig?: ScheduleLeadTimeConfig
  ) => {
    const all = tourScheduleService.getSchedulesForTour(tourId).map((s) => {
      const computed = computeScheduleStatus(s, category, visaConfig);
      return {
        ...s,
        minParticipants: s.minParticipants || 10,
        status: computed.status,
        lifecycleInfo: computed,
      };
    });

    return {
      active: all.filter((s) => s.status === 'ACTIVE'),
      inProgress: all.filter((s) => s.status === 'IN_PROGRESS'),
      closed: all.filter((s) => s.status === 'CLOSED_BOOKING'),
      cancelled: all.filter((s) => s.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'),
      completed: all.filter((s) => s.status === 'COMPLETED'),
      all,
    };
  },

  getNearestUpcomingSchedule: (
    tourId: number,
    category?: string,
    visaConfig?: ScheduleLeadTimeConfig
  ): TourScheduleItem | null => {
    const upcoming = tourScheduleService.getUpcomingSchedulesForUser(tourId, category, visaConfig);
    if (upcoming.length === 0) return null;
    const sorted = [...upcoming].sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return a.startDate.localeCompare(b.startDate);
    });
    return sorted[0];
  },

  hasUpcomingSchedule: (tourId: number): boolean => {
    // Trong lúc đang đồng bộ API lần đầu, tạm giữ tour hiển thị để tránh chớp màn hình
    if (!isSynced) return true;
    return tourScheduleService.getUpcomingSchedulesForUser(tourId).length > 0;
  },

  hasActiveBookableSchedule: (tourId: number, category?: string): boolean => {
    const upcoming = tourScheduleService.getUpcomingSchedulesForUser(tourId, category);
    return upcoming.some((s) => s.status === 'ACTIVE');
  },

  getTourAvailableSeats: (tourId: number, defaultSeats?: number, category?: string): number => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return defaultSeats !== undefined ? defaultSeats : 0;
    return Math.max(0, nearest.maxParticipants - nearest.bookedCount);
  },

  getTourSeatRatioDisplay: (tourId: number, category?: string): { booked: number; max: number; text: string } => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return { booked: 0, max: 40, text: '0/40 chỗ' };
    return {
      booked: nearest.bookedCount,
      max: nearest.maxParticipants,
      text: `${nearest.bookedCount}/${nearest.maxParticipants} chỗ`,
    };
  },

  getTourDepartureDateDisplay: (tourId: number, category?: string): string => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return isSynced ? 'Chưa có lịch' : 'Đang tải...';
    return formatScheduleDate(nearest.startDate);
  },

  saveSchedulesForTour: (tourId: number, schedules: TourScheduleItem[]): void => {
    schedulesCache[tourId] = schedules;
    notifyUpdated(tourId);
  },

  addSchedule: async (
    tourId: number,
    data: Omit<TourScheduleItem, 'id' | 'tourId' | 'bookedCount'>
  ): Promise<TourScheduleItem | null> => {
    const res = await axiosClient.post<any, ApiResponse<TourScheduleItem>>(
      `/tour-schedules/tour/${tourId}`,
      {
        startDate: data.startDate,
        endDate: data.endDate,
        maxParticipants: data.maxParticipants,
      }
    );
    if (res && res.data) {
      const created: TourScheduleItem = {
        ...res.data,
        minParticipants: data.minParticipants || 10,
        note: data.note || 'Khởi hành định kỳ',
      };
      const current = schedulesCache[tourId] || [];
      schedulesCache[tourId] = [...current, created].sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
      );
      notifyUpdated(tourId);
      return created;
    }
    return null;
  },

  deleteSchedule: async (tourId: number, scheduleId: number): Promise<void> => {
    await axiosClient.delete(`/tour-schedules/${scheduleId}`);
    const current = schedulesCache[tourId] || [];
    schedulesCache[tourId] = current.filter((s) => s.id !== scheduleId);
    notifyUpdated(tourId);
  },

  completeSchedule: async (
    tourId: number,
    scheduleId: number
  ): Promise<{ schedule: TourScheduleItem; completedBookingsCount: number } | null> => {
    const res = await axiosClient.put<any, ApiResponse<TourScheduleItem>>(
      `/tour-schedules/${scheduleId}/complete`
    );
    if (res && res.data) {
      const updated: TourScheduleItem = {
        ...res.data,
        status: 'COMPLETED',
        minParticipants: res.data.minParticipants || 10,
        note: res.data.note || 'Khởi hành định kỳ',
      };
      const current = schedulesCache[tourId] || [];
      schedulesCache[tourId] = current.map((s) => (s.id === scheduleId ? updated : s));
      notifyUpdated(tourId);
      return {
        schedule: updated,
        completedBookingsCount: res.data.completedBookingsCount ?? 0,
      };
    }
    return null;
  },

  bookSeatsForSchedule: (tourId: number, scheduleId?: number, guestCount = 1, departureDate?: string): boolean => {
    const schedules = schedulesCache[tourId] || [];
    let targetId: number | undefined = scheduleId;

    if (!targetId && departureDate) {
      const normDate = (d: string) => {
        const parts = d.trim().split('-');
        return parts[0].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
      };
      const target = schedules.find((s) => normDate(s.startDate) === normDate(departureDate));
      targetId = target?.id;
    }

    if (!targetId) return false;

    const next = schedules.map((s) =>
      s.id === targetId
        ? { ...s, bookedCount: Math.min(s.maxParticipants, s.bookedCount + guestCount) }
        : s
    );
    schedulesCache[tourId] = next;
    notifyUpdated(tourId);

    void axiosClient
      .patch(`/tour-schedules/${targetId}/book?guests=${guestCount}`)
      .catch((err) => console.error('Lỗi đồng bộ bookedCount lên máy chủ:', err));

    return true;
  },
};
