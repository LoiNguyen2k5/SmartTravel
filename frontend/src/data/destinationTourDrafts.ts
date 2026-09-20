export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface ArticleDraft {
  tourId: number;
  title: string;
  desc: string;
  sections: ArticleSection[];
}

export const drafts: ArticleDraft[] = [
  {
    tourId: 1,
    title: 'Phượng Hoàng Cổ Trấn – Trương Gia Giới: Từ ánh đèn huyền ảo cổ trấn đến đỉnh núi sa thạch kỳ vĩ',
    desc: 'Hành trình vượt thời gian đưa du khách từ vẻ đẹp trầm mặc lung linh nghìn năm bên dòng Đà Giang của Phượng Hoàng Cổ Trấn đến chốn bồng lai tiên cảnh Trương Gia Giới và Cổng Trời Thiên Môn Sơn ngoạn mục.',
    sections: [
      {
        heading: '1. Phượng Hoàng Cổ Trấn: Bức tranh thủy mặc nghìn năm bên dòng Đà Giang',
        paragraphs: [
          'Nằm nép mình bên dòng sông Đà Giang hiền hòa thuộc tỉnh Hồ Nam, Phượng Hoàng Cổ Trấn (Fenghuang) hiện lên như một bức tranh cổ tích còn vẹn nguyên kiến trúc thời Minh - Thanh. Những ngôi nhà sàn Điếu Cước Lâu bằng gỗ mộc mạc soi bóng xuống mặt nước trong veo, nối liền bởi những cây cầu đá rêu phong nổi tiếng như Cầu Hồng Kiều, Cầu Tuyết và Cầu Nhảy.',
          'Khi màn đêm buông xuống, toàn bộ cổ trấn bừng sáng rực rỡ bởi hàng vạn ánh đèn lồng đỏ phản chiếu lung linh trên mặt sông. Trải nghiệm ngồi trên chiếc thuyền gỗ mộc mạc lững lờ trôi theo dòng nước, lắng nghe điệu hò êm dịu của người lái đò Miêu tộc và ngắm nhìn Tháp Vạn Danh uy nghiêm sẽ để lại dấu ấn khó phai trong lòng mọi lữ khách.',
          'Vào sáng sớm mai khi sương mù còn vương vấn trên các mái ngói âm dương, hãy thức dậy thật sớm để tản bộ quanh các con hẻm lát đá cổ kính, thưởng thức món đậu phụ thối chiên giòn, kẹo gừng cay ấm và ngắm nhìn nhịp sống thường nhật bình dị của đồng bào Thổ Gia.'
        ]
      },
      {
        heading: '2. Trương Gia Giới: Kỳ quan rừng đá sa thạch – Nguyên mẫu hành tinh Pandora',
        paragraphs: [
          'Rời cổ trấn cổ kính, hành trình mở ra một chiều không gian kỳ vĩ tại Công viên Rừng Quốc gia Trương Gia Giới. Nơi đây sở hữu hơn 3.000 cột đá sa thạch thạch anh khổng lồ dựng đứng vươn thẳng lên trời xanh, quanh năm mây mù bao phủ, từng là nguồn cảm hứng cho dãy núi bay Hallelujah trong bộ phim bom tấn thế giới Avatar.',
          'Đặc biệt, du khách sẽ được trải nghiệm thang máy Bách Long (Bailong Elevator) – chiếc thang máy ngoài trời bằng kính cao nhất thế giới bám chặt vào vách núi dựng đứng. Chỉ trong chưa đầy hai phút, thang máy đưa bạn từ chân thung lũng lên độ cao hơn 326m, mở ra toàn cảnh đại vực Viên Gia Giới bao la hùng vĩ khiến bất cứ ai cũng phải choáng ngợp.'
        ]
      },
      {
        heading: '3. Thiên Môn Sơn huyền bí: Cung đường 99 khúc cua và nấc thang lên Cổng Trời',
        paragraphs: [
          'Đỉnh cao của chuyến đi là hành trình chinh phục ngọn núi thiêng Thiên Môn Sơn. Du khách sẽ trải nghiệm hệ thống cáp treo dài hơn 7.400m xuất phát từ trung tâm thành phố lướt qua những tầng mây trắng bồng bềnh, phóng tầm mắt ngắm cung đường đèo 99 khúc cua uốn lượn hiểm trở như một con rồng khổng lồ ôm lấy vách núi.',
          'Khi lên đến đỉnh, con đường kính Skywalk trong suốt men theo vách đá ở độ cao 1.400m sẽ thử thách lòng dũng cảm của bạn trước khi bước xuống 999 bậc thang đá sừng sững dẫn lên Cổng Trời – hang động tự nhiên xuyên núi khổng lồ quanh năm đón nhận những luồng linh khí đất trời.'
        ]
      },
      {
        heading: '4. Cẩm nang du lịch và mẹo chuẩn bị hành trang',
        paragraphs: [
          'Hành trình Phượng Hoàng – Trương Gia Giới đòi hỏi việc đi bộ và leo bậc thang khá nhiều, do đó một đôi giày thể thao chuyên dụng có độ bám tốt, êm chân là vật bất ly thân. Thời tiết trên núi cao chênh lệch nhiệt độ lớn, hãy chuẩn bị áo khoác cản gió, khăn choàng nhẹ và bình giữ nhiệt cá nhân.',
          'Sim 4G hoặc bộ phát wifi quốc tế có cài sẵn VPN là điều cần thiết để duy trì kết nối mạng tại Trung Quốc. Đừng quên đổi sẵn một lượng tiền mặt Nhân Dân Tệ (RMB) hoặc kích hoạt tài khoản Alipay/WeChat Pay để thuận tiện thanh toán quà lưu niệm thủ công.'
        ]
      }
    ]
  },
  {
    tourId: 2,
    title: 'Thượng Hải – Ô Trấn: Bản giao hưởng giữa đô thị hiện đại và nét trầm mặc nghìn năm',
    desc: 'Trải nghiệm sự tương phản độc đáo giữa một Thượng Hải hiện đại hoa lệ bên dòng sông Hoàng Phố và Ô Trấn Tây Sách – tuyệt tác thủy trấn cổ kính thanh bình bậc nhất vùng Giang Nam.',
    sections: [
      {
        heading: '1. Thượng Hải phồn hoa: Nơi hội tụ kiến trúc kim - cổ bên dòng Hoàng Phố',
        paragraphs: [
          'Thượng Hải được mệnh danh là "Hòn ngọc Viễn Đông", nơi lưu giữ trọn vẹn sự giao thoa văn hóa Đông - Tây đầy quyến rũ. Điểm dừng chân đầu tiên không thể bỏ qua chính là Bến Thượng Hải (The Bund) – đại lộ dài hơn 1,5km chạy dọc bờ tây sông Hoàng Phố, quy tụ 52 tòa nhà mang phong cách kiến trúc Gothic, Phục Hưng và Baroque cổ kính được ví như bảo tàng kiến trúc ngoài trời.',
          'Phóng tầm mắt sang bờ đông đối diện là khu phố tài chính Lục Gia Chủy (Pudong) hiện đại với những tòa cao ốc chọc trời biểu tượng như Tháp truyền hình Đông Phương Minh Châu lung linh ánh đèn và Tháp Thượng Hải cao sừng sững. Dạo bước trên đại lộ mua sắm Nam Kinh Lộ sầm uất và ghé thăm Vườn Dự Viên (Yuyuan Garden) mang đậm phong cách vườn cảnh cung đình truyền thống là trải nghiệm không thể bỏ lỡ.'
        ]
      },
      {
        heading: '2. Ô Trấn Tây Sách: Tuyệt tác Venice phương Đông tĩnh lặng giữa làn sương',
        paragraphs: [
          'Cách Thượng Hải chỉ khoảng hai giờ di chuyển, Ô Trấn (Wuzhen) như đưa du khách ngược dòng thời gian về với vùng sông nước Giang Nam hơn 1.300 năm lịch sử. Khu Tây Sách được bảo tồn nguyên vẹn với mạng lưới kênh rạch chằng chịt, những cây cầu vòm đá rêu phong và dãy nhà mái ngói đen tường vôi trắng soi bóng nước êm đềm.',
          'Khác biệt với nhịp sống hối hả nơi phố thị, Ô Trấn buổi sớm mai phủ kín màn sương mỏng tang tĩnh mịch. Ngồi trên chiếc thuyền nan trôi nhẹ theo dòng nước, lắng nghe tiếng mái chèo khua nước rì rào và ghé thăm xưởng nhuộm vải hoa lam truyền thống sẽ mang lại cảm giác an yên tuyệt đối cho tâm hồn.'
        ]
      },
      {
        heading: '3. Ẩm thực phong phú và những lưu ý cần nhớ',
        paragraphs: [
          'Đến Thượng Hải và Ô Trấn, hãy dành thời gian thưởng thức món bánh bao súp Tiểu Long Bao (Xiao Long Bao) với lớp vỏ mỏng tang chứa trọn dòng nước súp ngọt thanh nóng hổi, thịt kho Đông Pha mềm rục tan ngay đầu lưỡi và chén rượu tam bạch cay nồng trứ danh Ô Trấn.',
          'Các con phố đi bộ ở cả hai địa điểm đều lát đá cuội tự nhiên, vì vậy giày bệt êm chân là lựa chọn tối ưu. Thời điểm lý tưởng nhất để ghé thăm là mùa xuân (tháng 3 - tháng 5) khi hoa đào nở rộ hoặc mùa thu (tháng 9 - tháng 11) khi tiết trời mát mẻ, lá vàng phủ bóng thủy trấn.'
        ]
      }
    ]
  },
  {
    tourId: 3,
    title: 'Núi Chứa Chan – Dinh Thầy Thím: Hành trình tìm về an yên và chiêm bái linh thiêng',
    desc: 'Một chuyến đi ngắn một ngày tràn đầy năng lượng tâm linh và thanh lọc tâm hồn, kết hợp chiêm bái chùa Bửu Quang trên đỉnh núi Chứa Chan hùng vĩ và viếng Dinh Thầy Thím linh thiêng giữa rừng cát Bình Thuận.',
    sections: [
      {
        heading: '1. Chinh phục Núi Chứa Chan: "Đệ Nhị Thiên Sơn" Nam Bộ hùng vĩ',
        paragraphs: [
          'Núi Chứa Chan (núi Gia Lào) thuộc tỉnh Đồng Nai là ngọn núi cao thứ hai ở Nam Bộ với độ cao 837m so với mực nước biển. Ngọn núi sở hữu thảm thực vật phong phú, rừng cây xanh ngắt và bầu không khí mát mẻ quanh năm, trở thành điểm đến lý tưởng cho du khách muốn tìm về thiên nhiên trong lành.',
          'Hệ thống cáp treo hiện đại sẽ đưa du khách lướt êm qua những triền rừng xanh mướt, ngắm nhìn toàn cảnh cánh đồng bao la bên dưới. Điểm nhấn linh thiêng bậc nhất trên núi là chùa Bửu Quang tọa lạc ở lưng chừng trời, nép mình dưới những hang đá tự nhiên kỳ vĩ cùng "Cây đa 3 gốc một ngọn" thần bí được người dân chiêm bái cầu bình an, may mắn.'
        ]
      },
      {
        heading: '2. Viếng Dinh Thầy Thím La Gi: Nét đẹp văn hóa tâm linh miền duyên hải',
        paragraphs: [
          'Rời Đồng Nai, hành trình đưa du khách đến thị xã La Gi, tỉnh Bình Thuận để viếng cụm di tích lịch sử - văn hóa Dinh Thầy Thím nép mình giữa rừng dầu bạt ngàn. Nơi đây gắn liền với truyền thuyết cảm động về đôi vợ chồng đạo sĩ giàu lòng nhân ái, luôn bốc thuốc cứu người nghèo và giúp đỡ ngư dân vượt qua phong ba bão táp.',
          'Kiến trúc Dinh Thầy Thím mang đậm phong cách cung đình triều Nguyễn với nghệ thuật điêu khắc gỗ tinh xảo, mái ngói âm dương uốn cong đắp nổi hình tượng rồng phụng. Không gian thanh tịnh, trầm hương nghi ngút và tiếng chuông đồng ngân vang mang lại cảm giác bình tâm lạ kỳ sau những ngày làm việc căng thẳng.'
        ]
      },
      {
        heading: '3. Thưởng thức đặc sản địa phương và lời khuyên chuẩn bị',
        paragraphs: [
          'Tại khu vực chân núi Chứa Chan, du khách đừng quên thưởng thức món bánh xèo rau rừng độc đáo và chuối hột ngâm mật ong rừng. Khi về vùng biển La Gi, hãy thưởng thức các món hải sản tươi sống giá bình dân như cá đục nướng mọi, gỏi cá mai hay chả lụi La Gi giòn rụm.',
          'Vì chuyến đi mang tính chất hành hương tâm linh kết hợp ngắm cảnh, du khách nên mặc trang phục kín đáo, lịch sự khi vào đền chùa. Chuẩn bị mũ rộng vành, kem chống nắng và một đôi giày có độ ma sát tốt để thuận tiện đi bộ trên những bậc thang đá.'
        ]
      }
    ]
  },
  {
    tourId: 4,
    title: 'An Giang: Miền đất Thất Sơn huyền bí Châu Đốc, Núi Cấm và hồ Tà Pạ',
    desc: 'Hành trình khám phá vùng đất linh thiêng An Giang: Chiêm bái Miếu Bà Chúa Xứ Núi Sam nức tiếng, chinh phục đỉnh Núi Cấm sương mờ và ngắm bức tranh đồng lúa Tà Pạ tuyệt đẹp từ ngôi chùa Khmer cổ.',
    sections: [
      {
        heading: '1. Châu Đốc linh thiêng: Chiêm bái Miếu Bà Chúa Xứ Núi Sam',
        paragraphs: [
          'Miếu Bà Chúa Xứ Núi Sam tại thành phố Châu Đốc là trung tâm hành hương tâm linh lớn nhất vùng Tây Nam Bộ, thu hút hàng triệu lượt du khách thập phương mỗi năm. Tọa lạc uy nghiêm dưới chân núi Sam, miếu Bà mang kiến trúc hình chữ "Quốc", mái ngói tam cấp lợp ngói đại ống màu xanh ngọc bích, các góc mái vút cong tựa hình thuyền rồng.',
          'Tượng Bà Chúa Xứ bằng đá sa thạch hàng trăm năm tuổi ngự trên tòa sen tôn nghiêm. Đến đây, du khách thành kính dâng lễ vật, thắp nén nhang cầu xin quốc thái dân an, gia đạo êm ấm và công việc hanh thông. Bên cạnh Miếu Bà, bạn còn có thể viếng Lăng Thoại Ngọc Hầu và Chùa Tây An cổ kính để hiểu thêm về công cuộc khai hoang mở cõi phương Nam.'
        ]
      },
      {
        heading: '2. Chinh phục Núi Cấm (Thiên Cấm Sơn) – Nóc nhà huyền thoại miền Tây',
        paragraphs: [
          'Được ví như "Đà Lạt của đồng bằng sông Cửu Long", Núi Cấm sừng sững với độ cao hơn 710m sở hữu khí hậu se lạnh trong lành quanh năm. Ngồi trên cabin cáp treo băng qua rừng cây bạt ngàn, du khách sẽ chiêm ngưỡng toàn cảnh hồ Thanh Long xanh ngắt và dòng suối Bạc uốn lượn bên dưới.',
          'Trên đỉnh núi, tượng Phật Di Lặc khổng lồ cao 33,6m nặng gần 1.700 tấn với nụ cười từ bi rạng rỡ ngự trên đồi cao bên cạnh hồ Thủy Liêm sương khói mờ ảo. Không gian tĩnh lặng ngát hương sen của Chùa Vạn Linh với tòa tháp 9 tầng uy nghiêm mang lại cảm giác thanh thản, thoát tục.'
        ]
      },
      {
        heading: '3. Hồ Tà Pạ và nét đẹp văn hóa chùa Khmer Tri Tôn',
        paragraphs: [
          'Hồ Tà Pạ được mệnh danh là "tuyệt tình cốc" của miền Tây, hình thành từ vết tích khai thác đá với làn nước trong vắt phẳng lặng đổi màu theo ánh nắng. Ngay phía trên đồi là chùa Tà Pạ (chùa Chưn-Knum) – ngôi chùa Phật giáo Nam tông Khmer cổ kính mang lối kiến trúc đền tháp tinh xảo, mái nhọn nhiều tầng và tượng thần rắn Naga uốn lượn.',
          'Từ lan can chùa, phóng tầm mắt ra xa là cánh đồng Tà Pạ trải dài ngút ngàn với những hàng thốt nốt vươn cao kiêu hãnh trên nền trời xanh biếc. Thưởng thức một ly nước thốt nốt ngọt lịm kèm cơm thốt nốt giòn dẻo sẽ xua tan mọi mệt nhọc của chuyến đi.'
        ]
      }
    ]
  },
  {
    tourId: 5,
    title: 'Khám phá sáu tỉnh miền Tây: Mỹ Tho – Bến Tre – Cần Thơ – Cà Mau – Bạc Liêu – Sóc Trăng',
    desc: 'Một hải trình sâu rộng và trọn vẹn xuôi dòng Cửu Long qua 6 tỉnh thành, chạm mốc tọa độ địa đầu cực Nam Đất Mũi, hòa mình vào chợ nổi Cái Răng và lắng nghe điệu đờn ca tài tử phương Nam.',
    sections: [
      {
        heading: '1. Sông nước Tiền Giang – Bến Tre: Nghe đờn ca tài tử và chèo xuồng ba lá',
        paragraphs: [
          'Hành trình khởi đầu bằng việc ngồi thuyền máy lướt sóng sông Tiền ngắm tứ linh cồn Long – Lân – Quy – Phụng. Cập bến đất cù lao Bến Tre, du khách được chuyển sang những chiếc xuồng ba lá mộc mạc do các cô gái miền Tây mặc áo bà ba khua chèo luồn lách dưới rặng dừa nước rợp bóng mát.',
          'Ghé thăm lò kẹo dừa truyền thống bốc khói thơm nức, nhâm nhi tách trà mật ong phấn hoa ấm nóng và lắng nghe những giai điệu đờn ca tài tử Nam Bộ ngân vang giữa vườn cây ăn trái sum suê trĩu quả là mở đầu không thể trọn vẹn hơn.'
        ]
      },
      {
        heading: '2. Tây Đô Cần Thơ: Nhịp sống bồng bềnh rạng đông chợ nổi Cái Răng',
        paragraphs: [
          'Đến đất Cần Thơ gạo trắng nước trong, trải nghiệm thức dậy từ 5 giờ sáng đón bình minh trên sông Hậu để đến với chợ nổi Cái Răng là nét văn hóa độc đáo nhất. Hàng trăm ghe thuyền tụ hội trên mặt sông buôn bán đủ loại nông sản, treo sản phẩm lên cây bẹo bằng tre đầu mũi thuyền thay cho biển hiệu.',
          'Ngồi lắc lư trên ghe thưởng thức một tô bún nước lèo hay hủ tiếu nóng hổi, uống ly cà phê kho thơm phức và trò chuyện cùng những người thương hồ hồn hậu, mến khách sẽ đem lại cảm xúc bồi hồi khó tả.'
        ]
      },
      {
        heading: '3. Chạm mốc Tọa độ Quốc gia Đất Mũi Cà Mau và dinh thự Công tử Bạc Liêu',
        paragraphs: [
          'Xuôi về cực Nam của Tổ quốc, du khách sẽ băng qua những cánh rừng đước ngập mặn bao la của vườn quốc gia Mũi Cà Mau để chạm tay vào Cột mốc tọa độ Quốc gia GPS 0001 và biểu tượng con tàu no gió hướng ra biển lớn. Đứng tại mũi đất thiêng liêng, nơi ngắm mặt trời mọc ở biển Đông và lặn ở biển Tây trên cùng một địa danh là niềm tự hào của mọi người con đất Việt.',
          'Trên đường về, ghé thăm thành phố Bạc Liêu để chiêm ngưỡng Tòa dinh thự Công tử Bạc Liêu xây dựng theo phong cách kiến trúc Pháp cổ lộng lẫy từ đầu thế kỷ 20, lắng nghe những giai thoại ly kỳ về sự giàu có nức tiếng của cậu Ba Huy một thời vang bóng.'
        ]
      },
      {
        heading: '4. Sắc màu văn hóa Khmer Sóc Trăng: Chùa Dơi và Chùa Chén Kiểu',
        paragraphs: [
          'Điểm dừng chân cuối cùng là xứ sở Sóc Trăng với nền văn hóa giao thoa Kinh – Hoa – Khmer rực rỡ. Chùa Dơi (chùa Mahatup) cổ kính nổi tiếng với bầy dơi quạ hàng ngàn con treo mình ngủ ngày trên các tán cây cổ thụ trong khuôn viên chùa.',
          'Bên cạnh đó, Chùa Chén Kiểu (chùa Sà Lôn) gây ấn tượng mạnh bởi bức tường và các cột tháp được ốp thủ công tỉ mỉ từ hàng vạn mảnh chén, đĩa sứ vỡ đầy màu sắc hoa văn, tạo nên một tuyệt tác kiến trúc mỹ thuật dân gian độc nhất vô nhị.'
        ]
      }
    ]
  },
  {
    tourId: 6,
    title: 'Đà Lạt bốn ngày ba đêm: Đồi hoa cẩm tú cầu, thác Datanla và đêm lạnh phố sương mù',
    desc: 'Hành trình nghỉ dưỡng lãng mạn tại xứ sở sương mù Đà Lạt: Thả hồn giữa biển hoa cẩm tú cầu bạt ngàn, trải nghiệm trượt thác Datanla ngoạn mục và sưởi ấm tâm hồn bên bếp than hồng chợ đêm.',
    sections: [
      {
        heading: '1. Rực rỡ sắc hoa phố núi: Đồi Cẩm Tú Cầu và Quảng trường Lâm Viên',
        paragraphs: [
          'Khí hậu mát mẻ quanh năm cùng thổ nhưỡng phì nhiêu biến Đà Lạt thành thiên đường của ngàn loài hoa khoe sắc. Đồi hoa cẩm tú cầu Trại Mát rộng hàng héc ta trải dài theo triền dốc thoải, những đóa hoa khổng lồ đổi màu diệu kỳ từ xanh ngọc, trắng tinh khôi sang tím nhạt dưới ánh nắng mai là phông nền chụp ảnh tuyệt mỹ cho du khách.',
          'Trở về trung tâm thành phố, Quảng trường Lâm Viên bên bờ hồ Xuân Hương thơ mộng nổi bật với hai công trình kiến trúc kính biểu tượng: Bông hoa Dã Quỳ khổng lồ kiêu hãnh và Nụ hoa Atiso xanh biếc soi bóng nước lung linh khi thành phố lên đèn.'
        ]
      },
      {
        heading: '2. Thác Datanla hùng vĩ và hệ thống máng trượt uốn lượn xuyên rừng thông',
        paragraphs: [
          'Nằm cách trung tâm khoảng 5km, thác Datanla đổ ầm ầm qua nhiều thềm đá tung bọt trắng xóa giữa đại ngàn thông xanh nguyên sinh. Điểm cuốn hút nhất tại đây là hệ thống máng trượt xe băng rừng dài nhất Đông Nam Á với chiều dài hơn 2.400m.',
          'Ngồi trên xe trượt tự điều chỉnh tốc độ, lướt vèo vèo qua những khúc cua uốn lượn quanh co sườn đồi, hít căng lồng ngực mùi thơm ngai ngái của lá thông và cảm nhận luồng gió lạnh mơn man da thịt sẽ mang đến cảm giác phấn khích tột cùng cho những ai yêu thích phiêu lưu.'
        ]
      },
      {
        heading: '3. Đà Lạt về đêm: Bánh tráng nướng chợ đêm và quán cà phê view thung lũng đèn',
        paragraphs: [
          'Khi sương đêm buông dày và nhiệt độ hạ xuống dưới 15 độ C, chợ đêm Đà Lạt (chợ Âm Phủ) trở thành tâm điểm nhộn nhịp. Quây quần bên gánh hàng rong nướng bánh tráng mỡ hành giòn rụm, nhâm nhi ly sữa đậu nành nóng hổi kèm bánh su kem béo ngậy là thú vui bình dị gây thương nhớ.',
          'Kết thúc một ngày hoàn hảo bằng việc ghé một quán cà phê lưng chừng đồi dốc tại Trại Mát, phóng tầm mắt ngắm thung lũng nhà lồng bừng sáng rực rỡ trong đêm như hàng vạn đốm đom đóm thắp sáng cả một vùng trời phố núi mộng mơ.'
        ]
      }
    ]
  },
  {
    tourId: 7,
    title: 'Đảo Nam Du: Thiên đường biển hoang sơ với làn nước trong vắt như pha lê',
    desc: 'Rời xa khói bụi thành phố để đắm chìm trong vẻ đẹp nguyên sơ của quần đảo Nam Du – viên ngọc thô của vịnh Thái Lan với Bãi Cây Mến dừa nghiêng, Hòn Mấu cát trắng mịn và trải nghiệm câu cá ngắm san hô.',
    sections: [
      {
        heading: '1. Bãi Cây Mến: Vịnh biển êm đềm với rặng dừa trăm tuổi ngả bóng',
        paragraphs: [
          'Nằm trên Hòn Lớn – đảo lớn nhất của quần đảo Nam Du thuộc tỉnh Kiên Giang, Bãi Cây Mến được mệnh danh là bãi tắm đẹp nhất với bờ cát trắng mịn thoai thoải, bao bọc bởi vịnh biển hình cánh cung phẳng lặng không chút gợn sóng.',
          'Hàng dừa xanh cổ thụ nghiêng mình che mát rượi bờ biển, nước biển ở đây trong vắt đến mức đứng trên bờ có thể nhìn rõ từng đàn cá nhỏ tung tăng bơi lội dưới làn nước ngọc bích. Nằm dài trên võng đu đưa dưới bóng dừa, nghe tiếng sóng vỗ rì rào và nhấp ngụm nước dừa mát lịm là cảm giác thảnh thơi hiếm có.'
        ]
      },
      {
        heading: '2. Tour cano khám phá Hòn Mấu và lặn ngắm san hô tại Hòn Hai Bờ Đập',
        paragraphs: [
          'Một ngày tuyệt vời tại Nam Du bắt đầu bằng việc lên tàu gỗ hoặc cano cao tốc lướt sóng ra khơi khám phá các hòn đảo vệ tinh. Hòn Mấu quyến rũ với Bãi Chướng cát mịn như nhung và Bãi Đá Đen với hàng ngàn viên đá tròn nhẵn bóng lấp lánh dưới ánh mặt trời.',
          'Tại khu vực Hòn Hai Bờ Đập, tàu neo đậu cho du khách mặc áo phao, đeo kính lặn úp mặt xuống nước ngắm nhìn rạn san hô tự nhiên đa sắc màu và những chú cá hề bơi lội quanh hải quỳ. Du khách còn được tự tay câu cá biển và thưởng thức món cháo nhum biển nóng hổi thơm nức ngay trên boong tàu.'
        ]
      },
      {
        heading: '3. Chinh phục hải đăng Nam Du và thưởng thức tiệc hải sản tươi sống',
        paragraphs: [
          'Chạy xe máy dọc theo con đường quanh đảo uốn lượn lưng chừng núi lên ngọn Hải đăng Nam Du ở độ cao hơn 300m so với mực nước biển, bạn sẽ được thưởng ngoạn bức tranh toàn cảnh 21 hòn đảo lớn nhỏ nhấp nhô giữa đại dương bao la.',
          'Buổi tối trên bờ kè bến cảng, hãy thưởng thức bữa tiệc hải sản tươi rói vừa đánh bắt về: cá xương xanh nướng bẹ chuối thơm phức cuốn bánh tráng rau rừng, mực trứng hấp gừng giòn ngọt và ốc nón xào tỏi thơm lừng với giá cả cực kỳ bình dân.'
        ]
      }
    ]
  },
  {
    tourId: 8,
    title: 'Vũng Tàu một ngày: Đổi gió tắm biển Bãi Sau, check-in Mũi Nghinh Phong và nạp trọn năng lượng',
    desc: 'Hành trình một ngày đổi gió nhanh chóng và tiện lợi từ TP.HCM: Tắm biển Bãi Sau lộng gió, check-in Cổng Trời Mũi Nghinh Phong, viếng Tượng Chúa Kito và thưởng thức hải sản tươi ngon.',
    sections: [
      {
        heading: '1. Đón bình minh Bãi Sau và tắm biển sảng khoái',
        paragraphs: [
          'Chỉ mất khoảng 2 giờ chạy xe cao tốc từ TP.HCM, thành phố biển Vũng Tàu mở ra trước mắt với bờ biển dài đầy nắng gió. Bãi Sau (bãi Thùy Vân) với dải cát phẳng mịn thoai thoải và những đợt sóng biển dạt dào là nơi lý tưởng để đắm mình vào làn nước mát rượi buổi sớm mai.',
          'Sau khi tắm biển, tản bộ trên công viên bờ biển rợp bóng mát cây bàng biển và nhâm nhi ly cà phê sáng ngắm những đoàn thuyền đánh cá trở về bến là khởi đầu tràn đầy năng lượng cho ngày cuối tuần.'
        ]
      },
      {
        heading: '2. Mũi Nghinh Phong và Tượng Chúa Kito dang tay trên đỉnh Núi Nhỏ',
        paragraphs: [
          'Mũi Nghinh Phong – dải đất vươn dài ra biển đón gió suốt bốn mùa – nổi tiếng với chiếc "Cổng Trời" màu vàng cam rực rỡ mở ra khung cảnh biển trời bao la bát ngát. Đứng tại mỏm đá lộng gió, bạn có thể chiêm ngưỡng trọn vẹn Hòn Bà uy nghiêm giữa sóng nước trùng khơi.',
          'Tiếp tục hành trình, hãy thử thách bản thân vượt qua gần 1.000 bậc thang rợp bóng cây xanh để lên viếng Tượng Chúa Kito Vua cao 32m trên đỉnh Núi Nhỏ. Bước vào trong lòng tượng và leo lên hai bên cánh tay tượng, bạn sẽ được phóng tầm mắt ngắm toàn cảnh 360 độ non nước hữu tình của thành phố biển Vũng Tàu.'
        ]
      },
      {
        heading: '3. Thưởng thức bánh khọt giòn rụm và buffet hải sản tươi sống',
        paragraphs: [
          'Đến Vũng Tàu không thể bỏ qua món bánh khọt nóng hổi giòn rụm nhân tôm tươi rắc bột tôm cháy vàng ươm ăn kèm đu đủ bào sợi, rau sống và nước mắm chua ngọt. Bữa trưa buffet hải sản tươi sống với tôm nướng, mực hấp, hào nướng mỡ hành và lẩu cá đuối măng chua đậm đà sẽ làm hài lòng mọi tín đồ ẩm thực.',
          'Trước khi quay về TP.HCM vào buổi chiều, hãy ghé chợ đêm hải sản hoặc các vựa cá uy tín mua ghẹ hấp, mực một nắng và bánh bông lan trứng muối chà bông trứ danh về làm quà cho gia đình.'
        ]
      }
    ]
  },
  {
    tourId: 9,
    title: 'Phú Yên – Quy Nhơn: Bản tình ca của biển xanh, Kỳ Co – Eo Gió và Tháp Nghinh Phong',
    desc: 'Hành trình kết nối hai miền biển duyên hải Nam Trung Bộ tuyệt đẹp: Chiêm ngưỡng kỳ quan Gành Đá Đĩa Phú Yên, ngắm hoàng hôn rực lửa tại Eo Gió và lặn ngắm san hô tại thiên đường biển Kỳ Co.',
    sections: [
      {
        heading: '1. Xứ sở hoa vàng cỏ xanh Phú Yên: Gành Đá Đĩa và Mũi Điện đón bình minh',
        paragraphs: [
          'Phú Yên chào đón du khách bằng vẻ đẹp hoang sơ, mộc mạc làm say đắm lòng người. Gành Đá Đĩa – kỳ quan địa chất độc nhất vô nhị của Việt Nam – nổi bật với hàng chục ngàn cột đá bazan hình lục giác màu đen tuyền xếp chồng khít lên nhau như một tổ ong khổng lồ vươn mình ra biển khơi đón từng đợt sóng bạc đầu.',
          'Tại Mũi Điện (Mũi Đại Lãnh), du khách sẽ được đứng dưới chân ngọn hải đăng cổ hơn 100 năm tuổi đón những tia nắng bình minh đầu tiên trên đất liền Việt Nam. Bãi Môn bên cạnh với dải cát trắng thoai thoải nép mình bên con suối nước ngọt chảy róc rách ra biển tạo nên khung cảnh thơ mộng khó nơi nào sánh kịp.'
        ]
      },
      {
        heading: '2. Tháp Nghinh Phong: Biểu tượng kiến trúc đương đại vươn tầm thế giới',
        paragraphs: [
          'Tọa lạc ngay quảng trường trung tâm thành phố Tuy Hòa, Tháp Nghinh Phong lấy cảm hứng từ truyền thuyết bọc trăm trứng mẹ Âu Cơ và kiến trúc khối đá Gành Đá Đĩa. Hai tòa tháp đá sừng sững cao vút giữa bờ biển lộng gió, ở giữa là khe gió hẹp tạo nên những âm thanh vi vu độc đáo của gió biển.',
          'Khi màn đêm buông xuống, công nghệ chiếu sáng nghệ thuật 3D mapping biến tháp Nghinh Phong thành một sân khấu ánh sáng lung linh rực rỡ bên bờ biển, là điểm check-in không thể bỏ lỡ của mọi du khách.'
        ]
      },
      {
        heading: '3. Quy Nhơn: Thiên đường biển đảo Kỳ Co và hoàng hôn tráng lệ Eo Gió',
        paragraphs: [
          'Vượt qua cầu Thị Nại dài bắc qua đầm biển, du khách đến với xã đảo Nhơn Lý (Quy Nhơn). Bãi biển Kỳ Co hiện ra như một Maldives thu nhỏ với dải cát trắng hình trăng khuyết và làn nước biển trong vắt chuyển màu từ xanh ngọc bích sang xanh thẫm.',
          'Buổi chiều tà, ghé thăm Eo Gió – con đường đi bộ ven biển uốn lượn lưng chừng núi với hàng rào gỗ tuyệt đẹp. Đứng trên vách đá sừng sững ngắm mặt trời đỏ ối dần chìm xuống sau những rặng núi đá kỳ vĩ và những con sóng bạc vỗ vào bờ đá mang lại trải nghiệm ngắm hoàng hôn lãng mạn bậc nhất miền Trung.'
        ]
      },
      {
        heading: '4. Dấu ấn văn hóa Chămpa và ẩm thực hải sản miền duyên hải',
        paragraphs: [
          'Bên cạnh cảnh sắc thiên nhiên, Bình Định còn là cái nôi văn hóa Chămpa rực rỡ với quần thể Tháp Bánh Ít và Tháp Đôi trầm mặc rêu phong giữa lòng thành phố, mang đậm phong cách kiến trúc điêu khắc gạch nung bí truyền.',
          'Chuyến đi sẽ càng thêm trọn vẹn với các món đặc sản nức tiếng: bánh xèo tôm nhảy giòn tan, bún chả cá Quy Nhơn ngọt thanh từ nước luộc xương cá thu, mắt cá ngừ đại dương hầm thuốc bắc béo ngậy và tré rơm Bình Định chua giòn độc đáo.'
        ]
      }
    ]
  },
  {
    tourId: 10,
    title: 'Bangkok – Pattaya: Sắc màu rực rỡ từ phố thị phồn hoa đến biển đảo nhiệt đới',
    desc: 'Hành trình 5 ngày 4 đêm đầy ắp trải nghiệm tại xứ sở Chùa Vàng Thái Lan: Đắm mình trong làn nước trong xanh Đảo San Hô Pattaya, ngắm toàn cảnh thành phố từ Baiyoke Sky và viếng chùa Phật Vàng linh thiêng.',
    sections: [
      {
        heading: '1. Pattaya: Thành phố giải trí không ngủ và Đảo San Hô Coral rực rỡ',
        paragraphs: [
          'Cách thủ đô Bangkok khoảng 2 giờ xe chạy, thành phố biển Pattaya đón chào du khách bằng không khí tiệc tùng sôi động và nhịp sống về đêm náo nhiệt. Buổi sáng, cano cao tốc rẽ sóng đưa đoàn ra Đảo San Hô (Coral Island – Koh Larn) với làn nước biển trong vắt màu ngọc lam.',
          'Tại đây, du khách có thể thỏa thích tham gia các trò chơi cảm giác mạnh trên biển như dù lượn bay trên không trung, lái mô tô nước mạo hiểm, đi bộ dưới đáy biển ngắm rạn san hô (Seawalker) hoặc đơn giản là nằm thư giãn dưới những rặng phi lao xanh rì rào.'
        ]
      },
      {
        heading: '2. Chiêm bái Trân Bảo Phật Sơn dát vàng và Chùa Thuyền Wat Yannawa',
        paragraphs: [
          'Điểm nhấn tâm linh độc đáo tại Pattaya là ngọn núi Trân Bảo Phật Sơn (Khao Chee Chan) – bức tượng Phật Thích Ca Mâu Ni ngồi tọa thiền khổng lồ cao 130m được khắc laser tỉ mỉ lên vách núi đá vôi sừng sững và dát kín bằng 999kg vàng ròng 24K để mừng 50 năm ngày trị vì của Quốc vương Rama IX.',
          'Trở về Bangkok, du khách ghé thăm Chùa Thuyền Wat Yannawa với hình dáng chiếc thuyền buồm Trung Hoa cổ kính bằng bê tông độc nhất vô nhị bên bờ sông Chao Phraya, chiêm bái và thỉnh những viên xá lợi Phật linh thiêng cầu bình an cho gia đạo.'
        ]
      },
      {
        heading: '3. Bangkok hoa lệ: Chiêm bái Chùa Phật Vàng và ngắm thành phố từ Baiyoke Sky',
        paragraphs: [
          'Giữa lòng khu phố người Hoa Chinatown sầm uất, Chùa Phật Vàng (Wat Traimit) lưu giữ bảo vật vô giá: Tượng Phật đúc bằng vàng khối nguyên chất nặng 5,5 tấn từ thời kỳ Sukhothai cổ đại tỏa ánh hào quang linh thiêng tôn nghiêm.',
          'Bữa trưa buffet quốc tế hàng trăm món hải sản và ẩm thực Á - Âu tại tầng cao của tòa nhà chọc trời Baiyoke Sky cao 86 tầng mang đến tầm nhìn toàn cảnh 360 độ ngoạn mục ngắm nhìn những xa lộ trên cao và những tòa tháp hiện đại của thủ đô Bangkok.'
        ]
      },
      {
        heading: '4. Du thuyền sông Chao Phraya và thiên đường mua sắm IconSiam',
        paragraphs: [
          'Buổi chiều tà, du khách lên thuyền dạo quanh dòng sông mẹ Chao Phraya lịch sử, ngắm nhìn ngôi chùa Wat Arun (Chùa Bình Minh) lấp lánh ánh gốm sứ bên bờ sông và trải nghiệm thả bánh mì cho đàn cá tra tự nhiên nổi lên dày đặc.',
          'Kết thúc chuyến đi bằng việc thỏa sức mua sắm tại siêu trung tâm thương mại IconSiam hoa lệ với khu chợ nổi trong nhà SookSiam tái hiện sinh động văn hóa ẩm thực và làng nghề truyền thống 4 miền đất nước Thái Lan.'
        ]
      }
    ]
  },
  {
    tourId: 12,
    title: 'Hà Nội – Hạ Long – Ninh Bình: Hành trình di sản thiên nhiên và văn hóa ngàn năm',
    desc: 'Hành trình 4 ngày 3 đêm kết nối tinh hoa miền Bắc: Dạo bước 36 phố phường ngàn năm văn hiến, du thuyền lướt giữa kỳ quan thế giới Vịnh Hạ Long và chèo thuyền giữa non nước Tràng An hữu tình.',
    sections: [
      {
        heading: '1. Hà Nội ba mươi sáu phố phường: Lắng đọng hồn thiêng kinh kỳ',
        paragraphs: [
          'Thủ đô Hà Nội đón chào du khách với vẻ đẹp cổ kính rêu phong xen lẫn nhịp sống hiện đại. Trái tim của thủ đô là Hồ Gươm (Hồ Hoàn Kiếm) xanh trong với Tháp Rùa soi bóng, Cầu Thê Húc đỏ son uốn cong dẫn vào Đền Ngọc Sơn uy nghiêm cổ kính.',
          'Ngồi trên chuyến xe điện tản bộ vòng quanh 36 phố phường rợp bóng cây cổ thụ: Hàng Gai, Hàng Đào, Hàng Mã rực rỡ sắc màu, viếng Lăng Chủ tịch Hồ Chí Minh, Chùa Một Cột với kiến trúc hoa sen độc đáo và Văn Miếu Quốc Tử Giám – trường đại học đầu tiên của Việt Nam ghi dấu truyền thống hiếu học ngàn năm.'
        ]
      },
      {
        heading: '2. Du thuyền giữa Vịnh Hạ Long: Kỳ quan thiên nhiên thế giới',
        paragraphs: [
          'Rời Hà Nội, du khách đến với Vịnh Hạ Long – di sản thiên nhiên thế giới được UNESCO công nhận với gần 2.000 hòn đảo đá vôi nhấp nhô giữa làn nước xanh màu lục bảo. Du thuyền sang trọng lướt êm qua Hòn Trống Mái biểu tượng, Hòn Đỉnh Hương và Đảo Ti Tốp.',
          'Khám phá Hang Sửng Sốt – hang động rộng lớn và lộng lẫy bậc nhất vịnh với hàng ngàn khối nhũ đá rủ xuống lấp lánh muôn hình vạn trạng dưới ánh đèn nghệ thuật. Chinh phục đỉnh núi Ti Tốp để phóng tầm mắt ngắm toàn cảnh vịnh biển tráng lệ từ trên cao là khoảnh khắc đắt giá nhất của chuyến đi.'
        ]
      },
      {
        heading: '3. Non nước Tràng An – Ninh Bình và đỉnh Hang Múa ngoạn mục',
        paragraphs: [
          'Quần thể danh thắng Tràng An hiện ra như một bức tranh thủy mặc non xanh nước biếc hữu tình. Ngồi trên những chiếc thuyền nan do người dân địa phương chèo lái, du khách sẽ luồn lách qua những hang động kỳ bí ngập nước như Hang Sáng, Hang Tối, Hang Nấu Rượu và ghé thăm ngôi đền Trần cổ kính giữa lòng thung lũng cô lập.',
          'Đặc biệt, thử thách leo gần 500 bậc thang đá uốn lượn men theo sườn núi Ngọa Long lên đỉnh Hang Múa sẽ mở ra trước mắt bạn góc nhìn bao trọn toàn cảnh thung lũng Tam Cốc với dòng sông Ngô Đồng uốn lượn giữa những cánh đồng lúa chín vàng ươm rực rỡ.'
        ]
      },
      {
        heading: '4. Thưởng thức đặc sản đất kinh kỳ và cố đô Hoa Lư',
        paragraphs: [
          'Ẩm thực miền Bắc mang phong vị thanh tao tinh tế: bắt đầu ngày mới bằng bát phở bò Hà Nội nóng hổi thơm mùi gừng nướng, thưởng thức chả cá Lã Vọng xèo xèo cùng mắm tôm bồng bềnh hay tách cà phê trứng béo ngậy phố cổ.',
          'Khi về đất Ninh Bình, du khách nhất định phải thử món cơm cháy chấm nước sốt tim cật đậm đà và thịt dê núi nướng ngũ vị ngọt mềm ăn kèm trái sung chát và rau rừng tươi non.'
        ]
      }
    ]
  },
  {
    tourId: 13,
    title: 'Sa Pa – Fansipan: Chạm tay vào nóc nhà Đông Dương giữa biển mây bồng bềnh',
    desc: 'Hành trình chinh phục đỉnh Fansipan hùng vĩ 3.143m, ngắm nhìn thung lũng Mường Hoa tuyệt đẹp, hòa mình vào cuộc sống mộc mạc của đồng bào H\'Mông tại bản Cát Cát và tận hưởng khí hậu ôn đới mát lạnh quanh năm.',
    sections: [
      {
        heading: '1. Bản Cát Cát: Nét đẹp mộc mạc nép mình bên thung lũng Mường Hoa',
        paragraphs: [
          'Cách trung tâm thị trấn Sa Pa khoảng 2km, bản Cát Cát là ngôi làng cổ của đồng bào dân tộc H\'Mông nằm e ấp dưới chân dãy Hoàng Liên Sơn hùng vĩ. Dọc theo con đường bậc đá uốn lượn quanh bản là những nếp nhà gỗ ba gian mộc mạc (nhà trình tường), cối xay nước bằng gỗ kẽo kẹt đêm ngày và những khung cửi dệt vải thổ cẩm rực rỡ sắc màu.',
          'Tại trung tâm bản, dòng thác Tiên Sa trắng xóa đổ ầm ầm hòa cùng tiếng đàn môi, sáo Mông da diết của các chàng trai cô gái trong trang phục truyền thống tinh xảo. Du khách có thể thuê những bộ váy thổ cẩm truyền thống rực rỡ để lưu lại những khung hình tuyệt đẹp bên cầu treo si và vườn hoa cúc bướm rực rỡ.'
        ]
      },
      {
        heading: '2. Chinh phục Nóc nhà Đông Dương Fansipan trên độ cao 3.143m',
        paragraphs: [
          'Điểm nhấn đắt giá nhất của hành trình là hệ thống cáp treo Fansipan ba dây hiện đại nhất thế giới. Cabin cáp treo đưa bạn lướt êm ru qua biển mây bồng bềnh ngút ngàn, thu trọn vào tầm mắt toàn cảnh thung lũng Mường Hoa với những thửa ruộng bậc thang kỳ vĩ uốn lượn theo sườn núi xanh thẳm.',
          'Khi bước ra khỏi ga đến, một quần thể công trình tâm linh kỳ vĩ ẩn hiện giữa làn sương khói mờ ảo: Đại tượng Phật A Di Đà bằng đồng cao 21,5m ngự trên đài sen uy nghiêm, con đường La Hán và tháp Kim Sơn Bảo Thắng. Vượt qua những bậc đá cuối cùng chạm tay vào cột mốc inox ghi dấu độ cao 3.143m giữa trời đất bao la là cảm xúc tự hào vỡ òa không thể nào quên.'
        ]
      },
      {
        heading: '3. Đêm Sa Pa se lạnh: Đồ nướng than hoa và không khí nhộn nhịp phố núi',
        paragraphs: [
          'Khi hoàng hôn buông xuống, thị trấn Sa Pa chìm trong màn sương mù mờ ảo và nhiệt độ hạ sâu mang lại cảm giác se lạnh như mùa đông châu Âu. Khu vực nhà thờ đá cổ Sa Pa xây dựng từ thời Pháp thuộc bừng sáng rực rỡ, trở thành điểm hẹn giao lưu văn hóa của các bạn trẻ và đồng bào địa phương.',
          'Không gì ấm lòng hơn khi tấp vào một góc phố nướng bốc khói nghi ngút, thưởng thức các xiên thịt lợn bản cuốn cải mèo cay nồng, cơm lam dẻo thơm nướng ống nứa, trứng nướng thơm bùi và nhâm nhi ly rượu ngô Bản Phố ấm nồng bên bếp than hồng tí tách.'
        ]
      }
    ]
  },
  {
    tourId: 14,
    title: 'Hà Giang – Cao nguyên đá Đồng Văn: Những cung đèo huyền thoại và dòng Nho Quế biếc xanh',
    desc: 'Hành trình vượt qua những cung đèo ngoạn mục bậc nhất địa đầu Tổ quốc: Chinh phục Dốc Thẩm Mã, Cột cờ Lũng Cú kiêu hãnh, Đèo Mã Pí Lèng hùng vĩ và đi thuyền ngắm hẻm vực Tu Sản sâu nhất Đông Nam Á.',
    sections: [
      {
        heading: '1. Cổng Trời Quản Bạ và dốc Thẩm Mã uốn lượn giữa núi đá',
        paragraphs: [
          'Chuyến đi đưa du khách vượt qua những khúc cua uốn lượn của dốc Bắc Sum để đến với Cổng Trời Quản Bạ ở độ cao hơn 1.500m. Đứng tại trạm dừng chân, mở ra trước mắt là tuyệt tác thiên nhiên Núi Đôi Cô Tiên (núi Đôi Quản Bạ) với hai quả núi hình bầu ngực căng tròn cân đối kỳ lạ giữa thung lũng Tam Sơn trù phú.',
          'Tiếp tục hành trình xuyên qua Cao nguyên đá Đồng Văn – Công viên địa chất toàn cầu UNESCO, dốc Thẩm Mã hiện ra với 9 khúc cua tay áo hiểm trở đẹp như tranh vẽ. Nơi đây từng là nơi người xưa dùng để thử sức những chú ngựa thồ dũng mãnh nhất trước khi tiến sâu vào miền cao nguyên đá.'
        ]
      },
      {
        heading: '2. Cột cờ Lũng Cú thiêng liêng và Dinh thự Vua Mèo vương giả',
        paragraphs: [
          'Chạm tay vào Cột cờ Quốc gia Lũng Cú trên đỉnh núi Rồng ở độ cao 1.470m là khoảnh khắc thiêng liêng nhất của chuyến đi. Lá cờ đỏ sao vàng rộng đúng 54m² tượng trưng cho 54 dân tộc anh em kiêu hãnh tung bay phấp phới giữa nền trời lộng gió biên cương địa đầu Tổ quốc.',
          'Rời Lũng Cú, du khách ghé thăm Dinh thự Họ Vương (Dinh Vua Mèo) tại thung lũng Sà Phìn. Dinh thự cổ hơn 100 năm tuổi của thủ lĩnh Vương Chính Đức được xây dựng bằng đá xanh, gỗ sa mộc quý hiếm kết hợp tinh xảo kiến trúc Trung Hoa, Pháp và truyền thống người Mông với kinh phí tương đương hàng trăm tỷ đồng thời bấy giờ.'
        ]
      },
      {
        heading: '3. Đèo Mã Pí Lèng hùng vĩ và đi thuyền hẻm vực Tu Sản trên sông Nho Quế',
        paragraphs: [
          'Được mệnh danh là "Vua của các con đèo" tại Việt Nam, Đèo Mã Pí Lèng dài hơn 20km trên con đường Hạnh Phúc nối liền Đồng Văn và Mèo Vạc. Vượt qua những cung đường chênh vênh một bên là vách núi đá dựng đứng, một bên là vực sâu hun hút, du khách sẽ được chiêm ngưỡng bức tranh thiên nhiên kỳ vĩ không lời nào tả xiết.',
          'Xuống bến thuyền, du khách sẽ được ngồi thuyền máy xuôi dòng sông Nho Quế màu xanh ngọc bích êm đềm luồn lách qua Hẻm Tu Sản – hẻm vực kiến tạo sâu nhất Đông Nam Á với vách đá thẳng đứng cao tới 800m. Ngước nhìn lên vòm trời xanh lọt thỏm giữa hai vách núi đá khổng lồ là trải nghiệm choáng ngợp trọn đời.'
        ]
      },
      {
        heading: '4. Đêm phố cổ Đồng Văn và phong vị ẩm thực miền cao nguyên đá',
        paragraphs: [
          'Phố cổ Đồng Văn nép mình giữa lòng thung lũng đá với những ngôi nhà trình tường mái ngói âm dương rêu phong cổ kính. Buổi tối, cả khu phố rực rỡ ánh đèn lồng, tiếng khèn Mông rộn rã gọi bạn tình hòa cùng tiếng cười nói của du khách muôn phương.',
          'Ẩm thực Hà Giang mang phong vị hoang sơ đặc trưng: nồi lẩu thắng cố ngựa nóng hổi thơm mùi thảo quả quế hồi, bánh tam giác mạch nướng than bùi béo, cháo ấu tẩu giải cảm đậm đà và bát phở Tráng Kìm sợi mềm dai tráng tay truyền thống.'
        ]
      }
    ]
  },
  {
    tourId: 15,
    title: 'Đà Nẵng – Hội An – Huế: Hành trình di sản miền Trung từ biển xanh đến cung vàng điện ngọc',
    desc: 'Tour trọn gói 4 ngày 3 đêm kết nối ba điểm đến di sản hàng đầu miền Trung: Thỏa sức tắm biển Mỹ Khê Đà Nẵng, thả hoa đăng trên sông Hoài phố cổ Hội An và chiêm bái Đại Nội Cố đô Huế trầm mặc.',
    sections: [
      {
        heading: '1. Đà Nẵng đáng sống: Biển Mỹ Khê cát trắng và Cầu Vàng Bà Nà Hills trên mây',
        paragraphs: [
          'Thành phố biển Đà Nẵng chào đón du khách bằng vẻ đẹp hiện đại, sạch sẽ và người dân thân thiện nồng hậu. Bãi biển Mỹ Khê từng được tạp chí Forbes vinh danh là một trong những bãi biển quyến rũ nhất hành tinh với dải cát trắng mịn màng, sóng êm đềm và làn nước trong xanh chan hòa ánh nắng.',
          'Điểm nhấn không thể bỏ qua là quần thể du lịch Bà Nà Hills ở độ cao gần 1.500m. Du khách sẽ được sải bước trên Cầu Vàng – tuyệt tác kiến trúc vươn tầm quốc tế với đôi bàn tay đá khổng lồ rêu phong nâng đỡ dải lụa vàng uốn lượn giữa lưng chừng mây trời bồng bềnh, dạo bước qua Làng Pháp cổ kính mang phong cách châu Âu thời Trung cổ.'
        ]
      },
      {
        heading: '2. Phố cổ Hội An lung linh sắc đèn lồng bên dòng sông Hoài',
        paragraphs: [
          'Chỉ cách Đà Nẵng 30km, phố cổ Hội An – Di sản văn hóa thế giới UNESCO – như níu giữ bước chân du khách bởi vẻ đẹp hoài cổ thanh bình. Những mái nhà ngói cổ rêu phong phủ kín hoa giấy rực rỡ, bức tường quét vôi vàng đặc trưng và những con hẻm nhỏ tĩnh lặng.',
          'Ghé thăm Chùa Cầu Nhật Bản cổ kính hơn 400 năm tuổi, Hội quán Phúc Kiến uy nghiêm và Nhà cổ Tấn Ký bảo tồn nguyên vẹn kiến trúc giao thoa Việt - Nhật - Hoa. Khi đêm về, phố cổ cấm xe máy nhường chỗ cho ánh sáng lung linh của hàng ngàn chiếc đèn lồng thủ công. Trải nghiệm ngồi thuyền gỗ thả hoa đăng cầu may trên dòng sông Hoài thơ mộng là kỷ niệm ngọt ngào khó quên.'
        ]
      },
      {
        heading: '3. Cố đô Huế trầm mặc: Đại Nội uy nghiêm và lăng tẩm hoàng gia',
        paragraphs: [
          'Vượt qua hầm Hải Vân hoặc cung đèo Hải Vân đệ nhất hùng quan, hành trình đưa du khách về với đất thần kinh xứ Huế. Quần thể Di tích Cố đô Huế lưu giữ trọn vẹn dấu ấn triều Nguyễn với Đại Nội – Hoàng cung của 13 vị vua triều Nguyễn gồm Ngọ Môn tráng lệ, Điện Thái Hòa dát vàng uy nghiêm và Tử Cấm Thành thâm nghiêm.',
          'Du khách tiếp tục viếng Lăng Khải Định – tuyệt tác kiến trúc đỉnh cao kết hợp tinh xảo giữa văn hóa phương Đông và nghệ thuật ghép sành sứ phương Tây hiện đại, ghé thăm Chùa Thiên Mụ cổ kính soi bóng bên dòng sông Hương thơ mộng nghe tiếng chuông ngân vang chiều tà.'
        ]
      },
      {
        heading: '4. Thiên đường ẩm thực đậm đà bản sắc miền Trung',
        paragraphs: [
          'Ẩm thực miền Trung ghi dấu ấn khó phai nhờ hương vị đậm đà, thơm nồng gia vị. Tại Đà Nẵng, hãy thưởng thức món bánh tráng cuốn thịt heo hai đầu da chấm mắm nêm cay xé lưỡi hay tô mì Quảng ếch thơm lừng.',
          'Đến Hội An, đừng quên thưởng thức tô Cao lầu sợi mì vàng óng dai giòn và ổ bánh mì Phượng nổi danh thế giới. Tại đất Huế, chén chè hẻm thanh ngọt, tô bún bò Huế thơm lừng mùi mắm ruốc và mâm bánh bèo nậm lọc cung đình tinh xảo sẽ làm say đắm mọi thực khách sành ăn.'
        ]
      }
    ]
  },
  {
    tourId: 16,
    title: 'Nam đảo Phú Quốc: Thiên đường nhiệt đới với cáp treo vượt biển và rạn san hô rực rỡ',
    desc: 'Kỳ nghỉ biển đảo 4 ngày 3 đêm tại đảo ngọc Phú Quốc: Thư giãn tại Bãi Sao cát trắng mịn như kem, trải nghiệm cáp treo Hòn Thơm vượt biển dài nhất thế giới và cano khám phá tứ đảo An Thới hoang sơ.',
    sections: [
      {
        heading: '1. Bãi Sao: Dải cát trắng mịn như kem và làn nước ngọc bích phẳng lặng',
        paragraphs: [
          'Nằm ở phía nam của đảo ngọc Phú Quốc, Bãi Sao được mệnh danh là một trong những bãi tắm đẹp nhất Việt Nam với bờ cát trắng muốt mịn màng như kem sữa trải dài hơn 7km hình cánh cung ôm trọn vịnh biển êm đềm.',
          'Nước biển ở Bãi Sao nông và phẳng lặng như mặt gương, sóng chỉ lăn tăn gợn nhẹ an toàn cho cả trẻ nhỏ và người lớn tuổi. Những hàng dừa xanh nghiêng bóng mát rượi bên chiếc xích đu gỗ mộc mạc là tọa độ check-in sống ảo triệu view làm xiêu lòng mọi du khách.'
        ]
      },
      {
        heading: '2. Cáp treo Hòn Thơm: Kỷ lục cáp treo 3 dây vượt biển dài nhất thế giới',
        paragraphs: [
          'Từ thị trấn Hoàng Hôn (Sunset Town) mang đậm kiến trúc Địa Trung Hải rực rỡ sắc màu tại An Thới, du khách bước lên cabin cáp treo Hòn Thơm để bắt đầu hành trình bay lượn trên không trung dài gần 7.900m vượt qua biển khơi bao la.',
          'Từ độ cao hàng trăm mét, bạn sẽ được thu trọn vào tầm mắt bức tranh đại dương bao la với hàng trăm chiếc thuyền đánh cá sắc màu neo đậu tại làng chài An Thới và những hòn đảo nhỏ nhấp nhô giữa làn nước xanh trong. Đến Hòn Thơm, công viên nước Aquatopia với hơn 20 trò chơi hiện đại hàng đầu châu Á sẽ mang đến những giờ phút vui chơi bùng nổ sảng khoái.'
        ]
      },
      {
        heading: '3. Tour cano khám phá tứ đảo hoang sơ và lặn ngắm san hô tự nhiên',
        paragraphs: [
          'Một ngày bùng nổ năng lượng trên biển với chiếc cano cao tốc lướt sóng đưa đoàn khám phá quần đảo An Thới: Hòn Móng Tay hoang sơ ví như Maldives Việt Nam, Hòn Gầm Ghì với vương quốc san hô tự nhiên dày đặc nhiều màu sắc dưới làn nước trong vắt và Hòn Mây Rút Trong với bãi biển cát trắng nước cạn thơ mộng.',
          'Du khách được trang bị áo phao, kính lặn chuyên dụng để thỏa thích bơi lội ngắm những rạn san hô bàn, san hô bắp cải và từng đàn cá biển rực rỡ bơi lượn ngay trước mắt, trải nghiệm dịch vụ đi bộ dưới đáy biển (Seawalker) hoặc chụp ảnh flycam sống ảo từ trên cao.'
        ]
      },
      {
        heading: '4. Ngắm hoàng hôn Sunset Town và thưởng thức hải sản đảo ngọc',
        paragraphs: [
          'Buổi chiều tà, đừng bỏ lỡ khoảnh khắc hoàng hôn nhuộm đỏ rực cả một vùng biển tại Cầu Hôn (Kiss Bridge) – kiệt tác kiến trúc nghệ thuật độc đáo nơi hai nhánh cầu vươn ra biển cách nhau chỉ 30cm.',
          'Đêm về, ghé chợ đêm Phú Quốc hoặc làng chài Hàm Ninh thưởng thức món gỏi cá trích tươi rói cuốn bánh tráng rau rừng chấm nước mắm đậu phộng đậm đà, nhum biển nướng mỡ hành béo ngậy, tôm mũ ni hấp sả và ghẹ Hàm Ninh chắc nịch ngọt lịm.'
        ]
      }
    ]
  },
  {
    tourId: 17,
    title: 'Singapore – Malaysia: Khám phá hai quốc gia hiện đại bậc nhất Đông Nam Á',
    desc: 'Hành trình 5 ngày 4 đêm một chuyến đi hai quốc gia: Chiêm ngưỡng biểu tượng Sư tử biển Merlion và siêu cây Gardens by the Bay tại Singapore, khám phá phố cổ Malacca và Tháp đôi Petronas sừng sững tại Malaysia.',
    sections: [
      {
        heading: '1. Đảo quốc Sư tử Singapore: Kỳ quan xanh giữa lòng đô thị thông minh',
        paragraphs: [
          'Singapore chào đón du khách bằng không gian đô thị xanh - sạch - đẹp chuẩn mực hàng đầu thế giới. Điểm dừng chân biểu tượng đầu tiên là Công viên Sư tử biển Merlion Park bên vịnh Marina, nơi đặt bức tượng nửa sư tử nửa cá đang phun nước ra vịnh biển trước khung cảnh tòa nhà Marina Bay Sands hình con thuyền trên không tráng lệ.',
          'Khám phá Gardens by the Bay – kỳ quan sinh thái nhân tạo rộng hơn 100ha với 18 "Siêu cây" (Supertree) khổng lồ được bao phủ bởi hàng trăm ngàn loài thực vật biểu sinh. Khi đêm xuống, màn trình diễn ánh sáng và âm nhạc Garden Rhapsody biến khu vườn thành một khu rừng thần tiên lộng lẫy đầy mê hoặc.'
        ]
      },
      {
        heading: '2. Thành phố cổ Malacca: Dấu ấn lịch sử giao thoa văn hóa phương Tây',
        paragraphs: [
          'Vượt qua biên giới sang đất nước Malaysia, hành trình đưa du khách đến với thành phố cổ Malacca – di sản văn hóa thế giới bên bờ eo biển lịch sử. Nơi đây lưu giữ trọn vẹn kiến trúc thời kỳ thuộc địa với Quảng trường Hà Lan đỏ rực rỡ, Nhà thờ Thánh Saint Paul cổ kính trên đồi cao và Pháo đài cổ A Famosa xây dựng từ thế kỷ 16.',
          'Dạo bước trên phố đi bộ Jonker Walk nhộn nhịp, ngắm nhìn những ngôi nhà cổ của người Peranakan (Baba Nyonya) và thưởng thức món cơm gà viên Hải Nam dẻo thơm trứ danh mang đến những trải nghiệm văn hóa đa chiều vô cùng sâu sắc.'
        ]
      },
      {
        heading: '3. Kuala Lumpur hoa lệ: Động Batu rực rỡ và Tháp đôi Petronas kiêu hãnh',
        paragraphs: [
          'Thủ đô Kuala Lumpur gây ấn tượng mạnh bởi sự hòa quyện giữa nét truyền thống Hồi giáo và nhịp sống hiện đại. Động Batu – thánh địa Hindu giáo linh thiêng nhất Malaysia – chào đón du khách bằng bức tượng thần Murugan mạ vàng khổng lồ cao 42,7m sừng sững bên cạnh 272 bậc thang cầu vồng rực rỡ sắc màu dẫn vào hang động đá vôi kỳ vĩ.',
          'Biểu tượng kiêu hãnh của Malaysia là Tòa tháp đôi Petronas Twin Towers cao 452m với 88 tầng bằng kính và thép sáng lấp lánh dưới ánh đèn đêm. Cầu nối trên không Skybridge ở tầng 41 và đài quan sát tầng 86 mở ra toàn cảnh hoa lệ của thủ đô về đêm.'
        ]
      },
      {
        heading: '4. Thiên đường ẩm thực đa văn hóa Mã Lai – Sing',
        paragraphs: [
          'Sự giao thoa văn hóa giữa người Mã Lai, Trung Hoa và Ấn Độ tạo nên nền ẩm thực đường phố vô cùng phong phú: thưởng thức tô mì cua sốt ớt Chilli Crab trứ danh Singapore, cơm dừa Nasi Lemak thơm béo bọc lá chuối, mì xào Char Kway Teow bốc khói hay món trà sữa kéo Teh Tarik sủi bọt nghệ thuật ngọt ngào.'
        ]
      }
    ]
  },
  {
    tourId: 18,
    title: 'Seoul – Đảo Nami: Bản tình ca mùa thu lãng mạn xứ sở Kim Chi',
    desc: 'Hành trình khám phá thủ đô Seoul hoa lệ và hòn đảo Nami thơ mộng: Mặc Hanbok dạo bước trong cung điện Gyeongbokgung cổ kính, chụp ảnh cùng hàng cây ngân hạnh vàng rực và ngắm tháp Namsan tình yêu.',
    sections: [
      {
        heading: '1. Cung điện Gyeongbokgung và Làng cổ Bukchon Hanok: Trở về thời đại Joseon',
        paragraphs: [
          'Tọa lạc ngay giữa trung tâm thủ đô Seoul hiện đại, Cung điện Cảnh Phúc Cung (Gyeongbokgung) là cung điện hoàng gia lớn nhất và tráng lệ nhất trong năm đại cung điện triều đại Joseon. Du khách được khoác lên mình bộ trang phục truyền thống Hanbok lộng lẫy để bước qua cổng Quảng Hòa Môn (Gwanghwamun), ngắm nhìn lễ đổi gác trang nghiêm của lính hoàng gia và khám phá Điện Cần Chính nơi thiết triều uy nghiêm.',
          'Cách cung điện không xa là Làng cổ Bukchon Hanok – khu dân cư bảo tồn hàng trăm ngôi nhà truyền thống bằng gỗ và đá có tuổi đời hơn 600 năm. Tản bộ giữa những con dốc hẹp lát đá thanh bình, chiêm ngưỡng mái ngói cong vút cổ kính đối lập với những tòa cao ốc chọc trời phía xa mang lại cảm xúc hoài niệm sâu lắng.'
        ]
      },
      {
        heading: '2. Đảo Nami: Hòn đảo tình yêu ngập tràn sắc vàng ngân hạnh',
        paragraphs: [
          'Nằm cách Seoul khoảng 63km, đảo Nami (Namiseom) được ví như thiên đường tình yêu lãng mạn từng làm say đắm hàng triệu khán giả qua bộ phim truyền hình kinh điển "Bản tình ca mùa đông". Hòn đảo hình bán nguyệt này cấm xe cơ giới, tạo nên không gian thiên nhiên tĩnh lặng và thanh khiết tuyệt đối.',
          'Mùa thu là thời khắc Nami rực rỡ nhất khi những con đường rợp bóng cây ngân hạnh đồng loạt chuyển sang sắc vàng rực óng ả, xen lẫn những hàng phong lá đỏ thắm rụng kín lối đi. Dạo bước dưới hàng cây linh sam cao vút thẳng tắp, hít thở không khí se lạnh và check-in bên bức tượng đồng của hai nhân vật chính là trải nghiệm ngọt ngào khó quên.'
        ]
      },
      {
        heading: '3. Tháp Namsan tình yêu và mua sắm sành điệu tại Myeongdong',
        paragraphs: [
          'Tháp truyền hình N Seoul (Tháp Namsan) tọa lạc trên đỉnh núi Namsan là biểu tượng tình yêu lãng mạn của giới trẻ xứ Hàn. Nơi đây nổi tiếng với hàng rào "Ổ khóa tình yêu" rực rỡ muôn màu, nơi các cặp đôi cùng nhau gắn những chiếc khóa ghi lời nguyện ước gắn kết trọn đời trước khung cảnh toàn cảnh thủ đô Seoul lấp lánh triệu ánh đèn bên dưới.',
          'Sau đó, hòa mình vào không khí mua sắm sầm uất tại khu phố Myeongdong và phố thời trang Dongdaemun với hàng trăm thương hiệu mỹ phẩm, thời trang hàng đầu châu Á và thiên đường ẩm thực đường phố: bánh gạo cay Tteokbokki, chả cá nóng hổi Eomuk, gà rán sốt cay ngọt và dâu tây Hàn Quốc đỏ mọng ngọt lịm.'
        ]
      }
    ]
  },
  {
    tourId: 19,
    title: 'Tokyo – Núi Phú Sĩ: Hành trình chạm vào biểu tượng văn hóa xứ sở Phù Tang',
    desc: 'Hành trình 5 ngày 4 đêm khám phá vẻ đẹp kỳ diệu của đất nước Mặt trời mọc: Chiêm bái ngôi chùa cổ Sensoji tại Tokyo náo nhiệt, ngắm Núi Phú Sĩ soi bóng hồ Kawaguchi và dạo bước trong làng cổ Oshino Hakkai.',
    sections: [
      {
        heading: '1. Tokyo náo nhiệt: Chùa cổ Sensoji Asakusa và biểu tượng Tokyo Skytree',
        paragraphs: [
          'Thủ đô Tokyo chào đón du khách bằng sự kết hợp hoàn hảo giữa công nghệ tương lai hiện đại và truyền thống Thần đạo, Phật giáo nghìn năm. Chùa Sensoji (Asakusa Kannon) là ngôi chùa Phật giáo cổ nhất Tokyo xây dựng từ thế kỷ thứ 7. Bước qua Cổng Sấm (Kaminarimon) với chiếc đèn lồng đỏ khổng lồ nặng gần 700kg, du khách sẽ dạo bước trên con phố mua sắm Nakamise nhộn nhịp bày bán bánh gạo nướng senbei thủ công và đồ lưu niệm truyền thống.',
          'Đối lập với nét cổ kính của Asakusa là Tháp truyền hình Tokyo Skytree cao 634m vươn thẳng lên bầu trời xanh – tháp truyền hình tự đỡ cao nhất thế giới. Đứng từ xa ngắm nhìn ngọn tháp soi bóng xuống dòng sông Sumida thơ mộng mang đến cảm giác choáng ngợp trước sức mạnh kiến trúc hiện đại của Nhật Bản.'
        ]
      },
      {
        heading: '2. Núi Phú Sĩ hùng vĩ soi bóng bên hồ Kawaguchi thơ mộng',
        paragraphs: [
          'Rời xa đô thị nhộn nhịp, hành trình đưa du khách đến khu vực Phú Sĩ Ngũ Hồ dưới chân ngọn Núi Phú Sĩ (Fuji-san) – ngọn núi lửa thiêng liêng cao 3.776m được công nhận là Di sản văn hóa thế giới UNESCO. Hồ Kawaguchi là điểm ngắm núi Phú Sĩ đẹp và tráng lệ nhất với mặt hồ phẳng lặng như gương soi bóng nón núi tuyết phủ trắng xóa quanh năm.',
          'Vào mùa xuân, hàng ngàn cây hoa anh hoa nở rộ bao quanh bờ hồ tạo nên cảnh tượng "Sakura và Phú Sĩ" tuyệt mỹ. Xe đưa đoàn lên Trạm số 5 ở độ cao 2.300m lưng chừng núi để chạm tay vào lớp tuyết trắng tinh khôi và ngắm nhìn biển mây cuồn cuộn bên dưới.'
        ]
      },
      {
        heading: '3. Làng cổ Oshino Hakkai thanh bình và tắm suối khoáng nóng Onsen',
        paragraphs: [
          'Ngay dưới chân núi Phú Sĩ là ngôi làng cổ tích Oshino Hakkai yên bình, nơi còn lưu giữ những nếp nhà gỗ mái rạ truyền thống của nông thôn Nhật Bản xưa. Điểm độc đáo của làng là 8 hồ nước trong vắt như gương soi được nuôi dưỡng từ nguồn nước tuyết tan trên đỉnh núi Phú Sĩ lọc qua các tầng địa chất dung nham suốt hơn 80 năm.',
          'Buổi tối tại khách sạn vùng hồ Kawaguchiko, trải nghiệm ngâm mình trong bồn tắm khoáng nóng thiên nhiên Onsen theo đúng phong tục truyền thống Nhật Bản sẽ xua tan mọi mệt nhọc, giúp phục hồi sức khỏe và làm mịn màng làn da trước khi thưởng thức bữa tiệc Kaiseki truyền thống với bò Wagyu thượng hạng.'
        ]
      }
    ]
  },
  {
    tourId: 20,
    title: 'Bali – Indonesia: Hòn đảo của những vị thần, biển xanh Nusa Dua và ruộng bậc thang Ubud',
    desc: 'Hành trình nghỉ dưỡng thiên đường tại hòn đảo Bali huyền thoại: Đắm mình trong làn nước ấm vịnh Nusa Dua, chiêm ngưỡng hoàng hôn rực lửa bên vách đá đền Uluwatu, xích đu Bali Swing và ngắm đền nước Tanah Lot kỳ bí.',
    sections: [
      {
        heading: '1. Thiên đường biển nhiệt đới Nusa Dua và hoàng hôn đền Uluwatu',
        paragraphs: [
          'Được mệnh danh là "Hòn đảo của những vị thần", Bali mê hoặc du khách toàn cầu bằng thiên nhiên nhiệt đới hoang sơ và nền văn hóa Hindu giáo độc nhất vô nhị. Bán đảo Nusa Dua ở phía nam hòn đảo sở hữu những bãi cát vàng mịn màng, làn nước biển màu ngọc bích ấm áp và các khu nghỉ dưỡng 5 sao đẳng cấp quốc tế.',
          'Vào buổi chiều tà, hãy đến với Đền Uluwatu cổ kính tọa lạc cheo leo trên đỉnh vách đá vôi dựng đứng cao hơn 70m so với Ấn Độ Dương lộng gió. Ngắm nhìn những con sóng khổng lồ tung bọt trắng xóa dưới chân vách đá và hòa mình vào điệu múa lửa Kecak truyền thống dưới ánh hoàng hôn đỏ rực buông xuống đại dương bao la là khoảnh khắc kỳ vĩ bậc nhất Bali.'
        ]
      },
      {
        heading: '2. Trái tim văn hóa Ubud: Ruộng bậc thang Tegallalang và xích đu Bali Swing',
        paragraphs: [
          'Rời miền duyên hải để tiến vào trung tâm hòn đảo, thị trấn Ubud hiện ra như một thiên đường xanh mướt của nghệ thuật, thiền định và yoga. Ruộng bậc thang Tegallalang với hệ thống tưới tiêu Subak truyền thống nghìn năm uốn lượn mềm mại theo các sườn đồi xanh ngắt là kiệt tác nông nghiệp đã được UNESCO công nhận.',
          'Trải nghiệm chiếc xích đu tử thần Bali Swing bay vút lên không trung giữa thung lũng rừng cọ nhiệt đới bao la, lưu lại những bức hình sống ảo để đời với váy dài bay bổng và ghé thăm rừng khỉ nhiệt đới Sacred Monkey Forest linh thiêng rợp bóng cây cổ thụ.'
        ]
      },
      {
        heading: '3. Ngôi đền nước linh thiêng Ulun Danu Beratan và đền Tanah Lot giữa sóng vỗ',
        paragraphs: [
          'Hành trình tiếp tục đưa du khách lên vùng cao nguyên mát lạnh Bedugul để chiêm bái Đền Ulun Danu Beratan – ngôi đền nước linh thiêng tọa lạc bên bờ hồ núi lửa Beratan mây mù bao phủ, in bóng trên tờ tiền 50.000 Rupiah của Indonesia với kiến trúc tháp mái nhiều tầng Meru độc đáo.',
          'Khép lại hành trình bằng chuyến thăm Đền Tanah Lot – biểu tượng tâm linh bất tử của Bali ngự trên một khối đá hoa cương khổng lồ giữa biển khơi. Khi thủy triều dâng cao, ngôi đền hoàn toàn tách biệt như một ốc đảo cô đơn giữa trùng khơi sóng gió gầm thét, tạo nên bức tranh huyền bí đầy mê hoặc lòng người.'
        ]
      }
    ]
  }
];
