import { MOCK_TOURS } from './mockTours';

import { drafts, ArticleSection, ArticleDraft } from './destinationTourDrafts';
export type { ArticleSection, ArticleDraft };

export interface TourBlogArticle {
  id: number;
  tourId?: number;
  tourCode?: string;
  isDemo?: boolean;
  cat: 'diaDiem' | 'kinhNghiem' | 'amThuc';
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

const internationalTourIds = new Set([1, 2, 10, 17, 18, 19, 20]);

// ==========================================
// 11 BÀI VIẾT CHUYÊN SÂU: KINH NGHIỆM & ẨM THỰC
// ==========================================
export const dedicatedBlogArticles: TourBlogArticle[] = [
  // --- 4 BÀI KINH NGHIỆM DU LỊCH ---
  {
    id: 201,
    cat: 'kinhNghiem',
    tag: 'Hành lý & Mẹo',
    tagColor: 'bg-sky-500/90',
    title: 'Mẹo chuẩn bị hành lý du lịch 4 mùa gọn nhẹ & thông minh cho mọi chuyến bay',
    desc: 'Bí quyết đóng gói hành lý tối ưu theo quy tắc 5-4-3-2-1, cách bảo quản giấy tờ quan trọng, đồ công nghệ và những quy định hàng không mới nhất cần nhớ.',
    image: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=1200&q=80',
    date: '20/09/2026',
    readTime: '5 phút',
    views: '1.420',
    featured: true,
    sections: [
      {
        heading: '1. Quy tắc vàng đóng gói 5-4-3-2-1 và kỹ thuật cuộn quần áo',
        paragraphs: [
          'Đối với một chuyến đi thông thường từ 4 đến 5 ngày, bạn chỉ cần áp dụng công thức tối giản 5-4-3-2-1: 5 đôi tất/đồ lót, 4 áo thun hoặc sơ mi dễ phối, 3 quần hoặc chân váy, 2 đôi giày (1 thể thao đi bộ, 1 giày nhẹ hoặc sandal) và 1 chiếc áo khoác đa năng có khả năng cản gió hoặc chống thấm nhẹ.',
          'Kỹ thuật cuộn tròn quần áo thay vì gấp phẳng truyền thống không chỉ giúp tiết kiệm tới 40% diện tích vali mà còn hạn chế tối đa nếp nhăn. Bạn nên tận dụng các khoảng trống bên trong lòng giày để đựng tất hoặc phụ kiện nhỏ đã bọc túi zip sạch sẽ.'
        ]
      },
      {
        heading: '2. Bảo quản giấy tờ tùy thân và thiết bị công nghệ an toàn',
        paragraphs: [
          'Hộ chiếu (còn hạn tối thiểu 6 tháng), CCCD, xác nhận đặt tour vé điện tử QR code và bảo hiểm du lịch nên được đựng trong một ví cầm tay chống nước và luôn mang theo bên người trong balo xách tay, tuyệt đối không để trong hành lý ký gửi.',
          'Đồng thời, hãy chụp lại bản mềm các giấy tờ quan trọng và lưu trên đám mây (Google Drive hoặc iCloud) hoặc ghi chú trong điện thoại để sẵn sàng đối chiếu khi cần thiết.'
        ]
      },
      {
        heading: '3. Nắm vững quy định về chất lỏng và pin sạc dự phòng khi bay',
        paragraphs: [
          'Quy định hàng không quốc tế quy định chất lỏng xách tay phải chiết vào các chai lọ dung tích không quá 100ml mỗi chai và tổng dung tích không vượt quá 1 lít, đựng trong túi trong suốt có khóa kéo.',
          'Pin sạc dự phòng (Powerbank), pin máy ảnh và các thiết bị chứa pin Lithium bắt buộc phải để trong hành lý xách tay. Dung lượng pin dự phòng phổ biến cho phép là dưới 20.000mAh (hoặc dưới 100Wh). Đừng để quên trong vali ký gửi vì an ninh soi chiếu sẽ yêu cầu bạn mở vali để lấy ra.'
        ]
      }
    ]
  },
  {
    id: 202,
    cat: 'kinhNghiem',
    tag: 'Thủ tục Visa',
    tagColor: 'bg-indigo-500/90',
    title: 'Cẩm nang xin Visa du lịch tự túc từ A-Z: Bí quyết tăng tỷ lệ đậu ngay lần đầu',
    desc: 'Hướng dẫn chi tiết cách chuẩn bị hồ sơ chứng minh tài chính, công việc, lên lịch trình du lịch logic và bí quyết phỏng vấn tự tin trước viên chức lãnh sự.',
    image: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    date: '19/09/2026',
    readTime: '6 phút',
    views: '2.150',
    featured: false,
    sections: [
      {
        heading: '1. Hồ sơ tài chính và công việc: Yếu tố then chốt quyết định',
        paragraphs: [
          'Một bộ hồ sơ xin visa du lịch thành công đòi hỏi sự minh bạch và nguồn gốc thu nhập rõ ràng. Không nhất thiết phải có sổ tiết kiệm hàng trăm triệu mới mở ngày hôm qua; lãnh sự quán đánh giá cao dòng tiền lưu thông ổn định qua sao kê tài khoản ngân hàng 3-6 tháng gần nhất.',
          'Hợp đồng lao động, quyết định bổ nhiệm, đơn xin nghỉ phép có dấu mộc công ty và bảo hiểm xã hội (VssID) là bằng chứng rõ ràng nhất chứng minh bạn có sự ràng buộc bền vững tại Việt Nam và sẽ quay về sau chuyến du lịch.'
        ]
      },
      {
        heading: '2. Xây dựng lịch trình chuyến đi chi tiết và logic',
        paragraphs: [
          'Lịch trình chuyến đi nộp cho đại sứ quán cần khớp chính xác từng ngày với đặt phòng khách sạn (booking có thể hủy miễn phí) và vé máy bay khứ hồi (chỉ nên lấy vé giữ chỗ trước khi có kết quả visa).',
          'Tránh làm lịch trình quá ôm đồm hoặc di chuyển phi thực tế giữa các thành phố cách nhau hàng ngàn kilomet trong một ngày. Một hành trình mạch lạc, hợp lý sẽ ghi điểm rất lớn với người xét duyệt.'
        ]
      },
      {
        heading: '3. Tâm thế tự tin khi phỏng vấn visa và lỗi cần tránh',
        paragraphs: [
          'Nếu điểm đến yêu cầu phỏng vấn trực tiếp (như Mỹ hay một số quốc gia châu Âu), trang phục lịch sự và thái độ tự tin, nhìn thẳng vào mắt người phỏng vấn là điều rất quan trọng. Hãy trả lời ngắn gọn, trung thực đúng trọng tâm câu hỏi.',
          'Lỗi lớn nhất khiến hồ sơ bị từ chối là thông tin khai báo không trùng khớp giữa tờ khai online và giấy tờ thực tế. Luôn kiểm tra kỹ từng chi tiết trước khi nộp.'
        ]
      }
    ]
  },
  {
    id: 203,
    cat: 'kinhNghiem',
    tag: 'Đặt tour an toàn',
    tagColor: 'bg-emerald-500/90',
    title: 'Kinh nghiệm đặt tour du lịch trực tuyến: Cách chọn tour chất lượng, tránh bẫy giá rẻ',
    desc: 'Phân biệt tour trọn gói với tour có chi phí ẩn, kiểm tra giấy phép lữ hành, đọc kỹ chính sách hoàn hủy và ưu tiên thanh toán VietQR tự động an toàn.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    date: '18/09/2026',
    readTime: '5 phút',
    views: '1.870',
    featured: false,
    sections: [
      {
        heading: '1. Đọc kỹ điều khoản dịch vụ: Đâu là chi phí đã bao gồm?',
        paragraphs: [
          'Nhiều tour chào giá "siêu rẻ" trên mạng xã hội nhưng khi khởi hành du khách mới bất ngờ vì phải đóng thêm hàng loạt phụ phí như vé cáp treo, vé cổng tham quan, tiền bồi dưỡng (tip) bắt buộc cho tài xế và hướng dẫn viên, hoặc bữa ăn chất lượng kém.',
          'Tại Smart Travel, mọi hành trình đều công khai minh bạch danh mục dịch vụ bao gồm và không bao gồm, cam kết chuẩn sao khách sạn và thực đơn bữa ăn rõ ràng trước khi thanh toán.'
        ]
      },
      {
        heading: '2. Xác minh tính pháp lý và phản hồi thực tế của khách hàng',
        paragraphs: [
          'Trước khi chuyển cọc, hãy kiểm tra công ty lữ hành có giấy phép kinh doanh lữ hành nội địa hoặc quốc tế hợp lệ hay không, địa chỉ văn phòng thực tế và số hotline hoạt động liên tục.',
          'Đọc đánh giá và xem ảnh chụp trải nghiệm từ các đoàn khách đã đi trước đó là cách chân thực nhất để đánh giá chất lượng phục vụ của đơn vị tổ chức.'
        ]
      },
      {
        heading: '3. Thanh toán trực tuyến an toàn và lưu giữ mã vé điện tử E-Ticket',
        paragraphs: [
          'Ưu tiên thanh toán qua các cổng thanh toán tự động quét mã VietQR ngân hàng chính chủ của doanh nghiệp có mã đặt chỗ rõ ràng trong nội dung chuyển khoản. Tránh chuyển tiền vào các số tài khoản cá nhân mập mờ.',
          'Ngay sau khi thanh toán thành công, hệ thống Smart Travel sẽ tự động gửi E-Ticket kèm mã QR check-in qua email và tài khoản cá nhân, đảm bảo quyền lợi tuyệt đối cho du khách.'
        ]
      }
    ]
  },
  {
    id: 204,
    cat: 'kinhNghiem',
    tag: 'Du lịch gia đình',
    tagColor: 'bg-amber-500/90',
    title: 'Bí quyết du lịch cùng gia đình có người cao tuổi và trẻ nhỏ an toàn, vui vẻ',
    desc: 'Kinh nghiệm chọn điểm đến thong thả, chuẩn bị thực đơn dinh dưỡng, thuốc men thiết yếu và cách cân đối lịch trình để mọi thế hệ đều cảm thấy thoải mái.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    date: '17/09/2026',
    readTime: '5 phút',
    views: '1.290',
    featured: false,
    sections: [
      {
        heading: '1. Lựa chọn điểm đến có khí hậu ôn hòa và hạ tầng thuận tiện',
        paragraphs: [
          'Những chuyến đi đa thế hệ nên ưu tiên các thành phố nghỉ dưỡng ven biển hoặc vùng đồi núi có khí hậu mát mẻ, giao thông thuận tiện và hệ thống y tế tốt như Đà Nẵng, Nha Trang, Phú Quốc hay Đà Lạt.',
          'Hạn chế các hành trình trekking dốc hiểm trở hoặc phải chuyển xe liên tục trong ngày khiến người lớn tuổi nhanh mệt mỏi và trẻ nhỏ quấy khóc.'
        ]
      },
      {
        heading: '2. Lịch trình thong thả: Chất lượng hơn số lượng',
        paragraphs: [
          'Thay vì cố gắng check-in 5-6 điểm trong ngày, hãy giới hạn mỗi buổi chỉ tham quan 1 đến 2 điểm nổi bật nhất. Dành thời gian nghỉ trưa đủ giấc và khoảng tự do buổi chiều để cả nhà tắm biển hoặc thư giãn tại hồ bơi khách sạn.',
          'Khi đặt tour, bạn nên thông báo trước cho hướng dẫn viên về độ tuổi của các thành viên để đoàn được sắp xếp chỗ ngồi phía trên xe và bố trí phòng khách sạn gần thang máy tiện di chuyển.'
        ]
      },
      {
        heading: '3. Chuẩn bị túi y tế cá nhân và thực đơn linh hoạt',
        paragraphs: [
          'Luôn mang theo túi thuốc cơ bản gồm thuốc hạ sốt, men tiêu hóa, thuốc say xe, băng gạc cá nhân và các loại thuốc đặc trị theo toa của người lớn tuổi (thuốc huyết áp, tim mạch, xương khớp).',
          'Khẩu vị của trẻ em và người già thường nhạt và dễ ăn hơn, vì vậy hãy chọn các nhà hàng có món súp, cháo hoặc các món thanh đạm để cả gia đình luôn tràn đầy năng lượng suốt kỳ nghỉ.'
        ]
      }
    ]
  },

  // --- 7 BÀI ẨM THỰC ĐẶC SẮC ---
  {
    id: 205,
    tourId: 5,
    tourCode: 'HCM-MT-6T-4N3D',
    cat: 'amThuc',
    tag: 'Bánh xèo Miền Tây',
    tagColor: 'bg-rose-500/90',
    title: 'Bánh xèo miền Tây: Tinh hoa ẩm thực sông nước giòn rụm từ vành bánh đến rổ rau rừng',
    desc: 'Nghệ thuật đổ bánh xèo chảo bự giòn tan, béo ngậy nước cốt dừa, nhân tôm sông tươi rói thịt ba rọi ngọt lịm và phong vị cuốn trọn hơn 20 loại rau rừng độc đáo của người miền Tây.',
    image: '/images/blogs/banh-xeo-mien-tay.jpg',
    date: '20/09/2026',
    readTime: '5 phút',
    views: '2.640',
    featured: true,
    sections: [
      {
        heading: '1. Nghệ thuật đổ bánh chảo gang và tiếng "xèo" rộn rã miệt vườn',
        paragraphs: [
          'Tên gọi "bánh xèo" mộc mạc bắt nguồn từ chính âm thanh vui tai vang lên khi người đầu bếp đổ vá bột gạo tươi vào chảo gang nóng rực đã láng mỡ heo. Bí quyết làm nên chiếc bánh xèo miền Tây trứ danh nằm ở khâu pha bột: bột gạo xay ngâm nước cốt dừa béo ngậy, thêm chút bột nghệ tạo màu vàng óng ả, hành lá xắt nhuyễn và một quả trứng gà để vỏ bánh thêm thơm xốp.',
          'Người đổ bánh phải có đôi tay thoăn thoắt và độ khéo léo tuyệt vời: múc vá bột rưới đều quanh thành chảo rồi nghiêng xoay một vòng tròn hoàn hảo sao cho vành bánh mỏng dính như cánh chuồn, giòn rụm không gãy, trong khi phần đáy bánh vẫn giữ được độ mềm ẩm và béo bùi vừa vặn.'
        ]
      },
      {
        heading: '2. Linh hồn nhân bánh hào sảng: Tôm sông tươi rói, thịt ba chỉ và củ hũ dừa ngọt mát',
        paragraphs: [
          'Chiếc bánh xèo miền Tây to bản như cái mâm nhôm mang trọn vẹn nét phóng khoáng, trù phú của vùng đất chín rồng. Nhân bánh không làm sơ sài mà đầy ắp tôm đất sông tươi rói ngọt lịm, thịt ba rọi xắt mỏng tẩm ướp tiêu hành đậm đà, đậu xanh hấp chín bùi bùi và giá đỗ mập mạp.',
          'Đặc biệt, ở các miệt vườn Bến Tre hay Cần Thơ, người ta còn cho thêm củ hũ dừa non bào sợi giòn ngọt thanh tao, tép trấu hoặc măng le rừng mùa mưa. Vị béo của nước cốt dừa quyện cùng vị ngọt lịm của tôm thịt và độ giòn sần sật của củ hũ dừa khiến thực khách ăn bao nhiêu cũng không thấy ngấy.'
        ]
      },
      {
        heading: '3. Bản hòa tấu của hơn 20 loại rau rừng và chén nước mắm tỏi ớt chấm ngập tay',
        paragraphs: [
          'Người miền Tây có câu: "Bánh xèo ngon nhờ rổ rau miệt vườn". Một mẹt bánh xèo đúng điệu không thể thiếu rổ rau đồng ngút ngàn với hơn 20 loại lá dân dã: đọt xoài non chua dịu, lá cóc non chan chát, lá lụa ngọt thanh, sao nhái, đọt bứa, cải xanh cay nồng, diếp cá, lá cách thơm ngát và xà lách giòn ngọt.',
          'Thưởng thức bánh xèo phải dùng tay trần mới đúng điệu: ngắt một góc bánh xèo nóng hổi giòn rụm, cuộn tròn cùng nhiều lớp rau rừng xanh mướt rồi chấm ngập chén nước mắm nhĩ chua ngọt pha tỏi ớt đỏ tươi có củ cải cà rốt bào sợi. Cắn một miếng, mọi giác quan như bừng tỉnh trước sự hòa quyện hoàn hảo giữa độ giòn béo, vị chát ngọt thanh tao và cay the nồng nàn lan tỏa khắp khoang miệng.'
        ]
      }
    ]
  },
  {
    id: 206,
    tourId: 12,
    tourCode: 'HCM-HN-HL-NB-4N3D',
    cat: 'amThuc',
    tag: 'Ẩm thực Hà Nội',
    tagColor: 'bg-amber-500/90',
    title: 'Food tour phố cổ Hà Nội: Bản đồ ẩm thực 36 phố phường từ sáng đến đêm',
    desc: 'Dạo quanh phố cổ thưởng thức phở bò Bát Đàn, bún chả Hàng Quạt, chả cá Lã Vọng, cà phê trứng Giảng béo ngậy và kem Tràng Tiền danh tiếng.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    date: '19/09/2026',
    readTime: '6 phút',
    views: '3.120',
    featured: false,
    sections: [
      {
        heading: '1. Bắt đầu sớm mai với bát Phở bò truyền thống và Cà phê trứng Giảng',
        paragraphs: [
          'Một buổi sáng Hà Nội đúng điệu phải khởi đầu bằng tô phở bò nóng hổi thơm nức mùi gừng nướng, hoa hồi và thảo quả trên phố Bát Đàn hoặc Lý Quốc Sư. Nước dùng phở trong veo nhưng ngọt sâu từ xương bò ninh nhừ suốt mười mấy tiếng, bánh phở mềm mượt ăn kèm quẩy giòn.',
          'Sau đó, rẽ vào con ngõ nhỏ phố Nguyễn Hữu Huân thưởng thức ly cà phê trứng Giảng trứ danh. Lớp kem trứng được đánh bông mịn như mây, thơm béo ngậy quyện cùng vị cà phê đắng đậm đà bên dưới.'
        ]
      },
      {
        heading: '2. Bữa trưa đậm đà phong vị kinh kỳ: Bún chả than hoa và Chả cá Lã Vọng',
        paragraphs: [
          'Trưa đến, mùi thơm nức của chả thịt nướng trên than hoa sẽ dẫn lối bạn đến quán bún chả Hàng Quạt hoặc ngõ Đống Xuân. Miếng chả viên và chả miếng tẩm ướp mắm tiêu đượm đà, chấm cùng bát nước mắm chua ngọt ấm ấm thả vài lát đu đủ cà rốt giòn sần sật.',
          'Nếu muốn trải nghiệm sự tao nhã, chảo chả cá Lã Vọng xèo xèo trên bàn với từng miếng cá lăng vàng ươm, hành hoa, thì là xào chín, ăn kèm bún rối, lạc rang và chén mắm tôm đánh sủi bọt dậy mùi.'
        ]
      },
      {
        heading: '3. La cà xế chiều và ẩm thực đêm phố cổ: Nộm bò khô, ốc luộc và kem Tràng Tiền',
        paragraphs: [
          'Chiều mát, ghé phố Đinh Liệt gọi đĩa nộm bò khô giòn sần sật rưới nước giấm chua ngọt cay nồng, hoặc bát ốc luộc lá chanh nước mắm gừng sả cay xé lưỡi.',
          'Kết thúc một ngày food tour hoàn hảo bằng việc tản bộ bên bờ Hồ Gươm lộng gió và thưởng thức cây kem cốm hoặc kem ốc quế đậu xanh Tràng Tiền mát lạnh.'
        ]
      }
    ]
  },
  {
    id: 207,
    tourId: 15,
    tourCode: 'HCM-DALAT-3N2D',
    cat: 'amThuc',
    tag: 'Ẩm thực Đà Lạt',
    tagColor: 'bg-teal-500/90',
    title: 'Food tour Đà Lạt về đêm: Những món ấm nồng giữa tiết trời se lạnh phố núi',
    desc: 'Khám phá thế giới ẩm thực sưởi ấm lòng người tại Đà Lạt với lẩu gà lá é Tao Ngộ, lẩu bò Ba Toa, bánh tráng nướng chợ đêm và ly sữa đậu nành nóng hổi.',
    image: '/images/blogs/da-lat-am-thuc.jpg',
    date: '19/09/2026',
    readTime: '5 phút',
    views: '2.890',
    featured: false,
    sections: [
      {
        heading: '1. Lẩu gà lá é Tao Ngộ và Lẩu bò Ba Toa: Bộ đôi sưởi ấm đêm sương',
        paragraphs: [
          'Khi sương chiều buông xuống khiến nhiệt độ Đà Lạt hạ xuống dưới 16 độ C, không gì tuyệt vời hơn khi ngồi quây quần bên nồi lẩu gà lá é sôi sùng sục. Vị cay the nhẹ nhàng của lá é xanh mướt kết hợp với ớt xiêm rừng và thịt gà đồi dai ngọt làm ấm bừng lồng ngực.',
          'Cách đó không xa là khu lẩu bò Ba Toa quán gỗ nức tiếng với những miếng nạm, gân và đuôi bò ninh mềm rục chấm chao sa tế cay xé lưỡi, ăn cùng đĩa rau cải non và mì trứng vàng ươm.'
        ]
      },
      {
        heading: '2. Ẩm thực đường phố chợ đêm: Bánh tráng nướng và sữa đậu nành nóng',
        paragraphs: [
          'Dạo bước xuống dốc chợ đêm Đà Lạt (chợ Âm Phủ), bạn sẽ bị níu chân bởi những bếp than hồng rực rỡ nướng bánh tráng. Miếng bánh tráng mỏng nướng giòn rụm với trứng cút, mỡ hành, ruốc tôm, xúc xích và phô mai béo ngậy được du khách quốc tế ưu ái gọi là "Pizza Việt Nam".',
          'Ngồi cạnh gánh hàng rong, nhâm nhi ly sữa đậu nành nguyên chất nóng hổi kèm chiếc bánh su kem hoặc bánh tiêu xốp mềm là ký ức Đà Lạt không thể nào quên.'
        ]
      },
      {
        heading: '3. Bánh ướt lòng gà và đặc sản dâu tây tươi làm quà phố núi',
        paragraphs: [
          'Bữa sáng Đà Lạt sẽ thật thiếu sót nếu bỏ qua món bánh ướt lòng gà phố Tăng Bạt Hổ. Bánh ướt mềm mướt tráng mới ăn cùng lòng heo giòn sần sật, thịt gà xé phay, rau thơm và nước mắm chua ngọt thanh tao.',
          'Trước khi rời phố núi, hãy ghé vườn dâu công nghệ cao tự tay hái những quả dâu tây đỏ mọng, mua vài hũ mứt atiso, hồng treo gió Đà Lạt về làm quà cho bạn bè.'
        ]
      }
    ]
  },
  {
    id: 208,
    tourId: 10,
    tourCode: 'HCM-BKK-PTY-5N4D',
    cat: 'amThuc',
    tag: 'Ẩm thực Thái Lan',
    tagColor: 'bg-orange-500/90',
    title: 'Khám phá ẩm thực đường phố Bangkok: Bản hòa tấu chua, cay, mặn, ngọt',
    desc: 'Thưởng thức Tom Yum Goong chua cay nồng nàn, Pad Thai tôm tươi bốc khói, xôi xoài cốt dừa béo ngậy tại các khu chợ đêm sầm uất bậc nhất Bangkok.',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
    date: '18/09/2026',
    readTime: '5 phút',
    views: '2.450',
    featured: false,
    sections: [
      {
        heading: '1. Những món ăn mang linh hồn xứ Chùa Vàng: Tom Yum và Pad Thai',
        paragraphs: [
          'Ẩm thực Thái Lan chinh phục thực khách thế giới nhờ sự kết hợp tài tình của các loại thảo mộc tươi: sả, riềng, lá chanh kaffir và ớt hiểm. Tô súp Tom Yum Goong bốc khói nghi ngút với vị chua thanh từ nước cốt chanh tươi, vị béo của nước cốt dừa và vị ngọt đậm đà của tôm sú tươi rói.',
          'Trên các vỉa hè Bangkok, tiếng chảo gang xèo xèo đảo Pad Thai liên tục không dứt. Từng sợi hủ tiếu dai dai quyện với sốt me chua ngọt, đậu phụ, tôm khô, trứng gà và giá đỗ tươi, rắc thêm chút đậu phộng rang giòn thơm lừng.'
        ]
      },
      {
        heading: '2. Thế giới đồ ngọt đường phố: Xôi xoài cốt dừa và trà sữa Thái',
        paragraphs: [
          'Món tráng miệng quốc dân làm say lòng mọi du khách chính là xôi xoài (Mango Sticky Rice). Hạt nếp Thái dẻo thơm nấu chín với nước dừa béo ngậy, ăn kèm những lát xoài chín vàng ngọt lịm không xơ và chan đẫm nước cốt dừa đặc sánh rắc hạt đậu xanh rang giòn.',
          'Đi bộ mỏi chân giữa chợ đêm, một ly trà sữa Thái đỏ (Cha Yen) hoặc trà xanh Thái mát lạnh với lớp sữa đặc ngọt béo sẽ ngay lập tức xua tan cơn khát.'
        ]
      },
      {
        heading: '3. Các khu chợ đêm ẩm thực nức tiếng du khách không thể bỏ lỡ',
        paragraphs: [
          'Để thưởng thức trọn vẹn ẩm thực đường phố Bangkok an toàn và phong phú, hãy ghé thăm khu phố người Hoa Yaowarat rực rỡ ánh đèn, chợ đêm Jodd Fairs với món sườn cay "núi lửa" khổng lồ, hay khu ẩm thực Terminal 21 với giá cả bình dân niêm yết rõ ràng.'
        ]
      }
    ]
  },
  {
    id: 209,
    tourId: 16,
    tourCode: 'HCM-HUE-DN-HA-4N3D',
    cat: 'amThuc',
    tag: 'Ẩm thực Miền Trung',
    tagColor: 'bg-red-500/90',
    title: 'Mê mẩn ẩm thực miền Trung: Hành trình hương vị đậm đà từ Huế, Đà Nẵng đến Hội An',
    desc: 'Khám phá bún bò Huế cay nồng, cơm hến mộc mạc, mì Quảng ếch thơm lừng Đà Nẵng cùng cao lầu và bánh mì Phượng nổi danh thế giới tại phố cổ Hội An.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    date: '18/09/2026',
    readTime: '6 phút',
    views: '2.730',
    featured: false,
    sections: [
      {
        heading: '1. Ẩm thực Cố đô Huế: Tinh hoa từ bún bò cay thơm đến khay bánh bèo nậm lọc',
        paragraphs: [
          'Bún bò xứ Huế mang hương vị rất riêng biệt không nơi nào sao chép được nhờ mùi thơm nồng của mắm ruốc hòa quyện cùng sả cây đập dập và ớt xào sa tế cay xé lưỡi. Tô bún đầy đặn với khoanh giò heo ninh mềm, lát thịt bắp hoa giòn sần sật và viên chả cua vàng ươm.',
          'Bên cạnh đó, các món bánh cung đình như bánh bèo chén tôm chấy giòn tan mỡ hành, bánh nậm lá dong mềm mướt hay bánh lọc nhân tôm thịt trong veo chấm nước mắm ớt cay là đỉnh cao của sự cầu kỳ, tinh tế.'
        ]
      },
      {
        heading: '2. Mì Quảng Đà Nẵng: Đậm đà phong vị mộc mạc xứ Quảng',
        paragraphs: [
          'Khác với phở hay bún nước, tô mì Quảng chỉ chan một lượng nước nhưn xâm xấp nhưng cực kỳ đậm đà nấu từ tôm, thịt heo, thịt ếch đồng hoặc cá lóc. Sợi mì gạo dày mềm ăn cùng bánh tráng mè giòn rụm, đậu phộng rang và đĩa rau sống búp chuối tươi non.'
        ]
      },
      {
        heading: '3. Cao lầu Hội An và ổ bánh mì ngon nhất thế giới',
        paragraphs: [
          'Đến phố cổ Hội An, nhất định phải thử món Cao lầu với sợi mì vàng nhạt làm từ gạo ngâm nước tro củi cù lao Chàm, ăn kèm thịt xá xíu thái mỏng, da heo chiên giòn và rau thơm Trà Quế.',
          'Và đừng quên xếp hàng thưởng thức ổ bánh mì Phượng giòn tan đẫm nhân pate, bơ béo và nước sốt bí truyền từng được đầu bếp quốc tế Anthony Bourdain khen ngợi hết lời.'
        ]
      }
    ]
  },
  {
    id: 210,
    tourId: 13,
    tourCode: 'HCM-QN-PY-3N3D',
    cat: 'amThuc',
    tag: 'Hải sản Biển Đảo',
    tagColor: 'bg-cyan-500/90',
    title: 'Hải sản biển đảo Phú Quốc & Quy Nhơn: Cẩm nang ăn tươi ngon, giá bình dân ven biển',
    desc: 'Kinh nghiệm ăn hải sản bao tươi ngon tại làng chài Hàm Ninh Phú Quốc và làng chài Nhơn Lý Quy Nhơn: Gỏi cá trích, nhum biển nướng, cua huỳnh đế, ốc nón hấp.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    date: '17/09/2026',
    readTime: '5 phút',
    views: '1.980',
    featured: false,
    sections: [
      {
        heading: '1. Phú Quốc: Gỏi cá trích cuốn bánh tráng rau rừng và nhum biển nướng mỡ hành',
        paragraphs: [
          'Gỏi cá trích tươi sống là "linh hồn" của ẩm thực đảo ngọc Phú Quốc. Thịt cá trích lóc xương trắng hồng tái chanh trộn cơm dừa nạo béo bùi, cuốn cùng bánh tráng, dưa leo, rau rừng nguyên sinh và chấm chén nước mắm nhĩ Phú Quốc pha tỏi ớt đậu phộng đặc sánh.',
          'Nhum biển (cầu gai) vừa bắt dưới rạn san hô được bổ đôi, nướng than hoa rưới mỡ hành thơm lừng và đập thêm quả trứng cút béo ngậy, rắc chút muối tiêu chanh là món bồi bổ sức khỏe tuyệt hảo sau một ngày lặn biển.'
        ]
      },
      {
        heading: '2. Quy Nhơn: Thưởng thức cua huỳnh đế và các loại ốc biển tươi rói',
        paragraphs: [
          'Về vùng biển Quy Nhơn – Eo Gió, du khách sẽ được thưởng thức cua huỳnh đế – loài cua tiến vua với lớp vỏ đỏ cam dày dặn, gạch cua béo ngậy như bơ và thớ thịt trắng phau ngọt thanh tự nhiên.',
          'Các loại ốc biển độc đáo như ốc nón hấp sả ớt, ốc hương rang muối ớt hay mực lá câu đêm hấp gừng ăn ngay trên các bè nổi làng chài Nhơn Lý mang đến vị ngọt mặn mòi nguyên bản của đại dương.'
        ]
      },
      {
        heading: '3. Mẹo chọn hải sản còn bơi tại bè và ăn ngon không lo chặt chém',
        paragraphs: [
          'Hãy luôn hỏi giá theo kilogam trước khi yêu cầu cân và chế biến tại chỗ. Ưu tiên các quán hải sản tập trung đông người địa phương hoặc các hợp tác xã làng chài có niêm yết bảng giá rõ ràng.'
        ]
      }
    ]
  },
  {
    id: 211,
    tourId: 1,
    tourCode: 'TOUR-001',
    cat: 'amThuc',
    tag: 'Ẩm thực Á Đông',
    tagColor: 'bg-purple-500/90',
    title: 'Tinh hoa ẩm thực Trung Hoa: Thưởng thức Dimsum Hồng Kông & Vịt quay Bắc Kinh chuẩn vị',
    desc: 'Trải nghiệm nét nghệ thuật ẩm thực tinh hoa với các xửng tre Dimsum nghi ngút khói (há cảo tôm, xíu mại, bánh bao kim sa) và vịt quay Bắc Kinh da giòn óng ả.',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=80',
    date: '17/09/2026',
    readTime: '6 phút',
    views: '2.210',
    featured: false,
    sections: [
      {
        heading: '1. Dimsum: Nghệ thuật "chạm vào trái tim" qua từng xửng tre nóng hổi',
        paragraphs: [
          'Dimsum (Điểm tâm) trong văn hóa ẩm thực Quảng Đông mang ý nghĩa là những món ăn nhẹ "chạm đến trái tim". Mỗi xửng tre hấp nghi ngút khói mở ra một tuyệt tác thị giác: há cảo tôm với lớp vỏ bột trong veo thấy rõ màu hồng của tôm tươi, xíu mại thịt heo trứng cua vàng óng, hay bánh bao kim sa với dòng nhân trứng muối vàng ươm tan chảy ngọt béo.',
          'Thưởng thức Dimsum không thể thiếu bình trà Ô Long hoặc trà hoa cúc nóng hổi đi kèm để trung hòa vị béo và giúp tiêu hóa nhẹ nhàng.'
        ]
      },
      {
        heading: '2. Vịt quay Bắc Kinh: Đỉnh cao nghệ thuật quay giòn da bí truyền',
        paragraphs: [
          'Món vịt quay Bắc Kinh nổi danh toàn cầu nhờ kỹ thuật quay củi gỗ cây ăn quả đặc biệt, tạo nên lớp da vịt căng bóng màu cánh gián và giòn tan rôm rốp trong miệng.',
          'Đầu bếp sẽ lóc từng lát da giòn mỏng ngay trước mặt thực khách, cuốn cùng lớp bánh tráng mỏng mềm, dưa leo giòn mát, hành boa-rô thái sợi và chấm ngập thứ nước sốt tương ngọt sánh đậm đà.'
        ]
      },
      {
        heading: '3. Mì kéo sợi thủ công Lan Châu và nét văn hóa ẩm thực trường thọ',
        paragraphs: [
          'Chứng kiến nghệ nhân biểu diễn nhào bột và vung tay kéo thành hàng trăm sợi mì dài óng ả chỉ trong chớp mắt là trải nghiệm văn hóa vô cùng thú vị. Bát mì bò Lan Châu nóng hổi với nước dùng thanh ngọt từ củ cải trắng và thịt bắp bò mềm ngậy tượng trưng cho lời chúc sức khỏe và trường thọ.'
        ]
      }
    ]
  }
];

const tourArticlesFromDrafts: TourBlogArticle[] = drafts.flatMap(draft => {
  // Loại bỏ bài thử nghiệm tour 11 đã bị xóa
  if (draft.tourId === 11) {
    return [];
  }

  const tour = MOCK_TOURS.find(item => item.id === draft.tourId);
  if (!tour || !tour.tourCode) {
    return [];
  }

  const tourCode = tour.tourCode;
  const image = tour.thumbnailUrl ?? '';
  const isInternational = internationalTourIds.has(tour.id);

  const text = [
    draft.desc,
    ...draft.sections.flatMap(section => section.paragraphs),
  ].join(' ');

  const readingMinutes = Math.max(
    1,
    Math.ceil(text.trim().split(/\s+/).length / 200),
  );

  const cat: TourBlogArticle['cat'] = 'diaDiem';

  return [
    {
      id: 100 + tour.id,
      tourId: tour.id,
      tourCode,
      isDemo: false,
      cat,
      tag: isInternational ? 'Điểm đến Quốc tế' : 'Điểm đến Trong nước',
      tagColor: isInternational ? 'bg-indigo-500/90' : 'bg-emerald-500/90',
      title: draft.title,
      desc: draft.desc,
      image,
      date: '19/09/2026',
      readTime: `${readingMinutes} phút`,
      views: '850',
      featured: false,
      sections: draft.sections,
    },
  ];
});

export const tourBlogArticles: TourBlogArticle[] = [
  ...dedicatedBlogArticles,
  ...tourArticlesFromDrafts,
];