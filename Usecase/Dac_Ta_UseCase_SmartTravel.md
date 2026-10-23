# BÁO CÁO TIỂU LUẬN CHUYÊN NGÀNH CÔNG NGHỆ THÔNG TIN
# DỰ ÁN: SMARTTRAVEL - NỀN TẢNG ĐẶT TOUR DU LỊCH ĐA ĐẠI LÝ TÍCH HỢP AI & THANH TOÁN TRỰC TUYẾN
## (Công nghệ: Spring Boot 3 + ReactJS / TypeScript)

---

## MỤC 2.3. XÂY DỰNG CÁC CHỨC NĂNG CHÍNH SẼ THỰC HIỆN

Dựa trên quá trình khảo sát thực tế nghiệp vụ du lịch lữ hành và yêu cầu bài toán đặt ra cho nền tảng thương mại điện tử du lịch đa đại lý (Multi-vendor Travel Platform), hệ thống **SmartTravel** được phân rã thành các phân hệ chức năng tương ứng với từng nhóm người dùng (Actors). 

Hệ thống phục vụ 3 nhóm tác nhân chính:
1. **Customer (Khách hàng / Khách du lịch)**: Người dùng tìm kiếm, đặt tour, thanh toán trực tuyến, tra cứu thủ tục visa, nhận vé điện tử QR Code và đánh giá tour.
2. **Vendor (Đại lý du lịch / Nhà cung cấp tour)**: Các doanh nghiệp lữ hành đối tác trực tiếp tạo tour, quản lý lịch khởi hành, cấu hình chính sách visa, quét mã QR check-in khách lên xe và phân tích hiệu quả kinh doanh.
3. **Admin (Quản trị viên hệ thống)**: Chịu trách nhiệm quản lý người dùng, phân quyền RBAC, kiểm duyệt đối tác Vendor, kiểm duyệt nội dung tour trước khi công khai lên sàn, quản lý danh mục địa danh, phát hành mã giảm giá và đối soát hoa hồng toàn sàn.
4. **Hệ thống ngoài (Secondary Actors)**:
   - **BankGateway**: Cổng thanh toán trực tuyến & hệ thống ngân hàng (VietQR / Webhook đối soát tự động).
   - **Google Gemini API**: Trợ lý trí tuệ nhân tạo phục vụ tư vấn tour, giải đáp thủ tục visa thông minh, sinh mô tả tour chuẩn SEO và phân tích cảm xúc đánh giá khách hàng (AI Sentiment Analysis).

Bảng tổng hợp chi tiết toàn bộ các chức năng chính trong hệ thống SmartTravel được trình bày ở Bảng 2.1 dưới đây:

### Bảng 2.1. Danh mục các chức năng chính trong hệ thống SmartTravel

| STT | Phân hệ / Chức năng chính | Mô tả tóm tắt nghiệp vụ | Người dùng (Actors) |
| :---: | :--- | :--- | :--- |
| **I** | **PHÂN HỆ XÁC THỰC & HỒ SƠ CÁ NHÂN** | | |
| 1 | Đăng ký tài khoản mới | Đăng ký tài khoản hệ thống với xác thực mã OTP qua Email bảo mật | Khách vãng lai |
| 2 | Đăng nhập hệ thống | Đăng nhập qua JWT (JSON Web Token), phân quyền tự động theo Role | User (Customer, Vendor, Admin) |
| 3 | Quên mật khẩu & Đặt lại mật khẩu | Khôi phục mật khẩu thông qua xác thực mã OTP 6 số gửi về Email | User (Customer, Vendor, Admin) |
| 4 | Đăng xuất | Hủy phiên đăng nhập, thu hồi và vô hiệu hóa JWT Token ở Client | User (Customer, Vendor, Admin) |
| 5 | Quản lý hồ sơ cá nhân | Xem thông tin, cập nhật họ tên, số điện thoại, ngày sinh và ảnh đại diện | User (Customer, Vendor, Admin) |
| 6 | Đổi mật khẩu | Thay đổi mật khẩu định kỳ với yêu cầu nhập mật khẩu hiện tại | User (Customer, Vendor, Admin) |
| **II** | **PHÂN HỆ KHÁM PHÁ & TƯ VẤN TOUR (CUSTOMER)** | | |
| 7 | Tìm kiếm & Lọc tour đa tiêu chí | Tìm kiếm theo từ khóa/điểm đến; Lọc theo khoảng giá, thời gian, loại tour | Customer, Khách vãng lai |
| 8 | Xem chi tiết tour & Lịch trình | Xem lịch trình chi tiết theo từng ngày, hình ảnh, tiện ích, chính sách hủy | Customer, Khách vãng lai |
| 9 | Tra cứu thông tin thủ tục Visa | Xem điều kiện, yêu cầu hồ sơ xin visa du lịch tích hợp trực tiếp theo từng tour | Customer, Khách vãng lai |
| 10 | Xem cẩm nang du lịch | Đọc các bài viết cẩm nang du lịch, kinh nghiệm du lịch các địa phương | Customer, Khách vãng lai |
| 11 | Xem danh sách khuyến mãi & Ưu đãi | Khám phá các chương trình giảm giá, mã khuyến mãi đang có hiệu lực | Customer, Khách vãng lai |
| 12 | Tư vấn tour bằng Chatbot AI | Tương tác trò chuyện với Chatbot AI để nhận gợi ý tour theo sở thích, ngân sách | Customer, Khách vãng lai (Google Gemini API) |
| 13 | Tra cứu thủ tục Visa bằng Chatbot AI | Hỏi đáp thông minh với Chatbot AI về điều kiện, quy trình làm hồ sơ Visa du lịch | Customer, Khách vãng lai (Google Gemini API) |
| **III** | **PHÂN HỆ ĐẶT TOUR & THANH TOÁN (CUSTOMER)** | | |
| 14 | Đặt tour & Đăng ký dịch vụ Visa | Chọn lịch khởi hành, số lượng vé người lớn/trẻ em, đăng ký làm dịch vụ visa | Customer |
| 15 | Kiểm tra & Khóa giữ slot Real-time | Hệ thống tự động kiểm tra số lượng chỗ khả dụng và khóa giữ slot trong 15 phút | Hệ thống (Customer) |
| 16 | Áp dụng mã giảm giá khi thanh toán | Nhập mã Voucher, hệ thống tự kiểm tra điều kiện áp dụng và khấu trừ tổng tiền | Customer |
| 17 | Thanh toán đa kênh (VietQR / Thẻ Visa) | Tạo mã VietQR động kèm mã giao dịch duy nhất hoặc chuyển hướng cổng thanh toán | Customer (BankGateway) |
| 18 | Tự động đối soát thanh toán (Webhook) | Nhận tín hiệu Webhook từ cổng ngân hàng, kiểm tra số tiền và khớp lệnh tự động | Hệ thống (BankGateway) |
| 19 | Nhận & Tra cứu Vé điện tử E-Ticket | Phát hành vé điện tử kèm mã QR Code bảo mật để hành khách tra cứu khi lên xe | Customer |
| **IV** | **PHÂN HỆ QUẢN LÝ ĐƠN HÀNG & ĐÁNH GIÁ (CUSTOMER)** | | |
| 20 | Xem lịch sử đặt tour & Trạng thái | Quản lý danh sách các đơn đặt tour đã đặt: Đang chờ, Đã thanh toán, Hoàn thành, Đã hủy | Customer |
| 21 | Hủy đơn đặt tour | Yêu cầu hủy đơn tour theo chính sách hoàn tiền tương ứng với thời gian khởi hành | Customer |
| 22 | Đánh giá sao & Đăng ảnh trải nghiệm | Gửi đánh giá từ 1 đến 5 sao, kèm bình luận và hình ảnh thực tế sau khi đi tour | Customer |
| **V** | **PHÂN HỆ DÀNH CHO ĐỐI TÁC ĐẠI LÝ (VENDOR)** | | |
| 23 | Đăng ký trở thành Đại lý Vendor | Nộp đơn đăng ký đại lý, nhập thông tin doanh nghiệp, tải giấy phép kinh doanh | Customer (Người dùng có nhu cầu) |
| 24 | Theo dõi trạng thái xét duyệt hồ sơ | Kiểm tra trạng thái hồ sơ đại lý (Đang chờ duyệt, Được phê duyệt, Bị từ chối) | Customer (Ứng viên Vendor) |
| 25 | Đăng bán tour du lịch mới | Tạo thông tin tour: tiêu đề, điểm đến, thời lượng, phương tiện, lịch trình theo ngày | Vendor |
| 26 | Cấu hình chính sách & Hồ sơ Visa | Thiết lập yêu cầu giấy tờ, thủ tục visa du lịch đối với các tour quốc tế | Vendor |
| 27 | Tạo mô tả tour chuẩn SEO bằng AI | Tự động sinh nội dung mô tả tour hấp dẫn, chuẩn SEO bằng Google Gemini AI | Vendor (Google Gemini API) |
| 28 | Cập nhật tour & Thư viện ảnh | Chỉnh sửa thông tin tour và quản lý upload album ảnh chất lượng cao lên Cloudinary | Vendor |
| 29 | Quản lý lịch khởi hành & Cấu hình chỗ | Tạo các chuyến đi theo ngày, cấu hình số lượng chỗ tối đa, đóng/hủy lịch khởi hành | Vendor |
| 30 | Cập nhật giá vé Người lớn / Trẻ em | Thiết lập chính sách giá vé linh hoạt theo từng ngày khởi hành và phân loại đối tượng | Vendor |
| 31 | Quản lý danh sách đặt chỗ & Hành khách | Xem danh sách các đơn booking, tra cứu danh sách hành khách theo từng chuyến đi | Vendor |
| 32 | Quét mã QR E-Ticket check-in lên xe | Sử dụng camera quét mã QR trên vé điện tử của khách khi lên xe để điểm danh | Vendor |
| 33 | Cập nhật trạng thái đơn đặt tour | Cập nhật trạng thái dịch vụ (Đã xác nhận, Khách đã check-in tham gia tour) | Vendor |
| 34 | Thống kê doanh thu & Tỷ lệ lấp đầy | Xem biểu đồ doanh thu theo thời gian, tỷ lệ lấp đầy slot chỗ ngồi của các tour | Vendor |
| 35 | Phân tích cảm xúc đánh giá bằng AI | Dùng Gemini AI phân tích các đánh giá (Tích cực, Trung tính, Tiêu cực) để cải tiến tour | Vendor (Google Gemini API) |
| **VI** | **PHÂN HỆ QUẢN TRỊ TOÀN SÀN (ADMIN)** | | |
| 36 | Quản lý người dùng & Phân quyền RBAC | Xem danh sách tất cả tài khoản, phân quyền Role, Khóa hoặc Mở khóa tài khoản | Admin |
| 37 | Phê duyệt hồ sơ đối tác Vendor | Thẩm định hồ sơ doanh nghiệp, phê duyệt nâng quyền Vendor hoặc thu hồi quyền | Admin |
| 38 | Kiểm duyệt nội dung tour đăng bán | Thẩm định nội dung tour của Vendor, duyệt công khai lên sàn hoặc từ chối có lý do | Admin |
| 39 | Quản trị danh mục địa danh du lịch | Quản lý danh mục các địa danh, tỉnh thành, quốc gia (Thêm, Sửa, Xóa địa danh) | Admin |
| 40 | Quản lý mã giảm giá (Voucher) | Tạo mới mã voucher, cấu hình tỷ lệ giảm giá, giá trị tối đa, hạn dùng, bật/tắt | Admin |
| 41 | Theo dõi dòng tiền & Đối soát hoa hồng | Theo dõi tổng tiền nạp/rút, hoa hồng sàn nhận được từ mỗi đơn booking thành công | Admin |
| 42 | Báo cáo Dashboard doanh thu toàn sàn | Biểu đồ trực quan tổng doanh thu, số lượng đơn đặt, tăng trưởng người dùng toàn sàn | Admin |

*(Ghi chú: Toàn bộ các chức năng liên quan đến Khách sạn và Lập lịch trình cá nhân hóa AI đã được loại bỏ hoàn toàn khỏi phạm vi bài toán).*

---

## MỤC 2.4. XÂY DỰNG LƯỢC ĐỒ CHỨC NĂNG (USECASE DIAGRAM)

Lược đồ Use Case thể hiện trực quan mối quan hệ giữa các tác nhân (Actors) với các hành vi/chức năng mà hệ thống cung cấp (Use Cases). Trong đồ án này, mô hình Use Case được xây dựng theo chuẩn UML 2.0 bằng phần mềm **StarUML**, bao gồm 1 lược đồ chức năng tổng quát và 12 lược đồ phân rã chi tiết độc lập.

### 2.4.1. Lược đồ chức năng chính (Tổng quát)
- **Tên file thiết kế**: `SmartTravel_UseCase_Diagram.mdj`
- **Mô tả**: Lược đồ thể hiện bức tranh toàn cảnh hệ thống SmartTravel. Khung ranh giới hệ thống (Subject) chứa các nhóm chức năng cốt lõi được gắn kết với 3 tác nhân chính (`Customer`, `Vendor`, `Admin`) và 2 tác nhân phụ (`BankGateway`, `Google Gemini API`). Các quan hệ `<<include>>` và `<<extend>>` giữa các phân hệ được thiết kế chặt chẽ, loại bỏ hoàn toàn các phần tử dư thừa.

### 2.4.2. Lược đồ Use Case Xác thực
- **Tên file thiết kế**: `UC_01_XacThuc.mdj` (hoặc `Usecase_1.mdj`)
- **Mô tả**: Biểu diễn các chức năng xác thực người dùng trong hệ thống (`uc Authentication`), bao gồm đăng ký tài khoản với xác thực OTP qua Email, đăng nhập cấp phát token JWT bảo mật, quên mật khẩu và đăng xuất.

### 2.4.3. Lược đồ Use Case Quản lý hồ sơ cá nhân
- **Tên file thiết kế**: `UC_02_HoSoCaNhan.mdj` (hoặc `Usecase_2.mdj`)
- **Mô tả**: Biểu diễn các chức năng quản lý tài khoản người dùng (`uc Manage Profile`), cho phép xem thông tin cá nhân, cập nhật dữ liệu hồ sơ, cập nhật ảnh đại diện và thực hiện đổi mật khẩu bảo mật.

### 2.4.4. Lược đồ Use Case Tìm kiếm, Xem chi tiết Tour & Cẩm nang
- **Tên file thiết kế**: `UC_03_TimKiemVaXemTour.mdj` (hoặc `Usecase_3.mdj`)
- **Mô tả**: Biểu diễn phân rã các tính năng khám phá du lịch (`uc Tour Discovery`) của khách hàng, bao gồm tìm kiếm tour theo từ khóa/điểm đến, bộ lọc đa tiêu chí (giá, loại hình, thời gian), xem chi tiết lịch trình, tra cứu thủ tục visa, xem cẩm nang du lịch và danh sách ưu đãi.

### 2.4.5. Lược đồ Use Case Tư vấn Tour & Visa bằng Chatbot AI
- **Tên file thiết kế**: `UC_04_TuVanChatbotAI.mdj` (hoặc `Usecase_4.mdj`)
- **Mô tả**: Biểu diễn sự tương tác thông minh giữa `Customer` và trợ lý ảo AI (`uc AI Chatbot Consultation`) thông qua việc tích hợp `Google Gemini API` để hỏi đáp thông tin tour, nhận gợi ý hành trình và hướng dẫn chi tiết về thủ tục cấp visa.

### 2.4.6. Lược đồ Use Case Đặt tour & Thanh toán đa kênh
- **Tên file thiết kế**: `UC_05_DatTourVaThanhToan.mdj` (hoặc `Usecase_5.mdj`)
- **Mô tả**: Biểu diễn quy trình thương mại điện tử cốt lõi (`uc Booking & Payment`), bao gồm: đặt tour, chọn dịch vụ visa, cơ chế khóa giữ slot chỗ real-time, áp dụng voucher giảm giá, thanh toán đa kênh (VietQR/Thẻ Visa), webhook đối soát tự động từ `BankGateway` và phát hành vé điện tử E-Ticket QR Code.

### 2.4.7. Lược đồ Use Case Lịch sử đặt tour, Hủy tour & Đánh giá
- **Tên file thiết kế**: `UC_06_LichSuDatTourVaDanhGia.mdj` (hoặc `Usecase_6.mdj`)
- **Mô tả**: Biểu diễn quy trình chăm sóc sau bán hàng (`uc Booking History & Review`), cho phép khách hàng tra cứu tiến độ đơn đặt chỗ, xem/tải vé điện tử E-Ticket QR, thực hiện yêu cầu hủy tour hoàn tiền và viết bài đánh giá kèm hình ảnh thực tế sau khi hoàn thành chuyến đi.

### 2.4.8. Lược đồ Use Case Đăng ký trở thành Đại lý Vendor
- **Tên file thiết kế**: `UC_07_DangKyVendor.mdj` (hoặc `Usecase_7.mdj`)
- **Mô tả**: Biểu diễn quy trình mở rộng mạng lưới đối tác (`uc Vendor Registration`), cho phép người dùng nộp đơn đăng ký đại lý du lịch, tải lên hồ sơ pháp lý doanh nghiệp và theo dõi tiến độ xét duyệt trực tuyến.

### 2.4.9. Lược đồ Use Case Quản lý Tour, Lịch khởi hành & Visa của Vendor
- **Tên file thiết kế**: `UC_08_VendorQuanLyTour.mdj` (hoặc `Usecase_8.mdj`)
- **Mô tả**: Biểu diễn toàn bộ nghiệp vụ quản lý sản phẩm du lịch của đại lý (`uc Vendor Tour Management`): đăng bán tour, cấu hình yêu cầu visa (áp dụng ràng buộc `{tour quốc tế}`), gọi `Google Gemini API` tự động viết nội dung chuẩn SEO, cập nhật thư viện ảnh qua Cloudinary, tạo các đợt khởi hành và thiết lập giá vé người lớn/trẻ em.

### 2.4.10. Lược đồ Use Case Quản lý đơn đặt chỗ & Quét QR Check-in của Vendor
- **Tên file thiết kế**: `UC_09_VendorQuanLyDonVaCheckin.mdj` (hoặc `Usecase_9.mdj`)
- **Mô tả**: Biểu diễn nghiệp vụ vận hành chuyến đi (`uc Vendor Booking & Check-in`), cho phép đại lý theo dõi danh sách hành khách, cập nhật trạng thái đơn đặt chỗ và thực hiện quét mã QR E-Ticket để xác thực check-in cho hành khách khi lên xe.

### 2.4.11. Lược đồ Use Case Thống kê doanh thu & Phân tích đánh giá bằng AI của Vendor
- **Tên file thiết kế**: `UC_10_VendorThongKeVaAISentiment.mdj` (hoặc `Usecase_10.mdj`)
- **Mô tả**: Biểu diễn công cụ hỗ trợ kinh doanh (`uc Vendor Analytics & AI Sentiment`), cung cấp biểu đồ thống kê doanh thu theo kỳ, tỷ lệ lấp đầy chỗ của từng tour và ứng dụng `Google Gemini API` để phân tích cảm xúc từ phản hồi của khách hàng.

### 2.4.12. Lược đồ Use Case Quản lý người dùng & Phê duyệt đối tác Vendor của Admin
- **Tên file thiết kế**: `UC_11_AdminQuanLyNguoiDungVaVendor.mdj` (hoặc `Usecase_11.mdj`)
- **Mô tả**: Biểu diễn phân hệ quản trị nhân sự và đối tác (`uc Admin User & Vendor Management`): quản lý tài khoản người dùng, thực hiện khóa/mở khóa tài khoản, phân quyền RBAC và thẩm định chi tiết hồ sơ để nâng quyền hoặc thu hồi quyền đại lý Vendor.

### 2.4.13. Lược đồ Use Case Kiểm duyệt Tour, Địa danh, Khuyến mãi & Đối soát của Admin
- **Tên file thiết kế**: `UC_12_AdminKiemDuyetVaTaiChinh.mdj` (hoặc `Usecase_12.mdj`)
- **Mô tả**: Biểu diễn nghiệp vụ quản trị nội dung và tài chính (`uc Admin Content, Voucher & Financial Management`): kiểm duyệt tour của Vendor trước khi đăng bán, quản lý danh mục địa danh du lịch, quản lý chương trình mã giảm giá, đối soát dòng tiền hoa hồng và dashboard báo cáo tổng thể toàn sàn.

---

## MỤC 2.5. ĐẶC TẢ USE CASE CHI TIẾT

Phần này trình bày đặc tả chi tiết từng Use Case tương ứng với 12 lược đồ chức năng ở Mục 2.4 theo đúng chuẩn báo cáo học thuật ngành Công nghệ Thông tin. Mỗi đặc tả phản ánh chính xác cấu trúc kỹ thuật: giao diện người dùng ReactJS / TypeScript, xử lý nghiệp vụ tại Spring Boot, truy vấn cơ sở dữ liệu MySQL, và tương tác với các hệ sinh thái bên ngoài (Google Gemini AI, VietQR Webhook, Cloudinary, Email SMTP).

---

### 2.5.1. Đặc tả Use Case: Đăng ký tài khoản mới (Xác thực OTP qua Email)
- **Mô tả**: Cho phép khách vãng lai đăng ký tài khoản khách hàng (`Customer`) trên hệ thống SmartTravel. Để đảm bảo tính xác thực và an toàn, hệ thống áp dụng cơ chế xác minh địa chỉ email thông qua mã số xác thực một lần (OTP - One Time Password) có hiệu lực trong thời gian giới hạn.
- **Tác nhân chính**: Khách vãng lai (Chưa đăng nhập).
- **Tác nhân phụ**: Mail Service (Gửi email chứa mã OTP).
- **Điều kiện**: Khách vãng lai truy cập vào website SmartTravel và chưa đăng nhập vào hệ thống.
- **Luồng sự kiện chính**:
  1. Người dùng bấm vào nút "Đăng ký" trên thanh điều hướng (Navbar).
  2. Giao diện (ReactJS) hiển thị form đăng ký yêu cầu nhập: Họ và tên, Email, Số điện thoại, Mật khẩu và Xác nhận mật khẩu.
  3. Người dùng nhập đầy đủ thông tin hợp lệ và nhấn nút "Đăng ký".
  4. Frontend gửi yêu cầu `POST /api/auth/register` kèm payload thông tin người dùng về Backend Spring Boot.
  5. Hệ thống Backend tiếp nhận, kiểm tra tính hợp lệ của dữ liệu (email đúng định dạng, mật khẩu tối thiểu 6 ký tự).
  6. Backend truy vấn cơ sở dữ liệu kiểm tra xem Email hoặc Số điện thoại đã tồn tại trong hệ thống hay chưa.
  7. Hệ thống tạo một mã OTP ngẫu nhiên gồm 6 chữ số, lưu mã OTP kèm thời gian hết hạn (15 phút) vào bảng lưu tạm (hoặc cache).
  8. Hệ thống gửi email chứa mã OTP kích hoạt tài khoản tới địa chỉ email người dùng đã đăng ký.
  9. Frontend chuyển sang giao diện nhập mã OTP gồm 6 ô số và hiển thị bộ đếm ngược thời gian hiệu lực (15 phút).
  10. Người dùng kiểm tra hộp thư email cá nhân, lấy mã OTP, nhập vào giao diện và nhấn "Xác nhận".
  11. Frontend gửi yêu cầu `POST /api/auth/verify-otp` về Backend kèm theo email và mã OTP.
  12. Backend kiểm tra mã OTP: xác nhận mã trùng khớp và còn trong thời gian hiệu lực.
  13. Backend mã hóa mật khẩu người dùng bằng thuật toán BCrypt (`BCryptPasswordEncoder`), tạo mới bản ghi người dùng với vai trò mặc định `ROLE_CUSTOMER`, kích hoạt tài khoản (`status = ACTIVE`) và lưu vào CSDL.
  14. Hệ thống trả về thông báo thành công. Frontend chuyển hướng người dùng sang trang Đăng nhập kèm thông báo chúc mừng.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *3a. Thông tin nhập không hợp lệ*: Email không đúng định dạng, mật khẩu dưới 6 ký tự hoặc xác nhận mật khẩu không khớp -> Frontend hiển thị lỗi trực tiếp ngay dưới ô nhập liệu và ngăn không gửi form.
  - *6a. Email hoặc Số điện thoại đã được đăng ký*: Backend trả về mã lỗi 400 (`EMAIL_ALREADY_EXISTS`) -> Frontend hiển thị thông báo "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác".
  - *8a. Lỗi gửi Email SMTP*: Không thể kết nối tới máy chủ gửi mail -> Backend ghi nhận log lỗi và trả về thông báo hệ thống gián đoạn, yêu cầu người dùng thử lại sau.
  - *12a. Mã OTP không chính xác*: Backend trả về mã lỗi 400 (`INVALID_OTP`) -> Frontend hiển thị cảnh báo "Mã OTP không hợp lệ, vui lòng kiểm tra lại".
  - *12b. Mã OTP đã hết hạn*: Backend trả về mã lỗi 400 (`OTP_EXPIRED`) -> Frontend hiển thị nút "Gửi lại mã OTP" để người dùng yêu cầu mã xác thực mới.
- **Kết quả**: Tài khoản người dùng được tạo thành công với vai trò Customer, trạng thái hoạt động bình thường và có thể đăng nhập vào hệ thống.

---

### 2.5.2. Đặc tả Use Case: Đăng nhập hệ thống (Xác thực JWT)
- **Mô tả**: Cho phép người dùng (Customer, Vendor, Admin) đăng nhập vào hệ thống bằng Email và Mật khẩu đã đăng ký để sử dụng các tính năng được phân quyền tương ứng. Hệ thống sử dụng kiến trúc xác thực Stateless thông qua JSON Web Token (JWT).
- **Tác nhân chính**: User (Customer, Vendor, Admin).
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Người dùng đã sở hữu tài khoản hợp lệ trên hệ thống.
- **Luồng sự kiện chính**:
  1. Người dùng nhấn nút "Đăng nhập" trên thanh điều hướng.
  2. Giao diện hiển thị form Đăng nhập yêu cầu nhập Email và Mật khẩu.
  3. Người dùng nhập thông tin đăng nhập và nhấn nút "Đăng nhập".
  4. Frontend gửi yêu cầu `POST /api/auth/login` chứa Email và Mật khẩu tới Backend.
  5. Spring Security thực hiện xác thực thông tin thông qua `AuthenticationManager`:
     - Kiểm tra sự tồn tại của Email trong cơ sở dữ liệu.
     - So khớp chuỗi mật khẩu người dùng nhập với chuỗi hash mật khẩu đã lưu trong CSDL bằng BCrypt.
  6. Backend kiểm tra trạng thái hoạt động của tài khoản (`status == ACTIVE`).
  7. Hệ thống sinh Access Token (JWT) chứa thông tin định danh (User ID, Email, Role) kèm thời hạn hiệu lực (24 giờ).
  8. Backend phản hồi HTTP 200 kèm theo Access Token và thông tin cơ bản của User (Họ tên, Avatar, Role).
  9. Frontend lưu JWT vào `localStorage` (hoặc cookie an toàn), cập nhật trạng thái đăng nhập vào Redux/Context Store.
  10. Hệ thống tự động chuyển hướng người dùng dựa theo vai trò:
      - `ROLE_ADMIN`: Chuyển hướng về trang Quản trị toàn sàn (`/admin/dashboard`).
      - `ROLE_VENDOR`: Chuyển hướng về trang Quản lý đại lý (`/vendor/dashboard`).
      - `ROLE_CUSTOMER`: Duy trì tại trang chủ hoặc chuyển về trang cá nhân (`/profile`).
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *5a. Sai Email hoặc Mật khẩu*: Backend trả về HTTP 401 (`BAD_CREDENTIALS`) -> Frontend hiển thị thông báo "Email hoặc mật khẩu không chính xác".
  - *6a. Tài khoản đang bị khóa*: Nếu tài khoản có trạng thái `BLOCKED` hoặc `INACTIVE`, Backend từ chối xác thực và trả về lỗi 403 -> Frontend hiển thị cảnh báo "Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ".
- **Kết quả**: Người dùng đăng nhập thành công, nhận được JWT Token hợp lệ và truy cập vào giao diện làm việc theo đúng vai trò được phân quyền.

---

### 2.5.3. Đặc tả Use Case: Quên mật khẩu & Đặt lại mật khẩu qua OTP
- **Mô tả**: Hỗ trợ người dùng tự lấy lại quyền truy cập tài khoản khi quên mật khẩu thông qua việc xác thực mã bảo mật OTP được gửi về địa chỉ email đã đăng ký.
- **Tác nhân chính**: User (Customer, Vendor, Admin).
- **Tác nhân phụ**: Mail Service.
- **Điều kiện**: Người dùng có tài khoản đã đăng ký trên hệ thống và có quyền truy cập vào hộp thư email tương ứng.
- **Luồng sự kiện chính**:
  1. Tại màn hình Đăng nhập, người dùng bấm vào đường liên kết "Quên mật khẩu?".
  2. Hệ thống chuyển sang giao diện Khôi phục mật khẩu, hiển thị ô nhập địa chỉ Email.
  3. Người dùng nhập email của tài khoản và nhấn "Gửi mã xác nhận".
  4. Frontend gửi request `POST /api/auth/forgot-password` tới Backend.
  5. Backend kiểm tra sự tồn tại của email trong hệ thống CSDL.
  6. Hệ thống tạo mã OTP gồm 6 chữ số ngẫu nhiên, lưu mã OTP kèm thời gian hết hạn (15 phút) vào cơ sở dữ liệu.
  7. Hệ thống gửi email chứa mã OTP và hướng dẫn đặt lại mật khẩu đến hòm thư của người dùng.
  8. Giao diện chuyển sang màn hình nhập mã OTP và Mật khẩu mới kèm ô Xác nhận mật khẩu mới.
  9. Người dùng nhập mã OTP từ email và nhập mật khẩu mới, sau đó bấm nút "Đặt lại mật khẩu".
  10. Frontend gửi request `POST /api/auth/reset-password` kèm email, OTP và mật khẩu mới.
  11. Backend kiểm tra tính chính xác và thời hạn của OTP.
  12. Backend mã hóa mật khẩu mới bằng BCrypt, cập nhật vào CSDL và xóa/hủy mã OTP vừa sử dụng.
  13. Backend phản hồi HTTP 200 thông báo thành công.
  14. Frontend thông báo "Đổi mật khẩu thành công. Vui lòng đăng nhập lại" và chuyển người dùng về trang Đăng nhập.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *5a. Email không tồn tại trong hệ thống*: Backend trả về HTTP 404 (`EMAIL_NOT_FOUND`) -> Frontend hiển thị thông báo "Không tìm thấy tài khoản liên kết với địa chỉ email này".
  - *11a. Mã OTP sai hoặc hết hạn*: Backend trả về mã lỗi tương ứng -> Frontend thông báo lỗi và yêu cầu nhập lại mã OTP hoặc nhấn "Gửi lại OTP".
  - *11b. Mật khẩu mới không đáp ứng yêu cầu*: Mật khẩu dưới 6 ký tự hoặc không khớp -> Frontend cảnh báo ngay trên form.
- **Kết quả**: Mật khẩu tài khoản được cập nhật mới thành công, người dùng có thể dùng mật khẩu mới để đăng nhập.

---

### 2.5.4. Đặc tả Use Case: Quản lý hồ sơ cá nhân & Đổi mật khẩu
- **Mô tả**: Cung cấp cho người dùng đã đăng nhập khả năng xem thông tin chi tiết hồ sơ cá nhân, chỉnh sửa thông tin liên hệ, cập nhật ảnh đại diện lên máy chủ đám mây Cloudinary và thực hiện đổi mật khẩu tài khoản định kỳ.
- **Tác nhân chính**: User (Customer, Vendor, Admin).
- **Tác nhân phụ**: Cloudinary API (Lưu trữ ảnh đại diện).
- **Điều kiện**: Người dùng đã đăng nhập thành công vào hệ thống.
- **Luồng sự kiện chính**:
  - **Nhánh Xem và Cập nhật hồ sơ cá nhân**:
    1. Người dùng bấm vào menu đại diện trên Header và chọn mục "Hồ sơ cá nhân".
    2. Frontend gửi request `GET /api/users/profile` kèm Header `Authorization: Bearer <JWT>`.
    3. Backend trích xuất User ID từ JWT, truy vấn thông tin chi tiết từ bảng `users` và trả về JSON dữ liệu.
    4. Giao diện hiển thị đầy đủ thông tin: Họ tên, Email, Số điện thoại, Địa chỉ, Ngày sinh, Vai trò và Ảnh đại diện hiện tại.
    5. Người dùng thực hiện chỉnh sửa các trường thông tin hoặc tải tệp ảnh đại diện mới từ thiết bị.
    6. Nếu có chọn ảnh mới, Frontend upload ảnh lên Cloudinary lấy đường dẫn URL bảo mật (HTTPS).
    7. Người dùng nhấn nút "Lưu thay đổi".
    8. Frontend gửi request `PUT /api/users/profile` chứa các thông tin cập nhật và URL ảnh mới về Backend.
    9. Backend kiểm tra tính hợp lệ của dữ liệu, cập nhật bản ghi người dùng trong CSDL và phản hồi thành công.
    10. Frontend cập nhật lại giao diện người dùng và thông báo "Cập nhật hồ sơ cá nhân thành công".
  - **Nhánh Đổi mật khẩu**:
    1. Tại trang Hồ sơ cá nhân, người dùng chuyển sang tab "Bảo mật & Đổi mật khẩu".
    2. Giao diện hiển thị 3 ô nhập: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
    3. Người dùng điền đầy đủ 3 trường và nhấn "Cập nhật mật khẩu".
    4. Frontend gửi request `PUT /api/users/change-password` kèm mật khẩu cũ và mới.
    5. Backend kiểm tra mật khẩu hiện tại bằng `BCryptPasswordEncoder.matches()`.
    6. Nếu mật khẩu cũ chính xác, Backend mã hóa mật khẩu mới và lưu vào CSDL.
    7. Backend trả về thông báo thành công. Frontend hiển thị thông báo đổi mật khẩu hoàn tất.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *5a. Định dạng ảnh tải lên không hợp lệ*: Người dùng tải tệp không phải ảnh hoặc dung lượng vượt quá 5MB -> Hệ thống từ chối tệp và cảnh báo "Chỉ chấp nhận định dạng ảnh JPG, PNG dưới 5MB".
  - *5b. Mật khẩu hiện tại không đúng*: Tại bước đổi mật khẩu, người dùng nhập sai mật khẩu cũ -> Backend trả về HTTP 400 (`INCORRECT_CURRENT_PASSWORD`) -> Frontend cảnh báo "Mật khẩu hiện tại không chính xác".
- **Kết quả**: Thông tin hồ sơ cá nhân hoặc mật khẩu của người dùng được cập nhật mới chính xác trong hệ thống.

---

### 2.5.5. Đặc tả Use Case: Tìm kiếm & Lọc tour du lịch đa tiêu chí
- **Mô tả**: Cho phép khách hàng tìm kiếm và tra cứu các tour du lịch phù hợp với nhu cầu thông qua từ khóa tìm kiếm (tên tour, địa danh, tỉnh thành) kết hợp với bộ lọc nâng cao theo khoảng giá, thời lượng chuyến đi, phân loại tour (trong nước / quốc tế).
- **Tác nhân chính**: Customer, Khách vãng lai.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Khách truy cập vào trang web SmartTravel.
- **Luồng sự kiện chính**:
  1. Người dùng truy cập trang "Danh sách tour du lịch" (`/tours`) hoặc sử dụng thanh tìm kiếm nhanh tại Trang chủ.
  2. Người dùng nhập từ khóa tìm kiếm (ví dụ: "Đà Nẵng", "Phú Quốc", "Thái Lan") vào ô tìm kiếm.
  3. Người dùng tùy chọn thêm các tiêu chí lọc ở thanh công cụ bên trái giao diện:
     - Khoảng giá mong muốn (sử dụng thanh trượt Slider: từ mức giá tối thiểu đến tối đa).
     - Thời gian tour (1 ngày, 2-3 ngày, 4-7 ngày, trên 7 ngày).
     - Loại hình tour: Tour trong nước hoặc Tour quốc tế.
     - Điểm khởi hành (Hà Nội, TP. Hồ Chí Minh, Đà Nẵng...).
     - Tiêu chí sắp xếp: Giá tăng dần, Giá giảm dần, Mới nhất, Đánh giá cao nhất.
  4. Người dùng bấm nút "Áp dụng bộ lọc" hoặc hệ thống tự động nhận diện thay đổi sau 400ms (Debounce).
  5. Frontend gửi request `GET /api/tours` kèm các tham số Query Params: `keyword`, `minPrice`, `maxPrice`, `duration`, `isInternational`, `sortBy`, `page`, `size`.
  6. Backend Spring Boot tiếp nhận yêu cầu, xây dựng câu lệnh truy vấn động (Spring Data JPA Specification / Criteria API) kết hợp kiểm tra trạng thái tour phải là `status == APPROVED` (đã được Admin phê duyệt).
  7. Backend thực hiện phân trang (Pagination), đếm tổng số bản ghi thỏa mãn và trả về danh sách tour cùng thông tin phân trang (Tổng số trang, trang hiện tại).
  8. Giao diện React hiển thị lưới danh sách thẻ Tour (Tour Cards) với đầy đủ thông tin: Ảnh đại diện, Tên tour, Thời lượng, Giá vé thấp nhất, Điểm xuất phát, Đánh giá sao trung bình và Số lượng chỗ còn trống.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *7a. Không có tour nào khớp với tiêu chí tìm kiếm*: Backend trả về mảng danh sách rỗng (`totalElements = 0`) -> Giao diện hiển thị hình ảnh minh họa và thông báo "Không tìm thấy tour phù hợp với tiêu chí của bạn. Vui lòng thử tìm kiếm bằng từ khóa khác hoặc thiết lập lại bộ lọc".
- **Kết quả**: Danh sách tour du lịch thỏa mãn các điều kiện tìm kiếm và lọc được hiển thị rõ ràng, trực quan cho người dùng.

---

### 2.5.6. Đặc tả Use Case: Xem chi tiết tour & Tra cứu thông tin Visa
- **Mô tả**: Hiển thị đầy đủ tất cả thông tin chi tiết về một tour du lịch cụ thể, bao gồm lịch trình chi tiết theo từng ngày, các đợt khởi hành sắp tới, bảng giá vé chi tiết, chính sách hủy hoàn vé, thông tin đại lý cung cấp (Vendor) và các yêu cầu/thủ tục hồ sơ xin Visa đối với các tour quốc tế.
- **Tác nhân chính**: Customer, Khách vãng lai.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Khách hàng chọn xem một tour du lịch từ danh sách tour hoặc qua đường dẫn liên kết.
- **Luồng sự kiện chính**:
  1. Người dùng bấm chọn một tour du lịch trên danh sách.
  2. Frontend kích hoạt định tuyến chuyển đến trang chi tiết `/tours/:id` và gửi request `GET /api/tours/:id`.
  3. Backend truy vấn cơ sở dữ liệu:
     - Lấy thông tin tổng quan của tour (tiêu đề, mô tả, điểm đến, phương tiện di chuyển).
     - Lấy danh sách ảnh trong album thư viện của tour.
     - Lấy danh sách lịch trình theo từng ngày (Day 1, Day 2, Day 3... kèm mô tả hoạt động và bữa ăn).
     - Lấy danh sách các lịch khởi hành sắp tới còn chỗ kèm bảng giá vé (Người lớn, Trẻ em).
     - Kiểm tra nếu là tour quốc tế (`isInternational == true`), truy vấn tiếp thông tin cấu hình chính sách Visa (yêu cầu hộ chiếu, hồ sơ công việc, tài chính, thời gian xử lý visa).
     - Lấy thông tin đại lý Vendor tổ chức tour và các đánh giá/nhận xét của khách hàng đã đi trước đó.
  4. Backend trả về gói dữ liệu JSON chi tiết của tour.
  5. Giao diện hiển thị chuyên nghiệp với các khối nội dung:
     - Slider ảnh chất lượng cao.
     - Khối thông tin giá và nút bấm "Đặt tour ngay".
     - Tab Lịch trình chi tiết: biểu diễn theo dạng dòng thời gian (Timeline) từng ngày.
     - Tab Thông tin Visa (hiển thị nổi bật với các tour quốc tế): liệt kê chi tiết các hạng mục giấy tờ cần chuẩn bị và chi phí hỗ trợ làm visa.
     - Tab Chính sách bao gồm / không bao gồm và điều kiện hủy đổi vé.
     - Danh sách nhận xét đánh giá có sao và hình ảnh thực tế từ các du khách.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *3a. Tour không tồn tại hoặc đã bị khóa/xóa*: Backend trả về HTTP 404 (`TOUR_NOT_FOUND`) -> Frontend hiển thị trang thông báo "Tour du lịch này không tồn tại hoặc đã ngừng cung cấp dịch vụ" kèm nút bấm quay về trang chủ.
- **Kết quả**: Khách hàng nắm bắt đầy đủ thông tin về lịch trình, chi phí và yêu cầu visa của tour để đưa ra quyết định đặt chỗ.

---

### 2.5.7. Đặc tả Use Case: Tư vấn Tour & Visa bằng Chatbot AI (Google Gemini API)
- **Mô tả**: Tích hợp trợ lý trí tuệ nhân tạo (Google Gemini API) trực tiếp vào nền tảng SmartTravel nhằm cung cấp trải nghiệm tư vấn tự động 24/7 cho người dùng. Khách hàng có thể tương tác bằng ngôn ngữ tự nhiên để hỏi về thông tin tour, nhận gợi ý tour theo sở thích và ngân sách, hoặc tra cứu chi tiết điều kiện, thủ tục hồ sơ làm Visa du lịch.
- **Tác nhân chính**: Customer, Khách vãng lai.
- **Tác nhân phụ**: Google Gemini API.
- **Điều kiện**: Khách hàng truy cập vào hệ thống SmartTravel.
- **Luồng sự kiện chính**:
  1. Người dùng bấm vào biểu tượng bong bóng Chatbot AI ở góc dưới bên phải màn hình.
  2. Cửa sổ chat mở ra với lời chào mừng tự động và gợi ý các câu hỏi mẫu (Ví dụ: "Gợi ý cho tôi tour đi Đà Lạt 3 ngày 2 đêm dưới 3 triệu", "Đi du lịch Hàn Quốc cần chuẩn bị những giấy tờ visa gì?").
  3. Người dùng nhập câu hỏi vào ô chat và bấm nút "Gửi".
  4. Frontend bổ sung tin nhắn vào lịch sử trò chuyện và gửi request `POST /api/chat/ask` tới Backend.
  5. Backend Spring Boot tiếp nhận câu hỏi của người dùng:
     - Hệ thống thực hiện xây dựng Prompt kỹ thuật (System Instruction) thiết lập vai trò trợ lý du lịch ảo chuyên nghiệp cho SmartTravel.
     - Nếu câu hỏi liên quan đến tìm tour, Backend truy vấn ngữ cảnh (Context) các tour hiện có trong cơ sở dữ liệu để cung cấp thông tin thực tế cho AI.
     - Nếu câu hỏi liên quan đến thủ tục Visa, Backend tích hợp quy định thị thực các quốc gia vào ngữ cảnh hỗ trợ.
  6. Backend gửi yêu cầu HTTPS API tới Google Gemini REST API (`gemini-1.5-flash` / `gemini-pro`).
  7. Google Gemini xử lý ngôn ngữ tự nhiên, phân tích ý định và sinh nội dung phản hồi trả về cho Backend.
  8. Backend tiếp nhận phản hồi từ Gemini, lưu trữ lịch sử tin nhắn của phiên làm việc và trả kết quả về cho Frontend.
  9. Frontend hiển thị câu trả lời của AI trên khung chat với định dạng Markdown chuyên nghiệp (gạch đầu dòng, liên kết trực tiếp tới tour du lịch được đề xuất).
  10. Người dùng có thể tiếp tục trò chuyện nhiều lượt (Multi-turn Conversation) để làm rõ thêm nhu cầu.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *6a. Lỗi kết nối Google Gemini API*: Hết quota hoặc sự cố mạng -> Backend bắt ngoại lệ (`GeminiApiException`), kích hoạt fallback message: "Hệ thống tư vấn AI đang tạm thời bận. Bạn vui lòng thử lại sau giây lát hoặc tra cứu trực tiếp tại danh mục Tour của chúng tôi".
  - *7a. Người dùng hỏi các chủ đề vi phạm quy chuẩn an toàn*: Gemini từ chối trả lời -> Hệ thống phản hồi lịch sự nhắc nhở người dùng quay lại các nội dung liên quan đến du lịch và tour.
- **Kết quả**: Khách hàng nhận được câu trả lời tư vấn chính xác, nhanh chóng và giải đáp thắc mắc về tour cũng như thủ tục visa bằng AI.

---

### 2.5.8. Đặc tả Use Case: Đặt tour & Khóa giữ slot chỗ Real-time
- **Mô tả**: Hỗ trợ khách hàng lựa chọn ngày khởi hành cụ thể, số lượng hành khách tham gia (Người lớn, Trẻ em), lựa chọn có sử dụng dịch vụ hỗ trợ làm Visa hay không, và nhập thông tin người liên hệ. Hệ thống thực hiện cơ chế kiểm tra và khóa giữ chỗ (Slot Lock) theo thời gian thực (15 phút) nhằm tránh tình trạng đặt trùng chỗ (Overbooking).
- **Tác nhân chính**: Customer (Đã đăng nhập).
- **Tác nhân phụ**: Hệ thống đếm ngược thời gian (Scheduler).
- **Điều kiện**: Khách hàng đã đăng nhập tài khoản Customer và đang ở trang chi tiết của một tour du lịch còn chỗ.
- **Luồng sự kiện chính**:
  1. Tại trang chi tiết tour, khách hàng nhấn nút "Đặt ngay" hoặc chuyển đến khu vực đặt chỗ.
  2. Giao diện hiển thị form đặt tour:
     - Chọn ngày khởi hành mong muốn từ danh sách lịch khởi hành của tour.
     - Chọn số lượng khách: Người lớn (>= 12 tuổi) và Trẻ em (< 12 tuổi).
     - Tích chọn dịch vụ "Hỗ trợ làm thủ tục Visa trọn gói" (đối với tour quốc tế) nếu có nhu cầu.
  3. Giao diện tự động tính toán tổng tiền tạm tính dựa trên số lượng khách và đơn giá từng loại vé.
  4. Khách hàng nhấn "Tiếp tục đặt tour".
  5. Hệ thống chuyển sang trang Nhập thông tin hành khách (`/booking/checkout`):
     - Thông tin người đặt: Họ tên, Số điện thoại, Email, Địa chỉ, Ghi chú đặc biệt.
     - Danh sách thông tin chi tiết từng hành khách (Họ tên, Giới tính, Ngày sinh, Số CCCD/Hộ chiếu).
  6. Khách hàng điền đầy đủ thông tin và nhấn "Xác nhận đặt chỗ & Tiến hành thanh toán".
  7. Frontend gửi request `POST /api/bookings` tới Backend kèm toàn bộ thông tin đơn hàng.
  8. Backend mở một Database Transaction với mức khóa dữ liệu (`Pessimistic Lock` / `Optimistic Lock`):
     - Truy vấn lịch khởi hành tương ứng (`departure_dates`), kiểm tra số chỗ khả dụng (`availableSlots`).
     - Xác nhận số chỗ khả dụng >= tổng số khách đặt (`adults + children`).
     - Trừ số chỗ khả dụng và tăng số chỗ đã giữ (`lockedSlots`).
     - Tạo bản ghi đơn hàng (`orders` / `bookings`) với trạng thái `PENDING_PAYMENT`.
     - Tạo thời hạn thanh toán: 15 phút tính từ thời điểm đặt (`lockExpiresAt = now + 15 minutes`).
  9. Backend commit transaction và trả về mã đơn hàng (`bookingCode`), tổng số tiền cần thanh toán và thời hạn khóa chỗ.
  10. Frontend chuyển người dùng sang màn hình Thanh toán kèm đồng hồ đếm ngược 15:00 phút.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *8a. Số chỗ trống không đủ*: Nếu trong lúc người dùng thao tác, người khác đã đặt hết chỗ (`availableSlots < requestedSlots`) -> Backend rollback transaction, trả về lỗi 400 (`SLOTS_NOT_AVAILABLE`) -> Frontend thông báo "Rất tiếc, ngày khởi hành này chỉ còn X chỗ trống. Vui lòng giảm số lượng khách hoặc chọn ngày khởi hành khác".
  - *10a. Hết thời gian 15 phút mà chưa thanh toán*: Scheduler của hệ thống kiểm tra và tự động giải phóng slot (`availableSlots += requestedSlots`), cập nhật đơn hàng thành `CANCELLED_TIMEOUT` -> Giao diện thông báo phiên đặt chỗ đã hết hạn.
- **Kết quả**: Đơn đặt tour được tạo ở trạng thái Chờ thanh toán, số lượng chỗ ngồi được bảo lưu an toàn trong 15 phút.

---

### 2.5.9. Đặc tả Use Case: Áp dụng mã giảm giá & Thanh toán đa kênh (VietQR / Thẻ Visa)
- **Mô tả**: Cho phép khách hàng áp dụng mã khuyến mãi (Voucher) để giảm trừ trực tiếp vào giá trị đơn hàng, sau đó lựa chọn phương thức thanh toán phù hợp (Quét mã VietQR tự động khớp lệnh hoặc Thanh toán qua thẻ quốc tế Visa/MasterCard). Hệ thống tiếp nhận Webhook từ cổng ngân hàng để đối soát và xác nhận thanh toán tức thời.
- **Tác nhân chính**: Customer.
- **Tác nhân phụ**: BankGateway (Hệ thống thanh toán ngân hàng / Cổng VietQR).
- **Điều kiện**: Khách hàng đang ở màn hình thanh toán cho một đơn đặt tour hợp lệ trong thời gian giữ slot (15 phút).
- **Luồng sự kiện chính**:
  - **Nhánh Áp dụng mã giảm giá**:
    1. Tại màn hình Thanh toán, khách hàng nhập mã Voucher vào ô "Mã giảm giá" và nhấn "Áp dụng".
    2. Frontend gửi request `POST /api/vouchers/apply` kèm mã voucher và mã đơn hàng.
    3. Backend kiểm tra: Mã voucher tồn tại, còn hạn sử dụng, số lượt dùng còn lại > 0, và giá trị đơn hàng đạt mức tối thiểu quy định.
    4. Backend tính toán số tiền được giảm (theo % hoặc số tiền cố định, không vượt quá mức giảm tối đa) và cập nhật lại số tiền phải thanh toán của đơn hàng.
    5. Frontend cập nhật lại tổng tiền thanh toán mới và hiển thị dòng tiền đã được giảm trừ.
  - **Nhánh Thanh toán qua VietQR**:
    6. Khách hàng lựa chọn phương thức thanh toán "Chuyển khoản ngân hàng qua mã VietQR".
    7. Frontend gửi request `POST /api/payments/create-vietqr` cho đơn hàng.
    8. Backend tạo thông tin giao dịch, sinh mã chuyển khoản duy nhất (VD: `STBOOKING123456`) và gọi dịch vụ tạo ảnh mã QR chuẩn VietQR (chứa STK ngân hàng thụ hưởng của sàn, Tên chủ tài khoản, Số tiền chính xác và Nội dung chuyển khoản duy nhất).
    9. Giao diện hiển thị mã VietQR động cùng thông tin chuyển khoản rõ ràng.
    10. Khách hàng mở ứng dụng Mobile Banking trên điện thoại, quét mã QR và tiến hành chuyển khoản.
    11. Hệ thống ngân hàng/cổng thanh toán xử lý giao dịch thành công và phát tín hiệu `POST /api/payments/webhook` tới Backend SmartTravel.
    12. Backend SmartTravel tiếp nhận Webhook:
        - Xác thực chữ ký số (Signature) của Webhook để đảm bảo tính bảo mật.
        - Trích xuất nội dung chuyển khoản để tìm mã đơn hàng tương ứng.
        - So khớp số tiền thực nhận với số tiền của đơn hàng.
        - Cập nhật trạng thái đơn hàng thành `PAID` (Đã thanh toán).
        - Ghi nhận lịch sử giao dịch thanh toán vào bảng `payment_transactions`.
        - Cập nhật trạng thái slot từ "đang giữ" sang "đã bán chính thức" cho Vendor.
        - Tự động phát hành Vé điện tử (E-Ticket) có kèm mã QR Code bảo mật.
        - Gửi email xác nhận thanh toán thành công kèm tệp vé điện tử đến email khách hàng.
    13. Giao diện Frontend tự động lắng nghe trạng thái (qua WebSocket hoặc Polling) và lập tức chuyển sang màn hình "Thanh toán thành công! Chúc mừng bạn đã hoàn tất đặt tour".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *3a. Mã Voucher không hợp lệ hoặc không đủ điều kiện*: Backend trả về thông báo lỗi chi tiết (Mã hết hạn, Hết lượt dùng, Đơn hàng chưa đạt giá trị tối thiểu...) -> Frontend hiển thị cảnh báo đỏ và giữ nguyên số tiền gốc.
  - *12a. Số tiền chuyển khoản không khớp*: Số tiền nhận được ít hơn giá trị đơn hàng -> Backend ghi nhận đơn hàng ở trạng thái `PAYMENT_MISMATCH`, gửi cảnh báo cho quản trị viên và thông báo cho khách hàng liên hệ hotline hỗ trợ.
  - *12b. Hết hạn giữ chỗ trước khi khách thanh toán*: Tiền vào sau 15 phút -> Hệ thống kích hoạt quy trình xử lý hoàn tiền tự động hoặc thông báo hỗ trợ giữ lại slot thủ công.
- **Kết quả**: Đơn hàng được thanh toán thành công, đối soát tự động, hệ thống cấp phát vé điện tử E-Ticket QR Code cho khách hàng.

---

### 2.5.10. Đặc tả Use Case: Xem lịch sử đặt tour & Tra cứu Vé điện tử E-Ticket (QR Code)
- **Mô tả**: Cho phép khách hàng quản lý và tra cứu toàn bộ danh sách các đơn đặt tour du lịch đã thực hiện trên tài khoản cá nhân, xem chi tiết hành trình, tải về hoặc xuất trình vé điện tử E-Ticket chứa mã QR Code để đại lý quét xác thực khi khởi hành.
- **Tác nhân chính**: Customer (Đã đăng nhập).
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Khách hàng đã đăng nhập tài khoản Customer.
- **Luồng sự kiện chính**:
  1. Khách hàng bấm vào menu tài khoản trên thanh điều hướng và chọn "Lịch sử đặt tour" (`/my-bookings`).
  2. Frontend gửi request `GET /api/bookings/my-history` kèm JWT token.
  3. Backend trích xuất Customer ID từ token, truy vấn bảng `bookings` kèm thông tin tour và các lịch khởi hành.
  4. Backend trả về danh sách các đơn hàng, sắp xếp theo thời gian đặt mới nhất.
  5. Giao diện hiển thị danh sách các đơn đặt tour theo các tab trạng thái: Tất cả, Chờ thanh toán, Đã xác nhận/Đã thanh toán, Hoàn thành, Đã hủy.
  6. Tại mỗi đơn hàng, khách hàng có thể nhấn vào nút "Xem chi tiết vé E-Ticket".
  7. Hệ thống mở cửa sổ hiển thị Vé điện tử (E-Ticket) trực quan bao gồm:
     - Mã vé (Ticket Code) và Mã đặt chỗ.
     - Tên tour du lịch và Tên đại lý tổ chức (Vendor).
     - Ngày giờ khởi hành, Địa điểm tập trung và Phương tiện di chuyển.
     - Danh sách hành khách tham gia chuyến đi.
     - Mã QR Code mã hóa chứa chuỗi token xác thực chữ ký điện tử an toàn.
  8. Khách hàng có thể chụp ảnh màn hình, lưu mã QR hoặc bấm nút "Tải vé PDF" về thiết bị cá nhân để xuất trình cho hướng dẫn viên khi lên xe.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *3a. Khách hàng chưa có đơn đặt tour nào*: Hệ thống hiển thị giao diện trống với thông báo "Bạn chưa có đơn đặt tour nào" kèm nút bấm "Khám phá tour ngay" dẫn về trang danh sách tour.
- **Kết quả**: Khách hàng theo dõi được lịch sử các chuyến đi và nắm giữ vé điện tử E-Ticket có mã QR Code phục vụ cho chuyến đi.

---

### 2.5.11. Đặc tả Use Case: Hủy đơn đặt tour du lịch
- **Mô tả**: Cho phép khách hàng gửi yêu cầu hủy đơn đặt tour đã thanh toán khi có thay đổi kế hoạch cá nhân. Việc hủy tour và số tiền được hoàn trả sẽ được hệ thống tự động tính toán dựa trên Chính sách hoàn tiền của đại lý tương ứng với khoảng thời gian từ thời điểm hủy đến ngày khởi hành.
- **Tác nhân chính**: Customer (Đã đăng nhập).
- **Tác nhân phụ**: BankGateway / Hệ thống kế toán (Hoàn tiền).
- **Điều kiện**: Khách hàng có đơn đặt tour ở trạng thái `PAID` (Đã thanh toán) và thời gian hiện tại chưa vượt quá ngày khởi hành.
- **Luồng sự kiện chính**:
  1. Tại trang Lịch sử đặt tour, khách hàng tìm đơn đặt tour muốn hủy và bấm nút "Yêu cầu hủy tour".
  2. Giao diện hiển thị modal xác nhận hủy tour, kèm theo bảng chi tiết Chính sách hoàn hủy:
     - Hủy trước ngày khởi hành > 15 ngày: Hoàn 100% tiền vé.
     - Hủy trước ngày khởi hành từ 7 - 14 ngày: Hoàn 70% tiền vé.
     - Hủy trước ngày khởi hành từ 3 - 6 ngày: Hoàn 50% tiền vé.
     - Hủy trước ngày khởi hành < 3 ngày: Không được hoàn tiền.
  3. Hệ thống hiển thị số tiền dự kiến được hoàn trả dựa trên thời gian thực tế và yêu cầu khách hàng chọn Lý do hủy tour kèm số tài khoản nhận tiền hoàn.
  4. Khách hàng xác nhận đồng ý với chính sách và bấm nút "Xác nhận gửi yêu cầu hủy".
  5. Frontend gửi request `POST /api/bookings/:id/cancel` kèm thông tin lý do hủy và thông tin nhận hoàn tiền.
  6. Backend kiểm tra điều kiện hủy của đơn hàng:
     - Xác thực quyền sở hữu đơn hàng của người dùng.
     - Tính toán tỷ lệ hoàn tiền và số tiền hoàn trả chính xác.
     - Cập nhật trạng thái đơn hàng thành `CANCELLED_PENDING_REFUND` (Đã hủy - Chờ hoàn tiền) hoặc `CANCELLED`.
     - Hoàn trả lại số slot chỗ ngồi cho lịch khởi hành của tour (`availableSlots += requestedSlots`).
     - Ghi nhận yêu cầu hoàn tiền vào hệ thống tài chính để chuyển tiền cho khách hàng.
  7. Backend phản hồi kết quả thành công. Frontend hiển thị thông báo "Yêu cầu hủy tour của bạn đã được ghi nhận. Số tiền hoàn lại sẽ được chuyển về tài khoản của bạn trong 2 - 3 ngày làm việc".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *6a. Đơn tour đã bắt đầu khởi hành hoặc đã hoàn thành*: Không cho phép hủy -> Backend từ chối và trả về lỗi 400 (`CANNOT_CANCEL_TOUR`) -> Frontend cảnh báo "Tour này đã khởi hành hoặc đã kết thúc, không thể thực hiện hủy vé".
- **Kết quả**: Đơn tour được hủy thành công, số chỗ khả dụng của tour được mở lại cho khách khác và yêu cầu hoàn tiền được ghi nhận vào hệ thống.

---

### 2.5.12. Đặc tả Use Case: Đánh giá chất lượng tour & Đăng ảnh trải nghiệm
- **Mô tả**: Cho phép khách hàng gửi đánh giá chất lượng (Số sao từ 1 đến 5), kèm bình luận nhận xét chi tiết và tải lên các bức ảnh trải nghiệm thực tế sau khi đã tham gia và hoàn thành chuyến đi. Tính năng này giúp tăng độ tin cậy và minh bạch cho cộng đồng du lịch SmartTravel.
- **Tác nhân chính**: Customer (Đã hoàn thành tour).
- **Tác nhân phụ**: Cloudinary API (Lưu ảnh đánh giá).
- **Điều kiện**: Khách hàng có đơn đặt tour ở trạng thái `COMPLETED` (Đã hoàn thành chuyến đi) và chưa thực hiện đánh giá cho đơn hàng này.
- **Luồng sự kiện chính**:
  1. Sau khi kết thúc chuyến đi, tại trang Lịch sử đặt tour, đơn hàng hiển thị nút "Đánh giá ngay".
  2. Khách hàng bấm chọn "Đánh giá ngay".
  3. Giao diện mở form đánh giá bao gồm:
     - Chọn số sao đánh giá tổng thể (từ 1 sao: Rất tệ đến 5 sao: Tuyệt vời).
     - Ô nhập nội dung nhận xét chi tiết về dịch vụ (hướng dẫn viên, xe đưa đón, khách sạn/bữa ăn, lịch trình).
     - Khu vực tải lên hình ảnh trải nghiệm thực tế (tối đa 5 ảnh).
  4. Khách hàng chọn số sao, viết bình luận và chọn các bức ảnh từ thiết bị cá nhân.
  5. Khách hàng bấm nút "Gửi đánh giá".
  6. Frontend thực hiện tải các tệp ảnh lên dịch vụ Cloudinary để nhận danh sách đường dẫn URL ảnh an toàn.
  7. Frontend gửi request `POST /api/reviews` chứa thông tin: Tour ID, Booking ID, Số sao (rating), Nội dung nhận xét (comment), Mảng URL ảnh (imageUrls).
  8. Backend tiếp nhận request:
     - Kiểm tra điều kiện đơn hàng phải ở trạng thái `COMPLETED`.
     - Kiểm tra đơn hàng này đã từng đánh giá hay chưa để tránh spam.
     - Lưu bản ghi đánh giá mới vào bảng `reviews`.
     - Tính toán lại điểm đánh giá sao trung bình (`averageRating`) và tổng số lượt đánh giá (`totalReviews`) của tour trong bảng `tours`.
  9. Backend phản hồi HTTP 201 tạo mới thành công.
  10. Frontend thông báo "Cảm ơn bạn đã chia sẻ trải nghiệm đánh giá chuyến đi!" và làm mới giao diện, chuyển nút "Đánh giá ngay" thành "Đã đánh giá".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *8a. Đơn hàng chưa hoàn thành chuyến đi*: Người dùng cố tình gọi API khi tour chưa diễn ra -> Backend từ chối với lỗi 400 (`TOUR_NOT_COMPLETED`) -> Cảnh báo "Bạn chỉ có thể đánh giá sau khi chuyến đi đã hoàn thành".
  - *8b. Đơn hàng đã được đánh giá trước đó*: Backend trả về lỗi 400 (`REVIEW_ALREADY_EXISTS`) -> Cảnh báo "Bạn đã gửi đánh giá cho chuyến đi này rồi".
- **Kết quả**: Đánh giá và hình ảnh thực tế của khách hàng được lưu trữ thành công, điểm sao trung bình của tour được cập nhật tự động.

---

### 2.5.13. Đặc tả Use Case: Nộp hồ sơ đăng ký đại lý du lịch (Vendor Registration)
- **Mô tả**: Cung cấp tính năng cho người dùng cá nhân hoặc doanh nghiệp lữ hành gửi hồ sơ đăng ký để trở thành Đối tác bán tour (Vendor) trên nền tảng SmartTravel. Hồ sơ bao gồm thông tin doanh nghiệp, mã số thuế và tệp giấy phép kinh doanh lữ hành để Admin kiểm duyệt.
- **Tác nhân chính**: Customer (Người dùng có nhu cầu mở đại lý).
- **Tác nhân phụ**: Cloudinary API (Lưu trữ tệp tài liệu giấy phép).
- **Điều kiện**: Người dùng đã đăng nhập tài khoản trên hệ thống và tài khoản hiện tại có vai trò `ROLE_CUSTOMER`.
- **Luồng sự kiện chính**:
  1. Người dùng bấm vào mục "Trở thành đối tác Vendor" trên Header hoặc Footer.
  2. Giao diện hiển thị trang giới thiệu quyền lợi đại lý kèm nút "Đăng ký ngay".
  3. Người dùng bấm "Đăng ký ngay", hệ thống hiển thị Form đăng ký đối tác:
     - Tên thương hiệu đại lý / Doanh nghiệp du lịch.
     - Mã số thuế / Mã số doanh nghiệp.
     - Địa chỉ trụ sở chính và Số điện thoại hotline.
     - Tải lên tệp quét Giấy phép kinh doanh lữ hành (PDF hoặc JPG/PNG).
     - Thông tin tài khoản ngân hàng thụ hưởng (Tên ngân hàng, Số tài khoản, Tên chủ thẻ).
     - Giới thiệu ngắn về năng lực tổ chức tour của doanh nghiệp.
  4. Người dùng điền đầy đủ các thông tin và đính kèm tệp tài liệu pháp lý.
  5. Người dùng nhấn nút "Gửi hồ sơ xét duyệt".
  6. Frontend upload tệp tài liệu lên Cloudinary lấy đường dẫn lưu trữ bảo mật.
  7. Frontend gửi request `POST /api/vendor-registrations` chứa toàn bộ hồ sơ lên Backend.
  8. Backend kiểm tra: Mã số thuế không được trùng lặp với đại lý đã tồn tại trong CSDL.
  9. Backend tạo bản ghi đăng ký mới trong bảng `vendor_registrations` với trạng thái ban đầu là `PENDING` (Chờ xét duyệt).
  10. Backend phản hồi HTTP 201 thành công.
  11. Frontend thông báo "Hồ sơ đăng ký đối tác của bạn đã được gửi thành công. Quản trị viên SmartTravel sẽ tiến hành thẩm định và phản hồi trong vòng 24 - 48 giờ làm việc".
  12. Giao diện tự động chuyển sang màn hình "Theo dõi trạng thái xét duyệt hồ sơ Vendor".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *8a. Người dùng đã có hồ sơ đang chờ duyệt*: Backend trả về lỗi 400 (`REGISTRATION_ALREADY_PENDING`) -> Frontend cảnh báo "Bạn đã có một hồ sơ đăng ký đang được xử lý, vui lòng chờ kết quả từ ban quản trị".
  - *8b. Mã số thuế đã được đăng ký thành công trước đó*: Backend trả về lỗi 400 (`TAX_CODE_EXISTS`) -> Cảnh báo "Mã số thuế doanh nghiệp này đã tồn tại trên hệ thống".
- **Kết quả**: Hồ sơ đăng ký Vendor được ghi nhận vào hệ thống ở trạng thái Chờ duyệt, sẵn sàng cho Admin thẩm định.

---

### 2.5.14. Đặc tả Use Case: Đăng bán tour du lịch mới (Cấu hình Visa & Sinh mô tả bằng AI Gemini)
- **Mô tả**: Cho phép đối tác Vendor tạo mới và đăng bán sản phẩm tour du lịch trên sàn. Điểm nổi bật là Vendor có thể sử dụng trí tuệ nhân tạo (Google Gemini AI) để tự động tạo bài viết mô tả tour hấp dẫn, chuẩn SEO từ các từ khóa đầu vào, đồng thời cấu hình các yêu cầu thủ tục xin Visa du lịch nếu là tour quốc tế.
- **Tác nhân chính**: Vendor (Đã đăng nhập).
- **Tác nhân phụ**: Google Gemini API, Cloudinary API.
- **Điều kiện**: Tài khoản đối tác đã được Admin phê duyệt có vai trò `ROLE_VENDOR`.
- **Luồng sự kiện chính**:
  1. Tại Dashboard quản lý Vendor, đại lý bấm chọn "Quản lý Tour" -> "Thêm tour mới".
  2. Giao diện hiển thị Form tạo tour theo từng bước (Wizard):
     - **Bước 1: Thông tin cơ bản**: Tên tour, Danh mục địa danh, Điểm khởi hành, Điểm đến, Thời lượng (Số ngày/Số đêm), Phương tiện di chuyển, Loại hình (Trong nước hay Quốc tế).
     - **Bước 2: Viết mô tả tour (Tích hợp AI)**:
       - Vendor có thể tự soạn thảo văn bản hoặc bấm nút "Tạo mô tả bằng AI Gemini".
       - Vendor nhập một số từ khóa chính (Ví dụ: "Tour ngắm hoa anh đào Tokyo - Phú Sĩ 5N4Đ, khách sạn 4 sao, trải nghiệm tắm Onsen").
       - Vendor bấm "Tạo nội dung với AI", Frontend gửi request `POST /api/ai/generate-tour-description`.
       - Backend gọi Google Gemini API với prompt thiết kế chuyên sâu cho copywriting du lịch.
       - Gemini sinh nội dung mô tả chi tiết, văn phong lôi cuốn, định dạng chuẩn HTML/Markdown.
       - Nội dung được tự động điền vào khung soạn thảo Editor để Vendor kiểm tra và chỉnh sửa.
     - **Bước 3: Cấu hình chính sách & Hồ sơ Visa (Áp dụng nếu là tour quốc tế)**:
       - Nếu bật tùy chọn "Tour quốc tế", hệ thống mở rộng khu vực cấu hình Visa: Phí dịch vụ visa, Thời gian xét duyệt dự kiến, Danh sách giấy tờ cần chuẩn bị (Hộ chiếu, Chứng minh tài chính, Xác nhận công việc, Ảnh thẻ).
     - **Bước 4: Thiết lập lịch trình từng ngày (Itinerary)**:
       - Nhập tiêu đề và chi tiết hoạt động của từng ngày (Ngày 1, Ngày 2...).
  3. Vendor tải lên hình ảnh đại diện (Thumbnail) và album ảnh hoạt động của tour (lưu trữ Cloudinary).
  4. Vendor kiểm tra lại toàn bộ thông tin và nhấn nút "Lưu và Gửi duyệt".
  5. Frontend gửi request `POST /api/vendor/tours` lên Backend.
  6. Backend kiểm tra tính toàn vẹn của dữ liệu, lưu tour vào cơ sở dữ liệu với trạng thái ban đầu là `PENDING_APPROVAL` (Chờ Admin kiểm duyệt).
  7. Backend phản hồi tạo mới thành công.
  8. Frontend hiển thị thông báo "Tạo tour thành công! Tour đã được gửi đến ban quản trị để kiểm duyệt nội dung trước khi hiển thị công khai trên sàn".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *2a. Gemini API gặp sự cố*: Không thể tự động tạo mô tả -> Hệ thống hiển thị cảnh báo lỗi và cho phép Vendor tự nhập nội dung mô tả thủ công bình thường.
  - *6a. Thiếu các trường thông tin bắt buộc*: Tên tour để trống, chưa nhập lịch trình -> Hệ thống đánh dấu đỏ các trường thiếu sót và yêu cầu điền bổ sung trước khi lưu.
- **Kết quả**: Tour du lịch mới được tạo thành công, có đầy đủ lịch trình, mô tả chất lượng cao và cấu hình visa, sẵn sàng cho Admin kiểm duyệt.

---

### 2.5.15. Đặc tả Use Case: Quản lý thông tin tour & Thư viện ảnh Cloudinary
- **Mô tả**: Cho phép đại lý Vendor chỉnh sửa các thông tin của tour đã tạo (tiêu đề, mô tả, chính sách bao gồm, lịch trình), tải thêm hoặc xóa bỏ các hình ảnh trong thư viện ảnh của tour được lưu trữ trên nền tảng đám mây Cloudinary.
- **Tác nhân chính**: Vendor.
- **Tác nhân phụ**: Cloudinary API.
- **Điều kiện**: Vendor đã đăng nhập và là chủ sở hữu của tour cần chỉnh sửa.
- **Luồng sự kiện chính**:
  1. Vendor truy cập danh sách tour của mình tại `/vendor/tours`.
  2. Bấm vào nút "Chỉnh sửa" tại tour cần thao tác.
  3. Giao diện tải dữ liệu hiện tại của tour và hiển thị trong form chỉnh sửa.
  4. Vendor thực hiện thay đổi thông tin (Sửa nội dung hoạt động từng ngày, cập nhật tiện ích).
  5. Tại khu vực Thư viện ảnh:
     - Vendor có thể bấm biểu tượng thùng rác trên một ảnh để xóa bỏ ảnh đó khỏi danh sách.
     - Vendor có thể kéo thả tải lên thêm các hình ảnh mới có độ phân giải cao.
  6. Frontend gửi các tệp ảnh mới lên Cloudinary để lấy đường dẫn HTTPS, sau đó cập nhật mảng danh sách URL ảnh.
  7. Vendor nhấn nút "Lưu cập nhật".
  8. Frontend gửi request `PUT /api/vendor/tours/:id` kèm dữ liệu mới lên Backend.
  9. Backend kiểm tra quyền sở hữu tour (Vendor ID của tour phải khớp với User ID trong JWT).
  10. Backend cập nhật các thông tin vào CSDL.
  11. Backend phản hồi HTTP 200 thành công. Frontend thông báo "Cập nhật thông tin tour thành công".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *9a. Vendor cố tình chỉnh sửa tour của đại lý khác*: Backend trả về HTTP 403 (`FORBIDDEN_ACCESS`) -> Cảnh báo "Bạn không có quyền chỉnh sửa tour này".
- **Kết quả**: Dữ liệu thông tin và thư viện ảnh của tour được cập nhật chính xác.

---

### 2.5.16. Đặc tả Use Case: Quản lý lịch khởi hành, cấu hình số slot chỗ & Biểu giá vé
- **Mô tả**: Cho phép đại lý Vendor quản lý các đợt khởi hành cụ thể của từng tour: tạo thêm ngày khởi hành mới, thiết lập tổng số chỗ ngồi tối đa, cấu hình giá vé người lớn và giá vé trẻ em linh hoạt theo từng thời điểm (mùa cao điểm / ngày thường), cũng như đóng hoặc hủy chuyến đi khi cần thiết.
- **Tác nhân chính**: Vendor.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Vendor đã đăng nhập và đang quản lý một tour du lịch cụ thể.
- **Luồng sự kiện chính**:
  - **Nhánh Thêm lịch khởi hành & Cấu hình giá**:
    1. Vendor chọn tour và truy cập vào tab "Quản lý Lịch khởi hành" (`/vendor/tours/:id/departures`).
    2. Giao diện hiển thị danh sách các đợt khởi hành hiện có (Ngày đi, Ngày về, Tổng chỗ, Chỗ còn trống, Giá người lớn, Giá trẻ em, Trạng thái).
    3. Vendor bấm nút "Thêm đợt khởi hành".
    4. Giao diện mở modal nhập liệu:
       - Ngày và giờ xuất phát (Departure Date & Time).
       - Ngày và giờ kết thúc tour (Return Date & Time).
       - Tổng số chỗ khả dụng (Max Slots, ví dụ: 30 chỗ).
       - Giá vé Người lớn (VND/khách).
       - Giá vé Trẻ em (VND/khách - thường bằng 70-80% giá người lớn).
    5. Vendor bấm "Lưu đợt khởi hành".
    6. Frontend gửi request `POST /api/vendor/tours/:id/departures` tới Backend.
    7. Backend kiểm tra: Ngày khởi hành phải ở thời điểm tương lai (ít nhất sau ngày hiện tại 24h), ngày kết thúc phải sau ngày khởi hành, tổng số chỗ > 0, giá vé > 0.
    8. Backend lưu bản ghi mới vào bảng `departure_dates` với trạng thái `ACTIVE`.
    9. Giao diện cập nhật thêm đợt khởi hành mới vào danh sách.
  - **Nhánh Cập nhật giá vé hoặc Đóng/Hủy lịch khởi hành**:
    1. Tại dòng của đợt khởi hành cần chỉnh sửa, Vendor bấm "Sửa giá" hoặc "Đóng đợt khởi hành".
    2. Nếu sửa giá: Vendor nhập mức giá mới và bấm lưu -> Backend cập nhật giá cho các lượt đặt tiếp theo.
    3. Nếu đóng đợt khởi hành: Vendor xác nhận đóng -> Backend cập nhật trạng thái thành `CLOSED` (không cho phép khách đặt thêm chỗ nữa).
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *7a. Ngày khởi hành bị trùng hoặc không hợp lệ*: Ngày đi trong quá khứ hoặc ngày về trước ngày đi -> Backend báo lỗi 400 (`INVALID_DEPARTURE_DATE`) -> Frontend hiển thị cảnh báo ngay trên modal.
  - *3b. Hủy đợt khởi hành đã có khách đặt*: Nếu đợt khởi hành đã có khách thanh toán chỗ ngồi (`bookedSlots > 0`), hệ thống không cho phép xóa trực tiếp mà yêu cầu Vendor liên hệ hủy tour và thực hiện bồi hoàn/đổi lịch cho khách hàng theo quy trình dịch vụ.
- **Kết quả**: Các đợt khởi hành được tạo lập với biểu giá vé và số lượng slot chỗ rõ ràng, hiển thị trực tiếp cho khách hàng lựa chọn khi đặt tour.

---

### 2.5.17. Đặc tả Use Case: Quản lý đơn đặt chỗ & Quét mã QR E-Ticket check-in của Vendor
- **Mô tả**: Hỗ trợ đại lý Vendor quản lý danh sách các đơn đặt chỗ của các tour mình phụ trách, theo dõi danh sách hành khách chi tiết của từng chuyến đi và sử dụng camera thiết bị để quét mã QR Code trên vé điện tử E-Ticket của khách khi lên xe để thực hiện check-in điểm danh tự động theo thời gian thực.
- **Tác nhân chính**: Vendor.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Đại lý Vendor đã đăng nhập và đang quản lý chuyến đi sắp hoặc đang khởi hành.
- **Luồng sự kiện chính**:
  - **Nhánh Quản lý danh sách đặt chỗ**:
    1. Vendor truy cập mục "Quản lý Đơn đặt chỗ" (`/vendor/bookings`).
    2. Giao diện hiển thị danh sách các đơn đặt tour với các thông tin: Mã đơn, Tên khách hàng, Số điện thoại, Tên tour, Ngày khởi hành, Số lượng khách, Tổng tiền, Trạng thái đơn hàng.
    3. Vendor có thể lọc theo đợt khởi hành cụ thể để xem danh sách toàn bộ hành khách tham gia chuyến xe hôm đó.
    4. Vendor bấm nút "Xuất danh sách hành khách" để tải tệp Excel danh sách đoàn phục vụ công tác tổ chức.
  - **Nhánh Quét mã QR Check-in lên xe**:
    5. Tại thời điểm đón khách trước giờ khởi hành, hướng dẫn viên/Vendor bấm vào tính năng "Quét QR Check-in" trên giao diện web di động.
    6. Trình duyệt yêu cầu cấp quyền truy cập Camera thiết bị, Vendor bấm "Cho phép".
    7. Khung hình quét mã QR hiển thị sẵn sàng.
    8. Khách hàng xuất trình mã QR Code trên Vé điện tử (E-Ticket) từ điện thoại.
    9. Camera hướng vào mã QR, hệ thống tự động nhận diện và giải mã chuỗi token bảo mật của vé.
    10. Frontend gửi request `POST /api/vendor/check-in` kèm mã vé vừa quét.
    11. Backend kiểm tra:
        - Mã vé hợp lệ và tồn tại trong hệ thống.
        - Đơn hàng đã ở trạng thái đã thanh toán (`PAID`).
        - Vé thuộc đúng chuyến đi/tour của Vendor này.
        - Trạng thái vé hiện tại là chưa check-in (`isCheckIn == false`).
    12. Backend cập nhật trạng thái `isCheckIn = true` kèm mốc thời gian check-in thực tế (`checkInAt = now()`).
    13. Backend phản hồi kết quả: Hiển thị âm thanh thông báo "Tít" thành công cùng thông tin chi tiết của hành khách: Họ tên, Số lượng vé đi kèm, Vị trí ghế/ghi chú.
    14. Màn hình quét vé hiển thị khung xanh chúc mừng "Check-in thành công cho khách hàng Nguyễn Văn A".
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *11a. Vé đã được check-in trước đó*: Nếu mã QR đã được quét rồi, Backend trả về cảnh báo (`ALREADY_CHECKED_IN`) -> Giao diện hiện khung cảnh báo đỏ "CẢNH BÁO: Vé này đã được quét check-in vào lúc HH:mm! Vui lòng kiểm tra lại".
  - *11b. Vé không hợp lệ hoặc sai chuyến đi*: Khách hàng xuất trình vé của tour khác hoặc vé giả mạo -> Backend trả về lỗi 400 (`INVALID_TICKET`) -> Giao diện cảnh báo "Vé không hợp lệ hoặc không thuộc chuyến đi này".
- **Kết quả**: Hành khách được xác thực lên xe nhanh chóng, chính xác, trạng thái điểm danh được cập nhật tức thì trên hệ thống.

---

### 2.5.18. Đặc tả Use Case: Thống kê doanh thu & Tỷ lệ lấp đầy chỗ của Vendor
- **Mô tả**: Cung cấp công cụ phân tích kinh doanh trực quan cho đại lý Vendor thông qua hệ thống biểu đồ và bảng số liệu: theo dõi doanh thu theo ngày/tháng/năm, số lượng đơn đặt tour, và tỷ lệ lấp đầy slot chỗ ngồi (Seat Occupancy Rate) của từng tour để điều chỉnh chiến lược giá vé kịp thời.
- **Tác nhân chính**: Vendor.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Đại lý Vendor đã đăng nhập vào hệ thống.
- **Luồng sự kiện chính**:
  1. Vendor truy cập mục "Báo cáo & Thống kê" (`/vendor/analytics`).
  2. Giao diện hiển thị các khối thẻ chỉ số tổng quan (KPI Cards):
     - Tổng doanh thu đạt được trong kỳ (VND).
     - Tổng số vé đã bán.
     - Tỷ lệ lấp đầy chỗ ngồi trung bình toàn bộ các tour (%).
     - Doanh thu dự kiến từ các đơn hàng sắp khởi hành.
  3. Vendor có thể tùy chọn bộ lọc thời gian: 7 ngày qua, 30 ngày qua, Tháng này, Quý này hoặc tùy chọn khoảng ngày từ... đến...
  4. Frontend gửi request `GET /api/vendor/analytics` kèm khoảng thời gian lọc.
  5. Backend thực hiện tổng hợp dữ liệu từ CSDL (tính toán tổng số tiền các đơn có trạng thái `PAID`, tính tỷ lệ `bookedSlots / totalSlots`).
  6. Backend trả về dữ liệu phân tích dạng JSON.
  7. Giao diện hiển thị các biểu đồ trực quan (sử dụng thư viện Chart.js / Recharts):
     - Biểu đồ đường (Line Chart): Biến động doanh thu theo từng ngày trong tháng.
     - Biểu đồ cột (Bar Chart): Top các tour có doanh thu cao nhất.
     - Biểu đồ tròn / thanh tiến độ (Progress Bar): Tỷ lệ lấp đầy slot chỗ của từng tour (Ví dụ: Tour Phú Quốc đạt 95% - Sắp hết chỗ, Tour Sapa đạt 40% - Cần đẩy mạnh khuyến mãi).
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *5a. Chưa có dữ liệu doanh thu trong khoảng thời gian chọn*: Backend trả về các chỉ số bằng 0 -> Biểu đồ hiển thị thông báo "Chưa có phát sinh giao dịch trong kỳ này".
- **Kết quả**: Vendor nắm bắt được bức tranh tài chính và hiệu quả khai thác tour để tối ưu hóa hoạt động kinh doanh.

---

### 2.5.19. Đặc tả Use Case: Phân tích cảm xúc nhận xét đánh giá bằng AI Gemini của Vendor
- **Mô tả**: Ứng dụng trí tuệ nhân tạo Google Gemini API để tự động quét toàn bộ bình luận, nhận xét của khách hàng về các tour của đại lý, tiến hành phân tích sắc thái cảm xúc (Sentiment Analysis: Tích cực, Trung tính, Tiêu cực) và tự động tóm tắt những điểm khách hàng khen ngợi cũng như các phản ánh cần khắc phục (về thức ăn, xe đưa đón, thái độ hướng dẫn viên).
- **Tác nhân chính**: Vendor.
- **Tác nhân phụ**: Google Gemini API.
- **Điều kiện**: Vendor đã đăng nhập và các tour của đại lý đã có ít nhất một số lượt đánh giá từ khách hàng.
- **Luồng sự kiện chính**:
  1. Vendor truy cập mục "Đánh giá của khách hàng" -> chọn tab "Phân tích AI Sentiment" (`/vendor/reviews/ai-sentiment`).
  2. Giao diện hiển thị danh sách các tour và nút bấm "Chạy phân tích cảm xúc bằng AI".
  3. Vendor bấm nút "Chạy phân tích cảm xúc bằng AI".
  4. Frontend gửi request `POST /api/vendor/reviews/analyze-sentiment` lên Backend.
  5. Backend Spring Boot truy vấn toàn bộ các nhận xét (bình luận, số sao) của tour trong cơ sở dữ liệu.
  6. Backend tổng hợp văn bản nhận xét và cấu trúc câu lệnh Prompt gửi tới Google Gemini API:
     - Yêu cầu phân loại từng nhận xét theo 3 nhãn: Positive (Tích cực), Neutral (Trung tính), Negative (Tiêu cực).
     - Yêu cầu rút ra tỷ lệ % hài lòng của khách hàng.
     - Yêu cầu tổng kết các điểm mạnh nổi bật (Strengths) và các điểm yếu cần cải thiện (Pain points / Weaknesses).
  7. Google Gemini xử lý ngôn ngữ tự nhiên và trả về kết quả phân tích có cấu trúc JSON.
  8. Backend lưu trữ kết quả phân tích vào bộ nhớ đệm/CSDL và phản hồi về cho Frontend.
  9. Giao diện hiển thị bảng tổng kết trực quan:
     - Biểu đồ Donut tỷ lệ cảm xúc: Ví dụ: 78% Hài lòng (Tích cực), 15% Trung tính, 7% Chưa hài lòng (Tiêu cực).
     - Khối "Khách hàng khen ngợi nhiều nhất": Hướng dẫn viên nhiệt tình, Khách sạn sạch sẽ, Cảnh đẹp.
     - Khối "Vấn đề khách hàng phàn nàn cần khắc phục": Xe đưa đón trễ 15 phút, Đồ ăn chưa hợp khẩu vị miền Nam.
     - Đề xuất giải pháp khắc phục do AI gợi ý cho đại lý.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *5a. Tour chưa có lượt đánh giá nào*: Backend trả về thông báo (`NO_REVIEWS_TO_ANALYZE`) -> Giao diện hiển thị "Chưa có đủ dữ liệu đánh giá để thực hiện phân tích bằng AI".
  - *7a. Lỗi kết nối Google Gemini API*: Backend bắt lỗi và trả về thông báo lỗi dịch vụ AI, đề nghị thử lại sau.
- **Kết quả**: Đại lý Vendor có cái nhìn sâu sắc, khách quan về chất lượng dịch vụ của mình thông qua báo cáo phân tích AI để kịp thời cải tiến chất lượng phục vụ.

---

### 2.5.20. Đặc tả Use Case: Quản trị người dùng & Phân quyền RBAC của Admin
- **Mô tả**: Cung cấp công cụ cho Quản trị viên (Admin) quản lý toàn bộ tài khoản người dùng trên hệ thống SmartTravel: tra cứu danh sách người dùng, xem thông tin chi tiết, thực hiện khóa (Block) hoặc mở khóa (Unblock) tài khoản khi phát hiện dấu hiệu vi phạm, và cập nhật phân quyền theo mô hình Role-Based Access Control (RBAC).
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản có quyền `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Admin truy cập mục "Quản lý người dùng" (`/admin/users`) trên thanh điều hướng quản trị.
  2. Frontend gửi request `GET /api/admin/users` kèm tham số tìm kiếm và phân trang.
  3. Backend truy vấn CSDL và trả về danh sách tài khoản kèm vai trò và trạng thái (`ACTIVE`, `BLOCKED`).
  4. Giao diện hiển thị bảng danh sách người dùng với đầy đủ các cột: ID, Avatar, Họ tên, Email, Số điện thoại, Vai trò (Customer / Vendor / Admin), Ngày đăng ký, Trạng thái hoạt động, và Cột Thao tác.
  - **Nhánh Khóa / Mở khóa tài khoản**:
    5. Tại dòng tài khoản người dùng cần xử lý, Admin bấm vào nút icon "Khóa tài khoản" (hoặc "Mở khóa").
    6. Modal xác nhận hiển thị yêu cầu nhập lý do xử lý (Ví dụ: "Phát hiện hành vi gian lận thanh toán").
    7. Admin xác nhận, Frontend gửi request `PUT /api/admin/users/:id/status` kèm trạng thái mới (`BLOCKED` hoặc `ACTIVE`) và lý do.
    8. Backend kiểm tra không cho phép tự khóa tài khoản Admin đang đăng nhập.
    9. Backend cập nhật trạng thái trong bảng `users`, đồng thời hủy bỏ các phiên làm việc và thu hồi token của tài khoản đó.
    10. Giao diện cập nhật lại trạng thái tài khoản thành công.
  - **Nhánh Cập nhật phân quyền RBAC**:
    11. Admin bấm vào nút "Phân quyền" tại tài khoản người dùng.
    12. Modal mở ra cho phép chọn các Role: `ROLE_CUSTOMER`, `ROLE_VENDOR`, `ROLE_ADMIN`.
    13. Admin chọn quyền mới và bấm "Lưu phân quyền".
    14. Backend kiểm tra và cập nhật bản ghi liên kết người dùng - vai trò trong CSDL.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *8a. Admin tự khóa chính mình*: Backend từ chối với lỗi 400 (`CANNOT_BLOCK_SELF`) -> Giao diện cảnh báo "Bạn không thể tự khóa tài khoản quản trị viên đang đăng nhập".
- **Kết quả**: Danh sách tài khoản được quản lý chặt chẽ, các tài khoản vi phạm bị vô hiệu hóa kịp thời và phân quyền được thực thi chuẩn xác.

---

### 2.5.21. Đặc tả Use Case: Phê duyệt hồ sơ đối tác Vendor của Admin
- **Mô tả**: Cho phép Admin thẩm định các hồ sơ đăng ký mở đại lý du lịch của các đối tác Vendor gửi lên sàn: xem xét thông tin doanh nghiệp, kiểm tra tính pháp lý của giấy phép kinh doanh lữ hành, từ đó ra quyết định Phê duyệt (chính thức nâng quyền thành `ROLE_VENDOR`) hoặc Từ chối kèm lý do phản hồi rõ ràng.
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: Mail Service (Gửi email thông báo kết quả duyệt).
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Admin truy cập mục "Phê duyệt đối tác Vendor" (`/admin/vendor-approvals`).
  2. Giao diện hiển thị danh sách các hồ sơ đăng ký theo các tab: Đang chờ duyệt (`PENDING`), Đã chấp thuận (`APPROVED`), Đã từ chối (`REJECTED`).
  3. Admin bấm vào một hồ sơ ở trạng thái `PENDING` để xem chi tiết.
  4. Giao diện hiển thị toàn bộ thông tin đăng ký: Tên doanh nghiệp, Mã số thuế, Đại diện pháp luật, Địa chỉ, Số điện thoại và đường link xem tệp quét Giấy phép kinh doanh lữ hành.
  5. Admin bấm xem tệp giấy phép kinh doanh đính kèm để thẩm định tính hợp lệ và thông tin pháp lý.
  - **Nhánh Chấp thuận hồ sơ**:
    6. Sau khi kiểm tra thông tin hợp lệ, Admin bấm nút "Phê duyệt đối tác".
    7. Modal xác nhận hiển thị tỷ lệ hoa hồng chiết khấu sàn áp dụng (mặc định 10%) và ghi chú.
    8. Admin bấm "Xác nhận duyệt".
    9. Frontend gửi request `PUT /api/admin/vendor-approvals/:id/approve`.
    10. Backend mở transaction:
        - Cập nhật trạng thái hồ sơ trong `vendor_registrations` thành `APPROVED`.
        - Cập nhật vai trò người dùng tương ứng từ `ROLE_CUSTOMER` lên `ROLE_VENDOR`.
        - Tạo bản ghi hồ sơ đại lý trong bảng `vendors`.
    11. Backend gửi email thông báo chúc mừng kèm hướng dẫn bắt đầu đăng bán tour đến địa chỉ email của đại lý.
    12. Giao diện cập nhật trạng thái sang "Đã phê duyệt".
  - **Nhánh Từ chối hồ sơ**:
    13. Nếu giấy phép không hợp lệ hoặc thông tin sai lệch, Admin bấm nút "Từ chối".
    14. Modal yêu cầu Admin nhập Lý do từ chối (Ví dụ: "Giấy phép kinh doanh đã hết hạn", "Mã số thuế không trùng khớp với cơ sở dữ liệu quốc gia").
    15. Admin bấm "Gửi từ chối".
    16. Backend cập nhật trạng thái thành `REJECTED`, lưu lý do từ chối và gửi email phản hồi thông báo lý do cho người nộp đơn.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *14a. Admin từ chối nhưng không nhập lý do*: Hệ thống yêu cầu phải nhập lý do từ chối để đối tác có thông tin chỉnh sửa và nộp lại hồ sơ.
- **Kết quả**: Hồ sơ đại lý được xử lý minh bạch; đối tác hợp lệ được nâng quyền Vendor để bắt đầu kinh doanh trên sàn.

---

### 2.5.22. Đặc tả Use Case: Kiểm duyệt nội dung tour du lịch của Admin
- **Mô tả**: Đảm bảo chất lượng và tính chuẩn mực của các sản phẩm tour đăng bán trên sàn SmartTravel. Admin kiểm tra chi tiết nội dung tour do Vendor gửi lên (hình ảnh, giá vé, lịch trình từng ngày, chính sách visa), trước khi phê duyệt để tour chính thức hiển thị công khai trên website.
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: Mail Service.
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Admin truy cập mục "Kiểm duyệt Tour du lịch" (`/admin/tour-approvals`).
  2. Giao diện hiển thị danh sách các tour đang ở trạng thái `PENDING_APPROVAL` do các Vendor gửi lên.
  3. Admin bấm nút "Xem và Kiểm duyệt" tại tour cần đánh giá.
  4. Hệ thống hiển thị giao diện xem trước (Preview) chi tiết tour giống như trải nghiệm của khách hàng: Tiêu đề, Thư viện ảnh, Lịch trình từng ngày, Chính sách visa, Bảng giá vé và thông tin Vendor.
  5. Admin rà soát kỹ các nội dung: tính chính xác của lịch trình, không có nội dung phản cảm, giá vé hợp lý và hình ảnh chất lượng.
  - **Nhánh Duyệt đăng tour công khai**:
    6. Nếu nội dung hoàn toàn đạt yêu cầu, Admin bấm nút "Phê duyệt đăng sàn".
    7. Frontend gửi request `PUT /api/admin/tours/:id/approve` tới Backend.
    8. Backend cập nhật trạng thái của tour thành `APPROVED`.
    9. Tour lập tức xuất hiện công khai trên trang chủ và kết quả tìm kiếm của khách hàng.
    10. Hệ thống gửi thông báo thông báo cho Vendor: "Tour du lịch của bạn đã được phê duyệt và đang mở bán trên sàn".
  - **Nhánh Từ chối / Yêu cầu chỉnh sửa**:
    11. Nếu phát hiện vi phạm hoặc nội dung thiếu sót (ảnh mờ, sai lỗi chính tả, lịch trình sơ sài), Admin bấm "Từ chối / Yêu cầu sửa".
    12. Modal yêu cầu Admin điền phản hồi chi tiết các điểm cần chỉnh sửa.
    13. Admin bấm "Gửi phản hồi".
    14. Backend cập nhật trạng thái tour thành `REJECTED` (hoặc `NEEDS_REVISION`), lưu nội dung phản hồi và gửi email thông báo cho Vendor chỉnh sửa để nộp duyệt lại.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *12a. Bỏ trống lý do từ chối*: Hệ thống bắt buộc nhập phản hồi để Vendor biết lỗi cần khắc phục.
- **Kết quả**: Tour du lịch đạt tiêu chuẩn được mở bán công khai trên nền tảng; các tour sai sót được trả về đại lý để hoàn thiện nội dung.

---

### 2.5.23. Đặc tả Use Case: Quản trị danh mục địa danh du lịch (Trong nước / Quốc tế) của Admin
- **Mô tả**: Cho phép Admin quản lý cơ sở dữ liệu danh mục các địa danh du lịch (Destination / Locations) trên hệ thống SmartTravel. Các địa danh này đóng vai trò phân loại điểm đến trong nước và quốc tế để phục vụ chức năng tìm kiếm, lọc tour và gắn thẻ địa lý cho các bài viết cẩm nang.
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: Cloudinary API (Lưu ảnh tiêu biểu địa danh).
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Admin truy cập mục "Quản trị Địa danh" (`/admin/destinations`).
  2. Giao diện hiển thị danh sách các địa danh du lịch hiện có kèm ảnh đại diện, tên địa danh, phân loại (Miền Bắc, Miền Trung, Miền Nam, Châu Á, Châu Âu...), số lượng tour liên kết và trạng thái.
  - **Nhánh Thêm mới địa danh**:
    3. Admin bấm nút "Thêm địa danh mới".
    4. Giao diện mở modal nhập liệu: Tên địa danh (VD: "Vịnh Hạ Long"), Quốc gia/Vùng miền, Tải ảnh đại diện tiêu biểu, Mô tả tóm tắt nét đặc sắc du lịch.
    5. Admin điền thông tin và tải ảnh, bấm "Lưu địa danh".
    6. Frontend upload ảnh lên Cloudinary và gửi request `POST /api/admin/destinations` tới Backend.
    7. Backend kiểm tra tên địa danh không trùng lặp, lưu vào CSDL và phản hồi thành công.
    8. Bảng danh mục cập nhật thêm địa danh mới.
  - **Nhánh Chỉnh sửa địa danh**:
    9. Admin bấm icon "Chỉnh sửa" tại một dòng địa danh.
    10. Modal mở ra chứa thông tin hiện tại, Admin thay đổi tên, ảnh hoặc mô tả và bấm "Cập nhật".
    11. Backend cập nhật dữ liệu vào bảng `destinations`.
  - **Nhánh Xóa địa danh**:
    12. Admin bấm icon "Xóa" tại địa danh không còn sử dụng.
    13. Hệ thống kiểm tra xem địa danh này có đang được liên kết với tour du lịch nào đang mở bán hay không.
    14. Nếu không có tour nào liên kết, hệ thống thực hiện xóa bản ghi (hoặc chuyển trạng thái sang `INACTIVE`) và thông báo xóa thành công.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *13a. Địa danh đang có tour du lịch hoạt động*: Backend phát hiện ràng buộc toàn vẹn khóa ngoại (`DESTINATION_IN_USE`) -> Từ chối xóa và hiển thị cảnh báo: "Không thể xóa địa danh này vì hiện có X tour du lịch đang liên kết. Bạn cần chuyển các tour sang địa danh khác trước".
- **Kết quả**: Danh mục địa danh du lịch được quản lý đồng bộ, hỗ trợ việc phân loại và tìm kiếm tour trên toàn hệ thống.

---

### 2.5.24. Đặc tả Use Case: Quản lý chương trình khuyến mãi & Mã giảm giá (Voucher) của Admin
- **Mô tả**: Cung cấp công cụ cho Quản trị viên tạo lập, quản lý và kiểm soát các chiến dịch kích cầu du lịch thông qua mã giảm giá (Voucher / Promo Code). Admin có thể thiết lập tỷ lệ giảm giá, mức giảm tối đa, giá trị đơn hàng tối thiểu để áp dụng, thời hạn hiệu lực và số lượt sử dụng tối đa của mã.
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: Không có.
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Admin truy cập mục "Quản lý Mã giảm giá" (`/admin/vouchers`).
  2. Giao diện hiển thị danh sách các mã voucher: Mã Code, Tên chương trình, Mức giảm (% hoặc số tiền cụ thể), Mức giảm tối đa, Giá trị đơn tối thiểu, Ngày bắt đầu, Ngày hết hạn, Đã dùng / Tổng số lượt, và Trạng thái (Đang bật / Đang tắt).
  - **Nhánh Tạo mã giảm giá mới**:
    3. Admin bấm nút "Tạo mã giảm giá mới".
    4. Giao diện mở form tạo Voucher:
       - Nhập Mã code (Ví dụ: `HE2026`, `VIETNAMTRAVEL`).
       - Loại giảm giá: Giảm theo phần trăm (%) hoặc Giảm số tiền cố định (VND).
       - Giá trị giảm (Ví dụ: 15% hoặc 500.000 VND).
       - Mức giảm tối đa (Áp dụng cho giảm theo %, ví dụ: tối đa 1.000.000 VND).
       - Giá trị đơn hàng tối thiểu để được áp dụng (Ví dụ: đơn từ 3.000.000 VND).
       - Tổng số lượt sử dụng cho phép (Ví dụ: 100 lượt).
       - Thời gian hiệu lực: Ngày bắt đầu và Ngày kết thúc.
    5. Admin kiểm tra các tham số và bấm "Lưu mã giảm giá".
    6. Frontend gửi request `POST /api/admin/vouchers` tới Backend.
    7. Backend kiểm tra mã code không trùng lặp, ngày kết thúc phải sau ngày bắt đầu, lưu vào CSDL.
    8. Bảng danh sách cập nhật hiển thị mã giảm giá mới.
  - **Nhánh Bật / Tắt hoặc Xóa mã giảm giá**:
    9. Admin có thể bấm nút chuyển đổi trạng thái (Toggle Switch) để Tắt nhanh một mã giảm giá khi chiến dịch kết thúc sớm mà không cần xóa bản ghi.
    10. Backend cập nhật trạng thái `isActive = false` trong CSDL để người dùng không thể áp dụng mã này khi thanh toán.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *7a. Trùng mã code*: Admin nhập mã đã tồn tại -> Backend báo lỗi 400 (`VOUCHER_CODE_EXISTS`) -> Cảnh báo "Mã giảm giá này đã tồn tại, vui lòng nhập mã khác".
- **Kết quả**: Mã giảm giá được thiết lập chuẩn xác, sẵn sàng cho khách hàng nhập và hưởng ưu đãi khi đặt tour.

---

### 2.5.25. Đặc tả Use Case: Theo dõi dòng tiền, Đối soát hoa hồng & Dashboard doanh thu toàn sàn của Admin
- **Mô tả**: Cung cấp trung tâm chỉ huy tài chính cho Quản trị viên toàn hệ thống: theo dõi dòng tiền thanh toán trực tuyến của toàn sàn du lịch, tính toán doanh thu hoa hồng sàn (Commission fee trích từ các đơn đặt tour thành công của Vendor), quản lý số dư đối soát để thanh toán cho đại lý, và hiển thị biểu đồ Dashboard tổng thể về tăng trưởng doanh thu và người dùng.
- **Tác nhân chính**: Admin.
- **Tác nhân phụ**: BankGateway.
- **Điều kiện**: Quản trị viên đã đăng nhập tài khoản `ROLE_ADMIN`.
- **Luồng sự kiện chính**:
  1. Khi Admin đăng nhập, hệ thống tự động điều hướng về màn hình Dashboard tổng thể (`/admin/dashboard`).
  2. Giao diện Dashboard hiển thị tức thì các chỉ số tài chính và vận hành thời gian thực:
     - **Tổng giá trị giao dịch toàn sàn (Gross Merchandise Value - GMV)**: Tổng số tiền khách hàng đã thanh toán qua cổng trực tuyến.
     - **Doanh thu hoa hồng sàn thực nhận (Net Revenue)**: Tổng số tiền hoa hồng mà sàn SmartTravel được hưởng theo tỷ lệ chiết khấu (ví dụ 10% trên mỗi đơn hàng thành công).
     - **Tổng số dư đối soát phải chi trả cho Vendor**: Số tiền sàn sẽ chuyển trả cho các đại lý du lịch sau khi trừ phí hoa hồng và khi chuyến đi hoàn tất.
     - **Tổng số lượng đơn đặt tour** và **Tổng số người dùng mới**.
  3. Admin có thể chuyển sang trang "Đối soát & Dòng tiền" (`/admin/financial-settlement`):
     - Xem danh sách chi tiết từng đại lý Vendor kèm tổng doanh số bán được, hoa hồng sàn đã giữ lại và số tiền cần thanh toán cho đại lý trong kỳ.
     - Kiểm tra lịch sử các giao dịch Webhook từ cổng ngân hàng BankGateway để đối chiếu số tiền thực tế vào tài khoản ngân hàng của sàn.
     - Bấm nút "Xác nhận đối soát kỳ này" để kết chuyển số liệu tài chính phục vụ quyết toán.
  4. Giao diện hiển thị các biểu đồ trực quan (Charts):
     - Biểu đồ vùng (Area Chart): Xu hướng tăng trưởng doanh thu toàn sàn theo 12 tháng trong năm.
     - Biểu đồ phân bổ tỷ trọng doanh thu giữa Tour trong nước và Tour quốc tế.
     - Bảng xếp hạng Top 5 đại lý du lịch (Vendors) có doanh số và chất lượng dịch vụ tốt nhất trên sàn.
- **Luồng sự kiện ngoại lệ / Rẽ nhánh**:
  - *3a. Phát hiện chênh lệch dòng tiền giữa Webhook và CSDL*: Hệ thống kích hoạt cảnh báo cảnh báo màu đỏ và liệt kê các mã giao dịch cần kiểm tra thủ công.
- **Kết quả**: Ban quản trị sàn nắm bắt toàn diện tình hình tài chính, kiểm soát dòng tiền hoa hồng và vận hành hệ sinh thái thương mại điện tử du lịch an toàn, hiệu quả.

---
*Báo cáo được hoàn thiện chuẩn theo format Tiểu luận chuyên ngành Công nghệ Thông tin.*
