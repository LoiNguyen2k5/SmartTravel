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

const STORAGE_PREFIX = 'smart_travel_tour_schedules_v4_';

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

// Lịch khởi hành trải dài từ cuối tháng 10 đến hết tháng 11/2026 cho toàn bộ 20 tour
// Đa dạng trạng thái: Đủ người khởi hành, Dư người (Full chỗ), Thiếu số người tối thiểu (Đang gom khách)
const TOUR_SCHEDULES: Record<number, TourScheduleItem[]> = {
  // ─── Tour 1: Ân Thi – Phượng Hoàng Cổ Trấn – Trương Gia Giới 6N5Đ (Quốc tế) ───
  1: [
    { id: 10101, tourId: 1, startDate: '2026-10-25', endDate: '2026-10-30', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 25/10 — Full chỗ (Đã chốt danh sách visa)' },
    { id: 10102, tourId: 1, startDate: '2026-11-02', endDate: '2026-11-07', maxParticipants: 35, bookedCount: 4,  note: 'Khởi hành 02/11 — Thiếu khách tối thiểu' },
    { id: 10103, tourId: 1, startDate: '2026-11-09', endDate: '2026-11-14', maxParticipants: 40, bookedCount: 26, note: 'Khởi hành 09/11 — Đủ điều kiện khởi hành (Còn 14 chỗ)' },
    { id: 10104, tourId: 1, startDate: '2026-11-16', endDate: '2026-11-21', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 16/11 — Hết chỗ (Dư người đăng ký chờ)' },
    { id: 10105, tourId: 1, startDate: '2026-11-23', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 23/11 — Đang gom khách (5/10 khách tối thiểu)' },
    { id: 10106, tourId: 1, startDate: '2026-11-29', endDate: '2026-12-04', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 29/11 — Đợt mới mở bán cuối tháng 11' },
  ],

  // ─── Tour 2: Thượng Hải – Ô Trấn 4N4Đ (Quốc tế) ───
  2: [
    { id: 10201, tourId: 2, startDate: '2026-10-26', endDate: '2026-10-29', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 26/10 — Hết chỗ (Đã khóa sổ làm visa)' },
    { id: 10202, tourId: 2, startDate: '2026-11-04', endDate: '2026-11-07', maxParticipants: 35, bookedCount: 3,  note: 'Khởi hành 04/11 — Thiếu số người tối thiểu' },
    { id: 10203, tourId: 2, startDate: '2026-11-11', endDate: '2026-11-14', maxParticipants: 35, bookedCount: 22, note: 'Khởi hành 11/11 — Đủ người khởi hành (Còn 13 chỗ)' },
    { id: 10204, tourId: 2, startDate: '2026-11-18', endDate: '2026-11-21', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 18/11 — Full slot (Dư người chờ hủy)' },
    { id: 10205, tourId: 2, startDate: '2026-11-25', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 25/11 — Đủ điều kiện khởi hành (Còn 25 chỗ)' },
    { id: 10206, tourId: 2, startDate: '2026-11-30', endDate: '2026-12-03', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 30/11 — Đang gom khách đợt cuối tháng' },
  ],

  // ─── Tour 3: Núi Chứa Chan (Gia Lào) & Dinh Thầy Thím 1N (Nội địa) ───
  3: [
    { id: 10301, tourId: 3, startDate: '2026-10-25', endDate: '2026-10-25', maxParticipants: 45, bookedCount: 45, note: 'Khởi hành 25/10 — Hết chỗ (Full slot Chủ Nhật tuần này)' },
    { id: 10302, tourId: 3, startDate: '2026-10-29', endDate: '2026-10-29', maxParticipants: 45, bookedCount: 4,  note: 'Khởi hành 29/10 — Thiếu người tối thiểu (Cần 10 khách)' },
    { id: 10303, tourId: 3, startDate: '2026-11-01', endDate: '2026-11-01', maxParticipants: 50, bookedCount: 32, note: 'Khởi hành 01/11 — Đủ điều kiện khởi hành (Còn 18 chỗ)' },
    { id: 10304, tourId: 3, startDate: '2026-11-08', endDate: '2026-11-08', maxParticipants: 50, bookedCount: 50, note: 'Khởi hành 08/11 — Dư người (Đã full 50/50 chỗ)' },
    { id: 10305, tourId: 3, startDate: '2026-11-15', endDate: '2026-11-15', maxParticipants: 45, bookedCount: 20, note: 'Khởi hành 15/11 — Đủ điều kiện khởi hành (Còn 25 chỗ)' },
    { id: 10306, tourId: 3, startDate: '2026-11-22', endDate: '2026-11-22', maxParticipants: 45, bookedCount: 5,  note: 'Khởi hành 22/11 — Đang gom khách (5/10 khách)' },
    { id: 10307, tourId: 3, startDate: '2026-11-29', endDate: '2026-11-29', maxParticipants: 45, bookedCount: 0,  note: 'Khởi hành 29/11 — Mới mở bán cuối tuần tháng 11' },
  ],

  // ─── Tour 4: Châu Đốc – Núi Cấm – Chùa Tà Pạ 2N1Đ (Nội địa) ───
  4: [
    { id: 10401, tourId: 4, startDate: '2026-10-25', endDate: '2026-10-26', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 25/10 — Hết chỗ (Full 40 khách)' },
    { id: 10402, tourId: 4, startDate: '2026-10-31', endDate: '2026-11-01', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 31/10 — Thiếu người tối thiểu (Đang gom khách)' },
    { id: 10403, tourId: 4, startDate: '2026-11-07', endDate: '2026-11-08', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 07/11 — Đủ điều kiện khởi hành (Còn 12 chỗ)' },
    { id: 10404, tourId: 4, startDate: '2026-11-14', endDate: '2026-11-15', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 14/11 — Dư người (Hết chỗ, nhận danh sách chờ)' },
    { id: 10405, tourId: 4, startDate: '2026-11-21', endDate: '2026-11-22', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 21/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 10406, tourId: 4, startDate: '2026-11-28', endDate: '2026-11-29', maxParticipants: 40, bookedCount: 3,  note: 'Khởi hành 28/11 — Đang gom khách (Cần thêm người)' },
  ],

  // ─── Tour 5: Mỹ Tho – Bến Tre – Cần Thơ – Cà Mau 4N3Đ (Nội địa) ───
  5: [
    { id: 10501, tourId: 5, startDate: '2026-10-26', endDate: '2026-10-29', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 26/10 — Full chỗ mùa nước nổi' },
    { id: 10502, tourId: 5, startDate: '2026-11-02', endDate: '2026-11-05', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 02/11 — Thiếu số người tối thiểu (6/10 khách)' },
    { id: 10503, tourId: 5, startDate: '2026-11-09', endDate: '2026-11-12', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 09/11 — Đủ điều kiện khởi hành (Còn 15 chỗ)' },
    { id: 10504, tourId: 5, startDate: '2026-11-16', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 16/11 — Hết chỗ (Dư người)' },
    { id: 10505, tourId: 5, startDate: '2026-11-23', endDate: '2026-11-26', maxParticipants: 40, bookedCount: 16, note: 'Khởi hành 23/11 — Đủ người khởi hành (Còn 24 chỗ)' },
    { id: 10506, tourId: 5, startDate: '2026-11-28', endDate: '2026-12-01', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 28/11 — Mới mở bán cuối tháng' },
  ],

  // ─── Tour 6: Đà Lạt 4N3Đ (Nội địa) ───
  6: [
    { id: 10601, tourId: 6, startDate: '2026-10-25', endDate: '2026-10-28', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 25/10 — Hết chỗ (Dư người mùa dã quỳ)' },
    { id: 10602, tourId: 6, startDate: '2026-10-30', endDate: '2026-11-02', maxParticipants: 40, bookedCount: 4,  note: 'Khởi hành 30/10 — Thiếu người tối thiểu (4/10 khách)' },
    { id: 10603, tourId: 6, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 40, bookedCount: 30, note: 'Khởi hành 06/11 — Đủ điều kiện khởi hành (Còn 10 chỗ)' },
    { id: 10604, tourId: 6, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 13/11 — Dư người (Full 40/40 chỗ)' },
    { id: 10605, tourId: 6, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 20/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 10606, tourId: 6, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 40, bookedCount: 3,  note: 'Khởi hành 27/11 — Đang gom khách (Cần thêm người)' },
  ],

  // ─── Tour 7: Đảo Nam Du 3N3Đ (Nội địa) ───
  7: [
    { id: 10701, tourId: 7, startDate: '2026-10-26', endDate: '2026-10-28', maxParticipants: 30, bookedCount: 30, note: 'Khởi hành 26/10 — Hết chỗ (Full 30 vé)' },
    { id: 10702, tourId: 7, startDate: '2026-11-02', endDate: '2026-11-04', maxParticipants: 30, bookedCount: 3,  note: 'Khởi hành 02/11 — Thiếu người tối thiểu' },
    { id: 10703, tourId: 7, startDate: '2026-11-09', endDate: '2026-11-11', maxParticipants: 35, bookedCount: 22, note: 'Khởi hành 09/11 — Đủ điều kiện khởi hành (Còn 13 chỗ)' },
    { id: 10704, tourId: 7, startDate: '2026-11-16', endDate: '2026-11-18', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 16/11 — Dư người (Full slot tàu cao tốc)' },
    { id: 10705, tourId: 7, startDate: '2026-11-23', endDate: '2026-11-25', maxParticipants: 30, bookedCount: 14, note: 'Khởi hành 23/11 — Đủ người khởi hành (Còn 16 chỗ)' },
    { id: 10706, tourId: 7, startDate: '2026-11-28', endDate: '2026-11-30', maxParticipants: 30, bookedCount: 2,  note: 'Khởi hành 28/11 — Mới mở bán' },
  ],

  // ─── Tour 8: Biển Vũng Tàu & Sun World 1N (Nội địa) ───
  8: [
    { id: 10801, tourId: 8, startDate: '2026-10-25', endDate: '2026-10-25', maxParticipants: 50, bookedCount: 50, note: 'Khởi hành 25/10 — Hết chỗ (Full 50 vé xe đời mới)' },
    { id: 10802, tourId: 8, startDate: '2026-10-31', endDate: '2026-10-31', maxParticipants: 50, bookedCount: 5,  note: 'Khởi hành 31/10 — Thiếu người tối thiểu' },
    { id: 10803, tourId: 8, startDate: '2026-11-07', endDate: '2026-11-07', maxParticipants: 50, bookedCount: 36, note: 'Khởi hành 07/11 — Đủ điều kiện khởi hành (Còn 14 chỗ)' },
    { id: 10804, tourId: 8, startDate: '2026-11-14', endDate: '2026-11-14', maxParticipants: 50, bookedCount: 50, note: 'Khởi hành 14/11 — Dư người (Hết chỗ, nhận danh sách chờ)' },
    { id: 10805, tourId: 8, startDate: '2026-11-21', endDate: '2026-11-21', maxParticipants: 50, bookedCount: 24, note: 'Khởi hành 21/11 — Đủ người khởi hành (Còn 26 chỗ)' },
    { id: 10806, tourId: 8, startDate: '2026-11-28', endDate: '2026-11-28', maxParticipants: 50, bookedCount: 4,  note: 'Khởi hành 28/11 — Đang gom khách (Cần thêm người)' },
  ],

  // ─── Tour 9: Phú Yên – Quy Nhơn 3N3Đ (Nội địa) ───
  9: [
    { id: 10901, tourId: 9, startDate: '2026-10-26', endDate: '2026-10-28', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 26/10 — Hết chỗ (Full slot)' },
    { id: 10902, tourId: 9, startDate: '2026-11-01', endDate: '2026-11-03', maxParticipants: 40, bookedCount: 4,  note: 'Khởi hành 01/11 — Thiếu số người tối thiểu' },
    { id: 10903, tourId: 9, startDate: '2026-11-08', endDate: '2026-11-10', maxParticipants: 40, bookedCount: 26, note: 'Khởi hành 08/11 — Đủ điều kiện khởi hành (Còn 14 chỗ)' },
    { id: 10904, tourId: 9, startDate: '2026-11-15', endDate: '2026-11-17', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 15/11 — Dư người (Đã full chỗ)' },
    { id: 10905, tourId: 9, startDate: '2026-11-22', endDate: '2026-11-24', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 22/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 10906, tourId: 9, startDate: '2026-11-29', endDate: '2026-12-01', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 29/11 — Mới mở bán' },
  ],

  // ─── Tour 10: Thái Lan Bangkok – Pattaya 5N4Đ (Quốc tế) ───
  10: [
    { id: 11001, tourId: 10, startDate: '2026-10-28', endDate: '2026-11-01', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 28/10 — Hết chỗ (Đã chốt vé máy bay)' },
    { id: 11002, tourId: 10, startDate: '2026-11-04', endDate: '2026-11-08', maxParticipants: 35, bookedCount: 5,  note: 'Khởi hành 04/11 — Thiếu số người tối thiểu' },
    { id: 11003, tourId: 10, startDate: '2026-11-11', endDate: '2026-11-15', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 11/11 — Đủ điều kiện khởi hành (Còn 12 chỗ)' },
    { id: 11004, tourId: 10, startDate: '2026-11-18', endDate: '2026-11-22', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 18/11 — Dư người (Full slot 40 khách)' },
    { id: 11005, tourId: 10, startDate: '2026-11-25', endDate: '2026-11-29', maxParticipants: 40, bookedCount: 16, note: 'Khởi hành 25/11 — Đủ người khởi hành (Còn 24 chỗ)' },
    { id: 11006, tourId: 10, startDate: '2026-11-30', endDate: '2026-12-04', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 30/11 — Mới mở bán' },
  ],

  // ─── Tour 11: [DEMO] Thanh Toán VietQR 5.000đ (Nội địa) ───
  11: [
    { id: 11101, tourId: 11, startDate: '2026-10-25', endDate: '2026-10-25', maxParticipants: 99, bookedCount: 8,  note: 'Test thanh toán VietQR 5.000đ — Luôn mở' },
    { id: 11102, tourId: 11, startDate: '2026-11-05', endDate: '2026-11-05', maxParticipants: 99, bookedCount: 12, note: 'Test thanh toán VietQR 5.000đ — Đủ người' },
    { id: 11103, tourId: 11, startDate: '2026-11-15', endDate: '2026-11-15', maxParticipants: 99, bookedCount: 99, note: 'Test thanh toán VietQR 5.000đ — Giả lập Full chỗ' },
    { id: 11104, tourId: 11, startDate: '2026-11-25', endDate: '2026-11-25', maxParticipants: 99, bookedCount: 2,  note: 'Test thanh toán VietQR 5.000đ — Thiếu người' },
    { id: 11105, tourId: 11, startDate: '2026-11-30', endDate: '2026-11-30', maxParticipants: 99, bookedCount: 0,  note: 'Test thanh toán VietQR 5.000đ — Luôn mở' },
  ],

  // ─── Tour 12: Hà Nội – Hạ Long – Ninh Bình 4N3Đ (Nội địa) ───
  12: [
    { id: 11201, tourId: 12, startDate: '2026-10-26', endDate: '2026-10-29', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 26/10 — Hết chỗ (Du thuyền Hạ Long full)' },
    { id: 11202, tourId: 12, startDate: '2026-11-02', endDate: '2026-11-05', maxParticipants: 40, bookedCount: 4,  note: 'Khởi hành 02/11 — Thiếu số người tối thiểu' },
    { id: 11203, tourId: 12, startDate: '2026-11-09', endDate: '2026-11-12', maxParticipants: 40, bookedCount: 27, note: 'Khởi hành 09/11 — Đủ điều kiện khởi hành (Còn 13 chỗ)' },
    { id: 11204, tourId: 12, startDate: '2026-11-16', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 16/11 — Dư người (Full slot)' },
    { id: 11205, tourId: 12, startDate: '2026-11-23', endDate: '2026-11-26', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 23/11 — Đủ người khởi hành (Còn 25 chỗ)' },
    { id: 11206, tourId: 12, startDate: '2026-11-29', endDate: '2026-12-02', maxParticipants: 40, bookedCount: 1,  note: 'Khởi hành 29/11 — Đang gom khách đợt cuối tháng' },
  ],

  // ─── Tour 13: Hà Nội – Sapa – Fansipan 4N3Đ (Nội địa) ───
  13: [
    { id: 11301, tourId: 13, startDate: '2026-10-25', endDate: '2026-10-28', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 25/10 — Hết chỗ mùa mây Fansipan' },
    { id: 11302, tourId: 13, startDate: '2026-10-31', endDate: '2026-11-03', maxParticipants: 35, bookedCount: 5,  note: 'Khởi hành 31/10 — Thiếu người tối thiểu' },
    { id: 11303, tourId: 13, startDate: '2026-11-07', endDate: '2026-11-10', maxParticipants: 35, bookedCount: 26, note: 'Khởi hành 07/11 — Đủ điều kiện khởi hành (Còn 9 chỗ)' },
    { id: 11304, tourId: 13, startDate: '2026-11-14', endDate: '2026-11-17', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 14/11 — Dư người (Full 35 khách)' },
    { id: 11305, tourId: 13, startDate: '2026-11-21', endDate: '2026-11-24', maxParticipants: 35, bookedCount: 14, note: 'Khởi hành 21/11 — Đủ người khởi hành (Còn 21 chỗ)' },
    { id: 11306, tourId: 13, startDate: '2026-11-28', endDate: '2026-12-01', maxParticipants: 35, bookedCount: 2,  note: 'Khởi hành 28/11 — Mới mở bán' },
  ],

  // ─── Tour 14: Hà Giang – Đồng Văn – Mã Pí Lèng 5N4Đ (Nội địa) ───
  14: [
    { id: 11401, tourId: 14, startDate: '2026-10-25', endDate: '2026-10-29', maxParticipants: 30, bookedCount: 30, note: 'Khởi hành 25/10 — Hết chỗ (Mùa hoa tam giác mạch HOT)' },
    { id: 11402, tourId: 14, startDate: '2026-10-31', endDate: '2026-11-04', maxParticipants: 30, bookedCount: 4,  note: 'Khởi hành 31/10 — Thiếu người tối thiểu' },
    { id: 11403, tourId: 14, startDate: '2026-11-07', endDate: '2026-11-11', maxParticipants: 30, bookedCount: 22, note: 'Khởi hành 07/11 — Đủ điều kiện khởi hành (Còn 8 chỗ)' },
    { id: 11404, tourId: 14, startDate: '2026-11-14', endDate: '2026-11-18', maxParticipants: 30, bookedCount: 30, note: 'Khởi hành 14/11 — Dư người (Full slot)' },
    { id: 11405, tourId: 14, startDate: '2026-11-21', endDate: '2026-11-25', maxParticipants: 30, bookedCount: 12, note: 'Khởi hành 21/11 — Đủ người khởi hành (Còn 18 chỗ)' },
    { id: 11406, tourId: 14, startDate: '2026-11-28', endDate: '2026-12-02', maxParticipants: 30, bookedCount: 0,  note: 'Khởi hành 28/11 — Mới mở bán' },
  ],

  // ─── Tour 15: Đà Nẵng – Hội An – Huế 4N3Đ (Nội địa) ───
  15: [
    { id: 11501, tourId: 15, startDate: '2026-10-25', endDate: '2026-10-28', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 25/10 — Hết chỗ (Full slot Bà Nà)' },
    { id: 11502, tourId: 15, startDate: '2026-10-31', endDate: '2026-11-03', maxParticipants: 40, bookedCount: 3,  note: 'Khởi hành 31/10 — Thiếu người tối thiểu' },
    { id: 11503, tourId: 15, startDate: '2026-11-07', endDate: '2026-11-10', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 07/11 — Đủ điều kiện khởi hành (Còn 12 chỗ)' },
    { id: 11504, tourId: 15, startDate: '2026-11-14', endDate: '2026-11-17', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 14/11 — Dư người (Full chỗ)' },
    { id: 11505, tourId: 15, startDate: '2026-11-21', endDate: '2026-11-24', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 21/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 11506, tourId: 15, startDate: '2026-11-28', endDate: '2026-12-01', maxParticipants: 40, bookedCount: 4,  note: 'Khởi hành 28/11 — Đang gom khách (Cần thêm người)' },
  ],

  // ─── Tour 16: Phú Quốc – Nam Đảo 4N3Đ (Nội địa) ───
  16: [
    { id: 11601, tourId: 16, startDate: '2026-10-26', endDate: '2026-10-29', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 26/10 — Hết chỗ (Full slot ngắm hoàng hôn)' },
    { id: 11602, tourId: 16, startDate: '2026-11-02', endDate: '2026-11-05', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 02/11 — Thiếu số người tối thiểu' },
    { id: 11603, tourId: 16, startDate: '2026-11-09', endDate: '2026-11-12', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 09/11 — Đủ điều kiện khởi hành (Còn 15 chỗ)' },
    { id: 11604, tourId: 16, startDate: '2026-11-16', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 16/11 — Dư người (Full slot)' },
    { id: 11605, tourId: 16, startDate: '2026-11-23', endDate: '2026-11-26', maxParticipants: 40, bookedCount: 16, note: 'Khởi hành 23/11 — Đủ người khởi hành (Còn 24 chỗ)' },
    { id: 11606, tourId: 16, startDate: '2026-11-29', endDate: '2026-12-02', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 29/11 — Mới mở bán' },
  ],

  // ─── Tour 17: Singapore & Malaysia 5N4Đ (Quốc tế) ───
  17: [
    { id: 11701, tourId: 17, startDate: '2026-10-27', endDate: '2026-10-31', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 27/10 — Hết chỗ (Đã xuất vé đoàn)' },
    { id: 11702, tourId: 17, startDate: '2026-11-03', endDate: '2026-11-07', maxParticipants: 40, bookedCount: 4,  note: 'Khởi hành 03/11 — Thiếu số người tối thiểu' },
    { id: 11703, tourId: 17, startDate: '2026-11-10', endDate: '2026-11-14', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 10/11 — Đủ điều kiện khởi hành (Còn 12 chỗ)' },
    { id: 11704, tourId: 17, startDate: '2026-11-17', endDate: '2026-11-21', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 17/11 — Dư người (Full 40 khách)' },
    { id: 11705, tourId: 17, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 24/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 11706, tourId: 17, startDate: '2026-11-29', endDate: '2026-12-03', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 29/11 — Mới mở bán' },
  ],

  // ─── Tour 18: Seoul & Đảo Nami Hàn Quốc 5N4Đ (Quốc tế) ───
  18: [
    { id: 11801, tourId: 18, startDate: '2026-10-28', endDate: '2026-11-01', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 28/10 — Hết chỗ (Lá đỏ Đảo Nami đỉnh điểm)' },
    { id: 11802, tourId: 18, startDate: '2026-11-04', endDate: '2026-11-08', maxParticipants: 35, bookedCount: 5,  note: 'Khởi hành 04/11 — Thiếu số người tối thiểu' },
    { id: 11803, tourId: 18, startDate: '2026-11-11', endDate: '2026-11-15', maxParticipants: 35, bookedCount: 27, note: 'Khởi hành 11/11 — Đủ điều kiện khởi hành (Còn 8 chỗ)' },
    { id: 11804, tourId: 18, startDate: '2026-11-18', endDate: '2026-11-22', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 18/11 — Dư người (Full slot mùa chớm đông)' },
    { id: 11805, tourId: 18, startDate: '2026-11-25', endDate: '2026-11-29', maxParticipants: 35, bookedCount: 15, note: 'Khởi hành 25/11 — Đủ người khởi hành (Còn 20 chỗ)' },
    { id: 11806, tourId: 18, startDate: '2026-11-30', endDate: '2026-12-04', maxParticipants: 35, bookedCount: 1,  note: 'Khởi hành 30/11 — Mới mở bán' },
  ],

  // ─── Tour 19: Tokyo & Núi Phú Sĩ Nhật Bản 5N4Đ (Quốc tế) ───
  19: [
    { id: 11901, tourId: 19, startDate: '2026-10-27', endDate: '2026-10-31', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 27/10 — Hết chỗ (Mùa lá đỏ Kohyo Phú Sĩ)' },
    { id: 11902, tourId: 19, startDate: '2026-11-04', endDate: '2026-11-08', maxParticipants: 35, bookedCount: 4,  note: 'Khởi hành 04/11 — Thiếu số người tối thiểu' },
    { id: 11903, tourId: 19, startDate: '2026-11-11', endDate: '2026-11-15', maxParticipants: 35, bookedCount: 26, note: 'Khởi hành 11/11 — Đủ điều kiện khởi hành (Còn 9 chỗ)' },
    { id: 11904, tourId: 19, startDate: '2026-11-18', endDate: '2026-11-22', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 18/11 — Dư người (Full 35 khách)' },
    { id: 11905, tourId: 19, startDate: '2026-11-25', endDate: '2026-11-29', maxParticipants: 35, bookedCount: 16, note: 'Khởi hành 25/11 — Đủ người khởi hành (Còn 19 chỗ)' },
    { id: 11906, tourId: 19, startDate: '2026-11-30', endDate: '2026-12-04', maxParticipants: 35, bookedCount: 0,  note: 'Khởi hành 30/11 — Mới mở bán' },
  ],

  // ─── Tour 20: Indonesia – Bali 5N4Đ (Quốc tế) ───
  20: [
    { id: 12001, tourId: 20, startDate: '2026-10-26', endDate: '2026-10-30', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 26/10 — Hết chỗ (Full 40 khách)' },
    { id: 12002, tourId: 20, startDate: '2026-11-03', endDate: '2026-11-07', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 03/11 — Thiếu số người tối thiểu' },
    { id: 12003, tourId: 20, startDate: '2026-11-10', endDate: '2026-11-14', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 10/11 — Đủ điều kiện khởi hành (Còn 12 chỗ)' },
    { id: 12004, tourId: 20, startDate: '2026-11-17', endDate: '2026-11-21', maxParticipants: 40, bookedCount: 40, note: 'Khởi hành 17/11 — Dư người (Full slot hoàng hôn Jimbaran)' },
    { id: 12005, tourId: 20, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 24/11 — Đủ người khởi hành (Còn 22 chỗ)' },
    { id: 12006, tourId: 20, startDate: '2026-11-29', endDate: '2026-12-03', maxParticipants: 40, bookedCount: 2,  note: 'Khởi hành 29/11 — Mới mở bán' },
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
      // Dọn dẹp cache cũ nếu tồn tại để đồng bộ lịch mới tháng 10 - 11/2026
      localStorage.removeItem('smart_travel_tour_schedules_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v2_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v3_' + tourId);

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
