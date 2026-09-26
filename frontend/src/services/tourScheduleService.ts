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

const STORAGE_PREFIX = 'smart_travel_tour_schedules_v3_';

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

// Lịch khởi hành mặc định tới hết tháng 10/2026, theo từng tour
// Mỗi tour có từ 4–5 đợt khởi hành rải đều tháng 9 & 10/2026
const TOUR_SCHEDULES: Record<number, TourScheduleItem[]> = {
  // ─── Tour 1: Ân Thi – Phượng Hoàng Cổ Trấn – Trương Gia Giới 6N5Đ ───
  1: [
    { id: 10101, tourId: 1, startDate: '2026-09-22', endDate: '2026-09-27', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 22/9 — Trương Gia Giới mùa thu vàng' },
    { id: 10102, tourId: 1, startDate: '2026-10-02', endDate: '2026-10-07', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 02/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10103, tourId: 1, startDate: '2026-10-13', endDate: '2026-10-18', maxParticipants: 35, bookedCount: 8,  note: 'Khởi hành 13/10 — Mùa lá đỏ Hồ Nam' },
    { id: 10104, tourId: 1, startDate: '2026-10-24', endDate: '2026-10-29', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 2: Thượng Hải – Ô Trấn 4N4Đ ───
  2: [
    { id: 10201, tourId: 2, startDate: '2026-09-25', endDate: '2026-09-28', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 25/9 — Thượng Hải mùa thu mát mẻ' },
    { id: 10202, tourId: 2, startDate: '2026-10-05', endDate: '2026-10-08', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 05/10 — Lịch HOT dịp lễ (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10203, tourId: 2, startDate: '2026-10-15', endDate: '2026-10-18', maxParticipants: 35, bookedCount: 10, note: 'Khởi hành 15/10 — Giữa tháng 10' },
    { id: 10204, tourId: 2, startDate: '2026-10-26', endDate: '2026-10-29', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 26/10 — Cuối tháng 10' },
  ],
  // ─── Tour 3: Núi Chứa Chan (Gia Lào) & Dinh Thầy Thím ───
  3: [
    { id: 10301, tourId: 3, startDate: '2026-09-20', endDate: '2026-09-20', maxParticipants: 45, bookedCount: 22, note: 'Khởi hành 20/9 — Tour 1 ngày cuối tuần' },
    { id: 10302, tourId: 3, startDate: '2026-09-27', endDate: '2026-09-27', maxParticipants: 45, bookedCount: 15, note: 'Khởi hành 27/9 — Tour 1 ngày cuối tuần' },
    { id: 10303, tourId: 3, startDate: '2026-10-04', endDate: '2026-10-04', maxParticipants: 50, bookedCount: 35, note: 'Khởi hành 04/10 — Lễ Quốc Khánh (+5%)', seasonalPriceMultiplier: 1.05 },
    { id: 10304, tourId: 3, startDate: '2026-10-11', endDate: '2026-10-11', maxParticipants: 45, bookedCount: 10, note: 'Khởi hành 11/10 — Cuối tuần giữa tháng' },
    { id: 10305, tourId: 3, startDate: '2026-10-18', endDate: '2026-10-18', maxParticipants: 45, bookedCount: 5,  note: 'Khởi hành 18/10 — Cuối tuần cuối tháng' },
    { id: 10306, tourId: 3, startDate: '2026-10-25', endDate: '2026-10-25', maxParticipants: 45, bookedCount: 0,  note: 'Khởi hành 25/10 — Cuối tháng 10' },
  ],
  // ─── Tour 4: Châu Đốc – Núi Cấm – Chùa Tà Pạ ───
  4: [
    { id: 10401, tourId: 4, startDate: '2026-09-21', endDate: '2026-09-22', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 21/9 — 2N1Đ cuối tuần' },
    { id: 10402, tourId: 4, startDate: '2026-10-03', endDate: '2026-10-04', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 03/10 — Dịp lễ Quốc Khánh (+5%)', seasonalPriceMultiplier: 1.05 },
    { id: 10403, tourId: 4, startDate: '2026-10-10', endDate: '2026-10-11', maxParticipants: 40, bookedCount: 12, note: 'Khởi hành 10/10 — Cuối tuần giữa tháng' },
    { id: 10404, tourId: 4, startDate: '2026-10-17', endDate: '2026-10-18', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 17/10 — Mùa nước nổi An Giang' },
    { id: 10405, tourId: 4, startDate: '2026-10-24', endDate: '2026-10-25', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 5: Mỹ Tho – Bến Tre – Cần Thơ – Cà Mau ───
  5: [
    { id: 10501, tourId: 5, startDate: '2026-09-26', endDate: '2026-09-29', maxParticipants: 45, bookedCount: 30, note: 'Khởi hành 26/9 — Miền Tây mùa nước nổi' },
    { id: 10502, tourId: 5, startDate: '2026-10-02', endDate: '2026-10-05', maxParticipants: 45, bookedCount: 38, note: 'Khởi hành 02/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10503, tourId: 5, startDate: '2026-10-10', endDate: '2026-10-13', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 10/10 — Giữa tháng 10' },
    { id: 10504, tourId: 5, startDate: '2026-10-17', endDate: '2026-10-20', maxParticipants: 40, bookedCount: 8,  note: 'Khởi hành 17/10 — Sông nước Cà Mau' },
    { id: 10505, tourId: 5, startDate: '2026-10-24', endDate: '2026-10-27', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 6: Đà Lạt 4N3Đ ───
  6: [
    { id: 10601, tourId: 6, startDate: '2026-09-19', endDate: '2026-09-22', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 19/9 — Đà Lạt mùa hoa dã quỳ' },
    { id: 10602, tourId: 6, startDate: '2026-09-26', endDate: '2026-09-29', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 26/9 — Cuối tuần tháng 9' },
    { id: 10603, tourId: 6, startDate: '2026-10-03', endDate: '2026-10-06', maxParticipants: 40, bookedCount: 35, note: 'Khởi hành 03/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10604, tourId: 6, startDate: '2026-10-10', endDate: '2026-10-13', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 10/10 — Mùa hoa mimosa' },
    { id: 10605, tourId: 6, startDate: '2026-10-17', endDate: '2026-10-20', maxParticipants: 35, bookedCount: 10, note: 'Khởi hành 17/10 — Mùa hoa hồng Đà Lạt' },
    { id: 10606, tourId: 6, startDate: '2026-10-24', endDate: '2026-10-27', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 7: Đảo Nam Du 3N3Đ ───
  7: [
    { id: 10701, tourId: 7, startDate: '2026-09-20', endDate: '2026-09-22', maxParticipants: 30, bookedCount: 18, note: 'Khởi hành 20/9 — Mùa biển xanh' },
    { id: 10702, tourId: 7, startDate: '2026-09-27', endDate: '2026-09-29', maxParticipants: 30, bookedCount: 12, note: 'Khởi hành 27/9 — Cuối tuần tháng 9' },
    { id: 10703, tourId: 7, startDate: '2026-10-04', endDate: '2026-10-06', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 04/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10704, tourId: 7, startDate: '2026-10-11', endDate: '2026-10-13', maxParticipants: 30, bookedCount: 8,  note: 'Khởi hành 11/10 — Giữa tháng 10' },
    { id: 10705, tourId: 7, startDate: '2026-10-18', endDate: '2026-10-20', maxParticipants: 30, bookedCount: 0,  note: 'Khởi hành 18/10 — Đảo vắng mùa bình yên' },
    { id: 10706, tourId: 7, startDate: '2026-10-25', endDate: '2026-10-27', maxParticipants: 30, bookedCount: 0,  note: 'Khởi hành 25/10 — Cuối tháng 10' },
  ],
  // ─── Tour 8: Biển Vũng Tàu & Sun World ───
  8: [
    { id: 10801, tourId: 8, startDate: '2026-09-20', endDate: '2026-09-20', maxParticipants: 50, bookedCount: 35, note: 'Khởi hành 20/9 — Tour 1 ngày cuối tuần' },
    { id: 10802, tourId: 8, startDate: '2026-09-27', endDate: '2026-09-27', maxParticipants: 50, bookedCount: 20, note: 'Khởi hành 27/9 — Tour 1 ngày cuối tuần' },
    { id: 10803, tourId: 8, startDate: '2026-10-04', endDate: '2026-10-04', maxParticipants: 50, bookedCount: 48, note: 'Khởi hành 04/10 — Lễ Quốc Khánh HOT (+5%)', seasonalPriceMultiplier: 1.05 },
    { id: 10804, tourId: 8, startDate: '2026-10-11', endDate: '2026-10-11', maxParticipants: 50, bookedCount: 22, note: 'Khởi hành 11/10 — Buffet trưa view biển' },
    { id: 10805, tourId: 8, startDate: '2026-10-18', endDate: '2026-10-18', maxParticipants: 50, bookedCount: 10, note: 'Khởi hành 18/10 — Cuối tuần giữa tháng' },
    { id: 10806, tourId: 8, startDate: '2026-10-25', endDate: '2026-10-25', maxParticipants: 50, bookedCount: 0,  note: 'Khởi hành 25/10 — Cuối tháng 10' },
  ],
  // ─── Tour 9: Phú Yên – Quy Nhơn 3N3Đ ───
  9: [
    { id: 10901, tourId: 9, startDate: '2026-09-19', endDate: '2026-09-21', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 19/9 — Mùa gió mát Phú Yên' },
    { id: 10902, tourId: 9, startDate: '2026-09-26', endDate: '2026-09-28', maxParticipants: 40, bookedCount: 16, note: 'Khởi hành 26/9 — Cuối tuần tháng 9' },
    { id: 10903, tourId: 9, startDate: '2026-10-03', endDate: '2026-10-05', maxParticipants: 40, bookedCount: 32, note: 'Khởi hành 03/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10904, tourId: 9, startDate: '2026-10-10', endDate: '2026-10-12', maxParticipants: 40, bookedCount: 14, note: 'Khởi hành 10/10 — Gành Đá Đĩa mùa đẹp nhất' },
    { id: 10905, tourId: 9, startDate: '2026-10-17', endDate: '2026-10-19', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 17/10 — Eo Gió mùa trong xanh' },
    { id: 10906, tourId: 9, startDate: '2026-10-24', endDate: '2026-10-26', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 10: Thái Lan Bangkok – Pattaya 5N4Đ ───
  10: [
    { id: 11001, tourId: 10, startDate: '2026-09-25', endDate: '2026-09-29', maxParticipants: 40, bookedCount: 30, note: 'Khởi hành 25/9 — Bangkok cuối tháng 9' },
    { id: 11002, tourId: 10, startDate: '2026-10-01', endDate: '2026-10-05', maxParticipants: 40, bookedCount: 38, note: 'Khởi hành 01/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11003, tourId: 10, startDate: '2026-10-12', endDate: '2026-10-16', maxParticipants: 35, bookedCount: 15, note: 'Khởi hành 12/10 — Giữa tháng 10' },
    { id: 11004, tourId: 10, startDate: '2026-10-23', endDate: '2026-10-27', maxParticipants: 35, bookedCount: 4,  note: 'Khởi hành 23/10 — Cuối tháng 10' },
  ],
  // ─── Tour 11: [DEMO] Thanh Toán VietQR ───
  11: [
    { id: 11101, tourId: 11, startDate: '2026-09-19', endDate: '2026-09-19', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
    { id: 11102, tourId: 11, startDate: '2026-10-01', endDate: '2026-10-01', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
    { id: 11103, tourId: 11, startDate: '2026-10-31', endDate: '2026-10-31', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
  ],
  // ─── Tour 12: Hà Nội – Hạ Long – Ninh Bình 4N3Đ ───
  12: [
    { id: 11201, tourId: 12, startDate: '2026-09-21', endDate: '2026-09-24', maxParticipants: 40, bookedCount: 22, note: 'Khởi hành 21/9 — Vịnh Hạ Long mùa thu' },
    { id: 11202, tourId: 12, startDate: '2026-10-02', endDate: '2026-10-05', maxParticipants: 40, bookedCount: 34, note: 'Khởi hành 02/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11203, tourId: 12, startDate: '2026-10-12', endDate: '2026-10-15', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 12/10 — Tràng An Ninh Bình đẹp nhất' },
    { id: 11204, tourId: 12, startDate: '2026-10-22', endDate: '2026-10-25', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 22/10 — Cuối tháng 10' },
  ],
  // ─── Tour 13: Hà Nội – Sapa – Fansipan 4N3Đ ───
  13: [
    { id: 11301, tourId: 13, startDate: '2026-09-19', endDate: '2026-09-22', maxParticipants: 35, bookedCount: 28, note: 'Khởi hành 19/9 — Sapa mùa lúa chín vàng' },
    { id: 11302, tourId: 13, startDate: '2026-09-26', endDate: '2026-09-29', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 26/9 — Ruộng bậc thang Mù Cang Chải' },
    { id: 11303, tourId: 13, startDate: '2026-10-03', endDate: '2026-10-06', maxParticipants: 35, bookedCount: 33, note: 'Khởi hành 03/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11304, tourId: 13, startDate: '2026-10-10', endDate: '2026-10-13', maxParticipants: 35, bookedCount: 25, note: 'Khởi hành 10/10 — Cáp treo Fansipan mùa mây' },
    { id: 11305, tourId: 13, startDate: '2026-10-17', endDate: '2026-10-20', maxParticipants: 35, bookedCount: 10, note: 'Khởi hành 17/10 — Rừng hoa tím Sapa' },
    { id: 11306, tourId: 13, startDate: '2026-10-24', endDate: '2026-10-27', maxParticipants: 35, bookedCount: 2,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 14: Hà Giang – Đồng Văn – Mã Pí Lèng 5N4Đ ───
  14: [
    { id: 11401, tourId: 14, startDate: '2026-09-20', endDate: '2026-09-24', maxParticipants: 30, bookedCount: 26, note: 'Khởi hành 20/9 — Hà Giang mùa tam giác mạch' },
    { id: 11402, tourId: 14, startDate: '2026-10-01', endDate: '2026-10-05', maxParticipants: 30, bookedCount: 30, note: 'Khởi hành 01/10 — Lễ HOT, hoa tam giác mạch nở rộ (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11403, tourId: 14, startDate: '2026-10-10', endDate: '2026-10-14', maxParticipants: 30, bookedCount: 22, note: 'Khởi hành 10/10 — Hoa cải trắng Đồng Văn' },
    { id: 11404, tourId: 14, startDate: '2026-10-18', endDate: '2026-10-22', maxParticipants: 30, bookedCount: 8,  note: 'Khởi hành 18/10 — Cổng trời Quản Bạ' },
    { id: 11405, tourId: 14, startDate: '2026-10-25', endDate: '2026-10-29', maxParticipants: 30, bookedCount: 0,  note: 'Khởi hành 25/10 — Cuối tháng 10' },
  ],
  // ─── Tour 15: Đà Nẵng – Hội An – Huế 4N3Đ ───
  15: [
    { id: 11501, tourId: 15, startDate: '2026-09-19', endDate: '2026-09-22', maxParticipants: 40, bookedCount: 30, note: 'Khởi hành 19/9 — Hội An lồng đèn lung linh' },
    { id: 11502, tourId: 15, startDate: '2026-09-26', endDate: '2026-09-29', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 26/9 — Cầu Vàng Bà Nà Hills' },
    { id: 11503, tourId: 15, startDate: '2026-10-03', endDate: '2026-10-06', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 03/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11504, tourId: 15, startDate: '2026-10-10', endDate: '2026-10-13', maxParticipants: 40, bookedCount: 24, note: 'Khởi hành 10/10 — Đại Nội Huế mùa đẹp' },
    { id: 11505, tourId: 15, startDate: '2026-10-17', endDate: '2026-10-20', maxParticipants: 40, bookedCount: 10, note: 'Khởi hành 17/10 — Làng rau Trà Quế' },
    { id: 11506, tourId: 15, startDate: '2026-10-24', endDate: '2026-10-27', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 24/10 — Cuối tháng 10' },
  ],
  // ─── Tour 16: Phú Quốc – Nam Đảo 4N3Đ ───
  16: [
    { id: 11601, tourId: 16, startDate: '2026-09-20', endDate: '2026-09-23', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 20/9 — Phú Quốc mùa biển đẹp' },
    { id: 11602, tourId: 16, startDate: '2026-09-27', endDate: '2026-09-30', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 27/9 — Ngắm hoàng hôn Bãi Sao' },
    { id: 11603, tourId: 16, startDate: '2026-10-04', endDate: '2026-10-07', maxParticipants: 40, bookedCount: 38, note: 'Khởi hành 04/10 — Lễ Quốc Khánh HOT (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11604, tourId: 16, startDate: '2026-10-11', endDate: '2026-10-14', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 11/10 — Cáp treo Hòn Thơm' },
    { id: 11605, tourId: 16, startDate: '2026-10-18', endDate: '2026-10-21', maxParticipants: 40, bookedCount: 8,  note: 'Khởi hành 18/10 — Khám phá Hòn Móng Tay' },
    { id: 11606, tourId: 16, startDate: '2026-10-25', endDate: '2026-10-28', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 25/10 — Cuối tháng 10' },
  ],
  // ─── Tour 17: Singapore – Malaysia 5N4Đ ───
  17: [
    { id: 11701, tourId: 17, startDate: '2026-09-22', endDate: '2026-09-26', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 22/9 — Gardens by the Bay mùa đẹp' },
    { id: 11702, tourId: 17, startDate: '2026-10-01', endDate: '2026-10-05', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 01/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11703, tourId: 17, startDate: '2026-10-12', endDate: '2026-10-16', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 12/10 — Tháp Petronas & Batu Caves' },
    { id: 11704, tourId: 17, startDate: '2026-10-22', endDate: '2026-10-26', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 22/10 — Cuối tháng 10' },
  ],
  // ─── Tour 18: Hàn Quốc – Seoul – Nami 5N4Đ ───
  18: [
    { id: 11801, tourId: 18, startDate: '2026-09-24', endDate: '2026-09-28', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 24/9 — Seoul mùa lá đỏ bắt đầu' },
    { id: 11802, tourId: 18, startDate: '2026-10-01', endDate: '2026-10-05', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 01/10 — Lễ Quốc Khánh HOT (+15%)', seasonalPriceMultiplier: 1.15 },
    { id: 11803, tourId: 18, startDate: '2026-10-10', endDate: '2026-10-14', maxParticipants: 35, bookedCount: 28, note: 'Khởi hành 10/10 — Lá đỏ Đảo Nami đỉnh cao' },
    { id: 11804, tourId: 18, startDate: '2026-10-18', endDate: '2026-10-22', maxParticipants: 35, bookedCount: 12, note: 'Khởi hành 18/10 — Gyeongbokgung mùa thu' },
    { id: 11805, tourId: 18, startDate: '2026-10-26', endDate: '2026-10-30', maxParticipants: 35, bookedCount: 2,  note: 'Khởi hành 26/10 — Cuối tháng 10' },
  ],
  // ─── Tour 19: Nhật Bản – Tokyo – Phú Sĩ 5N4Đ ───
  19: [
    { id: 11901, tourId: 19, startDate: '2026-09-22', endDate: '2026-09-26', maxParticipants: 35, bookedCount: 32, note: 'Khởi hành 22/9 — Tokyo ngắm lá vàng sớm' },
    { id: 11902, tourId: 19, startDate: '2026-10-02', endDate: '2026-10-06', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 02/10 — Lễ Quốc Khánh HOT (+15%)', seasonalPriceMultiplier: 1.15 },
    { id: 11903, tourId: 19, startDate: '2026-10-12', endDate: '2026-10-16', maxParticipants: 35, bookedCount: 25, note: 'Khởi hành 12/10 — Phú Sĩ mùa lá đỏ kohyo' },
    { id: 11904, tourId: 19, startDate: '2026-10-22', endDate: '2026-10-26', maxParticipants: 35, bookedCount: 8,  note: 'Khởi hành 22/10 — Hồ Kawaguchi mùa thu' },
  ],
  // ─── Tour 20: Indonesia – Bali 5N4Đ ───
  20: [
    { id: 12001, tourId: 20, startDate: '2026-09-21', endDate: '2026-09-25', maxParticipants: 40, bookedCount: 26, note: 'Khởi hành 21/9 — Bali mùa khô đẹp nhất' },
    { id: 12002, tourId: 20, startDate: '2026-10-01', endDate: '2026-10-05', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 01/10 — Lễ Quốc Khánh (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 12003, tourId: 20, startDate: '2026-10-11', endDate: '2026-10-15', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 11/10 — Ubud & Tegallalang mùa đẹp' },
    { id: 12004, tourId: 20, startDate: '2026-10-21', endDate: '2026-10-25', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 21/10 — Tanah Lot mùa lặng sóng' },
  ],
};

// Default template schedules for any tour (fallback nếu tourId chưa có lịch cụ thể)
const getDefaultSchedulesForTour = (tourId: number): TourScheduleItem[] => {
  // Nếu đã có lịch cố định, trả về ngay
  if (TOUR_SCHEDULES[tourId]) {
    return TOUR_SCHEDULES[tourId];
  }

  // Fallback: tạo 4 lịch tương lai cho bất kỳ tour nào chưa được định nghĩa
  const toDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const make = (offset: number, dur: number, note: string, booked: number): TourScheduleItem => {
    const s = new Date(); s.setHours(12, 0, 0, 0); s.setDate(s.getDate() + offset);
    const e = new Date(s); e.setDate(e.getDate() + dur);
    return { id: Number(`${tourId}${String(offset).padStart(2,'0')}`), tourId, startDate: toDateString(s), endDate: toDateString(e), maxParticipants: 40, bookedCount: booked, note };
  };
  return [
    make(7,  3, 'Khởi hành đợt 1 — Sắp khởi hành', 12),
    make(14, 4, 'Khởi hành đợt 2 — Giữa tháng',     8),
    make(21, 4, 'Khởi hành đợt 3',                   0),
    make(30, 4, 'Khởi hành đợt 4 — Tháng tới',       0),
  ];
};

export const tourScheduleService = {
  // Lấy tất cả lịch khởi hành của tour (dành cho Vendor quản lý & hiển thị)
  getSchedulesForTour: (tourId: number): TourScheduleItem[] => {
    try {
      // Dọn dẹp cache cũ chứa "Lịch mẫu" nếu tồn tại
      localStorage.removeItem('smart_travel_tour_schedules_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v2_' + tourId);

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
        if (!isLegacy && Array.isArray(parsed) && parsed.length > 0) {
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
    // Tự động loại bỏ các lịch đã qua ngày theo thời gian thực (daysRemaining < 0)
    let upcoming = all.filter((s) => isUpcomingSchedule(s.startDate));
    if (upcoming.length === 0) {
      // Tự động tái tạo lịch tương lai nếu lịch cũ đã hết hạn
      const fresh = getDefaultSchedulesForTour(tourId);
      try {
        localStorage.setItem(STORAGE_PREFIX + tourId, JSON.stringify(fresh));
      } catch (e) {
        console.error(e);
      }
      upcoming = fresh.filter((s) => isUpcomingSchedule(s.startDate));
    }
    // Gán trạng thái vòng đời động cho từng lịch
    return upcoming.map((s) => {
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
    // Ưu tiên lịch ACTIVE trước, sau đó sắp xếp theo ngày tăng dần
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
