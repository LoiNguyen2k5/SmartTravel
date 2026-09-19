export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export const blogContents: Record<number, BlogSection[]> = {
  1: [
    {
      heading: 'So sánh tổng chi phí trước khi đặt',
      paragraphs: [
        'Khi so sánh các tour, hãy đối chiếu cùng thời gian đi, số đêm lưu trú và các dịch vụ bao gồm. Giá hiển thị ban đầu có thể chưa phản ánh toàn bộ số tiền cần thanh toán.',
        'Đọc kỹ các mục vé tham quan, bữa ăn, hành lý và phụ thu phòng đơn. Ghi lại những khoản chưa rõ để hỏi đơn vị tổ chức trước khi xác nhận.',
      ],
    },
    {
      heading: 'Kiểm tra lịch trình và điều kiện thay đổi',
      paragraphs: [
        'Chọn lịch khởi hành phù hợp với thời gian nghỉ và khả năng di chuyển của bạn. Một lịch trình quá dày có thể làm giảm thời gian trải nghiệm tại từng điểm đến.',
        'Lưu thông tin xác nhận, điều kiện hủy và đầu mối hỗ trợ. Không nên quyết định chỉ dựa trên phần trăm giảm giá được quảng cáo.',
      ],
    },
  ],
  2: [
    {
      heading: 'Lên kế hoạch khám phá cổ trấn',
      paragraphs: [
        'Bạn có thể chia lịch tham quan thành các khoảng dành cho đi bộ, chụp ảnh và nghỉ ngơi. Khi đi cùng đoàn, cần ghi nhớ điểm hẹn và thời gian tập trung.',
        'Đối chiếu các điểm tham quan với lịch trình tour đã đặt để biết nơi nào có hướng dẫn viên và nơi nào là thời gian tự do.',
      ],
    },
    {
      heading: 'Chuẩn bị trước chuyến đi',
      paragraphs: [
        'Mang giày phù hợp để đi bộ và sắp xếp hành lý gọn nhẹ. Kiểm tra thời tiết gần ngày khởi hành để lựa chọn trang phục.',
        'Hỏi đơn vị tổ chức về giấy tờ cần thiết, phương thức liên lạc và thanh toán tại điểm đến. Tôn trọng không gian sinh hoạt của người dân khi chụp ảnh.',
      ],
    },
  ],
  3: [
    {
      heading: 'Sắp xếp hành trình khám phá ẩm thực',
      paragraphs: [
        'Bánh tráng nướng, sữa đậu nành và nem nướng là những món được nhắc đến trong bài giới thiệu này. Bạn có thể chọn một vài món phù hợp khẩu vị thay vì cố thử quá nhiều trong một buổi.',
        'Nên bố trí thời gian ăn uống xen kẽ với lịch tham quan và kiểm tra giờ phục vụ của quán trước khi đến.',
      ],
    },
    {
      heading: 'Lưu ý khi chọn quán',
      paragraphs: [
        'Xem thực đơn và hỏi rõ giá trước khi gọi món. Với nhóm đông, thống nhất khẩu phần để tránh gọi dư.',
        'Nếu có yêu cầu về thành phần món ăn, hãy trao đổi trực tiếp với quán. Giá cả và cách chế biến có thể khác nhau giữa các địa điểm.',
      ],
    },
  ],
  4: [
    {
      heading: 'Phân bổ thời gian giữa các điểm đến',
      paragraphs: [
        'Hành trình kết hợp Thượng Hải và Ô Trấn cần tính cả thời gian di chuyển giữa các điểm. Đọc kỹ lịch từng ngày để biết thời gian tham quan thực tế.',
        'Bạn có thể ghi lại những điểm muốn chụp ảnh hoặc trải nghiệm, sau đó trao đổi với hướng dẫn viên về khoảng thời gian tự do phù hợp.',
      ],
    },
    {
      heading: 'Chuẩn bị thông tin cần thiết',
      paragraphs: [
        'Lưu địa chỉ nơi lưu trú, điểm hẹn và số liên hệ của trưởng đoàn. Chuẩn bị phương án liên lạc khi tách nhóm trong thời gian tự do.',
        'Kiểm tra với đơn vị tổ chức về giấy tờ, hành lý và các dịch vụ đã bao gồm. Các hoạt động ngoài chương trình cần được xác nhận chi phí riêng.',
      ],
    },
  ],
  5: [
    {
      heading: 'Chuẩn bị cho chuyến đi trong ngày',
      paragraphs: [
        'Xác định phương án di chuyển và thời gian quay về trước khi xuất phát. Chọn lịch trình phù hợp với thể lực của các thành viên trong nhóm.',
        'Mang nước uống, đồ dùng cá nhân và giày phù hợp. Kiểm tra thời tiết và thông tin tuyến tham quan trước ngày đi.',
      ],
    },
    {
      heading: 'Giữ liên lạc và bảo vệ cảnh quan',
      paragraphs: [
        'Đi cùng nhóm và thống nhất điểm tập trung. Tuân thủ biển hướng dẫn tại khu vực tham quan, tránh tự ý đi vào tuyến chưa xác định.',
        'Thu gom rác của mình và tôn trọng không gian sinh hoạt, tín ngưỡng tại điểm đến.',
      ],
    },
  ],
  6: [
    {
      heading: 'Chia hành lý theo nhu cầu sử dụng',
      paragraphs: [
        'Chuẩn bị trang phục, đồ dùng cá nhân và túi đựng đồ ướt. Những vật dụng thường dùng nên để ở ngăn dễ lấy.',
        'Bảo vệ điện thoại và giấy tờ khỏi nước, cát. Kiểm tra giới hạn hành lý nếu chuyến đi có chặng bay.',
      ],
    },
    {
      heading: 'Kiểm tra trước khi rời nhà',
      paragraphs: [
        'Đối chiếu danh sách hành lý với số ngày đi và các hoạt động dự kiến. Hỏi nơi lưu trú những vật dụng đã được cung cấp để tránh mang thừa.',
        'Lưu thông tin đặt phòng, lịch trình và số liên hệ hỗ trợ. Kiểm tra dự báo thời tiết gần ngày khởi hành để điều chỉnh kế hoạch.',
      ],
    },
  ],
  7: [
    {
      heading: 'Chuẩn bị lịch trình trong ngày',
      paragraphs: [
        'Trước chuyến đi, hãy xác định giờ xuất phát, phương tiện và thời gian quay về. Với chuyến đi trong ngày, nên dành khoảng thời gian dự phòng cho việc di chuyển và chờ đợi.',
        'Kiểm tra thông tin hoạt động và giá dịch vụ từ đơn vị vận hành trước khi đi. Nếu đặt tour, hãy hỏi rõ những khoản đã bao gồm trong giá.',
      ],
    },
    {
      heading: 'Những điều cần lưu ý',
      paragraphs: [
        'Chọn trang phục phù hợp với hoạt động tham quan và các không gian tín ngưỡng. Mang hành lý gọn nhẹ và tuân thủ hướng dẫn tại điểm đến.',
        'Nếu đi cùng nhóm, thống nhất điểm hẹn và số điện thoại liên hệ. Xem thực đơn và hỏi giá trước khi sử dụng dịch vụ ăn uống.',
      ],
    },
  ],
  8: [
    {
      heading: 'Xác nhận phương tiện và nơi lưu trú',
      paragraphs: [
        'Khi lên kế hoạch đi Phú Quý, hãy kiểm tra lịch phương tiện từ đơn vị vận hành và xác nhận lại gần ngày khởi hành. Bố trí thời gian dự phòng nếu lịch di chuyển thay đổi.',
        'Liên hệ nơi lưu trú để xác nhận giờ nhận phòng, vị trí và phương án di chuyển sau khi đến nơi.',
      ],
    },
    {
      heading: 'Sắp xếp hoạt động trên đảo',
      paragraphs: [
        'Chia các điểm muốn tham quan theo từng buổi và dành thời gian nghỉ giữa các hoạt động. Điều chỉnh lịch trình theo điều kiện thực tế.',
        'Tuân thủ hướng dẫn tại khu vực biển, giữ vệ sinh và thu gom rác sau chuyến tham quan.',
      ],
    },
  ],
  9: [
    {
      heading: 'Kết hợp tham quan và nghỉ ngơi',
      paragraphs: [
        'Bạn có thể chia lịch trình thành các khoảng dành cho tìm hiểu lịch sử, ngắm cảnh và nghỉ ngơi. Tránh xếp quá nhiều hoạt động trong ngày đến hoặc ngày về.',
        'Kiểm tra giờ mở cửa và yêu cầu tham quan của từng địa điểm trước chuyến đi.',
      ],
    },
    {
      heading: 'Tôn trọng không gian tại điểm đến',
      paragraphs: [
        'Lựa chọn trang phục và ứng xử phù hợp khi tham quan di tích hoặc không gian tưởng niệm. Thực hiện theo hướng dẫn của người phụ trách.',
        'Giữ gìn cảnh quan, không để lại rác và xác nhận chi phí trước khi sử dụng các dịch vụ ngoài chương trình.',
      ],
    },
  ],
};