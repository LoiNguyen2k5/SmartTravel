-- Ensure UTF-8 character encoding
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Roles (if not exist)
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_VENDOR'),
(3, 'ROLE_USER');

-- 2. Insert Default Accounts (Password is BCrypt hash for "12345678")
-- Hash: $2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB. -> "12345678"
INSERT INTO users (id, created_at, updated_at, email, password, full_name, phone, avatar_url, enabled) VALUES 
(1, NOW(), NOW(), 'admin@smarttravel.com', '$2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB.', 'Quản Trị Viên Hệ Thống', '0901234567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1),
(2, NOW(), NOW(), 'vendor@smarttravel.com', '$2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB.', 'NewTour Travel Company', '0988776655', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 1),
(3, NOW(), NOW(), 'customer@smarttravel.com', '$2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB.', 'Khách Hàng SmartTravel', '0912345678', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 1),
(5, NOW(), NOW(), 'user@smarttravel.com', '$2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB.', 'Khách Hàng Thân Thiết', '0912345678', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 1),
(6, NOW(), NOW(), 'nguyenbaoloicv@gmail.com', '$2a$10$WGPw7.UlNUFOvTwnrMmheeXESd4N157b2Ue.S3LXe7LFHa1nSkrB.', 'Nguyễn Bảo Lợi', '0941899554', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 1)
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  enabled = 1,
  full_name = VALUES(full_name),
  phone = VALUES(phone);

-- 3. Insert User Roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- Admin
(2, 2), -- Vendor
(3, 3), -- Customer
(5, 3), -- User
(6, 3); -- Nguyen Bao Loi

-- 4. Insert Destinations
INSERT IGNORE INTO destinations (id, created_at, updated_at, name, city, country, description, image_url, latitude, longitude) VALUES 
(1, NOW(), NOW(), 'Phượng Hoàng Cổ Trấn', 'Trương Gia Giới', 'Trung Quốc', 'Cổ trấn ngàn năm tuổi bên dòng Đà Giang lung linh huyền ảo', 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png', 27.9483, 109.5986),
(2, NOW(), NOW(), 'Thượng Hải & Ô Trấn', 'Thượng Hải', 'Trung Quốc', 'Thành phố hiện đại bậc nhất kết hợp Cổ trấn Tây Sách mộng mơ', '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg', 31.2304, 121.4737),
(3, NOW(), NOW(), 'Núi Chứa Chan', 'Đồng Nai', 'Việt Nam', 'Ngọn núi tâm linh chiêm bái Chùa Bửu Quang (Gia Lào)', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', 10.9634, 107.3758),
(4, NOW(), NOW(), 'Châu Đốc - Núi Cấm', 'An Giang', 'Việt Nam', 'Vùng đất tâm linh viếng Miếu Bà Chúa Xứ và chinh phục Núi Cấm', '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg', 10.7005, 105.1192),
(5, NOW(), NOW(), 'Miền Tây Sông Nước', 'Cần Thơ', 'Việt Nam', 'Hành trình trọn vẹn 6 tỉnh miền Tây sông nước Đất Mũi Cà Mau', '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg', 10.0452, 105.7469),
(6, NOW(), NOW(), 'Đà Lạt Thành Phố Sương Mờ', 'Đà Lạt', 'Việt Nam', 'Thành phố ngàn hoa với khí hậu se lạnh và cảnh sắc thơ mộng', '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg', 11.9404, 108.4583),
(7, NOW(), NOW(), 'Đảo Nam Du', 'Kiên Giang', 'Việt Nam', 'Thiên đường biển đảo hoang sơ với bãi biển xanh trong vắt', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 9.6789, 104.3541),
(8, NOW(), NOW(), 'Biển Vũng Tàu', 'Vũng Tàu', 'Việt Nam', 'Thành phố biển năng động với Công viên nước Sun World hiện đại', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', 10.3460, 107.0843),
(9, NOW(), NOW(), 'Phú Yên - Quy Nhơn', 'Phú Yên', 'Việt Nam', 'Xứ nẫu hoang sơ với Gành Đá Đĩa, Tháp Nghinh Phong & Kỳ Co', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80', 13.0882, 109.3134),
(10, NOW(), NOW(), 'Mỹ Tho - Cần Thơ', 'Tiền Giang', 'Việt Nam', 'Dạo Chợ nổi Cái Răng, đi xuồng máy cù lao Thới Sơn', 'https://images.unsplash.com/photo-1626014903708-ec4f67c2e3dd?auto=format&fit=crop&w=800&q=80', 10.3542, 106.3653),
(11, NOW(), NOW(), 'Hạ Long & Ninh Bình', 'Quảng Ninh', 'Việt Nam', 'Kỳ quan thiên nhiên thế giới Vịnh Hạ Long và quần thể danh thắng Tràng An', '/images/tours/ha-noi-ha-long-ninh-binh/01.jpg', 20.9101, 107.1839),
(12, NOW(), NOW(), 'Sa Pa & Fansipan', 'Lào Cai', 'Việt Nam', 'Thị trấn sương mù Sa Pa, thung lũng Mường Hoa và nóc nhà Đông Dương Fansipan', '/images/tours/ha-noi-sapa-fansipan/01.png', 22.3364, 103.8438),
(13, NOW(), NOW(), 'Cao Nguyên Đá Đồng Văn', 'Hà Giang', 'Việt Nam', 'Công viên địa chất toàn cầu, đèo Mã Pí Lèng hùng vĩ và dòng sông Nho Quế xanh biếc', '/images/tours/ha-giang-dong-van/02.jpeg', 23.2789, 105.3621),
(14, NOW(), NOW(), 'Đà Nẵng & Hội An', 'Đà Nẵng', 'Việt Nam', 'Cầu Vàng Bà Nà Hills, biển Mỹ Khê và phố cổ Hội An lung linh đèn lồng', '/images/tours/da-nang-hoi-an-hue/01.jpg', 16.0544, 108.2022),
(15, NOW(), NOW(), 'Đảo Ngọc Phú Quốc', 'Kiên Giang', 'Việt Nam', 'Thiên đường nghỉ dưỡng biển đảo, cáp treo Hòn Thơm và hoàng hôn Bãi Sao', '/images/tours/phu-quoc-nam-dao/01.jpg', 10.2899, 103.9840),
(16, NOW(), NOW(), 'Singapore & Malaysia', 'Singapore', 'Singapore', 'Gardens by the Bay hiện đại, tháp đôi Petronas và động Batu huyền bí', '/images/tours/singapore-malaysia/01.jpg', 1.3521, 103.8198),
(17, NOW(), NOW(), 'Seoul & Đảo Nami', 'Seoul', 'Hàn Quốc', 'Cung điện Gyeongbokgung cổ kính, đảo Nami lãng mạn và phố Myeongdong sầm uất', '/images/tours/han-quoc-seoul-nami/01.jpg', 37.5665, 126.9780),
(18, NOW(), NOW(), 'Tokyo & Núi Phú Sĩ', 'Tokyo', 'Nhật Bản', 'Thủ đô Tokyo hiện đại, chùa Sensoji, hồ Kawaguchi và ngắm núi Phú Sĩ hùng vĩ', '/images/tours/nhat-ban-tokyo-phu-si/01.jpg', 35.6762, 139.6503),
(19, NOW(), NOW(), 'Đảo Thiên Đường Bali', 'Bali', 'Indonesia', 'Đền Tanah Lot linh thiêng, ruộng bậc thang Tegallalang và biển xanh Nusa Dua', '/images/tours/indonesia-bali/01.jpg', -8.4095, 115.1889);

-- 5. Insert All 10 Tours
INSERT INTO tours (
  id, created_at, updated_at, tour_code, title, description, price, child_price, duration_days, duration_nights, departure_location, thumbnail_url, category, remaining_seats, view_count, status, vendor_id, destination_id, included_services, excluded_services, cancellation_policy, itinerary_details
) VALUES 
(
  1, NOW(), NOW(), 'AT-PHCT-TGG-6N5D',
  'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ | DẤU ẤN XỨ TRUNG HOA',
  'Khám phá thiên đường hạ giới Trương Gia Giới, Phượng Hoàng Cổ Trấn lung linh về đêm và trải nghiệm văn hóa Thổ Gia độc đáo.',
  17990000.00, 14850000.00, 6, 5, 'TP.Hồ Chí Minh',
  'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png',
  'NUOC_NGOAI', 20, 512, 'ACTIVE', 2, 1,
  '• Vé máy bay khứ hồi theo đoàn\n• Khách sạn 4 sao tiêu chuẩn (2 người/phòng)\n• Các bữa ăn theo chương trình\n• Hướng dẫn viên tiếng Việt nhiệt tình suốt tuyến',
  '• Hộ chiếu còn hạn trên 6 tháng\n• Chi phí cá nhân, hành lý quá cước\n• Tiền Tip cho HDV và tài xế (5 USD/ngày/khách)',
  '• Hủy trước 30 ngày: Miễn phí hủy tour.\n• Hủy từ 15-29 ngày: Phí 50% tổng giá trị tour.\n• Hủy trong vòng 07 ngày: Phí 100% tổng giá trị tour.',
  '[{"day":1,"title":"NGÀY 1: TP. HỒ CHÍ MINH - ÂN THI","content":"Tập trung tại sân bay Tân Sơn Nhất đáp chuyến bay đi Ân Thi."},{"day":2,"title":"NGÀY 2: ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN","content":"Tham quan Phượng Hoàng Cổ Trấn 1.300 năm tuổi, Hồng Kiều, Cầu Tuyết."}]'
),
(
  2, NOW(), NOW(), 'SH-OTRAN-4N4D',
  'TOUR KHÁM PHÁ THƯỢNG HẢI - TÂY SÁCH Ô TRẤN 4 NGÀY 4 ĐÊM NOSHOPPING',
  'Check-in 2 đêm tại Thượng Hải phồn hoa, thưởng ngoạn cảnh sắc cổ kính tại Cổ trấn ngàn năm tuổi Ô Trấn chuẩn 4 sao.',
  18990000.00, 15190000.00, 4, 4, 'TP.Hồ Chí Minh',
  '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
  'NUOC_NGOAI', 40, 384, 'ACTIVE', 2, 2,
  '• Vé máy bay khứ hồi khép kín\n• Khách sạn 4 sao tiêu chuẩn quốc tế\n• Xe du lịch đời mới phục vụ theo hành trình\n• Vé tham quan Ô Trấn & Bến Thượng Hải',
  '• Chi phí mua sắm cá nhân\n• Tiền Tip phục vụ',
  '• Miễn phí hủy trước 20 ngày khởi hành',
  '[{"day":1,"title":"NGÀY 1: TP. HCM - THƯỢNG HẢI","content":"Đáp chuyến bay đi Thượng Hải. Check-in Bến Thượng Hải và Tháp Truyền hình Đông Phương."},{"day":2,"title":"NGÀY 2: THƯỢNG HẢI - TÂY SÁCH Ô TRẤN","content":"Khám phá Cổ trấn Tây Sách Ô Trấn đẹp như bức tranh thủy mặc."}]'
),
(
  3, NOW(), NOW(), 'NUI-CHUA-CHAN-1D',
  'TOUR KHÁM PHÁ NÚI CHỨA CHAN (GIA LÀO) VÀ DINH THẦY THÍM',
  'Hành trình kết hợp chiêm bái tâm linh tại Chùa Bửu Quang (Gia Lào) và viếng Dinh Thầy Thím cầu an lành, tài lộc.',
  790000.00, 550000.00, 1, 0, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'DOMESTIC', 40, 334, 'ACTIVE', 2, 3,
  '• Xe du lịch ghế ngồi cao cấp\n• 01 bữa ăn trưa đặc sản địa phương\n• Nước uống & khăn lạnh',
  '• Vé cáp treo Núi Chứa Chan\n• Chi phí cúng lễ cá nhân',
  '• Hủy trước 3 ngày hoàn 100% tiền',
  '[{"day":1,"title":"HÀNH TRÌNH 1 NGÀY: TP.HCM - NÚI CHỨA CHAN - DINH THẦY THÍM","content":"Khởi hành từ TP.HCM đi Đồng Nai, chinh phục Núi Chứa Chan chiêm bái Chùa Gia Lào."}]'
),
(
  4, NOW(), NOW(), 'CHAU-DOC-AN-GIANG-1N1D',
  'TOUR CHÂU ĐỐC AN GIANG VIẾNG MIẾU BÀ CHÚA XỨ, NÚI CẤM & CHÙA TÀ PẠ',
  'Hành trình hành hương tâm linh Châu Đốc - An Giang, viếng Miếu Bà Chúa Xức Núi Sam, chinh phục Núi Cấm và Chùa Tà Pạ.',
  890000.00, 620000.00, 1, 1, 'TP.Hồ Chí Minh',
  '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg',
  'DOMESTIC', 40, 289, 'ACTIVE', 2, 4,
  '• Xe giường nằm cao cấp\n• Vé viếng Miếu Bà Chúa Xứ & Lâm Viên Núi Cấm\n• Hướng dẫn viên chu đáo',
  '• Chi phí cá nhân\n• Tiền Tip tùy tâm',
  '• Hủy trước 5 ngày hoàn tiền 100%',
  '[{"day":1,"title":"ĐÊM 1: TP.HCM - CHÂU ĐỐC","content":"Đón khách tại các điểm hẹn khởi hành đi Châu Đốc."},{"day":2,"title":"NGÀY 1: MIẾU BÀ CHÚA XỨ - NÚI CẤM - TP.HCM","content":"Viếng Miếu Bà Chúa Xứ Núi Sam, chiêm bái Chùa Tà Pạ và trở về TP.HCM."}]'
),
(
  5, NOW(), NOW(), 'MIEN-TAY-6TINH-3N2D',
  'TOUR DU LỊCH MỸ THO - BẾN TRE - CẦN THƠ - CÀ MAU ĐẤT MŨI - BẠC LIÊU - SÓC TRĂNG',
  'Hành trình trọn vẹn 6 tỉnh miền Tây sông nước, check-in Cực Nam Đất Mũi Cà Mau, Chợ nổi Cái Răng và Nhà công tử Bạc Liêu.',
  2990000.00, 2090000.00, 3, 2, 'TP.Hồ Chí Minh',
  '/images/tours/tour-5-mien-tay-6-tinh/Tour-Du-Lịch-Mỹ-Tho-Bến-Tre-Cần-Thơ-Cà-Mau-Đất-Mũi.jpg',
  'DOMESTIC', 40, 415, 'ACTIVE', 2, 5,
  '• Xe du lịch máy lạnh suốt tuyến\n• Xuồng máy tham quan Chợ nổi Cái Răng\n• Khách sạn 3-4 sao trung tâm Cần Thơ & Cà Mau\n• Vé tham quan Đất Mũi Cà Mau',
  '• Chi phí mua sắm quà lưu niệm',
  '• Hủy trước 7 ngày không mất phí',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - MỸ THO - CẦN THƠ","content":"Đi xuồng máy Cù Lao Thới Sơn, thưởng thức trái cây nghe Đàn ca tài tử."},{"day":2,"title":"NGÀY 2: CẦN THƠ - CÀ MAU ĐẤT MŨI","content":"Dạo Chợ nổi Cái Răng sáng sớm, di chuyển về Đất Mũi Cà Mau."}]'
),
(
  6, NOW(), NOW(), 'DALAT-4N3D-HOA',
  'TOUR ĐÀ LẠT 4N3Đ | KHÁM PHÁ THÀNH PHỐ SƯƠNG MỜ & NHỮNG MÙA HOA',
  'Thưởng thức không khí se lạnh, check-in đồi hoa cẩm tú cầu, Thác Datanla, Quảng trường Lâm Viên và lẩu gà lá é đặc sản.',
  3890000.00, 2720000.00, 4, 3, 'TP.Hồ Chí Minh',
  '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
  'DOMESTIC', 28, 620, 'ACTIVE', 2, 6,
  '• Xe giường nằm đời mới\n• Khách sạn 3 sao trung tâm Đà Lạt\n• Các bữa ăn chính lẩu gà lá é & buffet rau\n• Vé tham quan Datanla, Quảng trường Lâm Viên',
  '• Chi phí xe ôm, đồ uống riêng',
  '• Hủy trước 7 ngày miễn phí',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - ĐÀ LẠT","content":"Xe đón khởi hành đi Đà Lạt. Check-in Quảng trường Lâm Viên và Hồ Xuân Hương."},{"day":2,"title":"NGÀY 2: ĐỒI HOA CẨM TÚ CẦU - THÁC DATANLA","content":"Tham quan đồi hoa cẩm tú cầu, trải nghiệm máng trượt Thác Datanla."}]'
),
(
  7, NOW(), NOW(), 'NAM-DU-3N3D',
  'TOUR DU LỊCH ĐẢO NAM DU 3 NGÀY 3 ĐÊM - CHẠM SÓNG BIỂN XANH',
  'Khám phá thiên đường biển đảo hoang sơ Nam Du, tắm biển Hòn Mấu, lặn ngắm san hô và thưởng thức hải sản tươi ngon.',
  2450000.00, 1715000.00, 3, 3, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'DOMESTIC', 40, 450, 'ACTIVE', 2, 7,
  '• Vé tàu cao tốc khứ hồi Rạch Giá - Nam Du\n• Nhà nghỉ/Khách sạn view biển\n• Tàu du lịch lặn ngắm san hô & ăn tiệc cháo nhum\n• Xe máy tham quan quanh đảo',
  '• Tiền mua hải sản cá nhân',
  '• Hủy trước 5 ngày hoàn 100%',
  '[{"day":1,"title":"ĐÊM 1: TP.HCM - RẠCH GIÁ","content":"Tập trung lên xe giường nằm đi Rạch Giá."},{"day":2,"title":"NGÀY 1: RẠCH GIÁ - ĐẢO NAM DU - TẮM BIỂN HÒN MẤU","content":"Lên tàu cao tốc ra Nam Du. Nhận phòng và đi xuồng máy tắm biển Hòn Mấu."}]'
),
(
  8, NOW(), NOW(), 'VUNG-TAU-SUNWORLD-1D',
  'TOUR DU LỊCH BIỂN VŨNG TÀU | CÔNG VIÊN NƯỚC SUN WORLD | BUFFET TRƯA',
  'Trải nghiệm công viên nước hiện đại Sun World Vũng Tàu, tắm biển Bãi Sau và thưởng thức đại tiệc Buffet trưa phong phú.',
  1050000.00, 735000.00, 1, 0, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'DOMESTIC', 40, 309, 'ACTIVE', 2, 8,
  '• Xe du lịch đưa đón khứ hồi\n• Vé vào cổng Công viên nước Sun World\n• 01 bữa trưa đại tiệc Buffet hải sản',
  '• Đồ uống cá nhân & đồ chơi thuê bãi biển',
  '• Miễn phí hủy trước 3 ngày',
  '[{"day":1,"title":"HÀNH TRÌNH 1 NGÀY: TP.HCM - VŨNG TÀU - SUN WORLD","content":"Khởi hành đi Vũng Tàu, tự do tắm biển Bãi Sau, vui chơi Công viên nước Sun World."}]'
),
(
  9, NOW(), NOW(), 'PHU-YEN-QUY-NHON-3N3D',
  'TOUR DU LỊCH 3 NGÀY 3 ĐÊM KHÁM PHÁ TRỌN VẸN PHÚ YÊN - QUY NHƠN',
  'Hành trình xứ nẫu Phú Yên - Quy Nhơn: Gành Đá Đĩa, Tháp Nghinh Phong, Eo Gió, Kỳ Co và Tháp Bánh Ít.',
  2790000.00, 1953000.00, 3, 3, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
  'DOMESTIC', 40, 580, 'ACTIVE', 2, 9,
  '• Xe giường nằm/Xe du lịch chất lượng cao\n• Vé tham quan Gành Đá Đĩa, Eo Gió, Kỳ Co\n• Khách sạn 3 sao sát biển\n• Ăn uống hải sản tươi sống đặc sản Xứ Nẫu',
  '• Tiền Tip và dịch vụ môtô nước cá nhân',
  '• Hủy trước 7 ngày hoàn tiền',
  '[{"day":1,"title":"ĐÊM 1: TP.HCM - PHÚ YÊN","content":"Khởi hành đi Phú Yên trên chuyến xe đêm sang trọng."},{"day":2,"title":"NGÀY 1: GÀNH ĐÁ ĐĨA - THÁP NGHINH PHONG","content":"Check-in Gành Đá Đĩa kỳ thú và tháp Nghinh Phong biểu tượng mới của Tuy Hòa."}]'
),
(
  10, NOW(), NOW(), 'TL-BKK-PAT-5N4D',
  'TOUR THÁI LAN 5N4Đ: BANGKOK - PATTAYA | THIÊN ĐƯỜNG XỨ SỞ CHÙA VÀNG',
  'Khám phá Chùa Phật Vàng Wat Traimit, dạo thuyền sông Chaophraya, vui chơi Đảo San Hô Coral Pattaya và thưởng thức đại tiệc buffet Baiyoke Sky 86 tầng.',
  6990000.00, 5590000.00, 5, 4, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  'NUOC_NGOAI', 35, 460, 'ACTIVE', 2, 2,
  '• Vé máy bay khứ hồi SGN - BKK - SGN (hành lý 20kg ký gửi + 7kg xách tay)\n• Khách sạn 4 sao tiêu chuẩn Thái Lan\n• Bữa ăn theo chương trình gồm Buffet 86 tầng Baiyoke Sky\n• Xe máy lạnh đưa đón tham quan suốt tuyến\n• Hướng dẫn viên Việt Nam và Thái Lan nhiệt tình\n• Bảo hiểm du lịch quốc tế',
  '• Tiền Tip cho HDV và tài xế (5 USD/khách/ngày)\n• Chi phí cá nhân: giặt ủi, điện thoại, thức uống ngoài chương trình',
  '• Hủy trước 20 ngày miễn phí\n• Hủy từ 10-19 ngày tính 50%\n• Hủy trong vòng 10 ngày tính 100%',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - BANGKOK - PATTAYA","content":"Đáp chuyến bay đi Bangkok, di chuyển về Pattaya, tham quan Chợ nổi 4 miền."},{"day":2,"title":"NGÀY 2: ĐẢO CORAL PATTAYA - TRÂN BẢO PHẬT SƠN","content":"Tắm biển Đảo San Hô Coral, chiêm bái tượng Phật dát vàng trên vách núi."}]'
),
(
  11, NOW(), NOW(), 'DEMO-VIETQR-5K',
  '[DEMO TEST] TOUR TRẢI NGHIỆM THỬ NGHIỆM THANH TOÁN VIETQR THỰC TẾ (5.000Đ)',
  'Tour thử nghiệm quét mã VietQR chuyển khoản tiền thật (5.000đ) trực tiếp về tài khoản Agribank / MoMo. Phục vụ kiểm thử quy trình thanh toán trực tuyến và nhận vé điện tử E-Ticket QR Code ngay lập tức.',
  5000.00, 5000.00, 1, 0, 'TP.Hồ Chí Minh',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'DOMESTIC', 100, 999, 'ACTIVE', 2, 4,
  '• Trải nghiệm thanh toán quét mã VietQR tự động\n• Nhận vé điện tử E-Ticket QR Code tức thì\n• Thử nghiệm quy trình check-in vé',
  '• Không áp dụng cho chuyến đi thực tế (Chỉ dành cho thử nghiệm thanh toán)',
  '• Hỗ trợ hoàn tiền test trực tiếp',
  '[{"day":1,"title":"HÀNH TRÌNH TEST: QUÉT MÃ VIETQR VÀ NHẬN VÉ ĐIỆN TỬ","content":"Chọn tour test 5.000đ, quét mã QR Agribank/MoMo và trải nghiệm quy trình xác nhận tự động."}]'
),
(
  12, NOW(), NOW(), 'HCM-HN-HL-NB-4N3D',
  'TOUR HÀ NỘI - HẠ LONG - NINH BÌNH 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM khám phá thủ đô Hà Nội, kỳ quan Vịnh Hạ Long, Tràng An Ninh Bình và Hang Múa.',
  7990000.00, 5990000.00, 4, 3, 'TP.Hồ Chí Minh',
  '/images/tours/ha-noi-ha-long-ninh-binh/01.jpg',
  'DOMESTIC', 40, 128, 'ACTIVE', 2, 11,
  '• Vé máy bay khứ hồi TP.HCM - Hà Nội\n• Xe tham quan đời mới\n• Khách sạn tiêu chuẩn 3 đêm\n• Vé tham quan và các bữa ăn theo chương trình',
  '• Chi phí cá nhân, phụ thu phòng đơn và các dịch vụ ngoài chương trình',
  '• Hủy trước 15 ngày: Miễn phí.\n• Hủy từ 7-14 ngày: Phí 50%.\n• Hủy trong vòng 7 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - HÀ NỘI","content":"Khởi hành từ Tân Sơn Nhất đến Hà Nội. Tham quan Hồ Gươm, dạo phố cổ và nghỉ đêm tại Hà Nội."},{"day":2,"title":"NGÀY 2: HÀ NỘI - HẠ LONG","content":"Di chuyển đến Hạ Long, đi thuyền tham quan vịnh và ngắm các đảo đá vôi. Nghỉ đêm tại Hạ Long."},{"day":3,"title":"NGÀY 3: HẠ LONG - NINH BÌNH","content":"Di chuyển đến Ninh Bình, tham quan chùa Bái Đính và trải nghiệm đi thuyền tại Tràng An."},{"day":4,"title":"NGÀY 4: HANG MÚA - HÀ NỘI - TP.HCM","content":"Tham quan Hang Múa, ngắm cảnh đồng quê Ninh Bình. Di chuyển về sân bay Nội Bài đáp chuyến bay về TP.HCM."}]'
),
(
  13, NOW(), NOW(), 'HCM-HN-SP-FSP-4N3D',
  'TOUR HÀ NỘI - SA PA - FANSIPAN 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM đến Hà Nội và Sa Pa, khám phá bản Cát Cát, thung lũng Mường Hoa và đỉnh Fansipan.',
  8490000.00, 6390000.00, 4, 3, 'TP.Hồ Chí Minh',
  '/images/tours/ha-noi-sapa-fansipan/01.png',
  'DOMESTIC', 40, 245, 'ACTIVE', 2, 12,
  '• Vé máy bay khứ hồi TP.HCM - Hà Nội\n• Xe di chuyển theo chương trình\n• Khách sạn 3 đêm\n• Các bữa ăn, vé tham quan và vé cáp treo Fansipan',
  '• Chi phí cá nhân, đồ uống và phụ thu phòng đơn',
  '• Hủy trước 15 ngày: Miễn phí.\n• Hủy từ 7-14 ngày: Phí 50%.\n• Hủy trong vòng 7 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - HÀ NỘI - SA PA","content":"Đáp chuyến bay sáng đến Nội Bài, di chuyển xe đi Sa Pa, nhận phòng nghỉ ngơi."},{"day":2,"title":"NGÀY 2: FANSIPAN - THUNG LŨNG MƯỜNG HOA","content":"Trải nghiệm cáp treo Fansipan, tham quan khu vực đỉnh núi, ngắm cảnh thung lũng Mường Hoa."},{"day":3,"title":"NGÀY 3: BẢN CÁT CÁT - HÀ NỘI","content":"Tham quan bản Cát Cát, tìm hiểu văn hóa dân tộc H''Mông. Di chuyển về Hà Nội nghỉ đêm."},{"day":4,"title":"NGÀY 4: HỒ GƯƠM - TP.HCM","content":"Dạo quanh Hồ Gươm và phố cổ, di chuyển ra sân bay đáp chuyến bay về TP.HCM."}]'
),
(
  14, NOW(), NOW(), 'HCM-HG-DV-MPL-5N4D',
  'TOUR HÀ GIANG - ĐỒNG VĂN - MÃ PÍ LÈNG 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM qua Hà Nội đến Hà Giang, khám phá dốc Thẩm Mã, cột cờ Lũng Cú, phố cổ Đồng Văn, đèo Mã Pí Lèng và sông Nho Quế.',
  9990000.00, 7490000.00, 5, 4, 'TP.Hồ Chí Minh',
  '/images/tours/ha-giang-dong-van/02.jpeg',
  'DOMESTIC', 40, 310, 'ACTIVE', 2, 13,
  '• Vé máy bay khứ hồi TP.HCM - Hà Nội\n• Xe di chuyển toàn tuyến\n• Lưu trú 4 đêm\n• Vé tham quan, thuyền trên sông Nho Quế',
  '• Chi phí cá nhân, đồ uống và các dịch vụ ngoài chương trình',
  '• Hủy trước 20 ngày: Miễn phí.\n• Hủy từ 10-19 ngày: Phí 50%.\n• Hủy trong vòng 9 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - HÀ NỘI - HÀ GIANG","content":"Bay sáng đến Nội Bài, xe đón đoàn di chuyển lên Hà Giang, nhận phòng nghỉ ngơi."},{"day":2,"title":"NGÀY 2: HÀ GIANG - DỐC THẨM MÃ - ĐỒNG VĂN","content":"Ngắm cảnh dốc Thẩm Mã, cổng trời Quản Bạ, đến Đồng Văn khám phá phố cổ về đêm."},{"day":3,"title":"NGÀY 3: LŨNG CÚ - ĐỒNG VĂN","content":"Chinh phục cột cờ Lũng Cú cực Bắc Tổ quốc, thăm dinh thự họ Vương."},{"day":4,"title":"NGÀY 4: MÃ PÍ LÈNG - SÔNG NHO QUẾ","content":"Chiêm ngưỡng đèo Mã Pí Lèng, du thuyền hẻm Tu Sản sông Nho Quế."},{"day":5,"title":"NGÀY 5: HÀ GIANG - NỘI BÀI - TP.HCM","content":"Khởi hành về sân bay Nội Bài, đáp chuyến bay tối về lại TP.HCM."}]'
),
(
  15, NOW(), NOW(), 'HCM-DN-HA-HUE-4N3D',
  'TOUR ĐÀ NẴNG - HỘI AN - HUẾ 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM khám phá biển Mỹ Khê, Cầu Vàng, phố cổ Hội An, Đại Nội Huế và chùa Thiên Mụ.',
  6990000.00, 5290000.00, 4, 3, 'TP.Hồ Chí Minh',
  '/images/tours/da-nang-hoi-an-hue/01.jpg',
  'DOMESTIC', 40, 420, 'ACTIVE', 2, 14,
  '• Vé máy bay khứ hồi TP.HCM - Đà Nẵng / Huế - TP.HCM\n• Xe tham quan đời mới\n• Khách sạn 3 sao 3 đêm\n• Vé cáp treo Bà Nà Hills, vé tham quan Hội An & Đại Nội',
  '• Chi phí cá nhân, đồ uống và trò chơi có phí',
  '• Hủy trước 15 ngày: Miễn phí.\n• Hủy từ 7-14 ngày: Phí 50%.\n• Hủy trong vòng 7 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - ĐÀ NẴNG - HỘI AN","content":"Bay đến Đà Nẵng, tắm biển Mỹ Khê, chiều dạo phố cổ Hội An đèn lồng lung linh."},{"day":2,"title":"NGÀY 2: BÀ NÀ HILLS - CẦU VÀNG","content":"Đi cáp treo Bà Nà Hills, check-in Cầu Vàng nổi tiếng thế giới, vui chơi Fantasy Park."},{"day":3,"title":"NGÀY 3: ĐÀ NẴNG - HUẾ - ĐẠI NỘI","content":"Vượt hầm Hải Vân đến Huế, tham quan Đại Nội Hoàng Cung ngắm kiến trúc triều Nguyễn."},{"day":4,"title":"NGÀY 4: CHÙA THIÊN MỤ - TP.HCM","content":"Viếng chùa Thiên Mụ cổ kính bên bờ sông Hương, ra sân bay Phú Bài về TP.HCM."}]'
),
(
  16, NOW(), NOW(), 'HCM-PQ-NAMDAO-4N3D',
  'TOUR PHÚ QUỐC - NAM ĐẢO 4N3Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM đến Phú Quốc, khám phá Bãi Sao, Hòn Thơm, cáp treo vượt biển, Hòn Móng Tay và hoàng hôn tại An Thới.',
  7490000.00, 5590000.00, 4, 3, 'TP.Hồ Chí Minh',
  '/images/tours/phu-quoc-nam-dao/01.jpg',
  'DOMESTIC', 40, 380, 'ACTIVE', 2, 15,
  '• Vé máy bay khứ hồi TP.HCM - Phú Quốc\n• Xe đưa đón tham quan\n• Khách sạn 3 đêm\n• Vé cáp treo Hòn Thơm vượt biển 3 dây dài nhất thế giới, cano 4 đảo',
  '• Chi phí cá nhân, trò chơi biển ngoài chương trình',
  '• Hủy trước 15 ngày: Miễn phí.\n• Hủy từ 7-14 ngày: Phí 50%.\n• Hủy trong vòng 7 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - PHÚ QUỐC - BÃI SAO","content":"Bay từ Tân Sơn Nhất đến Phú Quốc, tắm biển cát trắng Bãi Sao, thưởng thức hải sản."},{"day":2,"title":"NGÀY 2: CÁP TREO HÒN THƠM - AN THỚI","content":"Trải nghiệm cáp treo Hòn Thơm, công viên nước Aquatopia, ngắm hoàng hôn Sunset Town."},{"day":3,"title":"NGÀY 3: CANO 4 ĐẢO - HÒN MÓNG TAY","content":"Khám phá Hòn Móng Tay, Hòn Gầm Ghì lặn ngắm san hô tự nhiên tuyệt đẹp."},{"day":4,"title":"NGÀY 4: ĐẶC SẢN PHÚ QUỐC - TP.HCM","content":"Mua sắm ngọc trai, tiêu, nước mắm truyền thống, ra sân bay Phú Quốc về TP.HCM."}]'
),
(
  17, NOW(), NOW(), 'HCM-SG-MY-5N4D',
  'TOUR SINGAPORE - MALAYSIA 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM khám phá Merlion, Gardens by the Bay, Marina Bay tại Singapore và tháp đôi Petronas, động Batu tại Malaysia.',
  13990000.00, 10490000.00, 5, 4, 'TP.Hồ Chí Minh',
  '/images/tours/singapore-malaysia/01.jpg',
  'NUOC_NGOAI', 40, 490, 'ACTIVE', 2, 16,
  '• Vé máy bay khứ hồi TP.HCM - Singapore / Kuala Lumpur - TP.HCM\n• Khách sạn 3-4 sao 4 đêm\n• Các bữa ăn theo chương trình gồm buffet lẩu nướng\n• Hướng dẫn viên suốt tuyến',
  '• Hộ chiếu còn hạn trên 6 tháng\n• Chi phí cá nhân, tiền tip HDV (5 USD/ngày)',
  '• Hủy trước 30 ngày: Miễn phí.\n• Hủy từ 15-29 ngày: Phí 50%.\n• Hủy trong vòng 14 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - SINGAPORE - MERLION","content":"Bay đến Singapore, chụp hình tại công viên sư tử biển Merlion, ngắm Marina Bay Sands."},{"day":2,"title":"NGÀY 2: GARDENS BY THE BAY - SENTOSA","content":"Chiêm ngưỡng siêu cây nhân tạo Gardens by the Bay, khám phá đảo giải trí Sentosa."},{"day":3,"title":"NGÀY 3: SINGAPORE - MALACCA - KUALA LUMPUR","content":"Di chuyển qua Malaysia, thăm phố cổ Malacca di sản thế giới, về thủ đô Kuala Lumpur."},{"day":4,"title":"NGÀY 4: ĐỘNG BATU - THÁP ĐÔI PETRONAS","content":"Chinh phục 272 bậc thang động Batu Hindu, check-in tháp đôi Petronas Twin Towers."},{"day":5,"title":"NGÀY 5: KUALA LUMPUR - TP.HCM","content":"Mua sắm sô-cô-la đặc sản, ra sân bay quốc tế KLIA đáp chuyến bay về TP.HCM."}]'
),
(
  18, NOW(), NOW(), 'HCM-SEOUL-NAMI-5N4D',
  'TOUR HÀN QUỐC - SEOUL - NAMI 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM đến Hàn Quốc, khám phá cung Gyeongbokgung, đảo Nami, tháp N Seoul, làng Bukchon và phố Myeongdong.',
  18990000.00, 14290000.00, 5, 4, 'TP.Hồ Chí Minh',
  '/images/tours/han-quoc-seoul-nami/01.jpg',
  'NUOC_NGOAI', 40, 560, 'ACTIVE', 2, 17,
  '• Vé máy bay khứ hồi TP.HCM - Incheon hãng hàng không tiêu chuẩn\n• Visa nhập cảnh Hàn Quốc\n• Khách sạn 4 sao 4 đêm\n• Vé tham quan đảo Nami, cung Gyeongbokgung, trải nghiệm làm kimchi mặc Hanbok',
  '• Chi phí cá nhân, tiền Tip cho HDV và tài xế (6 USD/ngày/khách)',
  '• Hủy trước 30 ngày: Miễn phí.\n• Hủy từ 15-29 ngày: Phí 50%.\n• Hủy trong vòng 14 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - INCHEON - SEOUL","content":"Bay từ Tân Sơn Nhất sang Seoul, nhận phòng khách sạn nghỉ ngơi, dạo phố đêm."},{"day":2,"title":"NGÀY 2: CUNG GYEONGBOKGUNG - LÀNG BUKCHON","content":"Mặc Hanbok check-in cung điện Hoàng Gia Gyeongbokgung, dạo làng cổ Bukchon Hanok."},{"day":3,"title":"NGÀY 3: ĐẢO NAMI MÙA LÁ ĐỎ","content":"Tham quan đảo Nami - bối cảnh lãng mạn của bộ phim kinh điển Bản Tình Ca Mùa Đông."},{"day":4,"title":"NGÀY 4: THÁP N SEOUL - MYEONGDONG","content":"Ngắm toàn cảnh Seoul tại tháp N Seoul, gắn khóa tình yêu, mua sắm thả ga tại Myeongdong."},{"day":5,"title":"NGÀY 5: SEOUL - INCHEON - TP.HCM","content":"Mua sắm sâm chính phủ, mỹ phẩm Hàn Quốc, ra sân bay Incheon đáp chuyến bay về TP.HCM."}]'
),
(
  19, NOW(), NOW(), 'HCM-TOKYO-FUJI-5N4D',
  'TOUR NHẬT BẢN - TOKYO - PHÚ SĨ 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM khám phá Tokyo, chùa Sensoji, Tokyo Skytree, hồ Kawaguchi và làng Oshino Hakkai; ngắm núi Phú Sĩ khi thời tiết thuận lợi.',
  28990000.00, 21790000.00, 5, 4, 'TP.Hồ Chí Minh',
  '/images/tours/nhat-ban-tokyo-phu-si/01.jpg',
  'NUOC_NGOAI', 40, 610, 'ACTIVE', 2, 18,
  '• Vé máy bay khứ hồi TP.HCM - Tokyo\n• Visa nhập cảnh Nhật Bản\n• Khách sạn 3-4 sao 4 đêm\n• Trải nghiệm tắm suối khoáng nóng Onsen truyền thống Nhật Bản, ăn bò Wagyu',
  '• Hộ chiếu, chi phí cá nhân, tiền Tip cho HDV và tài xế (7 USD/ngày)',
  '• Hủy trước 30 ngày: Miễn phí.\n• Hủy từ 15-29 ngày: Phí 50%.\n• Hủy trong vòng 14 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - TOKYO - ASAKUSA","content":"Bay từ Tân Sơn Nhất đến Tokyo, viếng chùa cổ Asakusa Kannon (Sensoji), dạo phố Nakamise."},{"day":2,"title":"NGÀY 2: NÚI PHÚ SĨ - LÀNG CỔ OSHINO HAKKAI","content":"Di chuyển đến trạm số 5 ngắm núi Phú Sĩ hùng vĩ, thăm làng cổ thanh bình Oshino Hakkai dưới chân núi."},{"day":3,"title":"NGÀY 3: HỒ KAWAGUCHI - ONSEN NHẬT BẢN","content":"Du ngoạn hồ Kawaguchi ngắm cảnh thơ mộng, trải nghiệm tắm suối khoáng nóng Onsen thư giãn."},{"day":4,"title":"NGÀY 4: TOKYO SKYTREE - GINZA","content":"Chụp ảnh tháp truyền hình Tokyo Skytree cao nhất thế giới, mua sắm tại thiên đường Ginza & Shinjuku."},{"day":5,"title":"NGÀY 5: TOKYO - NARITA - TP.HCM","content":"Tự do dạo phố mua quà lưu niệm Nhật Bản, ra sân bay Narita đáp chuyến bay về lại TP.HCM."}]'
),
(
  20, NOW(), NOW(), 'HCM-BALI-5N4D',
  'TOUR INDONESIA - BALI 5N4Đ | KHỞI HÀNH TỪ TP.HCM',
  'Hành trình mẫu từ TP.HCM đến Bali, khám phá Tanah Lot, Uluwatu, ruộng bậc thang Tegallalang, đền Ulun Danu Beratan và biển Nusa Dua.',
  15990000.00, 11990000.00, 5, 4, 'TP.Hồ Chí Minh',
  '/images/tours/indonesia-bali/01.jpg',
  'NUOC_NGOAI', 40, 530, 'ACTIVE', 2, 19,
  '• Vé máy bay khứ hồi TP.HCM - Bali (Denpasar)\n• Khách sạn 4 sao tiêu chuẩn resort tại Bali\n• Các bữa ăn đặc sản gồm hải sản nướng bãi biển Jimbaran ngắm hoàng hôn\n• Vé tham quan đền Tanah Lot, Uluwatu, Cổng Trời Lempuyang',
  '• Hộ chiếu, chi phí cá nhân, trò chơi biển, xích đu Bali Swing',
  '• Hủy trước 30 ngày: Miễn phí.\n• Hủy từ 15-29 ngày: Phí 50%.\n• Hủy trong vòng 14 ngày: Phí 100%.',
  '[{"day":1,"title":"NGÀY 1: TP.HCM - BALI (DENPASAR)","content":"Bay từ Tân Sơn Nhất đến đảo thiên đường Bali, xe đón đoàn về resort nhận phòng nghỉ ngơi."},{"day":2,"title":"NGÀY 2: UBUD - RUỘNG BẬC THANG TEGALLALANG","content":"Khám phá văn hóa làng Ubud, check-in ruộng bậc thang Tegallalang xanh ngát, trải nghiệm xích đu Bali Swing."},{"day":3,"title":"NGÀY 3: ĐỀN CỔNG TRỜI LEMPUYANG - TIRTA GANGGA","content":"Chụp ảnh Cổng Trời Lempuyang phản chiếu mây trời, thăm cung điện nước Tirta Gangga với đàn cá Koi rực rỡ."},{"day":4,"title":"NGÀY 4: ĐỀN TANAH LOT - HOÀNG HÔN JIMBARAN","content":"Viếng đền Tanah Lot sừng sững trên mỏm đá giữa biển sóng, chiều ngắm hoàng hôn và ăn tiệc hải sản tại bãi biển Jimbaran."},{"day":5,"title":"NGÀY 5: BALI - TP.HCM","content":"Tự do tắm biển hoặc mua sắm cà phê chồn Kopi Luwak, ra sân bay Denpasar về lại TP.HCM."}]'
)
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  price = VALUES(price),
  status = VALUES(status),
  remaining_seats = VALUES(remaining_seats),
  thumbnail_url = VALUES(thumbnail_url);

-- 6. Insert Tour Schedules
INSERT IGNORE INTO tour_schedules (id, created_at, updated_at, tour_id, start_date, end_date, max_participants, booked_count) VALUES 
(1, NOW(), NOW(), 1, '2026-08-30', '2026-09-04', 20, 0),
(2, NOW(), NOW(), 2, '2026-09-10', '2026-09-14', 40, 0),
(3, NOW(), NOW(), 3, '2026-08-23', '2026-08-23', 40, 0),
(4, NOW(), NOW(), 4, '2026-08-22', '2026-08-23', 40, 0),
(5, NOW(), NOW(), 5, '2026-08-20', '2026-08-22', 40, 0),
(6, NOW(), NOW(), 6, '2026-08-20', '2026-08-23', 40, 0),
(7, NOW(), NOW(), 7, '2026-08-20', '2026-08-23', 40, 0),
(8, NOW(), NOW(), 8, '2026-08-22', '2026-08-22', 40, 0),
(9, NOW(), NOW(), 9, '2026-09-01', '2026-09-04', 40, 0),
(10, NOW(), NOW(), 10, '2026-09-05', '2026-09-09', 35, 0);

-- 7. Insert Vouchers
INSERT IGNORE INTO vouchers (id, created_at, updated_at, code, title, discount_percent, discount_amount, min_order_value, expiry_date, active) VALUES 
(1, NOW(), NOW(), 'SMARTTRAVEL100', 'Giảm 100.000đ cho đơn tour bất kỳ', NULL, 100000.00, 1000000.00, '2026-12-31', 1),
(2, NOW(), NOW(), 'SUMMER2026', 'Ưu đãi hè giảm 5% tổng giá trị', 5, NULL, 3000000.00, '2026-10-31', 1);

-- 8. Insert Reviews
INSERT IGNORE INTO reviews (id, created_at, updated_at, user_id, tour_id, rating, comment, image_url) VALUES 
(1, NOW(), NOW(), 3, 1, 5, 'Chuyến đi Phượng Hoàng Cổ Trấn tuyệt vời ngoài mong đợi! Hướng dẫn viên rất chu đáo.', 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png'),
(2, NOW(), NOW(), 3, 2, 5, 'Thượng Hải và Ô Trấn rất đẹp, dịch vụ khách sạn 4 sao chất lượng cao.', '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg');

SET FOREIGN_KEY_CHECKS = 1;
