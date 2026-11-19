export type TourScheduleStatus =
  | 'ACTIVE'
  | 'CLOSED_BOOKING'
  | 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
  | 'COMPLETED';

export interface TourScheduleItem {
  id: number;
  tourId: number;
  startDate: string; // YYYY-MM-DD or DD-MM-YYYY
  endDate: string;   // YYYY-MM-DD or DD-MM-YYYY
  minParticipants?: number; // Mặc định 10 khách
  maxParticipants: number;
  bookedCount: number;
  note?: string;
  seasonalPriceMultiplier?: number;
  status?: TourScheduleStatus;
}

const STORAGE_PREFIX = 'smart_travel_tour_schedules_v7_';
const LEGACY_PREFIXES = [
  'smart_travel_tour_schedules_',
  'smart_travel_tour_schedules_v2_',
  'smart_travel_tour_schedules_v3_',
  'smart_travel_tour_schedules_v4_',
  'smart_travel_tour_schedules_v5_',
  'smart_travel_tour_schedules_v6_',
];

// Tính số ngày còn lại từ hôm nay đến ngày khởi hành
export const getDaysUntilDeparture = (dateStr: string): number => {
  if (!dateStr) return -999;
  try {
    const clean = dateStr.trim();
    const delimiter = clean.includes('/') ? '/' : '-';
    const parts = clean.split(delimiter);
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
    const scheduleDate = new Date(year, month, day, 0, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const diffMs = scheduleDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

// Quy định số ngày đặt trước tối thiểu (Tour nội địa: 3 ngày, Tour quốc tế: 15 ngày)
export const getBookingCutoffDays = (category?: string): number => {
  return category === 'NUOC_NGOAI' ? 15 : 3;
};

// Tính toán trạng thái vòng đời đợt khởi hành dựa trên Business Rules
export const computeScheduleStatus = (
  schedule: TourScheduleItem,
  category?: string
): {
  status: TourScheduleStatus;
  daysRemaining: number;
  minLeadDays: number;
  reason: string;
  isBookable: boolean;
} => {
  const daysRemaining = getDaysUntilDeparture(schedule.startDate);
  const minLeadDays = getBookingCutoffDays(category);
  const minParticipants = schedule.minParticipants || 10;

  // 1. Nếu đã qua ngày khởi hành -> Tour đã hoàn tất
  if (daysRemaining < 0) {
    return {
      status: 'COMPLETED',
      daysRemaining,
      minLeadDays,
      reason: 'Đợt khởi hành đã hoàn tất chuyến đi',
      isBookable: false,
    };
  }

  // 2. Nếu đã đầy chỗ
  if (schedule.bookedCount >= schedule.maxParticipants) {
    return {
      status: 'CLOSED_BOOKING',
      daysRemaining,
      minLeadDays,
      reason: 'Đã hết chỗ trống (Full slot)',
      isBookable: false,
    };
  }

  // 3. Nếu đã bước vào khung thời gian chốt sổ (dưới minLeadDays ngày)
  if (daysRemaining < minLeadDays) {
    // Kiểm tra quy định số lượng người tối thiểu (minParticipants)
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
      reason: category === 'NUOC_NGOAI'
        ? `Đã hết hạn nhận hồ sơ Visa cho đợt này (Cần đặt trước tối thiểu ${minLeadDays} ngày)`
        : `Đã đóng cổng nhận khách (Cần đặt trước tối thiểu ${minLeadDays} ngày để chốt dịch vụ)`,
      isBookable: false,
    };
  }

  // 4. Còn hạn đặt chỗ và chưa đầy chỗ -> Đang mở bán bình thường
  const daysLeftToBook = Math.max(0, daysRemaining - minLeadDays);
  return {
    status: 'ACTIVE',
    daysRemaining,
    minLeadDays,
    reason: daysLeftToBook > 0
      ? `Đang mở bán (Còn ${daysLeftToBook} ngày để đặt vé)`
      : 'Đang mở bán (Hạn chót đặt vé hôm nay)',
    isBookable: true,
  };
};

// Check if a date string is today or in the future
export const isUpcomingSchedule = (dateStr: string): boolean => {
  return getDaysUntilDeparture(dateStr) >= 0;
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

// ─────────────────────────────────────────────────────────────────────────────
// Bộ sinh lịch khởi hành trải đều từ cuối 11/2026 đến hết tháng 02/2027
// Chia đều 3 trạng thái thực tế:
//   - 'ENOUGH'   : Đã đủ khách để khởi hành (>= 10 khách, còn nhiều chỗ)
//   - 'NEAR_MIN' : Thiếu 1-3 khách để đủ đoàn khởi hành (7-9/max)
//   - 'NEAR_FULL': Gần full chỗ (chỉ còn 2-4 chỗ trống)
// ─────────────────────────────────────────────────────────────────────────────
type OccupancyTier = 'ENOUGH' | 'NEAR_MIN' | 'NEAR_FULL';

interface TourSeedMeta {
  durationOffset: number; // endDate = startDate + durationOffset
  maxParticipants: number;
  theme: string;
  isInternational?: boolean;
  isDemo?: boolean;
}

const TOUR_META: Record<number, TourSeedMeta> = {
  1:  { durationOffset: 5, maxParticipants: 40, theme: 'Phượng Hoàng Cổ Trấn – Trương Gia Giới', isInternational: true },
  2:  { durationOffset: 3, maxParticipants: 35, theme: 'Thượng Hải – Ô Trấn', isInternational: true },
  3:  { durationOffset: 0, maxParticipants: 45, theme: 'Núi Chứa Chan & Dinh Thầy Thím' },
  4:  { durationOffset: 1, maxParticipants: 40, theme: 'Châu Đốc – Núi Cấm – Tà Pạ' },
  5:  { durationOffset: 3, maxParticipants: 40, theme: 'Miền Tây Sông Nước – Cà Mau' },
  6:  { durationOffset: 3, maxParticipants: 40, theme: 'Đà Lạt Ngàn Hoa' },
  7:  { durationOffset: 2, maxParticipants: 30, theme: 'Đảo Nam Du Biển Xanh' },
  8:  { durationOffset: 0, maxParticipants: 50, theme: 'Biển Vũng Tàu & Sun World' },
  9:  { durationOffset: 2, maxParticipants: 40, theme: 'Phú Yên – Quy Nhơn' },
  10: { durationOffset: 4, maxParticipants: 40, theme: 'Bangkok – Pattaya', isInternational: true },
  11: { durationOffset: 0, maxParticipants: 99, theme: 'Test thanh toán VietQR 5.000đ — luôn mở', isDemo: true },
  12: { durationOffset: 3, maxParticipants: 40, theme: 'Hà Nội – Hạ Long – Ninh Bình' },
  13: { durationOffset: 3, maxParticipants: 35, theme: 'Sapa – Fansipan Săn Mây' },
  14: { durationOffset: 4, maxParticipants: 30, theme: 'Hà Giang – Đồng Văn – Mã Pí Lèng' },
  15: { durationOffset: 3, maxParticipants: 40, theme: 'Đà Nẵng – Hội An – Huế' },
  16: { durationOffset: 3, maxParticipants: 40, theme: 'Phú Quốc – Nam Đảo' },
  17: { durationOffset: 4, maxParticipants: 40, theme: 'Singapore – Malaysia', isInternational: true },
  18: { durationOffset: 4, maxParticipants: 35, theme: 'Seoul – Đảo Nami Xứ Hàn', isInternational: true },
  19: { durationOffset: 4, maxParticipants: 35, theme: 'Tokyo – Núi Phú Sĩ', isInternational: true },
  20: { durationOffset: 4, maxParticipants: 40, theme: 'Đảo Ngọc Bali', isInternational: true },
};

interface DepartureWave {
  baseDate: string; // YYYY-MM-DD
  seasonLabel: string;
  multiplier?: number;
  forcePeak?: boolean;
}

const SEASONAL_WAVES_TO_FEB_2027: DepartureWave[] = [
  { baseDate: '2026-11-26', seasonLabel: 'Cuối tháng 11' },
  { baseDate: '2026-12-06', seasonLabel: 'Đầu đông tháng 12' },
  { baseDate: '2026-12-15', seasonLabel: 'Giữa tháng 12' },
  { baseDate: '2026-12-23', seasonLabel: 'Đón Giáng Sinh (+5%)', multiplier: 1.05 },
  { baseDate: '2026-12-30', seasonLabel: 'Tết Dương Lịch 2027 (+10%)', multiplier: 1.1, forcePeak: true },
  { baseDate: '2027-01-08', seasonLabel: 'Đầu năm mới 2027' },
  { baseDate: '2027-01-17', seasonLabel: 'Giữa tháng 01' },
  { baseDate: '2027-01-26', seasonLabel: 'Du xuân cận Tết' },
  { baseDate: '2027-02-05', seasonLabel: 'Tết Nguyên Đán 2027 (+10%)', multiplier: 1.1, forcePeak: true },
  { baseDate: '2027-02-14', seasonLabel: 'Du xuân Valentine & Đầu năm (+5%)', multiplier: 1.05 },
  { baseDate: '2027-02-23', seasonLabel: 'Cuối tháng 02' },
];

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toShortDayMonth = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const parseIsoLocal = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

const computeBookedCount = (
  tier: OccupancyTier,
  maxParticipants: number,
  seed: number
): number => {
  if (tier === 'NEAR_FULL') {
    const remaining = 2 + (seed % 3); // còn 2, 3 hoặc 4 chỗ
    return Math.max(10, maxParticipants - remaining);
  }
  if (tier === 'NEAR_MIN') {
    return 7 + (seed % 3); // 7, 8 hoặc 9 khách (thiếu 1-3 khách để đạt mốc 10)
  }
  // ENOUGH: đã đủ khách khởi hành (>= 10), tỷ lệ khoảng 42% - 62%
  const ratio = 0.42 + ((seed % 5) * 0.05);
  return Math.min(maxParticipants - 8, Math.max(14, Math.round(maxParticipants * ratio)));
};

const buildSchedulesThroughFeb2027 = (tourId: number, meta: TourSeedMeta): TourScheduleItem[] => {
  const tierCycle: OccupancyTier[] = ['ENOUGH', 'NEAR_MIN', 'NEAR_FULL'];
  // Xoay nhẹ ngày khởi hành 0..2 ngày theo tourId để các tour không trùng y hệt nhau, vẫn nằm gọn trong tháng 02/2027
  const dayShift = tourId % 3;
  // Dịch pha trạng thái theo tourId để các tour ngoài trang chủ/danh sách chia đều 3 nhóm trạng thái
  const phaseOffset = meta.isInternational ? (tourId % 3) + 2 : tourId % 3;

  return SEASONAL_WAVES_TO_FEB_2027.map((wave, idx) => {
    const rawStart = addDays(parseIsoLocal(wave.baseDate), dayShift);
    // Đảm bảo ngày khởi hành cuối cùng không vượt quá 28/02/2027
    const febEnd = parseIsoLocal('2027-02-28');
    const start = rawStart > febEnd ? parseIsoLocal('2027-02-26') : rawStart;
    const end = addDays(start, meta.durationOffset);
    const id = 100000 + tourId * 100 + (idx + 1);

    if (meta.isDemo) {
      return {
        id,
        tourId,
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
        minParticipants: 10,
        maxParticipants: meta.maxParticipants,
        bookedCount: idx % 3 === 0 ? 12 : idx % 3 === 1 ? 8 : 0,
        note: `Khởi hành ${toShortDayMonth(start)} — ${meta.theme}`,
      };
    }

    // Với tour quốc tế đợt cuối tháng 11 (< 15 ngày), để >= 12 khách để hiển thị đúng trạng thái chốt sổ lịch sự
    let tier: OccupancyTier;
    if (idx === 0 && meta.isInternational) {
      tier = 'ENOUGH';
    } else if (wave.forcePeak && idx % 2 === tourId % 2) {
      tier = 'NEAR_FULL';
    } else {
      tier = tierCycle[(idx + phaseOffset) % 3];
    }

    const bookedCount = computeBookedCount(tier, meta.maxParticipants, tourId * 7 + idx * 3);

    return {
      id,
      tourId,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      minParticipants: 10,
      maxParticipants: meta.maxParticipants,
      bookedCount,
      note: wave.seasonLabel,
      seasonalPriceMultiplier: wave.multiplier,
    };
  });
};

// Lịch khởi hành mẫu phong phú cho tất cả 20 tour từ cuối 11/2026 đến hết 02/2027
const TOUR_SCHEDULES: Record<number, TourScheduleItem[]> = Object.fromEntries(
  Object.entries(TOUR_META).map(([idStr, meta]) => {
    const id = Number(idStr);
    return [id, buildSchedulesThroughFeb2027(id, meta)];
  })
);

// Hàm tự động sinh lịch tương lai cho tour mới do Vendor tạo (hoặc khi lịch mẫu cũ đã qua hết)
const generateDynamicFutureSchedules = (tourId: number, baseHistory: TourScheduleItem[] = []): TourScheduleItem[] => {
  const febEnd = parseIsoLocal('2027-02-28');
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Nếu hôm nay vẫn trước 2027-02-15 -> dùng luôn bộ 11 đợt chuẩn tới hết tháng 02/2027
  if (today < parseIsoLocal('2027-02-15')) {
    const fallbackMeta: TourSeedMeta = {
      durationOffset: 3,
      maxParticipants: 40,
      theme: 'Lịch khởi hành định kỳ',
    };
    const built = buildSchedulesThroughFeb2027(tourId, fallbackMeta);
    return [...baseHistory, ...built];
  }

  // Fallback động nếu thời gian thực đã vượt qua tháng 02/2027
  const tierCycle: OccupancyTier[] = ['ENOUGH', 'NEAR_MIN', 'NEAR_FULL'];
  const generated: TourScheduleItem[] = [7, 16, 25, 34, 45, 56, 68, 80, 92].map((offsetDays, idx) => {
    const s = addDays(today, offsetDays);
    const e = addDays(s, 3);
    const tier = tierCycle[(idx + tourId) % 3];
    const maxParticipants = 40;
    return {
      id: 200000 + tourId * 100 + (idx + 1),
      tourId,
      startDate: toIsoDate(s),
      endDate: toIsoDate(e),
      minParticipants: 10,
      maxParticipants,
      bookedCount: computeBookedCount(tier, maxParticipants, tourId * 5 + idx),
      note: `Khởi hành ${toShortDayMonth(s)} — Đợt ${idx + 1}`,
      seasonalPriceMultiplier: idx % 4 === 3 ? 1.05 : 1.0,
    };
  });

  // Đảm bảo không lỗi unused variable
  void febEnd;
  return [...baseHistory, ...generated];
};

// Lấy lịch mặc định cho tour (kết hợp lịch định nghĩa sẵn và cơ chế tự động bù lịch tương lai)
const getDefaultSchedulesForTour = (tourId: number): TourScheduleItem[] => {
  const predefined = TOUR_SCHEDULES[tourId];
  if (predefined) {
    const upcoming = predefined.filter((s) => isUpcomingSchedule(s.startDate));
    if (upcoming.length >= 2) {
      return predefined;
    }
    return generateDynamicFutureSchedules(tourId, predefined);
  }

  return generateDynamicFutureSchedules(tourId);
};

export const tourScheduleService = {
  // Lấy tất cả lịch khởi hành của tour (dành cho Vendor quản lý & hiển thị)
  getSchedulesForTour: (tourId: number): TourScheduleItem[] => {
    try {
      for (const prefix of LEGACY_PREFIXES) {
        localStorage.removeItem(prefix + tourId);
      }

      const stored = localStorage.getItem(STORAGE_PREFIX + tourId);
      if (stored) {
        const parsed: TourScheduleItem[] = JSON.parse(stored);
        const isLegacy = parsed.some(
          (s) =>
            !s.note ||
            s.note.includes('Lịch mẫu') ||
            s.note.includes('kiểm tra giao diện') ||
            s.id < 10000
        );
        const hasUpcoming = parsed.some((s) => isUpcomingSchedule(s.startDate));
        if (!isLegacy && Array.isArray(parsed) && parsed.length > 0 && hasUpcoming) {
          return parsed;
        }
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

  // Lấy các lịch khởi hành tương lai (chưa qua ngày đi) dành cho User / Khách hàng
  getUpcomingSchedulesForUser: (tourId: number, category?: string): TourScheduleItem[] => {
    const all = tourScheduleService.getSchedulesForTour(tourId);
    let upcoming = all.filter((s) => isUpcomingSchedule(s.startDate));
    if (upcoming.length === 0) {
      const fresh = getDefaultSchedulesForTour(tourId);
      try {
        localStorage.setItem(STORAGE_PREFIX + tourId, JSON.stringify(fresh));
      } catch (e) {
        console.error(e);
      }
      upcoming = fresh.filter((s) => isUpcomingSchedule(s.startDate));
    }
    return upcoming
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((s) => {
        const computed = computeScheduleStatus(s, category);
        return {
          ...s,
          minParticipants: s.minParticipants || 10,
          status: computed.status,
        };
      });
  },

  // Phân loại toàn bộ lịch theo vòng đời (Đang mở bán, Đã đóng, Đã hủy, Đã hoàn tất) - Cho Vendor & Admin
  getSchedulesByLifecycle: (tourId: number, category?: string) => {
    const all = tourScheduleService.getSchedulesForTour(tourId).map((s) => {
      const computed = computeScheduleStatus(s, category);
      return {
        ...s,
        minParticipants: s.minParticipants || 10,
        status: computed.status,
        lifecycleInfo: computed,
      };
    });

    return {
      active: all.filter((s) => s.status === 'ACTIVE'),
      closed: all.filter((s) => s.status === 'CLOSED_BOOKING'),
      cancelled: all.filter((s) => s.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'),
      completed: all.filter((s) => s.status === 'COMPLETED'),
      all,
    };
  },

  // Lấy lịch khởi hành gần nhất trong tương lai (ưu tiên lịch còn mở bán)
  getNearestUpcomingSchedule: (tourId: number, category?: string): TourScheduleItem | null => {
    const upcoming = tourScheduleService.getUpcomingSchedulesForUser(tourId, category);
    if (upcoming.length === 0) return null;
    const sorted = [...upcoming].sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return a.startDate.localeCompare(b.startDate);
    });
    return sorted[0];
  },

  // Kiểm tra tour còn bất kỳ lịch tương lai nào không
  hasUpcomingSchedule: (tourId: number): boolean => {
    return tourScheduleService.getUpcomingSchedulesForUser(tourId).length > 0;
  },

  // Kiểm tra tour có còn lịch nào đang MỞ BÁN (ACTIVE) không
  hasActiveBookableSchedule: (tourId: number, category?: string): boolean => {
    const upcoming = tourScheduleService.getUpcomingSchedulesForUser(tourId, category);
    return upcoming.some((s) => s.status === 'ACTIVE');
  },

  // Lấy số chỗ còn trống của đợt khởi hành sắp tới
  getTourAvailableSeats: (tourId: number, defaultSeats?: number, category?: string): number => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return defaultSeats !== undefined ? 0 : 0;
    return Math.max(0, nearest.maxParticipants - nearest.bookedCount);
  },

  // Lấy tỷ lệ số chỗ hiện tại đã đặt / tổng số chỗ có (Ví dụ: 25/40 chỗ)
  getTourSeatRatioDisplay: (tourId: number, category?: string): { booked: number; max: number; text: string } => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return { booked: 0, max: 40, text: '0/40 chỗ' };
    return {
      booked: nearest.bookedCount,
      max: nearest.maxParticipants,
      text: `${nearest.bookedCount}/${nearest.maxParticipants} chỗ`,
    };
  },

  // Lấy ngày khởi hành hiển thị định dạng DD-MM-YYYY
  getTourDepartureDateDisplay: (tourId: number, category?: string): string => {
    const nearest = tourScheduleService.getNearestUpcomingSchedule(tourId, category);
    if (!nearest) return 'Đã hết lịch';
    return formatScheduleDate(nearest.startDate);
  },

  // Lưu danh sách lịch khởi hành của tour
  saveSchedulesForTour: (tourId: number, schedules: TourScheduleItem[]): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + tourId, JSON.stringify(schedules));
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
      minParticipants: data.minParticipants || 10,
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
  bookSeatsForSchedule: (tourId: number, scheduleId?: number, guestCount = 1, departureDate?: string): boolean => {
    const schedules = tourScheduleService.getSchedulesForTour(tourId);
    let updated = false;

    const normDate = (d?: string) => {
      if (!d) return '';
      const parts = d.trim().split('-');
      if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return d;
    };
    const targetDate = normDate(departureDate);

    const next = schedules.map((s) => {
      const isMatchById = scheduleId !== undefined && (s.id === scheduleId || Number(s.id) === Number(scheduleId));
      const isMatchByDate = targetDate && (normDate(s.startDate) === targetDate);
      if (isMatchById || (!updated && isMatchByDate)) {
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
      if (TOUR_SCHEDULES[tourId]) {
        TOUR_SCHEDULES[tourId] = next;
      }
    }
    return updated;
  },
};
