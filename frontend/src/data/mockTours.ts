import { Tour, TourCategory, TourStatus } from '../types/tour';

// 10 Tours chuẩn 100% lấy chính xác từ trang đầu tiên https://dulichnewtour.vn/danh-sach-tour
export const MOCK_TOURS: Tour[] = [
  {
    id: 1,
    tourCode: 'AT-PHCT-TGG-6N5D',
    title: 'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ | DẤU ẤN XỨ TRUNG HOA',
    description: 'Khám phá thiên đường hạ giới Trương Gia Giới, Phượng Hoàng Cổ Trấn lung linh về đêm và trải nghiệm văn hóa Thổ Gia độc đáo.',
    price: 17990000,
    childPrice: 14850000,
    durationDays: 6,
    durationNights: 5,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png',
    gallery: [
      'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
    ],
    category: 'NUOC_NGOAI' as any,
    remainingSeats: 20,
    viewCount: 512,
    averageRating: 5.0,
    totalReviews: 12,
    status: 'ACTIVE' as any,
    includedServices: '• Vé máy bay khứ hồi theo đoàn\n• Khách sạn 4 sao tiêu chuẩn (2 người/phòng)\n• Các bữa ăn theo chương trình\n• Xe đưa đón tham quan máy lạnh suốt tuyến\n• Hướng dẫn viên tiếng Việt nhiệt tình suốt tuyến\n• Bảo hiểm du lịch quốc tế tối đa 1.000.000.000đ',
    excludedServices: '• Hộ chiếu còn hạn trên 6 tháng\n• Chi phí cá nhân, hành lý quá cước\n• Tiền Tip cho HDV và tài xế (5 USD/ngày/khách)\n• Phụ thu phòng đơn (nếu có)',
    cancellationPolicy: '• Hủy trước 30 ngày: Miễn phí hủy tour.\n• Hủy từ 15-29 ngày: Phí 50% tổng giá trị tour.\n• Hủy từ 07-14 ngày: Phí 80% tổng giá trị tour.\n• Hủy trong vòng 07 ngày: Phí 100% tổng giá trị tour.',
    itineraryDetails: JSON.stringify([
      { day: 0, title: 'MÔ TẢ TỔNG QUAN', content: 'Chuyến bay thẳng đưa đoàn đến sân bay Ân Thi. Bắt đầu hành trình chinh phục Phượng Hoàng Cổ Trấn 1.300 năm tuổi.' },
      { day: 1, title: 'NGÀY 1: TP. HỒ CHÍ MINH - ÂN THI (Ăn tối)', content: 'Trưởng đoàn đón Quý khách tại sân bay Tân Sơn Nhất làm thủ tục đáp chuyến bay đi Ân Thi.' },
      { day: 2, title: 'NGÀY 2: ÂN THI - TUYỀN ÂN (Ăn sáng, Trưa, Tối)', content: 'Ăn sáng tại khách sạn. Khởi hành tham quan Nữ Nhi Thành - vùng đất của tộc người Thổ Gia.' },
      { day: 3, title: 'NGÀY 3: TUYỀN ÂN - PHƯỢNG HOÀNG CỔ TRẤN', content: 'Di chuyển đến Phượng Hoàng Cổ Trấn. Tham quan Hồng Kiều, Cầu Tuyết, Tháp Vạn Danh.' },
      { day: 4, title: 'NGÀY 4: PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI', content: 'Tham quan công viên quốc gia Trương Gia Giới - bối cảnh bộ phim Avatar.' },
      { day: 5, title: 'NGÀY 5: TRƯƠNG GIA GIỚI - THIÊN MÔN SƠN', content: 'Chinh phục Cổng Trời Thiên Môn Sơn bằng cáp treo dài 7.455m.' },
      { day: 6, title: 'NGÀY 6: ÂN THI - TP. HỒ CHÍ MINH', content: 'Tự do mua sắm đặc sản. Ra sân bay về TP. Hồ Chí Minh.' },
    ]),
  },
  {
    id: 2,
    tourCode: 'SH-OTRAN-4N4D',
    title: 'TOUR KHÁM PHÁ THƯỢNG HẢI - TÂY SÁCH Ô TRẤN 4 NGÀY 4 ĐÊM NOSHOPPING',
    description: 'Check-in 2 đêm tại Thượng Hải phồn hoa, thưởng ngoạn cảnh sắc cổ kính tại Cổ trấn ngàn năm tuổi Ô Trấn chuẩn 4 sao.',
    price: 18990000,
    childPrice: 15190000,
    durationDays: 4,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
    gallery: [
      '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
      '/images/tours/tour-2-thuong-hai-o-tran/images.jpg',
      '/images/tours/tour-2-thuong-hai-o-tran/a1-17019461240531747351528.jpg',
      '/images/tours/tour-2-thuong-hai-o-tran/thumbnail.png'
    ],
    category: 'NUOC_NGOAI' as any,
    remainingSeats: 40,
    viewCount: 384,
    averageRating: 4.9,
    totalReviews: 15,
    status: 'ACTIVE' as any,
  },
  {
    id: 3,
    tourCode: 'NUI-CHUA-CHAN-1D',
    title: 'TOUR KHÁM PHÁ NÚI CHỨA CHAN (GIA LÀO) VÀ DINH THẦY THÍM',
    description: 'Hành trình kết hợp chiêm bái tâm linh tại Chùa Bửu Quang (Gia Lào) và viếng Dinh Thầy Thím cầu an lành, tài lộc.',
    price: 790000,
    childPrice: 550000,
    durationDays: 1,
    durationNights: 0,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'
    ],
    category: 'DOMESTIC' as any,
    remainingSeats: 40,
    viewCount: 334,
    averageRating: 4.8,
    totalReviews: 9,
    status: 'ACTIVE' as any,
  },
  {
    id: 4,
    tourCode: 'CHAU-DOC-AN-GIANG-1N1D',
    title: 'TOUR CHÂU ĐỐC AN GIANG VIẾNG MIẾU BÀ CHÚA XỨ, NÚI CẤM & CHÙA TÀ PẠ',
    description: 'Hành trình hành hương tâm linh Châu Đốc - An Giang, viếng Miếu Bà Chúa Xức Núi Sam, chinh phục Núi Cấm và Chùa Tà Pạ.',
    price: 890000,
    childPrice: 620000,
    durationDays: 1,
    durationNights: 1,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg',
    gallery: [
      '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg',
      '/images/tours/tour-4-chau-doc-an-giang/khu-du-lich-lam-vien-nui-cam-ve-dep-linh-thieng-cua-nui-rung-06-1659717324.jpg',
      '/images/tours/tour-4-chau-doc-an-giang/nui-cam-an-giang-1.png',
      '/images/tours/tour-4-chau-doc-an-giang/images.jpg',
      '/images/tours/tour-4-chau-doc-an-giang/images (1).jpg'
    ],
    category: 'DOMESTIC' as any,
    remainingSeats: 40,
    viewCount: 289,
    averageRating: 5.0,
    totalReviews: 18,
    status: 'ACTIVE' as any,
  },
  {
    id: 5,
    tourCode: 'MIEN-TAY-6TINH-3N2D',
    title: 'TOUR DU LỊCH MỸ THO - BẾN TRE - CẦN THƠ - CÀ MAU ĐẤT MŨI - BẠC LIÊU - SÓC TRĂNG',
    description: 'Hành trình trọn vẹn 6 tỉnh miền Tây sông nước, check-in Cực Nam Đất Mũi Cà Mau, Chợ nổi Cái Răng và Nhà công tử Bạc Liêu.',
    price: 2990000,
    childPrice: 2090000,
    durationDays: 3,
    durationNights: 2,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg',
    gallery: [
      '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg',
      '/images/tours/tour-5-mien-tay-6-tinh/Tham-quan-chợ-nổi-cái-răng.jpg',
      '/images/tours/tour-5-mien-tay-6-tinh/mien-tay-song-nuoc-01.jpg',
      '/images/tours/tour-5-mien-tay-6-tinh/images.jpg'
    ],
    category: 'DOMESTIC' as any,
    remainingSeats: 35,
    viewCount: 415,
    averageRating: 4.9,
    totalReviews: 22,
    status: 'ACTIVE' as any,
  },
  {
    id: 6,
    tourCode: 'DALAT-4N3D-HOA',
    title: 'TOUR ĐÀ LẠT 4N3Đ | KHÁM PHÁ THÀNH PHỐ SƯƠNG MỜ & NHỮNG MÙA HOA',
    description: 'Thưởng thức không khí se lạnh, check-in đồi hoa cẩm tú cầu, Thác Datanla, Quảng trường Lâm Viên và lẩu gà lá é đặc sản.',
    price: 3890000,
    childPrice: 2720000,
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
    gallery: [
      '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
      '/images/tours/tour-6-da-lat-4n3d/images (1).jpg',
      '/images/tours/tour-6-da-lat-4n3d/images.jpg',
      '/images/tours/tour-6-da-lat-4n3d/lac-hu-co-tran-9.jpg'
    ],
    category: 'DOMESTIC' as any,
    remainingSeats: 28,
    viewCount: 620,
    averageRating: 4.8,
    totalReviews: 31,
    status: 'ACTIVE' as any,
  },
  {
    id: 7,
    tourCode: 'NAM-DU-3N3D',
    title: 'TOUR DU LỊCH ĐẢO NAM DU 3 NGÀY 3 ĐÊM - CHẠM SÓNG BIỂN XANH',
    description: 'Khám phá thiên đường biển đảo hoang sơ Nam Du, tắm biển Hòn Mấu, lặn ngắm san hô và thưởng thức hải sản tươi ngon.',
    price: 2450000,
    childPrice: 1715000,
    durationDays: 3,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'DOMESTIC' as any,
    remainingSeats: 40,
    viewCount: 450,
    averageRating: 5.0,
    totalReviews: 14,
    status: 'ACTIVE' as any,
  },
  {
    id: 8,
    tourCode: 'VUNG-TAU-SUNWORLD-1D',
    title: 'TOUR DU LỊCH BIỂN VŨNG TÀU | CÔNG VIÊN NƯỚC SUN WORLD | BUFFET TRƯA',
    description: 'Trải nghiệm công viên nước hiện đại Sun World Vũng Tàu, tắm biển Bãi Sau và thưởng thức đại tiệc Buffet trưa phong phú.',
    price: 1050000,
    childPrice: 735000,
    durationDays: 1,
    durationNights: 0,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    category: 'DOMESTIC' as any,
    remainingSeats: 40,
    viewCount: 309,
    averageRating: 4.7,
    totalReviews: 11,
    status: 'ACTIVE' as any,
  },
  {
    id: 9,
    tourCode: 'PHU-YEN-QUY-NHON-3N3D',
    title: 'TOUR DU LỊCH 3 NGÀY 3 ĐÊM KHÁM PHÁ TRỌN VẸN PHÚ YÊN - QUY NHƠN',
    description: 'Hành trình xứ nẫu Phú Yên - Quy Nhơn: Gành Đá Đĩa, Tháp Nghinh Phong, Eo Gió, Kỳ Co và Tháp Bánh Ít.',
    price: 2790000,
    childPrice: 1953000,
    durationDays: 3,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
    category: 'DOMESTIC' as any,
    remainingSeats: 40,
    viewCount: 580,
    averageRating: 4.9,
    totalReviews: 26,
    status: 'ACTIVE' as any,
  },
  {
    id: 10,
    tourCode: 'TL-BKK-PAT-5N4D',
    title: 'TOUR THÁI LAN 5N4Đ: BANGKOK - PATTAYA | THIÊN ĐƯỜNG XỨ SỞ CHÙA VÀNG',
    description: 'Khám phá Chùa Phật Vàng Wat Traimit, dạo thuyền sông Chaophraya, vui chơi Đảo San Hô Coral Pattaya và thưởng thức đại tiệc buffet Baiyoke Sky 86 tầng.',
    price: 6990000,
    childPrice: 5590000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'NUOC_NGOAI' as any,
    remainingSeats: 35,
    viewCount: 460,
    averageRating: 5.0,
    totalReviews: 22,
    status: 'ACTIVE' as any,
    includedServices: '• Vé máy bay khứ hồi SGN - BKK - SGN (hành lý 20kg ký gửi + 7kg xách tay)\n• Khách sạn 4 sao tiêu chuẩn Thái Lan\n• Bữa ăn theo chương trình gồm Buffet 86 tầng Baiyoke Sky\n• Xe máy lạnh đưa đón tham quan suốt tuyến\n• Hướng dẫn viên Việt Nam và Thái Lan nhiệt tình\n• Bảo hiểm du lịch quốc tế',
    excludedServices: '• Tiền Tip cho HDV và tài xế (5 USD/khách/ngày)\n• Chi phí cá nhân: giặt ủi, điện thoại, thức uống ngoài chương trình',
    cancellationPolicy: '• Hủy trước 20 ngày miễn phí\n• Hủy từ 10-19 ngày tính 50%\n• Hủy trong vòng 10 ngày tính 100%',
    itineraryDetails: JSON.stringify([
      { day: 1, title: 'NGÀY 1: TP.HCM - BANGKOK - PATTAYA', content: 'Đáp chuyến bay đi Bangkok, di chuyển về Pattaya, tham quan Chợ nổi 4 miền.' },
      { day: 2, title: 'NGÀY 2: ĐẢO CORAL PATTAYA - TRÂN BẢO PHẬT SƠN', content: 'Tắm biển Đảo San Hô Coral, chiêm bái tượng Phật dát vàng trên vách núi.' },
      { day: 3, title: 'NGÀY 3: PATTAYA - BANGKOK - BUFFET BAIYOKE SKY', content: 'Về Bangkok, thưởng thức đại tiệc buffet Baiyoke Sky ngắm toàn cảnh thành phố.' },
      { day: 4, title: 'NGÀY 4: CHÙA PHẬT VÀNG - DẠO THUYỀN CHAOPHRAYA', content: 'Chiêm bái Chùa Wat Traimit, viếng Phật Bốn Mặt linh thiêng, tự do mua sắm IconSiam.' },
      { day: 5, title: 'NGÀY 5: BANGKOK - TP. HỒ CHÍ MINH', content: 'Tham quan trung tâm nghiên cứu rắn hoàng gia, đáp chuyến bay về Việt Nam.' },
    ]),
  },
  {
    id: 12,
    tourCode: 'HCM-HN-HL-NB-4N3D',
    title: 'TOUR HÀ NỘI - HẠ LONG - NINH BÌNH 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu 4 ngày 3 đêm từ TP.HCM: khám phá Hà Nội, vịnh Hạ Long, Tràng An, chùa Bái Đính và Hang Múa.',
    price: 7990000,
    childPrice: 5990000,
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/ha-noi-ha-long-ninh-binh/01.jpg',
    gallery: [
      '/images/tours/ha-noi-ha-long-ninh-binh/01.jpg',
      '/images/tours/ha-noi-ha-long-ninh-binh/02.jpg',
      '/images/tours/ha-noi-ha-long-ninh-binh/03.jpg',
      '/images/tours/ha-noi-ha-long-ninh-binh/04.jpg',
      '/images/tours/ha-noi-ha-long-ninh-binh/05.jpg',
    ],
    category: TourCategory.DOMESTIC,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Hà Nội; xe tham quan; khách sạn 3 đêm; vé tham quan và các bữa ăn theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí cá nhân, phụ thu phòng đơn và các dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - HÀ NỘI',
        content:
          'Khởi hành từ sân bay Tân Sơn Nhất đến Hà Nội. Tham quan Hồ Gươm, dạo phố cổ và nghỉ đêm tại Hà Nội.',
      },
      {
        day: 2,
        title: 'NGÀY 2: HÀ NỘI - HẠ LONG',
        content:
          'Di chuyển đến Hạ Long, đi thuyền tham quan vịnh và ngắm các đảo đá vôi. Nghỉ đêm tại Hạ Long.',
      },
      {
        day: 3,
        title: 'NGÀY 3: HẠ LONG - NINH BÌNH',
        content:
          'Di chuyển đến Ninh Bình, tham quan chùa Bái Đính và trải nghiệm đi thuyền tại Tràng An. Nghỉ đêm tại Ninh Bình.',
      },
      {
        day: 4,
        title: 'NGÀY 4: HANG MÚA - HÀ NỘI - TP.HCM',
        content:
          'Tham quan Hang Múa, ngắm cảnh đồng quê Ninh Bình. Di chuyển về sân bay Nội Bài, đáp chuyến bay về TP.HCM.',
      },
    ]),
  },
  {
    id: 13,
    tourCode: 'HCM-HN-SP-FSP-4N3D',
    title: 'TOUR HÀ NỘI - SA PA - FANSIPAN 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM đến Hà Nội và Sa Pa, khám phá bản Cát Cát, thung lũng Mường Hoa và đỉnh Fansipan.',
    price: 8490000,
    childPrice: 6390000,
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/ha-noi-sapa-fansipan/01.png',
    gallery: [
      '/images/tours/ha-noi-sapa-fansipan/01.png',
      '/images/tours/ha-noi-sapa-fansipan/02.jpg',
      '/images/tours/ha-noi-sapa-fansipan/03.jpg',
      '/images/tours/ha-noi-sapa-fansipan/04.jpg',
      '/images/tours/ha-noi-sapa-fansipan/05.jpg',
    ],
    category: TourCategory.DOMESTIC,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Hà Nội; xe di chuyển theo chương trình; khách sạn 3 đêm; các bữa ăn, vé tham quan và vé cáp treo Fansipan theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí cá nhân; phụ thu phòng đơn; đồ uống và các dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - HÀ NỘI - SA PA',
        content:
          'Đáp chuyến bay sáng từ Tân Sơn Nhất đến Nội Bài. Di chuyển bằng xe đến Sa Pa, nhận phòng và nghỉ ngơi. Buổi tối tự do khám phá trung tâm thị trấn.',
      },
      {
        day: 2,
        title: 'NGÀY 2: FANSIPAN - THUNG LŨNG MƯỜNG HOA',
        content:
          'Trải nghiệm cáp treo Fansipan, tham quan khu vực đỉnh núi khi điều kiện thời tiết cho phép. Buổi chiều ngắm cảnh thung lũng Mường Hoa tại điểm dừng phù hợp. Nghỉ đêm tại Sa Pa.',
      },
      {
        day: 3,
        title: 'NGÀY 3: BẢN CÁT CÁT - HÀ NỘI',
        content:
          'Tham quan bản Cát Cát, tìm hiểu đời sống và nghề thủ công địa phương. Sau bữa trưa, di chuyển về Hà Nội, nhận phòng và nghỉ đêm.',
      },
      {
        day: 4,
        title: 'NGÀY 4: HỒ GƯƠM - TP.HCM',
        content:
          'Dạo quanh Hồ Gươm và phố cổ Hà Nội. Di chuyển đến sân bay Nội Bài, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 14,
    tourCode: 'HCM-HG-DV-MPL-5N4D',
    title: 'TOUR HÀ GIANG - ĐỒNG VĂN - MÃ PÍ LÈNG 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM qua Hà Nội đến Hà Giang, khám phá dốc Thẩm Mã, cột cờ Lũng Cú, phố cổ Đồng Văn, đèo Mã Pí Lèng và sông Nho Quế.',
    price: 9990000,
    childPrice: 7490000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/ha-giang-dong-van/02.jpeg',
    gallery: [
      '/images/tours/ha-giang-dong-van/01.jpg',
      '/images/tours/ha-giang-dong-van/02.jpeg',
      '/images/tours/ha-giang-dong-van/03.jpg',
      '/images/tours/ha-giang-dong-van/04.jpg',
      '/images/tours/ha-giang-dong-van/05.jpg',
    ],
    category: TourCategory.DOMESTIC,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Hà Nội; xe di chuyển theo chương trình; lưu trú 4 đêm; các bữa ăn, vé tham quan và thuyền trên sông Nho Quế theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí cá nhân; phụ thu phòng đơn; đồ uống và các dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - HÀ NỘI - HÀ GIANG',
        content:
          'Đáp chuyến bay sáng từ Tân Sơn Nhất đến Nội Bài. Di chuyển bằng xe đến Hà Giang, nhận phòng và nghỉ ngơi sau hành trình.',
      },
      {
        day: 2,
        title: 'NGÀY 2: HÀ GIANG - DỐC THẨM MÃ - ĐỒNG VĂN',
        content:
          'Di chuyển qua Quản Bạ và Yên Minh, dừng ngắm cảnh tại dốc Thẩm Mã. Tiếp tục đến Đồng Văn, nhận phòng và khám phá phố cổ vào buổi tối.',
      },
      {
        day: 3,
        title: 'NGÀY 3: LŨNG CÚ - ĐỒNG VĂN',
        content:
          'Tham quan cột cờ Lũng Cú và tìm hiểu đời sống địa phương. Trở về Đồng Văn, dành thời gian tham quan phố cổ và nghỉ đêm.',
      },
      {
        day: 4,
        title: 'NGÀY 4: MÃ PÍ LÈNG - SÔNG NHO QUẾ - HÀ GIANG',
        content:
          'Ngắm cảnh đèo Mã Pí Lèng, trải nghiệm đi thuyền trên sông Nho Quế khi thời tiết và điều kiện vận hành cho phép. Sau tham quan, di chuyển về Hà Giang và nghỉ đêm.',
      },
      {
        day: 5,
        title: 'NGÀY 5: HÀ GIANG - HÀ NỘI - TP.HCM',
        content:
          'Khởi hành về sân bay Nội Bài, bố trí thời gian nghỉ dọc đường và dự phòng di chuyển. Đáp chuyến bay tối về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 15,
    tourCode: 'HCM-DN-HA-HUE-4N3D',
    title: 'TOUR ĐÀ NẴNG - HỘI AN - HUẾ 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM khám phá biển Mỹ Khê, Cầu Vàng, phố cổ Hội An, Đại Nội Huế và chùa Thiên Mụ.',
    price: 6990000,
    childPrice: 5290000,
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/da-nang-hoi-an-hue/01.jpg',
    gallery: [
      '/images/tours/da-nang-hoi-an-hue/01.jpg',
      '/images/tours/da-nang-hoi-an-hue/02.jpg',
      '/images/tours/da-nang-hoi-an-hue/03.jpg',
      '/images/tours/da-nang-hoi-an-hue/04.jpg',
      '/images/tours/da-nang-hoi-an-hue/05.jpg',
    ],
    category: TourCategory.DOMESTIC,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay TP.HCM - Đà Nẵng và Huế - TP.HCM; xe tham quan; lưu trú 3 đêm; các bữa ăn theo chương trình; vé tham quan và cáp treo Bà Nà theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí cá nhân; phụ thu phòng đơn; đồ uống và các dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - ĐÀ NẴNG - HỘI AN',
        content:
          'Đáp chuyến bay sáng từ Tân Sơn Nhất đến Đà Nẵng. Tham quan biển Mỹ Khê, nghỉ ngơi trước khi đến phố cổ Hội An vào buổi chiều. Dạo phố đèn lồng, sau đó trở về Đà Nẵng nghỉ đêm.',
      },
      {
        day: 2,
        title: 'NGÀY 2: BÀ NÀ HILLS - CẦU VÀNG',
        content:
          'Di chuyển đến Bà Nà Hills, đi cáp treo và tham quan Cầu Vàng khi điều kiện thời tiết, vận hành cho phép. Buổi chiều trở về Đà Nẵng. Tự do khám phá thành phố và nghỉ đêm.',
      },
      {
        day: 3,
        title: 'NGÀY 3: ĐÀ NẴNG - HUẾ - ĐẠI NỘI',
        content:
          'Trả phòng, di chuyển đến Huế. Tham quan Đại Nội, tìm hiểu kiến trúc và lịch sử cố đô. Nhận phòng và nghỉ đêm tại Huế.',
      },
      {
        day: 4,
        title: 'NGÀY 4: CHÙA THIÊN MỤ - TP.HCM',
        content:
          'Tham quan chùa Thiên Mụ và ngắm cảnh sông Hương. Di chuyển đến sân bay Phú Bài, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 16,
    tourCode: 'HCM-PQ-NAMDAO-4N3D',
    title: 'TOUR PHÚ QUỐC - NAM ĐẢO 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM đến Phú Quốc, khám phá Bãi Sao, Hòn Thơm, cáp treo vượt biển, Hòn Móng Tay và hoàng hôn tại An Thới.',
    price: 7490000,
    childPrice: 5590000,
    durationDays: 4,
    durationNights: 3,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/phu-quoc-nam-dao/01.jpg',
    gallery: [
      '/images/tours/phu-quoc-nam-dao/01.jpg',
      '/images/tours/phu-quoc-nam-dao/02.jpg',
      '/images/tours/phu-quoc-nam-dao/03.jpg',
      '/images/tours/phu-quoc-nam-dao/04.jpg',
      '/images/tours/phu-quoc-nam-dao/05.jpeg',
    ],
    category: TourCategory.DOMESTIC,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Phú Quốc; xe di chuyển theo chương trình; lưu trú 3 đêm; các bữa ăn theo chương trình; vé cáp treo Hòn Thơm và chuyến tham quan Hòn Móng Tay.',
    excludedServices:
      'Dữ liệu mẫu: chi phí cá nhân; phụ thu phòng đơn; trò chơi biển có thu phí; đồ uống và các dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - PHÚ QUỐC - BÃI SAO',
        content:
          'Đáp chuyến bay sáng từ Tân Sơn Nhất đến Phú Quốc. Dùng bữa trưa, tham quan và nghỉ ngơi tại Bãi Sao. Nhận phòng khách sạn, tự do khám phá Phú Quốc vào buổi tối.',
      },
      {
        day: 2,
        title: 'NGÀY 2: CÁP TREO HÒN THƠM - AN THỚI',
        content:
          'Di chuyển đến ga cáp treo, trải nghiệm hành trình vượt biển đến Hòn Thơm khi thời tiết và điều kiện vận hành cho phép. Buổi chiều trở về An Thới, dạo bộ và ngắm hoàng hôn. Nghỉ đêm tại Phú Quốc.',
      },
      {
        day: 3,
        title: 'NGÀY 3: KHÁM PHÁ HÒN MÓNG TAY',
        content:
          'Tham gia chuyến tham quan Hòn Móng Tay thuộc khu vực quần đảo An Thới, nghỉ ngơi và tắm biển tại khu vực được hướng dẫn. Lịch trình đường biển có thể điều chỉnh theo thời tiết. Trở về khách sạn nghỉ đêm.',
      },
      {
        day: 4,
        title: 'NGÀY 4: PHÚ QUỐC - TP.HCM',
        content:
          'Ăn sáng, tự do nghỉ ngơi hoặc mua đặc sản trước khi trả phòng. Di chuyển đến sân bay Phú Quốc, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 17,
    tourCode: 'HCM-SG-MY-5N4D',
    title: 'TOUR SINGAPORE - MALAYSIA 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM khám phá Merlion, Gardens by the Bay, Marina Bay tại Singapore và tháp đôi Petronas, động Batu tại Malaysia.',
    price: 13990000,
    childPrice: 10490000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/singapore-malaysia/01.jpg',
    gallery: [
      '/images/tours/singapore-malaysia/01.jpg',
      '/images/tours/singapore-malaysia/02.jpg',
      '/images/tours/singapore-malaysia/03.jpg',
      '/images/tours/singapore-malaysia/04.jpg',
      '/images/tours/singapore-malaysia/05.jpg',
    ],
    category: TourCategory.NUOC_NGOAI,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay TP.HCM - Singapore, Singapore - Kuala Lumpur và Kuala Lumpur - TP.HCM; xe theo chương trình; lưu trú 4 đêm; các bữa ăn và tham quan theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí giấy tờ xuất nhập cảnh nếu phát sinh; phụ thu phòng đơn; chi phí cá nhân; vé khu nhà kính tại Gardens by the Bay và đài quan sát Petronas nếu không được xác nhận trong chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ, yêu cầu xuất nhập cảnh và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - SINGAPORE - MERLION',
        content:
          'Đáp chuyến bay từ Tân Sơn Nhất đến Singapore. Di chuyển đến công viên Merlion, tham quan và chụp ảnh khu vực vịnh Marina. Nhận phòng, nghỉ đêm tại Singapore.',
      },
      {
        day: 2,
        title: 'NGÀY 2: GARDENS BY THE BAY - MARINA BAY',
        content:
          'Tham quan khu vườn ngoài trời tại Gardens by the Bay. Buổi chiều khám phá khu vực Marina Bay, tự do dạo bộ và chụp ảnh. Nghỉ đêm tại Singapore.',
      },
      {
        day: 3,
        title: 'NGÀY 3: SINGAPORE - KUALA LUMPUR',
        content:
          'Trả phòng, di chuyển đến sân bay để đáp chuyến bay sang Kuala Lumpur. Sau khi hoàn tất thủ tục nhập cảnh, xe đưa đoàn về khách sạn. Nghỉ ngơi và khám phá khu vực trung tâm.',
      },
      {
        day: 4,
        title: 'NGÀY 4: ĐỘNG BATU - THÁP ĐÔI PETRONAS',
        content:
          'Tham quan động Batu, mặc trang phục phù hợp với điểm tham quan tôn giáo. Buổi chiều trở về trung tâm Kuala Lumpur, chụp ảnh bên ngoài tháp đôi Petronas và dạo công viên KLCC. Nghỉ đêm tại Kuala Lumpur.',
      },
      {
        day: 5,
        title: 'NGÀY 5: KUALA LUMPUR - TP.HCM',
        content:
          'Ăn sáng, tự do nghỉ ngơi hoặc mua sắm tùy giờ bay. Trả phòng, di chuyển đến sân bay và đáp chuyến bay về TP.HCM.',
      },
    ]),
  },
  {
    id: 18,
    tourCode: 'HCM-SEOUL-NAMI-5N4D',
    title: 'TOUR HÀN QUỐC - SEOUL - NAMI 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM đến Hàn Quốc, khám phá cung Gyeongbokgung, đảo Nami, tháp N Seoul, làng Bukchon và phố Myeongdong.',
    price: 18990000,
    childPrice: 14290000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/han-quoc-seoul-nami/01.jpg',
    gallery: [
      '/images/tours/han-quoc-seoul-nami/01.jpg',
      '/images/tours/han-quoc-seoul-nami/02.jpg',
      '/images/tours/han-quoc-seoul-nami/03.jpg',
      '/images/tours/han-quoc-seoul-nami/04.jpg',
      '/images/tours/han-quoc-seoul-nami/05.jpg',
    ],
    category: TourCategory.NUOC_NGOAI,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Incheon; xe di chuyển theo chương trình; lưu trú 4 đêm; các bữa ăn theo chương trình; vé tham quan cung Gyeongbokgung và đảo Nami.',
    excludedServices:
      'Dữ liệu mẫu: chi phí hộ chiếu, visa và giấy tờ xuất nhập cảnh; phụ thu phòng đơn; chi phí cá nhân; thuê hanbok; vé đài quan sát tháp N Seoul và dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ, yêu cầu xuất nhập cảnh và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - INCHEON - SEOUL',
        content:
          'Đáp chuyến bay ban ngày từ Tân Sơn Nhất đến Incheon. Hoàn tất thủ tục nhập cảnh, di chuyển về Seoul, nhận phòng và nghỉ ngơi. Nghỉ đêm tại Seoul.',
      },
      {
        day: 2,
        title: 'NGÀY 2: GYEONGBOKGUNG - BUKCHON',
        content:
          'Tham quan cung Gyeongbokgung theo lịch mở cửa thực tế. Tiếp tục khám phá khu vực làng Bukchon trong khung giờ cho phép, giữ yên lặng và tôn trọng sinh hoạt của cư dân. Nghỉ đêm tại Seoul.',
      },
      {
        day: 3,
        title: 'NGÀY 3: SEOUL - ĐẢO NAMI - SEOUL',
        content:
          'Khởi hành tham quan đảo Nami, đi bộ khám phá các hàng cây và cảnh quan ven sông. Cảnh sắc thay đổi theo mùa. Buổi chiều trở về Seoul, nghỉ đêm tại khách sạn.',
      },
      {
        day: 4,
        title: 'NGÀY 4: NAMSAN - THÁP N SEOUL - MYEONGDONG',
        content:
          'Tham quan khu vực Namsan, chụp ảnh bên ngoài tháp N Seoul. Buổi chiều và tối tự do khám phá phố Myeongdong, mua sắm và trải nghiệm ẩm thực với các chi phí ngoài chương trình tự túc. Nghỉ đêm tại Seoul.',
      },
      {
        day: 5,
        title: 'NGÀY 5: SEOUL - INCHEON - TP.HCM',
        content:
          'Ăn sáng, trả phòng và di chuyển đến sân bay Incheon theo giờ bay. Làm thủ tục xuất cảnh, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 19,
    tourCode: 'HCM-TOKYO-FUJI-5N4D',
    title: 'TOUR NHẬT BẢN - TOKYO - PHÚ SĨ 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM khám phá Tokyo, chùa Sensoji, Tokyo Skytree, hồ Kawaguchi và làng Oshino Hakkai; ngắm núi Phú Sĩ khi thời tiết thuận lợi.',
    price: 28990000,
    childPrice: 21790000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/nhat-ban-tokyo-phu-si/01.jpg',
    gallery: [
      '/images/tours/nhat-ban-tokyo-phu-si/01.jpg',
      '/images/tours/nhat-ban-tokyo-phu-si/02.jpg',
      '/images/tours/nhat-ban-tokyo-phu-si/03.jpg',
      '/images/tours/nhat-ban-tokyo-phu-si/04.jpg',
      '/images/tours/nhat-ban-tokyo-phu-si/05.jpg',
    ],
    category: TourCategory.NUOC_NGOAI,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Tokyo; xe di chuyển theo chương trình; lưu trú 4 đêm; các bữa ăn và hoạt động tham quan theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí hộ chiếu, visa và giấy tờ xuất nhập cảnh; phụ thu phòng đơn; chi phí cá nhân; vé đài quan sát Tokyo Skytree và dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ, yêu cầu xuất nhập cảnh và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - TOKYO',
        content:
          'Đáp chuyến bay ban ngày từ Tân Sơn Nhất đến Tokyo. Hoàn tất thủ tục nhập cảnh, di chuyển về khách sạn, nhận phòng và nghỉ ngơi. Nghỉ đêm tại Tokyo.',
      },
      {
        day: 2,
        title: 'NGÀY 2: SENSOJI - TOKYO SKYTREE',
        content:
          'Tham quan chùa Sensoji và dạo khu phố Asakusa. Buổi chiều tham quan khu vực bên ngoài Tokyo Skytree, tự do mua sắm theo thời gian của đoàn. Vé lên đài quan sát không nằm trong chương trình mẫu. Nghỉ đêm tại Tokyo.',
      },
      {
        day: 3,
        title: 'NGÀY 3: TOKYO - HỒ KAWAGUCHI',
        content:
          'Di chuyển đến khu vực hồ Kawaguchi, dạo ven hồ và ngắm núi Phú Sĩ khi thời tiết thuận lợi. Đây là chương trình ngắm cảnh, không bao gồm leo núi. Nhận phòng và nghỉ đêm tại khu vực Kawaguchiko.',
      },
      {
        day: 4,
        title: 'NGÀY 4: OSHINO HAKKAI - TOKYO',
        content:
          'Tham quan làng Oshino Hakkai, khám phá cảnh quan các hồ nước và kiến trúc địa phương. Buổi chiều trở về Tokyo, nhận phòng và nghỉ đêm.',
      },
      {
        day: 5,
        title: 'NGÀY 5: TOKYO - TP.HCM',
        content:
          'Ăn sáng, trả phòng và di chuyển đến sân bay theo giờ bay. Làm thủ tục xuất cảnh, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
  {
    id: 20,
    tourCode: 'HCM-BALI-5N4D',
    title: 'TOUR INDONESIA - BALI 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
    description:
      'Hành trình mẫu từ TP.HCM đến Bali, khám phá Tanah Lot, Uluwatu, ruộng bậc thang Tegallalang, đền Ulun Danu Beratan và biển Nusa Dua.',
    price: 15990000,
    childPrice: 11990000,
    durationDays: 5,
    durationNights: 4,
    departureLocation: 'TP.Hồ Chí Minh',
    thumbnailUrl: '/images/tours/indonesia-bali/01.jpg',
    gallery: [
      '/images/tours/indonesia-bali/01.jpg',
      '/images/tours/indonesia-bali/02.jpg',
      '/images/tours/indonesia-bali/03.png',
      '/images/tours/indonesia-bali/04.jpg',
      '/images/tours/indonesia-bali/05.jpg',
    ],
    category: TourCategory.NUOC_NGOAI,
    status: TourStatus.ACTIVE,
    remainingSeats: 40,
    viewCount: 0,
    averageRating: 0,
    totalReviews: 0,
    includedServices:
      'Dữ liệu mẫu: vé máy bay khứ hồi TP.HCM - Bali; xe di chuyển theo chương trình; lưu trú 4 đêm; các bữa ăn và vé tham quan theo chương trình.',
    excludedServices:
      'Dữ liệu mẫu: chi phí hộ chiếu, visa, phí nhập cảnh hoặc phí du lịch nếu áp dụng; phụ thu phòng đơn; chi phí cá nhân; trò chơi biển, xích đu và dịch vụ ngoài chương trình.',
    cancellationPolicy:
      'Tour minh họa phục vụ phát triển giao diện. Giá, dịch vụ, yêu cầu xuất nhập cảnh và điều kiện hủy cần được xác nhận trước khi sử dụng thực tế.',
    itineraryDetails: JSON.stringify([
      {
        day: 1,
        title: 'NGÀY 1: TP.HCM - BALI',
        content:
          'Đáp chuyến bay từ Tân Sơn Nhất đến Bali. Hoàn tất thủ tục nhập cảnh, di chuyển về khách sạn tại khu vực phía nam đảo, nhận phòng và nghỉ ngơi.',
      },
      {
        day: 2,
        title: 'NGÀY 2: NUSA DUA - ULUWATU',
        content:
          'Tham quan và nghỉ ngơi tại biển Nusa Dua. Buổi chiều khám phá khu vực đền Uluwatu, ngắm cảnh ven biển khi thời tiết thuận lợi. Tuân thủ hướng dẫn về trang phục và khu vực được phép tham quan. Trở về khách sạn nghỉ đêm.',
      },
      {
        day: 3,
        title: 'NGÀY 3: TEGALLALANG - UBUD',
        content:
          'Trả phòng và di chuyển đến khu vực Ubud. Tham quan ruộng bậc thang Tegallalang, tìm hiểu cảnh quan và đời sống địa phương. Các hoạt động xích đu hoặc trải nghiệm có thu phí không nằm trong chương trình mẫu. Nghỉ đêm tại Ubud.',
      },
      {
        day: 4,
        title: 'NGÀY 4: ULUN DANU BERATAN - TANAH LOT',
        content:
          'Khởi hành sớm đến khu vực hồ Beratan, tham quan đền Ulun Danu Beratan. Sau đó di chuyển đến Tanah Lot để ngắm cảnh ven biển từ khu vực được phép tiếp cận, tùy điều kiện thủy triều và thời tiết. Về khách sạn phía nam đảo nghỉ đêm.',
      },
      {
        day: 5,
        title: 'NGÀY 5: BALI - TP.HCM',
        content:
          'Ăn sáng, trả phòng và di chuyển đến sân bay theo giờ bay. Làm thủ tục xuất cảnh, đáp chuyến bay về TP.HCM, kết thúc hành trình.',
      },
    ]),
  },
];

/** Find a mock tour by its ID */
export const findMockTourById = (id: number): Tour | undefined => {
  return MOCK_TOURS.find(t => t.id === id);
};
