import { MOCK_TOURS } from './mockTours';

interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

interface ArticleDraft {
  tourId: number;
  title: string;
  desc: string;
  sections: ArticleSection[];
}

export interface TourBlogArticle {
  id: number;
  tourId: number;
  tourCode: string;
  isDemo: boolean;
  cat: 'kinhNghiem' | 'diaDiem' | 'nuocNgoai';
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
  image: string;
  date: string;
  readTime: string;
  views: string;
  featured: boolean;
  sections: ArticleSection[];
}

// Nội dung biên soạn theo dữ liệu tour trong dự án.
// Không dùng ID bài viết thay cho ID tour.
const drafts: ArticleDraft[] = [
  {
    tourId: 1,
    title:
      'Phượng Hoàng – Trương Gia Giới: từ ánh đèn cổ trấn đến những tầng núi xa',
    desc:
      'Có những chuyến đi hấp dẫn bởi sự đổi cảnh. Từ Ân Thi đến Phượng Hoàng Cổ Trấn rồi Trương Gia Giới, mỗi chặng mở ra một không gian khác: phố, cầu, núi và những khoảng trời rộng.',
    sections: [
      {
        heading: 'Để cổ trấn có thời gian kể chuyện',
        paragraphs: [
          'Hồng Kiều, Cầu Tuyết và Tháp Vạn Danh là những điểm được nhắc trong lịch trình. Thay vì chỉ tìm một góc chụp thật nhanh, hãy dành thời gian quan sát các lớp mái, nhịp người qua cầu và sự thay đổi của cảnh phố.',
          'Một chuyến đi đáng nhớ không nhất thiết phải có thật nhiều ảnh. Đôi khi, một đoạn đường bạn đi cùng người thân hoặc một khoảng dừng yên tĩnh lại là điều ở lại lâu nhất.',
        ],
      },
      {
        heading: 'Đổi nhịp giữa phố cổ và núi rừng',
        paragraphs: [
          'Sau Phượng Hoàng, chương trình chuyển sang Trương Gia Giới và Thiên Môn Sơn. Sự tương phản giữa kiến trúc cổ trấn và cảnh núi là điểm thú vị của tuyến này.',
          'Hành trình có nhiều chặng di chuyển. Chuẩn bị giày đi bộ, hành lý gọn và dành thời gian nghỉ để những ngày cuối vẫn còn hào hứng. Các dịch vụ và lịch tham quan cần đối chiếu với chương trình khởi hành thực tế.',
        ],
      },
    ],
  },
  {
    tourId: 2,
    title: 'Thượng Hải – Ô Trấn: một chuyến đi, hai nhịp sống',
    desc:
      'Một bên là nhịp đô thị, một bên là không gian cổ trấn. Thượng Hải và Ô Trấn tạo nên hành trình dành cho người thích cảm nhận sự tương phản, thay vì chỉ ghé qua những điểm nổi tiếng.',
    sections: [
      {
        heading: 'Giữ một khoảng trống cho Thượng Hải',
        paragraphs: [
          'Dữ liệu tour dành hai đêm tại Thượng Hải. Với quỹ thời gian đó, hãy cân bằng giữa tham quan cùng đoàn và nghỉ ngơi. Không phải khoảng tự do nào cũng cần được lấp đầy bằng mua sắm.',
          'Thử ghi lại những chi tiết nhỏ của thành phố: một góc phố, một dòng người hoặc khung cảnh khi ánh sáng thay đổi. Những quan sát riêng giúp album không chỉ là tập hợp ảnh check-in.',
        ],
      },
      {
        heading: 'Chậm lại khi đến Ô Trấn',
        paragraphs: [
          'Tây Sách Ô Trấn là điểm nhấn trong tên chương trình. Lối đi, mặt nước và các lớp kiến trúc là những yếu tố để bạn khám phá bằng một nhịp thong thả hơn.',
          'Tour được ghi bốn ngày bốn đêm, không phải bốn ngày ba đêm. Hỏi rõ thời gian bay, nhận phòng và lịch tham quan. Nhãn no-shopping cũng cần được đối chiếu với chương trình chi tiết trước khi đặt.',
        ],
      },
    ],
  },
  {
    tourId: 3,
    title: 'Núi Chứa Chan – Dinh Thầy Thím: dành một ngày cho sự bình tâm',
    desc:
      'Không phải chuyến đi nào cũng cần thật xa. Hành trình kết hợp Núi Chứa Chan và Dinh Thầy Thím gợi một ngày đổi nhịp, dành sự chú ý cho cảnh quan và những không gian mang ý nghĩa tinh thần.',
    sections: [
      {
        heading: 'Một chuyến đi không cần vội',
        paragraphs: [
          'Mô tả tour nhắc đến chùa Bửu Quang tại khu vực Gia Lào và Dinh Thầy Thím. Đây là tuyến kết hợp tham quan với chiêm bái, nên trải nghiệm không nằm ở việc hoàn thành càng nhiều hoạt động càng tốt.',
          'Hãy dành một khoảng yên lặng để quan sát không gian và đi theo nhịp của nhóm. Một chuyến đi ngắn vẫn có thể đem lại cảm giác thư thái nếu bạn không liên tục nhìn đồng hồ.',
        ],
      },
      {
        heading: 'Chuẩn bị phù hợp với người đồng hành',
        paragraphs: [
          'Nếu đi cùng người lớn tuổi hoặc trẻ nhỏ, hỏi rõ cách tiếp cận điểm tham quan, quãng đi bộ và thời gian nghỉ. Dữ liệu hiện tại chưa đủ để khẳng định tour có cáp treo hoặc hoạt động leo núi.',
          'Trang phục phù hợp, giọng nói vừa phải và việc tuân thủ biển hướng dẫn giúp chuyến thăm dễ chịu hơn. Giữ hành lý nhẹ và nhớ điểm hẹn trước mỗi khoảng thời gian tự do.',
        ],
      },
    ],
  },
  {
    tourId: 4,
    title: 'An Giang: một khoảng lặng giữa Châu Đốc, Núi Cấm và Tà Pạ',
    desc:
      'Miếu Bà Chúa Xứ, Núi Cấm và chùa Tà Pạ nối nhau trong một hành trình kết hợp chiêm bái và ngắm cảnh. Đây là dịp để bạn đi chậm hơn, thay vì chỉ tìm thêm một nơi để đánh dấu đã đến.',
    sections: [
      {
        heading: 'Bắt đầu bằng một tâm thế thong thả',
        paragraphs: [
          'Miếu Bà Chúa Xứ Núi Sam là điểm được ghi trong chương trình. Khi đến không gian tín ngưỡng, hãy tham quan theo hướng dẫn tại chỗ và tôn trọng sinh hoạt của những người xung quanh.',
          'Không nhất thiết phải có ảnh ở mọi vị trí. Đôi khi điều đáng giữ lại là cảm giác của bạn trong một khoảnh khắc yên tĩnh.',
        ],
      },
      {
        heading: 'Để cảnh quan nối tiếp câu chuyện',
        paragraphs: [
          'Núi Cấm và chùa Tà Pạ mang đến những góc nhìn khác sau điểm dừng ở Châu Đốc. Bạn có thể chú ý đến sự chuyển đổi giữa kiến trúc, cây xanh và đường nét của cảnh vật.',
          'Tour khai báo một ngày một đêm. Cần xác nhận giờ xuất phát và điều kiện nghỉ đêm, không mặc định có một đêm khách sạn. Hành lý vừa đủ sẽ giúp việc di chuyển nhẹ nhàng hơn.',
        ],
      },
    ],
  },
  {
    tourId: 5,
    title: 'Sáu tỉnh miền Tây: gom những câu chuyện sông nước vào một chuyến đi',
    desc:
      'Mỹ Tho, Bến Tre, Cần Thơ, Cà Mau, Bạc Liêu và Sóc Trăng cùng xuất hiện trong tuyến ba ngày hai đêm. Hành trình giống một cuốn sổ nhiều trang, nối cảnh sông nước với những điểm dừng văn hóa.',
    sections: [
      {
        heading: 'Những điểm neo của hành trình',
        paragraphs: [
          'Chợ nổi Cái Răng, Đất Mũi Cà Mau và Nhà công tử Bạc Liêu là ba điểm được nêu rõ trong mô tả. Mỗi nơi mang đến một cách tiếp cận khác: quan sát nhịp sinh hoạt, ghi lại dấu mốc hoặc chú ý đến kiến trúc.',
          'Khi đi qua nhiều địa phương, thử ghi lại sau mỗi ngày một câu chuyện đã nghe và một khung cảnh yêu thích. Những ghi chú ngắn sẽ giúp chuyến đi có nét riêng.',
        ],
      },
      {
        heading: 'Đi nhiều nơi nhưng vẫn cần thời gian nghỉ',
        paragraphs: [
          'Sáu tỉnh trong ba ngày là lịch trình có nhiều di chuyển. Trước khi chọn, hỏi rõ thời lượng ở từng điểm, các chặng đường và khoảng nghỉ.',
          'Đừng tự thêm quá nhiều điểm ngoài chương trình. Giữ sức cho cả hành trình sẽ giúp bạn tận hưởng những chặng cuối, thay vì chỉ mong đến lúc về.',
        ],
      },
    ],
  },
  {
    tourId: 6,
    title: 'Đà Lạt bốn ngày: có hoa, có thác và những bữa ăn ấm',
    desc:
      'Đồi hoa cẩm tú cầu, thác Datanla, Quảng trường Lâm Viên và lẩu gà lá é tạo nên tuyến Đà Lạt có nhiều sắc thái. Chuyến đi không chỉ dành cho ảnh đẹp, mà còn cho những khoảng ngồi lại cùng nhau.',
    sections: [
      {
        heading: 'Một album không cần cùng một kiểu ảnh',
        paragraphs: [
          'Không gian hoa hợp với khung hình nhẹ nhàng, thác nước mang lại cảm giác chuyển động, còn quảng trường là dịp ghi lại người đồng hành giữa nhịp thành phố.',
          'Thay vì cố chụp giống một tấm hình trên mạng, hãy để mỗi điểm đến có một câu chuyện riêng của nhóm bạn.',
        ],
      },
      {
        heading: 'Đừng bỏ quên thời gian ngồi lại',
        paragraphs: [
          'Sau buổi tham quan, một bữa ăn chung có thể trở thành phần đáng nhớ nhất. Lẩu gà lá é được nhắc trong mô tả, nhưng bữa ăn cụ thể vẫn cần xem trong chương trình xác nhận.',
          'Cảnh hoa phụ thuộc thời điểm thực tế, nên ảnh quảng bá không phải lời hứa về màu sắc của mọi chuyến đi. Mang trang phục dễ điều chỉnh và dành chỗ cho nghỉ ngơi trong quỹ bốn ngày ba đêm.',
        ],
      },
    ],
  },
  {
    tourId: 7,
    title: 'Nam Du: để tiếng sóng thay nhịp phố',
    desc:
      'Có lúc điều ta cần chỉ là một khoảng biển trước mắt và ít việc phải nghĩ hơn. Hòn Mấu, hoạt động ngắm san hô và những bữa hải sản là các điểm nhấn được nêu trong hành trình Nam Du.',
    sections: [
      {
        heading: 'Biển không chỉ dành cho check-in',
        paragraphs: [
          'Ở một điểm dừng ven biển, hãy dành thời gian nhìn mặt nước thay đổi và tận hưởng việc không phải di chuyển liên tục. Những phút nghỉ ấy cũng là một phần của chuyến đi.',
          'Tắm biển Hòn Mấu được nêu trong tour. Các hoạt động thực tế cần theo hướng dẫn của đoàn và điều kiện tại thời điểm đến.',
        ],
      },
      {
        heading: 'Hiểu lịch trình trước khi xếp hành lý',
        paragraphs: [
          'Ba ngày ba đêm không đồng nghĩa toàn bộ thời gian đều ở đảo hoặc khách sạn. Hỏi rõ các chặng đêm và thời gian trên phương tiện để chuẩn bị phù hợp.',
          'Nếu tham gia ngắm san hô, không chạm vào sinh vật biển và tuân thủ hướng dẫn. Điều đáng mang về là ảnh cùng ký ức; cảnh quan nên được giữ nguyên cho người đến sau.',
        ],
      },
    ],
  },
  {
    tourId: 8,
    title: 'Vũng Tàu trong một ngày: một khoảng nghỉ hướng về biển',
    desc:
      'Một chuyến đi ngắn vẫn đủ để đổi không khí. Tuyến Vũng Tàu trong dữ liệu kết hợp Bãi Sau, hoạt động công viên nước và bữa trưa buffet, phù hợp để bàn bạc một ngày đi chơi cùng nhóm.',
    sections: [
      {
        heading: 'Thống nhất nhịp vui chơi của cả nhóm',
        paragraphs: [
          'Không phải ai cũng muốn dành cả ngày cho cùng một hoạt động. Trước chuyến đi, thống nhất thời gian cho biển, vui chơi và nghỉ ngơi sẽ giúp mọi người thoải mái hơn.',
          'Với lịch một ngày, đồ thay và túi đựng đồ ướt thường thiết thực hơn một vali lớn. Ghi nhớ nơi tập trung sau thời gian tự do.',
        ],
      },
      {
        heading: 'Xác nhận đúng dịch vụ trước khi đặt',
        paragraphs: [
          'Tên công viên nước trong dữ liệu là Sun World. Bài này không xác nhận tình trạng vận hành, địa chỉ hoặc gói vé của địa điểm đó; cần hỏi đơn vị tổ chức trước khi đặt.',
          'Thông tin buffet cũng cần rõ địa điểm và phần phục vụ trong chương trình. Một lịch trình được xác nhận từ đầu sẽ giúp chuyến đi nhẹ đầu hơn.',
        ],
      },
    ],
  },
  {
    tourId: 9,
    title: 'Phú Yên – Quy Nhơn: kể chuyến đi bằng đường nét của biển',
    desc:
      'Gành Đá Đĩa, Tháp Nghinh Phong, Eo Gió, Kỳ Co và Tháp Bánh Ít tạo nên tuyến có nhiều hình khối để ngắm nhìn. Đá, biển và kiến trúc cùng góp phần kể câu chuyện của hành trình.',
    sections: [
      {
        heading: 'Nhìn kỹ trước khi bấm máy',
        paragraphs: [
          'Một đường chân trời, một lớp đá hoặc bóng người nhỏ trong khung hình có thể khiến bức ảnh có chiều sâu. Dành vài phút quan sát trước khi chọn góc chụp sẽ giúp bạn tìm được cách nhìn riêng.',
          'Không cần đứng đúng vị trí từng thấy trên mạng để có kỷ niệm đẹp. Khoảnh khắc với người đồng hành thường làm album gần gũi hơn.',
        ],
      },
      {
        heading: 'Xen kẽ cảnh biển và kiến trúc',
        paragraphs: [
          'Tháp Nghinh Phong và Tháp Bánh Ít được liệt kê cùng các điểm biển. Sự xen kẽ này giúp chuyến đi có nhiều trải nghiệm hơn việc chỉ ngắm sóng.',
          'Dữ liệu chưa chia chương trình theo từng ngày, nên cần xem lịch cụ thể và phương án hoạt động biển khi đặt. Không tự suy ra thứ tự điểm đến từ danh sách giới thiệu.',
        ],
      },
    ],
  },
  {
    tourId: 10,
    title: 'Bangkok – Pattaya: từ ngày bên biển đến tối nhìn thành phố',
    desc:
      'Pattaya và Bangkok mang đến hai sắc thái trong hành trình Thái Lan năm ngày bốn đêm. Bạn có thể vừa trải nghiệm hoạt động biển, vừa dành thời gian cho văn hóa, ẩm thực và nhịp đô thị.',
    sections: [
      {
        heading: 'Pattaya mở đầu chuyến đi',
        paragraphs: [
          'Lịch được cung cấp bắt đầu bằng chuyến bay đến Bangkok rồi di chuyển về Pattaya. Ngày tiếp theo có Đảo San Hô và Trân Bảo Phật Sơn.',
          'Hai ngày đầu vì thế cần tính cả thời gian bay và đi đường. Đừng đặt kỳ vọng rằng toàn bộ thời gian đều dành cho vui chơi.',
        ],
      },
      {
        heading: 'Trở lại Bangkok với một góc nhìn khác',
        paragraphs: [
          'Chương trình ghi bữa buffet tại Baiyoke Sky và tham quan Wat Traimit. Những điểm dừng và bữa ăn có thể trở thành dấu mốc giúp bạn nhớ thành phố.',
          'Mô tả tổng quan và lịch từng ngày chưa hoàn toàn khớp về hoạt động thuyền, nên cần hỏi lại. Trong thời gian mua sắm tự do, giữ rõ điểm hẹn và xem các khoản ngoài giá tour.',
        ],
      },
    ],
  },
  {
    tourId: 11,
    title: 'VietQR trong SmartTravel: hiểu đúng mục thử nghiệm thanh toán',
    desc:
      'Mục DEMO-VIETQR-5K xuất hiện trong danh sách nhưng không đại diện cho một chuyến du lịch. Đây là dữ liệu phục vụ kiểm thử luồng đặt chỗ và thanh toán của dự án.',
    sections: [
      {
        heading: 'Đây không phải tour du lịch',
        paragraphs: [
          'Bản dữ liệu ghi rõ mục này không áp dụng cho chuyến đi thực tế. Ảnh biển, số chỗ và mức đánh giá đi kèm không chứng minh rằng có một dịch vụ du lịch tương ứng.',
          'Bài viết này giúp phân biệt mục test với các hành trình thật trong danh sách, không giới thiệu nó như một sản phẩm nghỉ dưỡng.',
        ],
      },
      {
        heading: 'Không coi bài viết là yêu cầu chuyển tiền',
        paragraphs: [
          'Mô tả đề cập VietQR, xác nhận và vé điện tử, nhưng dữ liệu trong file không đủ chứng minh toàn bộ luồng đang hoạt động.',
          'Khoản test có thể liên quan tiền thật. Trước khi kiểm thử giao dịch, cần thống nhất môi trường và cách xử lý kết quả với người phụ trách. Bài này không yêu cầu thanh toán và không xác nhận chính sách hoàn tiền.',
        ],
      },
    ],
  },
  {
    tourId: 12,
    title: 'Hà Nội – Hạ Long – Ninh Bình: bốn ngày, ba cách ngắm miền Bắc',
    desc:
      'Một buổi dạo Hồ Gươm, một chặng thuyền giữa vịnh và một góc nhìn xuống cảnh đồng quê: tuyến này nối phố, biển và núi trong cùng chuyến đi bốn ngày ba đêm từ TP.HCM.',
    sections: [
      {
        heading: 'Bắt đầu bằng nhịp phố, rồi mở ra mặt vịnh',
        paragraphs: [
          'Ngày đầu dành cho Hà Nội với Hồ Gươm và phố cổ. Một vòng dạo vừa sức giúp bạn làm quen nhịp chuyến đi sau chặng bay.',
          'Ngày hai chuyển sang Hạ Long và đi thuyền ngắm đảo đá. Sự thay đổi từ phố sang mặt nước tạo nên một khoảng thở khác cho hành trình.',
        ],
      },
      {
        heading: 'Ninh Bình là chương cuối đáng chờ đợi',
        paragraphs: [
          'Ngày ba kết hợp Bái Đính và Tràng An; ngày cuối có Hang Múa trước khi về Nội Bài. Hai trải nghiệm đường thủy tại Hạ Long và Tràng An cũng là dịp nhìn sự khác biệt của cảnh quan.',
          'Chú ý quỹ thời gian ngày cuối và lựa chọn mức vận động phù hợp. Đây là lịch mẫu; giờ bay, thời lượng thuyền và dịch vụ cần được xác nhận khi sử dụng thực tế.',
        ],
      },
    ],
  },
  {
    tourId: 13,
    title: 'Sa Pa – Fansipan: tìm khoảng trời rộng sau nhịp phố Hà Nội',
    desc:
      'Hà Nội, Cát Cát, Mường Hoa và Fansipan tạo nên hành trình chuyển dần từ phố sang cảnh vùng cao. Điều đáng mong chờ không chỉ là một tấm ảnh trên đỉnh, mà còn là những khoảng nhìn dọc chuyến đi.',
    sections: [
      {
        heading: 'Dành sự chú ý cho những điều ở gần',
        paragraphs: [
          'Cát Cát và Mường Hoa được nêu trong tuyến bốn ngày ba đêm. Khi tham quan, thử nhìn đường đi, nhà cửa và các chi tiết cảnh quan thay vì chỉ hướng máy ảnh về phía xa.',
          'Tôn trọng không gian sinh hoạt địa phương và không làm phiền người dân để lấy ảnh sẽ giúp trải nghiệm dễ chịu hơn.',
        ],
      },
      {
        heading: 'Fansipan không phải lời hứa săn mây',
        paragraphs: [
          'Dữ liệu mẫu có vé cáp treo Fansipan trong phần dịch vụ. Tuy nhiên, cảnh mây và tầm nhìn phụ thuộc điều kiện thực tế.',
          'Chuẩn bị giày phù hợp và trang phục dễ điều chỉnh. Đừng đặt toàn bộ kỳ vọng vào một khoảnh khắc thời tiết; bản thân hành trình cũng có nhiều điều để nhớ.',
        ],
      },
    ],
  },
  {
    tourId: 14,
    title: 'Hà Giang: nhớ những khúc quanh, không chỉ tấm ảnh trên đèo',
    desc:
      'Từ Hà Nội lên Hà Giang, qua Đồng Văn, Lũng Cú, Mã Pí Lèng và Nho Quế, hành trình năm ngày bốn đêm có nhiều chuyển động. Cảnh đẹp nằm cả ở điểm dừng lẫn những đoạn đường nối chúng lại.',
    sections: [
      {
        heading: 'Đồng Văn là một nhịp nghỉ',
        paragraphs: [
          'Ngày đầu dành cho di chuyển đến Hà Giang. Những ngày sau mới mở ra dốc Thẩm Mã, Đồng Văn và Lũng Cú.',
          'Khoảng nghỉ tại Đồng Văn giúp chuyến đi không chỉ là ngồi xe. Dành thời gian quan sát phố và ghi lại cảm nhận sau một ngày qua nhiều cảnh núi.',
        ],
      },
      {
        heading: 'Một cảnh quan, hai góc nhìn',
        paragraphs: [
          'Lịch mẫu kết hợp ngắm Mã Pí Lèng với đi thuyền Nho Quế khi điều kiện cho phép. Nhìn từ trên cao rồi từ mặt nước đem đến hai cảm nhận khác nhau.',
          'Ngày về có chặng Hà Giang – Nội Bài nên cần giữ thời gian dự phòng. Không tự tách đoàn hoặc dừng ở vị trí không phù hợp để chụp ảnh.',
        ],
      },
    ],
  },
  {
    tourId: 15,
    title: 'Đà Nẵng – Hội An – Huế: biển, phố và một nhịp cố đô',
    desc:
      'Mỹ Khê mở ra khoảng biển, Hội An gợi nhịp dạo phố, còn Huế đưa hành trình về kiến trúc và lịch sử. Bốn ngày ba đêm dành cho người thích sự đổi cảnh trong cùng một chuyến đi.',
    sections: [
      {
        heading: 'Ngày đầu đừng quá vội',
        paragraphs: [
          'Lịch mẫu bắt đầu bằng chuyến bay đến Đà Nẵng, tham quan Mỹ Khê rồi ghé Hội An vào buổi chiều. Đoàn trở lại Đà Nẵng nghỉ đêm.',
          'Biết trước chặng quay về giúp bạn chọn cách tham quan vừa sức. Một khoảng ngồi ngắm phố có thể đáng nhớ không kém việc cố đi hết mọi ngõ.',
        ],
      },
      {
        heading: 'Từ Cầu Vàng đến Đại Nội',
        paragraphs: [
          'Ngày hai dành cho Bà Nà và Cầu Vàng khi điều kiện cho phép. Ngày ba chuyển sang Huế với Đại Nội, rồi ngày cuối có chùa Thiên Mụ trước chuyến bay về từ Phú Bài.',
          'Tuyến mẫu có sân bay đến và về khác nhau. Đối chiếu giờ bay và lịch trả phòng khi đặt để ngày cuối không bị gấp.',
        ],
      },
    ],
  },
  {
    tourId: 16,
    title: 'Nam đảo Phú Quốc: dành chỗ cho một chiều không vội',
    desc:
      'Bãi Sao, Hòn Thơm, Hòn Móng Tay và An Thới nối thành tuyến Phú Quốc bốn ngày ba đêm. Giữa các hoạt động, hãy giữ một khoảng thời gian chỉ để ngồi nhìn biển.',
    sections: [
      {
        heading: 'Từ bãi biển đến góc nhìn trên cao',
        paragraphs: [
          'Ngày đầu có Bãi Sao trước khi nhận phòng. Ngày tiếp theo chuyển sang cáp treo Hòn Thơm rồi trở về An Thới.',
          'Sự thay đổi giữa đứng trên bờ và nhìn cảnh biển từ trên cao là nét riêng của tuyến này. Trải nghiệm còn phụ thuộc thời tiết và điều kiện vận hành.',
        ],
      },
      {
        heading: 'Để lịch biển có khoảng linh hoạt',
        paragraphs: [
          'Ngày ba dành cho Hòn Móng Tay thuộc khu vực An Thới. Nghe hướng dẫn về phạm vi hoạt động, giờ tập trung và các khoản dịch vụ riêng.',
          'Ngày cuối dành cho nghỉ ngơi hoặc mua đặc sản tùy giờ bay. Đừng cố thêm hoạt động vào mọi khoảng trống; chuyến đi có thể đáng nhớ chính nhờ những lúc thong thả.',
        ],
      },
    ],
  },
  {
    tourId: 17,
    title: 'Singapore – Malaysia: hai thành phố trong một cuốn nhật ký',
    desc:
      'Merlion và Marina Bay, rồi Batu và Petronas: tuyến năm ngày bốn đêm đưa bạn qua hai nhóm biểu tượng. Thay vì so nơi nào đẹp hơn, hãy ghi lại điều khiến mỗi chặng có nhịp riêng.',
    sections: [
      {
        heading: 'Hai ngày đầu quanh Singapore',
        paragraphs: [
          'Lịch mẫu bắt đầu ở Merlion và vịnh Marina, sau đó có khu vườn ngoài trời tại Gardens by the Bay.',
          'Xen kẽ khung hình rộng với chi tiết nhỏ trên đường dạo sẽ giúp album đa dạng hơn. Vé nhà kính không được mặc định bao gồm trong lịch này.',
        ],
      },
      {
        heading: 'Dành thời gian cho việc chuyển chặng',
        paragraphs: [
          'Ngày ba là chuyến bay sang Kuala Lumpur, còn ngày bốn có Batu, chụp ảnh bên ngoài Petronas và dạo KLCC. Ngày chuyển chặng không phải ngày tham quan trọn vẹn.',
          'Chuẩn bị trang phục phù hợp khi đến điểm tôn giáo. Vé đài quan sát và các yêu cầu giấy tờ cần kiểm tra riêng, không suy ra từ hình ảnh quảng bá.',
        ],
      },
    ],
  },
  {
    tourId: 18,
    title: 'Seoul – Nami: giữa mái cung điện và những hàng cây',
    desc:
      'Gyeongbokgung, Bukchon, Nami và Myeongdong tạo nên một cách khám phá Hàn Quốc có cả kiến trúc, cảnh quan và nhịp phố. Tuyến năm ngày bốn đêm không chỉ dành cho mua sắm.',
    sections: [
      {
        heading: 'Đi chậm ở không gian có người sinh sống',
        paragraphs: [
          'Ngày hai kết hợp cung Gyeongbokgung và khu vực Bukchon. Khi đi qua khu dân cư, giữ giọng nói nhỏ và tôn trọng khung giờ tham quan thực tế.',
          'Một bức ảnh đẹp không cần đánh đổi sự yên tĩnh của người đang sống ở đó. Hãy chú ý cả cách mình trải nghiệm, không chỉ nơi mình đến.',
        ],
      },
      {
        heading: 'Nami có vẻ đẹp của ngày bạn đến',
        paragraphs: [
          'Ngày ba dành cho Nami với hoạt động đi bộ và cảnh ven sông. Màu lá thay đổi theo mùa, nên đừng mặc định sẽ gặp đúng khung hình từng thấy trên mạng.',
          'Chương trình còn có khu vực tháp N Seoul và Myeongdong. Vé đài quan sát, thuê hanbok và chi phí mua sắm không mặc nhiên nằm trong phần dịch vụ.',
        ],
      },
    ],
  },
  {
    tourId: 19,
    title: 'Tokyo – Phú Sĩ: từ nhịp Asakusa đến khoảng lặng bên hồ',
    desc:
      'Tokyo và khu vực Kawaguchi mang lại hai trải nghiệm trong tuyến năm ngày bốn đêm. Một bên là nhịp đô thị, một bên là cảnh hồ để đôi mắt được nghỉ sau nhiều chuyển động.',
    sections: [
      {
        heading: 'Bắt đầu từ những góc gần ở Tokyo',
        paragraphs: [
          'Ngày hai có Sensoji, khu phố Asakusa và khu vực bên ngoài Tokyo Skytree. Bạn có thể dành một phần album cho chi tiết gần rồi mở rộng sang cảnh thành phố.',
          'Vé lên đài quan sát không thuộc phần mặc định của chương trình mẫu. Cần phân biệt tham quan khu vực với mua vé vào từng dịch vụ.',
        ],
      },
      {
        heading: 'Đến Kawaguchi với kỳ vọng vừa đủ',
        paragraphs: [
          'Ngày ba đến hồ Kawaguchi và nghỉ tại khu vực Kawaguchiko; ngày bốn ghé Oshino Hakkai trước khi trở lại Tokyo.',
          'Ngắm Phú Sĩ phụ thuộc thời tiết và đây không phải chương trình leo núi. Ngay cả khi núi khuất sau mây, một vòng dạo ven hồ vẫn là khoảng đổi nhịp đáng trân trọng.',
        ],
      },
    ],
  },
  {
    tourId: 20,
    title: 'Bali: có biển, ruộng bậc thang và những ngôi đền',
    desc:
      'Nusa Dua và Uluwatu mở đầu, Tegallalang và Ubud đổi màu cảnh quan, rồi Ulun Danu Beratan cùng Tanah Lot khép lại hành trình. Bali trong tuyến này không chỉ có bãi biển.',
    sections: [
      {
        heading: 'Từ phía nam đảo đến một đêm ở Ubud',
        paragraphs: [
          'Sau ngày đến và nghỉ ngơi, lịch mẫu dành ngày hai cho Nusa Dua và Uluwatu. Ngày ba chuyển nơi lưu trú đến Ubud và tham quan Tegallalang.',
          'Cảnh ruộng bậc thang tạo nên một chương khác sau biển. Những trải nghiệm như xích đu có thu phí không thuộc phần mặc định trong chương trình.',
        ],
      },
      {
        heading: 'Ngày nhiều di chuyển cần một nhịp hợp lý',
        paragraphs: [
          'Ngày bốn nối Ulun Danu Beratan với Tanah Lot rồi trở về phía nam đảo. Lịch mẫu dành việc khởi hành sớm cho chặng này.',
          'Không tự thêm quá nhiều điểm. Điều kiện thời tiết và thủy triều có thể ảnh hưởng trải nghiệm ven biển; tuân thủ hướng dẫn về trang phục và khu vực được phép tiếp cận.',
        ],
      },
    ],
  },
];

const internationalTourIds = new Set([1, 2, 10, 17, 18, 19, 20]);

export const tourBlogArticles: TourBlogArticle[] = drafts.flatMap(draft => {
	const tour = MOCK_TOURS.find(item => item.id === draft.tourId);

	// Chỉ tạo bài liên kết khi tìm thấy tour và có mã tour.
	if (!tour || !tour.tourCode) {
	  return [];
	}

	const tourCode = tour.tourCode;
	const image = tour.thumbnailUrl ?? '';

  const isDemo = tourCode === 'DEMO-VIETQR-5K';
  const isInternational = internationalTourIds.has(tour.id);

  const text = [
    draft.desc,
    ...draft.sections.flatMap(section => section.paragraphs),
  ].join(' ');

  const readingMinutes = Math.max(
    1,
    Math.ceil(text.trim().split(/\s+/).length / 200),
  );

  const cat: TourBlogArticle['cat'] = isDemo
    ? 'kinhNghiem'
    : isInternational
      ? 'nuocNgoai'
      : 'diaDiem';

  return [
    {
      id: 100 + tour.id,
      tourId: tour.id,
      tourCode,
      isDemo,
      cat,
      tag: isDemo
        ? 'Thử nghiệm'
        : isInternational
          ? 'Quốc tế'
          : 'Trong nước',
      tagColor: isDemo
        ? 'bg-amber-500/90'
        : isInternational
          ? 'bg-rose-500/90'
          : 'bg-emerald-500/90',
      title: draft.title,
      desc: draft.desc,
      image,
      date: '19/09/2026',
      readTime: `${readingMinutes} phút`,
      views: '0',
      featured: false,
      sections: draft.sections,
    },
  ];
});