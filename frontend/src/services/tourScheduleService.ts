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

const STORAGE_PREFIX = 'smart_travel_tour_schedules_v5_';

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

// Lịch khởi hành mẫu phong phú theo từng tour (tháng 11 & 12/2026 và đầu năm 2027)
const TOUR_SCHEDULES: Record<number, TourScheduleItem[]> = {
  // ─── Tour 1: Ân Thi – Phượng Hoàng Cổ Trấn – Trương Gia Giới 6N5Đ ───
  1: [
    { id: 10101, tourId: 1, startDate: '2026-11-06', endDate: '2026-11-11', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 06/11 — Trương Gia Giới mùa thu vàng' },
    { id: 10102, tourId: 1, startDate: '2026-11-16', endDate: '2026-11-21', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 16/11 — Phượng Hoàng Cổ Trấn lung linh (+5%)', seasonalPriceMultiplier: 1.05 },
    { id: 10103, tourId: 1, startDate: '2026-11-26', endDate: '2026-12-01', maxParticipants: 35, bookedCount: 8,  note: 'Khởi hành 26/11 — Mùa tuyết đầu đông Hồ Nam' },
    { id: 10104, tourId: 1, startDate: '2026-12-08', endDate: '2026-12-13', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 08/12 — Đón đông xứ Trung' },
  ],
  // ─── Tour 2: Thượng Hải – Ô Trấn 4N4Đ ───
  2: [
    { id: 10201, tourId: 2, startDate: '2026-11-07', endDate: '2026-11-10', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 07/11 — Thượng Hải mùa thu mát mẻ' },
    { id: 10202, tourId: 2, startDate: '2026-11-17', endDate: '2026-11-20', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 17/11 — Ô Trấn cổ kính sương mai', seasonalPriceMultiplier: 1.05 },
    { id: 10203, tourId: 2, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 35, bookedCount: 10, note: 'Khởi hành 27/11 — Cuối tháng 11' },
    { id: 10204, tourId: 2, startDate: '2026-12-10', endDate: '2026-12-13', maxParticipants: 40, bookedCount: 0,  note: 'Khởi hành 10/12 — Giáng sinh rực rỡ' },
  ],
  // ─── Tour 3: Núi Chứa Chan (Gia Lào) & Dinh Thầy Thím ───
  3: [
    { id: 10301, tourId: 3, startDate: '2026-11-08', endDate: '2026-11-08', maxParticipants: 45, bookedCount: 22, note: 'Khởi hành 08/11 — Tour 1 ngày cuối tuần' },
    { id: 10302, tourId: 3, startDate: '2026-11-15', endDate: '2026-11-15', maxParticipants: 45, bookedCount: 15, note: 'Khởi hành 15/11 — Viếng chùa Gia Lào cầu an' },
    { id: 10303, tourId: 3, startDate: '2026-11-22', endDate: '2026-11-22', maxParticipants: 50, bookedCount: 35, note: 'Khởi hành 22/11 — Dinh Thầy Thím & biển Cam Bình' },
    { id: 10304, tourId: 3, startDate: '2026-11-29', endDate: '2026-11-29', maxParticipants: 45, bookedCount: 10, note: 'Khởi hành 29/11 — Cuối tuần cuối tháng' },
    { id: 10305, tourId: 3, startDate: '2026-12-06', endDate: '2026-12-06', maxParticipants: 45, bookedCount: 5,  note: 'Khởi hành 06/12 — Đầu tháng 12' },
  ],
  // ─── Tour 4: Châu Đốc – Núi Cấm – Chùa Tà Pạ ───
  4: [
    { id: 10401, tourId: 4, startDate: '2026-11-07', endDate: '2026-11-08', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 07/11 — 2N1Đ cuối tuần' },
    { id: 10402, tourId: 4, startDate: '2026-11-14', endDate: '2026-11-15', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 14/11 — Miếu Bà Chúa Xứ linh thiêng' },
    { id: 10403, tourId: 4, startDate: '2026-11-21', endDate: '2026-11-22', maxParticipants: 40, bookedCount: 12, note: 'Khởi hành 21/11 — Cánh đồng Tà Pạ mùa gặt lúa' },
    { id: 10404, tourId: 4, startDate: '2026-11-28', endDate: '2026-11-29', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 28/11 — Núi Cấm Thất Sơn' },
  ],
  // ─── Tour 5: Mỹ Tho – Bến Tre – Cần Thơ – Cà Mau ───
  5: [
    { id: 10501, tourId: 5, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 45, bookedCount: 30, note: 'Khởi hành 06/11 — Miền Tây sông nước miệt vườn' },
    { id: 10502, tourId: 5, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 45, bookedCount: 38, note: 'Khởi hành 13/11 — Chợ nổi Cái Răng & Đất Mũi Cà Mau', seasonalPriceMultiplier: 1.05 },
    { id: 10503, tourId: 5, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 20/11 — Trải nghiệm chèo xuồng ba lá' },
    { id: 10504, tourId: 5, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 40, bookedCount: 8,  note: 'Khởi hành 27/11 — Cuối tháng 11' },
  ],
  // ─── Tour 6: Đà Lạt 4N3Đ ───
  6: [
    { id: 10601, tourId: 6, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 06/11 — Đà Lạt mùa hoa dã quỳ vàng rực' },
    { id: 10602, tourId: 6, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 13/11 — Đồi cỏ hồng & săn mây Trại Mát' },
    { id: 10603, tourId: 6, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 35, note: 'Khởi hành 20/11 — Mùa lạnh cao nguyên (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 10604, tourId: 6, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 27/11 — Thung lũng Tình Yêu' },
    { id: 10605, tourId: 6, startDate: '2026-12-05', endDate: '2026-12-08', maxParticipants: 40, bookedCount: 10, note: 'Khởi hành 05/12 — Festival Hoa Đà Lạt 2026' },
  ],
  // ─── Tour 7: Đảo Nam Du 3N3Đ ───
  7: [
    { id: 10701, tourId: 7, startDate: '2026-11-06', endDate: '2026-11-08', maxParticipants: 30, bookedCount: 18, note: 'Khởi hành 06/11 — Biển xanh Nam Du mùa sóng êm' },
    { id: 10702, tourId: 7, startDate: '2026-11-13', endDate: '2026-11-15', maxParticipants: 30, bookedCount: 12, note: 'Khởi hành 13/11 — Lặn ngắm san hô Hòn Dầu' },
    { id: 10703, tourId: 7, startDate: '2026-11-20', endDate: '2026-11-22', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 20/11 — Thưởng thức hải sản tươi sống' },
    { id: 10704, tourId: 7, startDate: '2026-11-27', endDate: '2026-11-29', maxParticipants: 30, bookedCount: 8,  note: 'Khởi hành 27/11 — Đảo vắng thanh bình' },
  ],
  // ─── Tour 8: Biển Vũng Tàu & Sun World ───
  8: [
    { id: 10801, tourId: 8, startDate: '2026-11-08', endDate: '2026-11-08', maxParticipants: 50, bookedCount: 35, note: 'Khởi hành 08/11 — Tour 1 ngày nghỉ dưỡng cuối tuần' },
    { id: 10802, tourId: 8, startDate: '2026-11-15', endDate: '2026-11-15', maxParticipants: 50, bookedCount: 20, note: 'Khởi hành 15/11 — Tắm biển Bãi Sau & ngọn hải đăng' },
    { id: 10803, tourId: 8, startDate: '2026-11-22', endDate: '2026-11-22', maxParticipants: 50, bookedCount: 48, note: 'Khởi hành 22/11 — Buffet hải sản view biển' },
    { id: 10804, tourId: 8, startDate: '2026-11-29', endDate: '2026-11-29', maxParticipants: 50, bookedCount: 22, note: 'Khởi hành 29/11 — Cuối tuần thảnh thơi' },
  ],
  // ─── Tour 9: Phú Yên – Quy Nhơn 3N3Đ ───
  9: [
    { id: 10901, tourId: 9, startDate: '2026-11-06', endDate: '2026-11-08', maxParticipants: 40, bookedCount: 25, note: 'Khởi hành 06/11 — Xứ sở hoa vàng trên cỏ xanh' },
    { id: 10902, tourId: 9, startDate: '2026-11-13', endDate: '2026-11-15', maxParticipants: 40, bookedCount: 16, note: 'Khởi hành 13/11 — Gành Đá Đĩa kiệt tác thiên nhiên' },
    { id: 10903, tourId: 9, startDate: '2026-11-20', endDate: '2026-11-22', maxParticipants: 40, bookedCount: 32, note: 'Khởi hành 20/11 — Kỳ Co – Eo Gió Maldives Việt Nam' },
    { id: 10904, tourId: 9, startDate: '2026-11-27', endDate: '2026-11-29', maxParticipants: 40, bookedCount: 14, note: 'Khởi hành 27/11 — Đón bình minh Mũi Điện' },
  ],
  // ─── Tour 10: Thái Lan Bangkok – Pattaya 5N4Đ ───
  10: [
    { id: 11001, tourId: 10, startDate: '2026-11-06', endDate: '2026-11-10', maxParticipants: 40, bookedCount: 30, note: 'Khởi hành 06/11 — Bangkok – Pattaya thiên đường du lịch' },
    { id: 11002, tourId: 10, startDate: '2026-11-15', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 38, note: 'Khởi hành 15/11 — Lễ hội hoa đăng Loy Krathong (+10%)', seasonalPriceMultiplier: 1.1 },
    { id: 11003, tourId: 10, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 35, bookedCount: 15, note: 'Khởi hành 24/11 — Đảo San Hô Coral Island' },
    { id: 11004, tourId: 10, startDate: '2026-12-05', endDate: '2026-12-09', maxParticipants: 35, bookedCount: 4,  note: 'Khởi hành 05/12 — Mua sắm Siam Paragon cuối năm' },
  ],
  // ─── Tour 11: [DEMO] Thanh Toán VietQR ───
  11: [
    { id: 11101, tourId: 11, startDate: '2026-11-01', endDate: '2026-11-01', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
    { id: 11102, tourId: 11, startDate: '2026-11-15', endDate: '2026-11-15', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
    { id: 11103, tourId: 11, startDate: '2026-12-01', endDate: '2026-12-01', maxParticipants: 99, bookedCount: 0, note: 'Test thanh toán VietQR 5.000đ — luôn mở' },
  ],
  // ─── Tour 12: Hà Nội – Hạ Long – Ninh Bình 4N3Đ ───
  12: [
    { id: 11201, tourId: 12, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 40, bookedCount: 22, note: 'Khởi hành 06/11 — Vịnh Hạ Long di sản thế giới' },
    { id: 11202, tourId: 12, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 40, bookedCount: 34, note: 'Khởi hành 13/11 — Tràng An – Bái Đính Ninh Bình' },
    { id: 11203, tourId: 12, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 20/11 — Thưởng thức ẩm thực Hà Thành' },
    { id: 11204, tourId: 12, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 27/11 — Cuối tháng 11' },
  ],
  // ─── Tour 13: Hà Nội – Sapa – Fansipan 4N3Đ ───
  13: [
    { id: 11301, tourId: 13, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 35, bookedCount: 28, note: 'Khởi hành 06/11 — Sapa sương mờ & mùa lạnh bắt đầu' },
    { id: 11302, tourId: 13, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 35, bookedCount: 20, note: 'Khởi hành 13/11 — Chinh phục đỉnh Fansipan 3.143m' },
    { id: 11303, tourId: 13, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 35, bookedCount: 33, note: 'Khởi hành 20/11 — Bản Cát Cát mùa hoa mận' },
    { id: 11304, tourId: 13, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 35, bookedCount: 25, note: 'Khởi hành 27/11 — Đèo Ô Quy Hồ ngắm hoàng hôn' },
    { id: 11305, tourId: 13, startDate: '2026-12-05', endDate: '2026-12-08', maxParticipants: 35, bookedCount: 10, note: 'Khởi hành 05/12 — Săn tuyết mùa đông Sapa' },
  ],
  // ─── Tour 14: Hà Giang – Đồng Văn – Mã Pí Lèng 5N4Đ ───
  14: [
    { id: 11401, tourId: 14, startDate: '2026-11-05', endDate: '2026-11-09', maxParticipants: 30, bookedCount: 26, note: 'Khởi hành 05/11 — Lễ hội hoa tam giác mạch Hà Giang' },
    { id: 11402, tourId: 14, startDate: '2026-11-12', endDate: '2026-11-16', maxParticipants: 30, bookedCount: 30, note: 'Khởi hành 12/11 — Đệ nhất hùng quan Mã Pí Lèng' },
    { id: 11403, tourId: 14, startDate: '2026-11-19', endDate: '2026-11-23', maxParticipants: 30, bookedCount: 22, note: 'Khởi hành 19/11 — Du thuyền trên hẻm vực Tu Sản' },
    { id: 11404, tourId: 14, startDate: '2026-11-26', endDate: '2026-11-30', maxParticipants: 30, bookedCount: 8,  note: 'Khởi hành 26/11 — Cột cờ Lũng Cú cực Bắc Tổ quốc' },
  ],
  // ─── Tour 15: Đà Nẵng – Hội An – Huế 4N3Đ ───
  15: [
    { id: 11501, tourId: 15, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 40, bookedCount: 30, note: 'Khởi hành 06/11 — Phố cổ Hội An lung linh hoa đăng' },
    { id: 11502, tourId: 15, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 13/11 — Cầu Vàng Bà Nà Hills bồng bềnh mây' },
    { id: 11503, tourId: 15, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 20/11 — Thăm Đại Nội & lăng tẩm Cố Đô Huế' },
    { id: 11504, tourId: 15, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 40, bookedCount: 24, note: 'Khởi hành 27/11 — Bán đảo Sơn Trà & chùa Linh Ứng' },
  ],
  // ─── Tour 16: Phú Quốc – Nam Đảo 4N3Đ ───
  16: [
    { id: 11601, tourId: 16, startDate: '2026-11-06', endDate: '2026-11-09', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 06/11 — Phú Quốc mùa khô biển đẹp nhất năm' },
    { id: 11602, tourId: 16, startDate: '2026-11-13', endDate: '2026-11-16', maxParticipants: 40, bookedCount: 15, note: 'Khởi hành 13/11 — Cáp treo Hòn Thơm vượt biển dài nhất' },
    { id: 11603, tourId: 16, startDate: '2026-11-20', endDate: '2026-11-23', maxParticipants: 40, bookedCount: 38, note: 'Khởi hành 20/11 — Sunset Town & cầu Hôn Phú Quốc' },
    { id: 11604, tourId: 16, startDate: '2026-11-27', endDate: '2026-11-30', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 27/11 — Lặn ngắm san hô Bãi Sao' },
  ],
  // ─── Tour 17: Singapore – Malaysia 5N4Đ ───
  17: [
    { id: 11701, tourId: 17, startDate: '2026-11-06', endDate: '2026-11-10', maxParticipants: 40, bookedCount: 28, note: 'Khởi hành 06/11 — Gardens by the Bay & Marina Bay Sands' },
    { id: 11702, tourId: 17, startDate: '2026-11-15', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 15/11 — Tháp đôi Petronas & phố cổ Malacca' },
    { id: 11703, tourId: 17, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 18, note: 'Khởi hành 24/11 — Cao nguyên Genting & Động Batu' },
    { id: 11704, tourId: 17, startDate: '2026-12-05', endDate: '2026-12-09', maxParticipants: 40, bookedCount: 6,  note: 'Khởi hành 05/12 — Không khí Noel sớm tại Orchard' },
  ],
  // ─── Tour 18: Hàn Quốc – Seoul – Nami 5N4Đ ───
  18: [
    { id: 11801, tourId: 18, startDate: '2026-11-06', endDate: '2026-11-10', maxParticipants: 35, bookedCount: 30, note: 'Khởi hành 06/11 — Đảo Nami mùa lá ngân hạnh vàng' },
    { id: 11802, tourId: 18, startDate: '2026-11-15', endDate: '2026-11-19', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 15/11 — Cung điện Gyeongbokgung mùa thu lá đỏ' },
    { id: 11803, tourId: 18, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 35, bookedCount: 28, note: 'Khởi hành 24/11 — Tháp N Seoul & chợ đêm Myeongdong' },
    { id: 11804, tourId: 18, startDate: '2026-12-05', endDate: '2026-12-09', maxParticipants: 35, bookedCount: 12, note: 'Khởi hành 05/12 — Trượt tuyết mùa đông xứ Hàn' },
  ],
  // ─── Tour 19: Nhật Bản – Tokyo – Phú Sĩ 5N4Đ ───
  19: [
    { id: 11901, tourId: 19, startDate: '2026-11-06', endDate: '2026-11-10', maxParticipants: 35, bookedCount: 32, note: 'Khởi hành 06/11 — Núi Phú Sĩ & hồ Kawaguchi mùa lá đỏ' },
    { id: 11902, tourId: 19, startDate: '2026-11-15', endDate: '2026-11-19', maxParticipants: 35, bookedCount: 35, note: 'Khởi hành 15/11 — Chùa Sensoji Asakusa & phố cổ Tokyo' },
    { id: 11903, tourId: 19, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 35, bookedCount: 25, note: 'Khởi hành 24/11 — Thung lũng Owakudani luộc trứng đen' },
    { id: 11904, tourId: 19, startDate: '2026-12-05', endDate: '2026-12-09', maxParticipants: 35, bookedCount: 8,  note: 'Khởi hành 05/12 — Trải nghiệm tắm Onsen mùa đông' },
  ],
  // ─── Tour 20: Indonesia – Bali 5N4Đ ───
  20: [
    { id: 12001, tourId: 20, startDate: '2026-11-06', endDate: '2026-11-10', maxParticipants: 40, bookedCount: 26, note: 'Khởi hành 06/11 — Cổng trời Lempuyang & đền Tanah Lot' },
    { id: 12002, tourId: 20, startDate: '2026-11-15', endDate: '2026-11-19', maxParticipants: 40, bookedCount: 36, note: 'Khởi hành 15/11 — Xích đu Bali Swing & ruộng bậc thang Tegallalang' },
    { id: 12003, tourId: 20, startDate: '2026-11-24', endDate: '2026-11-28', maxParticipants: 40, bookedCount: 20, note: 'Khởi hành 24/11 — Đảo ngọc Nusa Penida sống lưng khủng long' },
    { id: 12004, tourId: 20, startDate: '2026-12-05', endDate: '2026-12-09', maxParticipants: 40, bookedCount: 5,  note: 'Khởi hành 05/12 — Hoàng hôn biển Jimbaran' },
  ],
};

// Hàm tự động sinh lịch tương lai động liên tục theo thời gian thực (Real-time dynamic rolling schedules)
// Đảm bảo không bao giờ bị tình trạng 0 tour dù qua tháng hay qua năm
const generateDynamicFutureSchedules = (tourId: number, baseHistory: TourScheduleItem[] = []): TourScheduleItem[] => {
  const toDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const make = (offsetDays: number, durationDays: number, note: string, booked: number, multiplier = 1.0): TourScheduleItem => {
    const s = new Date();
    s.setHours(12, 0, 0, 0);
    s.setDate(s.getDate() + offsetDays);
    const e = new Date(s);
    e.setDate(e.getDate() + durationDays);
    return {
      id: Number(`${tourId}${String(offsetDays).padStart(2, "0")}`),
      tourId,
      startDate: toDateString(s),
      endDate: toDateString(e),
      minParticipants: 10,
      maxParticipants: 40,
      bookedCount: booked,
      note,
      seasonalPriceMultiplier: multiplier,
    };
  };

  const generated: TourScheduleItem[] = [
    make(6, 4, 'Khởi hành đợt 1 — Đang nhận khách', 15),
    make(14, 4, 'Khởi hành đợt 2 — Lịch HOT giữa tháng', 24, 1.05),
    make(22, 5, 'Khởi hành đợt 3 — Cuối tháng', 8),
    make(35, 5, 'Khởi hành đợt 4 — Tháng kế tiếp', 0),
  ];

  return [...baseHistory, ...generated];
};

// Lấy lịch mặc định cho tour (kết hợp lịch định nghĩa sẵn và cơ chế tự động bù lịch tương lai)
const getDefaultSchedulesForTour = (tourId: number): TourScheduleItem[] => {
  const predefined = TOUR_SCHEDULES[tourId];
  if (predefined) {
    const upcoming = predefined.filter((s) => isUpcomingSchedule(s.startDate));
    // Nếu có ít nhất 2 đợt khởi hành tương lai, dùng danh sách mẫu
    if (upcoming.length >= 2) {
      return predefined;
    }
    // Nếu tất cả lịch mẫu đã quá hạn (hoặc còn quá ít), tự động sinh lịch mới trong tương lai
    return generateDynamicFutureSchedules(tourId, predefined);
  }

  // Fallback: tạo lịch tương lai động cho tour mới
  return generateDynamicFutureSchedules(tourId);
};

export const tourScheduleService = {
  // Lấy tất cả lịch khởi hành của tour (dành cho Vendor quản lý & hiển thị)
  getSchedulesForTour: (tourId: number): TourScheduleItem[] => {
    try {
      // Dọn dẹp cache cũ v1, v2, v3, v4 nếu tồn tại
      localStorage.removeItem('smart_travel_tour_schedules_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v2_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v3_' + tourId);
      localStorage.removeItem('smart_travel_tour_schedules_v4_' + tourId);

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
        // Kiểm tra xem cache còn bất kỳ lịch nào trong tương lai không
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
