SET NAMES utf8mb4;

INSERT INTO reviews (user_id, tour_id, rating, comment, image_url, created_at, updated_at) VALUES 
-- Tour 1: Phượng Hoàng Cổ Trấn - Trương Gia Giới
(3, 1, 5, 'Trương Gia Giới đẹp hùng vĩ như phim Avatar! Đồ ăn Trung Quốc hơi nhiều dầu mỡ nhưng HDV đã linh hoạt nhờ nhà hàng nấu bớt cay cho đoàn Việt Nam, rất chu đáo.', 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png', NOW(), NOW()),
(4, 1, 4, 'Hành trình tham quan phong phú, khách sạn 4 sao sạch sẽ. Tuy nhiên thời gian ngồi trên xe khá nhiều giữa các điểm, các bạn nên chuẩn bị gối cổ chữ U.', NULL, NOW(), NOW()),
(5, 1, 3, 'Cảnh Phượng Hoàng Cổ Trấn về đêm rất lung linh, nhưng khâu làm thủ tục xuất nhập cảnh ở cửa khẩu đông đúc nên đoàn phải chờ mất gần 1 tiếng.', NULL, NOW(), NOW()),

-- Tour 2: Thượng Hải - Tây Sách Ô Trấn
(4, 2, 5, 'Tour không bị dắt vào các điểm mua sắm (No Shopping) nên có nhiều thời gian chụp ảnh và dạo bến Thượng Hải, ngắm Tháp Đông Phương Minh Châu tuyệt đẹp.', '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg', NOW(), NOW()),
(5, 2, 4, 'Thời tiết mùa thu se lạnh rất dễ chịu, hướng dẫn viên am hiểu lịch sử văn hóa. Ô Trấn về đêm đẹp như tranh thủy mặc vậy.', NULL, NOW(), NOW()),

-- Tour 3: Núi Chứa Chan & Dinh Thầy Thím
(3, 3, 5, 'Chuyến đi viếng chùa thanh tịnh, cáp treo Núi Chứa Chan êm ái, quang cảnh trên đỉnh núi ngắm mây trời rất thoáng đãng.', NULL, NOW(), NOW()),
(4, 3, 4, 'Bữa trưa chay và mặn đều nấu ngon vừa miệng, bác tài xế chạy xe điềm đạm, an toàn.', NULL, NOW(), NOW()),

-- Tour 4: Châu Đốc An Giang
(3, 4, 5, 'Đi viếng Miếu Bà Chúa Xứ cầu bình an cho gia đình. Rừng tràm Trà Sư mùa nước nổi đẹp ngỡ ngàng, ngồi xuồng len lỏi giữa bèo xanh mướt chụp ảnh siêu đẹp!', '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg', NOW(), NOW()),
(5, 4, 4, 'Bánh xèo rau rừng Núi Cấm và lẩu mắm cá linh bông điên điển ngon xuất sắc, đúng chuẩn hương vị miền Tây.', NULL, NOW(), NOW()),
(4, 4, 3, 'Đi đúng dịp cuối tuần nên Miếu Bà đông đúc người hành hương, đoàn hơi khó tập trung nhưng hướng dẫn viên luôn túc trực hỗ trợ nhiệt tình.', NULL, NOW(), NOW()),

-- Tour 5: Miền Tây 6 Tỉnh
(5, 5, 5, 'Chuyến đi xuyên lục tỉnh Miền Tây rất đáng nhớ, được đặt chân đến Cột Mốc Tọa Độ Quốc Gia Đất Mũi Cà Mau thấy tự hào vô cùng.', NULL, NOW(), NOW()),
(3, 5, 4, 'Khách sạn ở Cần Thơ sạch sẽ, đi chợ nổi Cái Răng ăn hủ tiếu trên sông thú vị. Đi xe hơi dài ngày nhưng không khí miền Tây rất mộc mạc và thân thiện.', NULL, NOW(), NOW()),

-- Tour 6: Đà Lạt 4N3Đ
(3, 6, 5, 'Đà Lạt mùa này muôn hoa khoe sắc, không khí se lạnh dễ chịu. Khách sạn gần chợ đêm đi dạo ăn bánh tráng nướng uống sữa đậu nành rất tiện.', '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg', NOW(), NOW()),
(4, 6, 5, 'Gia đình mình có người lớn tuổi và trẻ em, lịch trình sắp xếp nhịp nhàng không bị vội vã. HDV chăm sóc đoàn chu đáo từng bữa ăn, vote 5 sao!', NULL, NOW(), NOW()),
(5, 6, 4, 'Đồi Chè Cầu Đất săn mây sáng sớm tuyệt đẹp, Nông trại Cún Puppy Farm các bé nhà mình thích mê.', NULL, NOW(), NOW()),
(6, 6, 2, 'Hôm đoàn lên đỉnh Langbiang trời mưa tầm tã nên đường đất trơn trượt, xe Jeep chạy dằn xóc khiến mẹ mình bị mệt và say xe.', NULL, NOW(), NOW()),

-- Tour 7: Đảo Nam Du
(3, 7, 5, 'Nước biển Nam Du trong vắt nhìn thấy đáy, bãi Cây Mến dừa nghiêng bóng cát trắng mịn không thua gì Maldives.', NULL, NOW(), NOW()),
(4, 7, 4, 'Hải sản cá bớp, nhum biển nướng mỡ hành tươi rói giá lại bình dân. Tàu cao tốc đi êm không bị say sóng.', NULL, NOW(), NOW()),

-- Tour 8: Biển Vũng Tàu Sun World
(4, 8, 5, 'Công viên nước Sun World chơi các đường trượt cảm giác mạnh cực đã! Buffet trưa hải sản ê hề tôm cua mực tươi ngon.', NULL, NOW(), NOW()),
(5, 8, 4, 'Chuyến đi 1 ngày cuối tuần xả stress rất hợp lý, xe đời mới ghế ngả êm ru, khởi hành đúng giờ.', NULL, NOW(), NOW()),

-- Tour 9: Phú Yên - Quy Nhơn
(3, 9, 5, 'Kỳ Co - Eo Gió xứng danh thiên đường biển đảo, nước biển hai màu xanh ngọc bích chụp góc nào cũng có ảnh đẹp.', NULL, NOW(), NOW()),
(4, 9, 5, 'Gành Đá Đĩa tuyệt tác thiên nhiên kỳ vĩ. Mắt cá ngừ đại dương tiềm thuốc bắc ăn lạ miệng mà bổ dưỡng.', NULL, NOW(), NOW()),

-- Tour 10: Thái Lan Bangkok - Pattaya
(3, 10, 5, 'Show Alcazar ở Pattaya hoành tráng đẳng cấp quốc tế, khách sạn view biển đẹp lung linh. Đồ ăn Thái chua cay đúng gu!', NULL, NOW(), NOW()),
(5, 10, 4, 'HDV địa phương nói tiếng Việt rất sõi, hài hước, kể chuyện lịch sử Hoàng Gia Thái Lan cuốn hút.', NULL, NOW(), NOW()),
(4, 10, 3, 'Chợ nổi 4 miền hơi đông đúc và đồ lưu niệm đắt hơn ngoài chợ đêm Pratunam một chút.', NULL, NOW(), NOW()),

-- Tour 18: Hàn Quốc Seoul - Nami
(4, 18, 5, 'Đảo Nami mùa lá vàng lãng mạn như phim Bản Tình Ca Mùa Đông, mặc Hanbok chụp ảnh Cung Gyeongbokgung rất ưng ý!', NULL, NOW(), NOW()),
(5, 18, 4, 'Thủ tục xin Visa được bên SmartTravel hướng dẫn tỉ mỉ nên đậu nhanh. Mua sắm mỹ phẩm ở phố Myeongdong rất tiện.', NULL, NOW(), NOW()),

-- Tour 19: Nhật Bản Tokyo - Núi Phú Sĩ
(3, 19, 5, 'Đoàn may mắn ngày đến Núi Phú Sĩ trời trong veo, thấy trọn ngọn núi tuyết hùng vĩ. Tắm suối nước nóng Onsen buổi tối cực kỳ thư thái.', NULL, NOW(), NOW()),
(4, 19, 5, 'Thịt bò Wagyu thơm lừng tan chảy trong miệng. Dịch vụ người Nhật tận tâm, đúng chuẩn chuyên nghiệp!', NULL, NOW(), NOW());
