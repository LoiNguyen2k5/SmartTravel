import { Tour } from '../types/tour';

export type TourTransportMode = 'FLIGHT' | 'LAND_SEA';

export interface FlightLegInfo {
  code: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  note: string;
}

export interface TourTransportInfo {
  mode: TourTransportMode;
  badgeLabel: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  carrier: string;
  shortCarrierBadge: string;
  baggageSummary: string;
  outbound: FlightLegInfo;
  inbound: FlightLegInfo;
  meetingPoint: string;
  leaderInstruction: string;
  localTransport: string;
  idDocumentNotice: string;
}

interface PresetRoute {
  mode: TourTransportMode;
  badgeLabel: string;
  toCode: string;
  toName: string;
  carrier: string;
  shortCarrierBadge: string;
  baggageSummary: string;
  outbound: FlightLegInfo;
  inbound: FlightLegInfo;
  localTransport: string;
}

const PRESET_BY_KEYWORD: Array<{ match: RegExp; route: PresetRoute }> = [
  {
    match: /hàn quốc|seoul|nami|incheon/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'ICN',
      toName: 'Seoul (Sân bay Quốc tế Incheon T1)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (23kg)',
      baggageSummary: '07kg xách tay + 23kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN408', departTime: '06:30', arriveTime: '13:30', duration: 'Bay thẳng · 5h00m', note: 'Suất ăn nóng trên tàu bay' },
      inbound: { code: 'VN409', departTime: '16:15', arriveTime: '19:30', duration: 'Bay thẳng · 5h15m', note: 'Suất ăn nóng trên tàu bay' },
      localTransport: 'Xe du lịch 45 chỗ đời mới đón đoàn ngay tại sân bay Incheon phục vụ suốt hành trình tại Hàn Quốc.',
    },
  },
  {
    match: /nhật bản|tokyo|phú sĩ|narita/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'NRT',
      toName: 'Tokyo (Sân bay Quốc tế Narita T1)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (23kg)',
      baggageSummary: '07kg xách tay + 23kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN300', departTime: '06:10', arriveTime: '13:50', duration: 'Bay thẳng · 5h40m', note: 'Tàu bay thân rộng Boeing 787' },
      inbound: { code: 'VN301', departTime: '15:25', arriveTime: '19:45', duration: 'Bay thẳng · 6h20m', note: 'Tàu bay thân rộng Boeing 787' },
      localTransport: 'Xe buýt du lịch chuẩn Nhật Bản đón đoàn tại sân bay Narita và di chuyển xuyên suốt Tokyo – Phú Sĩ.',
    },
  },
  {
    match: /thái lan|bangkok|pattaya/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'BKK',
      toName: 'Bangkok (Sân bay Suvarnabhumi)',
      carrier: 'Vietjet Air',
      shortCarrierBadge: 'Vietjet Air (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VJ801', departTime: '08:35', arriveTime: '10:05', duration: 'Bay thẳng · 1h30m', note: 'Vé đoàn bao gồm 20kg ký gửi' },
      inbound: { code: 'VJ804', departTime: '16:20', arriveTime: '18:00', duration: 'Bay thẳng · 1h40m', note: 'Vé đoàn bao gồm 20kg ký gửi' },
      localTransport: 'Xe du lịch 45 chỗ máy lạnh Thái Lan đón đoàn tại sân bay Suvarnabhumi đi Pattaya – Bangkok.',
    },
  },
  {
    match: /singapore|malaysia/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'SIN',
      toName: 'Singapore (Changi) / Kuala Lumpur (KLIA)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (23kg)',
      baggageSummary: '07kg xách tay + 23kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN651', departTime: '09:00', arriveTime: '12:10', duration: 'Bay thẳng · 2h10m', note: 'Nhập cảnh tại Sân bay Changi' },
      inbound: { code: 'VN674', departTime: '17:35', arriveTime: '18:45', duration: 'Bay thẳng · 2h10m', note: 'Xuất cảnh từ Sân bay KLIA (KUL)' },
      localTransport: 'Xe du lịch liên tuyến chất lượng cao đưa đoàn từ Singapore qua Malacca – Kuala Lumpur.',
    },
  },
  {
    match: /bali|indonesia/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'DPS',
      toName: 'Bali (Sân bay Quốc tế Ngurah Rai)',
      carrier: 'Vietjet Air',
      shortCarrierBadge: 'Vietjet Air (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VJ893', departTime: '08:05', arriveTime: '13:05', duration: 'Bay thẳng · 4h00m', note: 'Vé đoàn kèm 20kg hành lý ký gửi' },
      inbound: { code: 'VJ894', departTime: '14:05', arriveTime: '17:05', duration: 'Bay thẳng · 4h00m', note: 'Vé đoàn kèm 20kg hành lý ký gửi' },
      localTransport: 'Xe du lịch địa phương đón đoàn tại sân bay Ngurah Rai đi Ubud – Tanah Lot – Nusa Dua.',
    },
  },
  {
    match: /ân thi|phượng hoàng cổ trấn|trương gia giới/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'ENH',
      toName: 'Ân Thi – Hồ Nam (Sân bay Xujiaping)',
      carrier: 'Vietjet Air Charter',
      shortCarrierBadge: 'Vietjet Charter (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VJ3674', departTime: '14:35', arriveTime: '19:00', duration: 'Bay thẳng Charter · 3h25m', note: 'Chuyến bay thẳng thuê bao nguyên chuyến' },
      inbound: { code: 'VJ3675', departTime: '20:00', arriveTime: '23:05', duration: 'Bay thẳng Charter · 4h05m', note: 'Chuyến bay thẳng thuê bao nguyên chuyến' },
      localTransport: 'Xe du lịch VIP máy lạnh suốt tuyến Ân Thi – Phượng Hoàng Cổ Trấn – Trương Gia Giới.',
    },
  },
  {
    match: /thượng hải|ô trấn|hàng châu|tô châu|trung quốc/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'PVG',
      toName: 'Thượng Hải (Sân bay Quốc tế Phố Đông)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (23kg)',
      baggageSummary: '07kg xách tay + 23kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN522', departTime: '07:40', arriveTime: '12:45', duration: 'Bay thẳng · 4h05m', note: 'Bao gồm suất ăn nóng trên máy bay' },
      inbound: { code: 'VN523', departTime: '15:10', arriveTime: '18:35', duration: 'Bay thẳng · 4h25m', note: 'Bao gồm suất ăn nóng trên máy bay' },
      localTransport: 'Xe du lịch 45 chỗ đời mới đón đoàn tại sân bay Phố Đông phục vụ suốt hành trình Thượng Hải – Ô Trấn.',
    },
  },
  {
    match: /đà nẵng|hội an|huế/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'DAD',
      toName: 'Đà Nẵng (Sân bay Quốc tế Đà Nẵng)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN112', departTime: '07:00', arriveTime: '08:20', duration: 'Bay thẳng · 1h20m', note: 'Đáp tại Sân bay Quốc tế Đà Nẵng (DAD)' },
      inbound: { code: 'VN1375', departTime: '18:30', arriveTime: '19:55', duration: 'Bay thẳng · 1h25m', note: 'Khởi hành về từ Sân bay Phú Bài Huế / Đà Nẵng' },
      localTransport: 'Xe du lịch đời mới đón đoàn tại sân bay Đà Nẵng đưa đi Hội An – Bà Nà Hills – Cố đô Huế.',
    },
  },
  {
    match: /phú quốc|nam đảo|hòn thơm/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'PQC',
      toName: 'Phú Quốc (Sân bay Quốc tế Phú Quốc)',
      carrier: 'Vietjet Air',
      shortCarrierBadge: 'Vietjet Air (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VJ321', departTime: '07:30', arriveTime: '08:30', duration: 'Bay thẳng · 1h00m', note: 'Đã gồm gói hành lý ký gửi 20kg theo đoàn' },
      inbound: { code: 'VJ328', departTime: '17:15', arriveTime: '18:15', duration: 'Bay thẳng · 1h00m', note: 'Đã gồm gói hành lý ký gửi 20kg theo đoàn' },
      localTransport: 'Xe du lịch máy lạnh và cano cao tốc tham quan 4 đảo Nam Phú Quốc theo lịch trình.',
    },
  },
  {
    match: /phú yên|quy nhơn|tuy hòa/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'TBB',
      toName: 'Tuy Hòa (TBB) / Quy Nhơn (Phù Cát - UIH)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (20kg)',
      baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN1650', departTime: '07:15', arriveTime: '08:25', duration: 'Bay thẳng · 1h10m', note: 'Chiều đi đáp Sân bay Tuy Hòa (Phú Yên)' },
      inbound: { code: 'VN1397', departTime: '16:50', arriveTime: '18:05', duration: 'Bay thẳng · 1h15m', note: 'Chiều về bay từ Sân bay Phù Cát (Quy Nhơn)' },
      localTransport: 'Xe du lịch đời mới đón đoàn tại sân bay Tuy Hòa và phục vụ xuyên suốt tuyến Phú Yên – Quy Nhơn.',
    },
  },
  {
    match: /hà nội|hạ long|ninh bình|sa pa|sapa|fansipan|hà giang|đồng văn/i,
    route: {
      mode: 'FLIGHT',
      badgeLabel: 'Máy bay khứ hồi',
      toCode: 'HAN',
      toName: 'Hà Nội (Sân bay Quốc tế Nội Bài T1)',
      carrier: 'Vietnam Airlines',
      shortCarrierBadge: 'Vietnam Airlines (23kg)',
      baggageSummary: '07kg xách tay + 23kg hành lý ký gửi khứ hồi',
      outbound: { code: 'VN208', departTime: '06:30', arriveTime: '08:40', duration: 'Bay thẳng · 2h10m', note: 'Tàu bay thân rộng Airbus A350 / Boeing 787' },
      inbound: { code: 'VN221', departTime: '19:00', arriveTime: '21:15', duration: 'Bay thẳng · 2h15m', note: 'Tàu bay thân rộng Airbus A350 / Boeing 787' },
      localTransport: 'Xe du lịch đời mới đón đoàn ngay tại sảnh đến sân bay Nội Bài đi theo tuyến Đông – Tây Bắc.',
    },
  },
  {
    match: /nam du|rạch giá/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe + Tàu cao tốc',
      toCode: 'NDU',
      toName: 'Bến tàu Rạch Giá – Quần đảo Nam Du',
      carrier: 'Xe giường nằm + Tàu Superdong',
      shortCarrierBadge: 'Xe giường nằm + Tàu cao tốc',
      baggageSummary: 'Hành lý xách tay & ký gửi khoang xe 20kg/khách',
      outbound: { code: 'SD-RG01', departTime: '22:30', arriveTime: '08:30', duration: 'Xe đêm + Tàu cao tốc 2h15m', note: 'Đã gồm vé tàu cao tốc khứ hồi Rạch Giá – Nam Du' },
      inbound: { code: 'SD-ND02', departTime: '11:30', arriveTime: '20:30', duration: 'Tàu cao tốc + Xe về TP.HCM', note: 'Đã gồm vé tàu cao tốc & xe đưa về điểm đón' },
      localTransport: 'Tàu du lịch tham quan quanh các hòn đảo và xe trung chuyển trên đảo Nam Du.',
    },
  },
  {
    match: /đà lạt/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe Limousine đoàn',
      toCode: 'DLI',
      toName: 'Trung tâm TP. Đà Lạt (Lâm Đồng)',
      carrier: 'Xe Limousine / Universe VIP',
      shortCarrierBadge: 'Xe Limousine VIP',
      baggageSummary: 'Hành lý khoang xe tiêu chuẩn 25kg/khách',
      outbound: { code: 'BUS-DL01', departTime: '05:30', arriveTime: '12:00', duration: 'Cao tốc Dầu Giây · 6h30m', note: 'Dừng ăn sáng tại trạm dừng chân cao cấp' },
      inbound: { code: 'BUS-DL02', departTime: '13:00', arriveTime: '19:30', duration: 'Cao tốc Bảo Lộc · 6h30m', note: 'Dừng thưởng thức trà & cà phê Bảo Lộc' },
      localTransport: 'Xe du lịch đời mới máy lạnh phục vụ đoàn xuyên suốt các điểm tham quan tại Đà Lạt.',
    },
  },
  {
    match: /miền tây|mỹ tho|cần thơ|cà mau|bạc liêu|sóc trăng/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe du lịch đời mới',
      toCode: 'VCA',
      toName: 'Mỹ Tho – Cần Thơ – Đất Mũi Cà Mau',
      carrier: 'Xe Universe 45 chỗ đời mới',
      shortCarrierBadge: 'Xe Universe 45 chỗ',
      baggageSummary: 'Hành lý khoang xe tiêu chuẩn 25kg/khách',
      outbound: { code: 'BUS-MT01', departTime: '05:45', arriveTime: '08:00', duration: 'Cao tốc Trung Lương · 2h15m', note: 'Đón đoàn ăn sáng Hủ tiếu Mỹ Tho' },
      inbound: { code: 'BUS-MT02', departTime: '14:30', arriveTime: '19:00', duration: 'Cao tốc Mỹ Thuận – TP.HCM', note: 'Dừng mua đặc sản nem Lai Vung, kẹo dừa' },
      localTransport: 'Xe Universe 45 chỗ kết hợp tàu du lịch sông Tiền, xuồng ba lá và cano Đất Mũi Cà Mau.',
    },
  },
  {
    match: /châu đốc|an giang|bà chúa xứ|tà pạ/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe du lịch đời mới',
      toCode: 'AGI',
      toName: 'Châu Đốc – Núi Sam – Rừng Tràm Trà Sư',
      carrier: 'Xe Giường nằm / Universe 45 chỗ',
      shortCarrierBadge: 'Xe Universe 45 chỗ',
      baggageSummary: 'Hành lý khoang xe tiêu chuẩn 20kg/khách',
      outbound: { code: 'BUS-CD01', departTime: '22:00', arriveTime: '04:30', duration: 'Hành trình đêm · 6h30m', note: 'Nghỉ đêm trên xe, sáng sớm viếng Miếu Bà' },
      inbound: { code: 'BUS-CD02', departTime: '14:00', arriveTime: '20:30', duration: 'Cao tốc Trung Lương · 6h30m', note: 'Dừng mua đặc sản thốt nốt, mắm Châu Đốc' },
      localTransport: 'Xe du lịch máy lạnh đưa đón đoàn viếng Miếu Bà Chúa Xứ, Núi Cấm và Chùa Tà Pạ.',
    },
  },
  {
    match: /vũng tàu|sun world/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe du lịch đời mới',
      toCode: 'VTU',
      toName: 'TP. Biển Vũng Tàu – Sun World',
      carrier: 'Xe Universe 45 chỗ đời mới',
      shortCarrierBadge: 'Xe Universe 45 chỗ',
      baggageSummary: 'Hành lý gọn nhẹ trong ngày 15kg/khách',
      outbound: { code: 'BUS-VT01', departTime: '06:00', arriveTime: '08:15', duration: 'Cao tốc Long Thành · 2h15m', note: 'Bao gồm ăn sáng trên đường đi' },
      inbound: { code: 'BUS-VT02', departTime: '16:30', arriveTime: '19:00', duration: 'Cao tốc Long Thành · 2h30m', note: 'Ghé Bò sữa Long Thành mua quà đặc sản' },
      localTransport: 'Xe du lịch 45 chỗ máy lạnh đưa đón tận cổng khu du lịch và bãi biển Vũng Tàu.',
    },
  },
  {
    match: /núi chứa chan|gia lào|dinh thầy thím/i,
    route: {
      mode: 'LAND_SEA',
      badgeLabel: 'Xe du lịch đời mới',
      toCode: 'DNB',
      toName: 'Núi Chứa Chan (Đồng Nai) – Dinh Thầy Thím',
      carrier: 'Xe Universe 45 chỗ đời mới',
      shortCarrierBadge: 'Xe Universe 45 chỗ',
      baggageSummary: 'Hành lý gọn nhẹ trong ngày 15kg/khách',
      outbound: { code: 'BUS-GL01', departTime: '05:30', arriveTime: '08:00', duration: 'Cao tốc Dầu Giây · 2h30m', note: 'Ăn sáng và khởi hành lên cáp treo Gia Lào' },
      inbound: { code: 'BUS-GL02', departTime: '16:00', arriveTime: '19:00', duration: 'Cao tốc Phan Thiết – Dầu Giây', note: 'Đưa đoàn về lại điểm đón ban đầu tại TP.HCM' },
      localTransport: 'Xe du lịch 45 chỗ máy lạnh đưa đón suốt hành trình hành hương trong ngày.',
    },
  },
];

function resolveDepartureCode(departureLocation?: string, mode?: TourTransportMode): { code: string; name: string } {
  const raw = (departureLocation || 'TP.Hồ Chí Minh').toLowerCase();
  if (raw.includes('hà nội')) {
    return {
      code: mode === 'FLIGHT' ? 'HAN' : 'HNO',
      name: mode === 'FLIGHT' ? 'Hà Nội (Sân bay Nội Bài)' : 'Hà Nội (Nhà hát Lớn)',
    };
  }
  if (raw.includes('đà nẵng')) {
    return {
      code: mode === 'FLIGHT' ? 'DAD' : 'DNG',
      name: mode === 'FLIGHT' ? 'Đà Nẵng (Sân bay Quốc tế Đà Nẵng)' : 'Đà Nẵng (Trung tâm TP)',
    };
  }
  if (raw.includes('cần thơ')) {
    return {
      code: mode === 'FLIGHT' ? 'VCA' : 'CTH',
      name: mode === 'FLIGHT' ? 'Cần Thơ (Sân bay Cần Thơ)' : 'Cần Thơ (Bến Ninh Kiều)',
    };
  }
  return {
    code: mode === 'FLIGHT' ? 'SGN' : 'HCM',
    name: mode === 'FLIGHT' ? 'TP.HCM (Sân bay Tân Sơn Nhất)' : 'TP.HCM (190 Pasteur, Quận 3)',
  };
}

export function getTourTransportInfo(tour: Partial<Tour>): TourTransportInfo {
  const combinedText = `${tour.title || ''} ${tour.destinationName || ''} ${tour.tourCode || ''} ${tour.includedServices || ''}`;
  const isInternational = tour.category === 'NUOC_NGOAI' || Boolean(tour.requiresVisa);
  const mentionsFlight = /máy bay|bay khứ hồi|chuyến bay|flight|vietnam airlines|vietjet/i.test(combinedText);

  let matchedRoute: PresetRoute | undefined;
  for (const item of PRESET_BY_KEYWORD) {
    if (item.match.test(combinedText)) {
      matchedRoute = item.route;
      break;
    }
  }

  if (!matchedRoute) {
    if (isInternational || mentionsFlight) {
      matchedRoute = {
        mode: 'FLIGHT',
        badgeLabel: 'Máy bay khứ hồi',
        toCode: isInternational ? 'INT' : 'DOM',
        toName: tour.destinationName || 'Sân bay điểm đến theo chương trình',
        carrier: 'Vietnam Airlines',
        shortCarrierBadge: 'Vietnam Airlines (20kg)',
        baggageSummary: '07kg xách tay + 20kg hành lý ký gửi khứ hồi',
        outbound: { code: 'VN210', departTime: '07:30', arriveTime: '10:30', duration: 'Bay thẳng theo đoàn', note: 'Đã bao gồm thuế phí sân bay' },
        inbound: { code: 'VN215', departTime: '16:30', arriveTime: '19:30', duration: 'Bay thẳng theo đoàn', note: 'Đã bao gồm thuế phí sân bay' },
        localTransport: 'Xe du lịch đời mới máy lạnh đón đoàn ngay tại sân bay và phục vụ suốt lịch trình.',
      };
    } else {
      matchedRoute = {
        mode: 'LAND_SEA',
        badgeLabel: 'Xe Limousine đoàn',
        toCode: 'DST',
        toName: tour.destinationName || 'Điểm đến theo lịch trình',
        carrier: 'Xe Universe / Limousine đời mới',
        shortCarrierBadge: 'Xe Limousine VIP',
        baggageSummary: 'Hành lý khoang xe tiêu chuẩn 20kg/khách',
        outbound: { code: 'BUS-01', departTime: '06:00', arriveTime: '11:30', duration: 'Di chuyển theo đoàn', note: 'Xe du lịch máy lạnh đời mới' },
        inbound: { code: 'BUS-02', departTime: '14:00', arriveTime: '19:30', duration: 'Di chuyển theo đoàn', note: 'Đưa đoàn về điểm đón ban đầu' },
        localTransport: 'Xe du lịch máy lạnh đời mới phục vụ đoàn xuyên suốt hành trình.',
      };
    }
  }

  const dep = resolveDepartureCode(tour.departureLocation, matchedRoute.mode);

  const meetingPoint =
    matchedRoute.mode === 'FLIGHT'
      ? isInternational
        ? `Cột số 10 – Ga đi Quốc tế Sân bay ${dep.name.replace(/^.*\(|\).*$/g, '')} trước giờ khởi hành 03 tiếng.`
        : `Cột số 05 – Ga đi Quốc nội Sân bay ${dep.name.replace(/^.*\(|\).*$/g, '')} trước giờ khởi hành 02 tiếng.`
      : `Văn phòng SmartTravel – 190 Pasteur, Quận 3, TP.HCM trước giờ khởi hành 45 phút.`;

  const leaderInstruction =
    matchedRoute.mode === 'FLIGHT'
      ? 'Trưởng đoàn SmartTravel giữ sẵn danh sách vé máy bay đoàn (Group Block Ticket), trực tiếp đón và hỗ trợ Quý khách làm thủ tục check-in, ký gửi hành lý & phát thẻ lên tàu bay (Boarding Pass).'
      : 'Trưởng đoàn SmartTravel đón Quý khách tại điểm tập trung, sắp xếp hành lý lên khoang xe, điểm danh và phổ biến lịch trình trước giờ lăn bánh.';

  const idDocumentNotice =
    matchedRoute.mode === 'FLIGHT'
      ? isInternational
        ? 'Lưu ý xuất vé bay Quốc tế: Họ tên hành khách khi đặt tour phải khớp 100% với Hộ chiếu (còn hạn ít nhất 06 tháng tính từ ngày về).'
        : 'Lưu ý xuất vé bay Nội địa: Họ tên hành khách khi đặt tour phải khớp 100% với CCCD / Định danh VNeID mức 2 (Trẻ em dưới 14 tuổi mang Bản chính/Bản sao trích lục Giấy khai sinh).'
      : 'Lưu ý làm thủ tục lưu trú: Quý khách mang theo CCCD hoặc VNeID để làm thủ tục nhận phòng khách sạn theo quy định.';

  return {
    mode: (tour.transportMode as TourTransportMode) || matchedRoute.mode,
    badgeLabel: matchedRoute.badgeLabel,
    fromCode: tour.fromTerminalCode || dep.code,
    fromName: dep.name,
    toCode: tour.toTerminalCode || matchedRoute.toCode,
    toName: matchedRoute.toName,
    carrier: tour.airlineCarrier || matchedRoute.carrier,
    shortCarrierBadge: matchedRoute.shortCarrierBadge,
    baggageSummary: tour.baggageAllowance || matchedRoute.baggageSummary,
    outbound: matchedRoute.outbound,
    inbound: matchedRoute.inbound,
    meetingPoint: tour.airportMeetingPoint || meetingPoint,
    leaderInstruction,
    localTransport: matchedRoute.localTransport,
    idDocumentNotice,
  };
}
