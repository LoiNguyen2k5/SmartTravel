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
(10, NOW(), NOW(), 'Mỹ Tho - Cần Thơ', 'Tiền Giang', 'Việt Nam', 'Dạo Chợ nổi Cái Răng, đi xuồng máy cù lao Thới Sơn', 'https://images.unsplash.com/photo-1626014903708-ec4f67c2e3dd?auto=format&fit=crop&w=800&q=80', 10.3542, 106.3653);

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
