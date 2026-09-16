# TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP. HỒ CHÍ MINH
## KHOA CÔNG NGHỆ THÔNG TIN
### BỘ MÔN CÔNG NGHỆ PHẦN MỀM

---

# BẢNG KẾ HOẠCH THỰC HIỆN TIỂU LUẬN CHUYÊN NGÀNH (TLCN_02)
**HỌC KỲ I – NĂM HỌC 2026 - 2027**

---

## I. THÔNG TIN CHUNG VỀ ĐỀ TÀI

* **Tên đề tài:**  
  **XÂY DỰNG NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ ĐẶT TOUR DU LỊCH TRỰC TUYẾN SMARTTRAVEL TÍCH HỢP THANH TOÁN ĐA KÊNH (VIETQR / THẺ QUỐC TẾ VISA), QUẢN LÝ THỦ TỤC VISA VÀ TRỢ LÝ ẢO AI CHATBOT**
* **Chuyên ngành:** Công nghệ Thông tin / Kỹ thuật Phần mềm
* **Giảng viên hướng dẫn (GVHD):** ............................................................................
* **Thời gian thực hiện:** 15 tuần (Từ ngày 17/08/2026 đến ngày 29/11/2026)

### Thông tin sinh viên thực hiện:
| STT | Họ và tên sinh viên | Mã số sinh viên (MSSV) | Lớp sinh hoạt | Số điện thoại | Email liên hệ | Vai trò trong nhóm |
|:---:|:---|:---:|:---:|:---:|:---|:---:|
| 1 | **Nguyễn Bảo Lợi** | **23110256** | 23110... | .................... | 23110256@student.hcmute.edu.vn | Nhóm trưởng |
| 2 | **Nguyễn Duy Quang** | **23110290** | 23110... | .................... | 23110290@student.hcmute.edu.vn | Thành viên |

---

## II. MỤC TIÊU VÀ CÁC TÍNH NĂNG ĐẶC TRƯNG CỦA HỆ THỐNG

### 1. Mục tiêu đề tài
* Xây dựng sàn thương mại điện tử du lịch trực tuyến hiện đại kết nối 3 đối tượng người dùng: **Khách hàng (Customer)**, **Đại lý du lịch (Vendor)** và **Quản trị viên sàn (Admin)**.
* Ứng dụng kiến trúc phân tầng hiệu năng cao với **Spring Boot 3 (Java 17)**, cơ sở dữ liệu quan hệ **MySQL**, bảo mật và kiểm soát truy cập phân quyền chặt chẽ bằng **Spring Security 6 & JWT**.
* Xây dựng giao diện Single Page Application (SPA) tối ưu trải nghiệm người dùng với **React + TypeScript** và **TailwindCSS**.
* Tự động hóa thanh toán không tiền mặt đa kênh bằng **VietQR** (sinh mã QR động) và **Thẻ quốc tế (Visa / MasterCard)** kết hợp Webhook đối soát tự động theo thời gian thực và phát hành vé điện tử (E-Ticket) qua Email.
* Quản lý thông tin thủ tục và hướng dẫn hồ sơ xin **Visa du lịch** đối với các tour quốc tế.

### 2. Các chức năng tích hợp Trí tuệ nhân tạo (AI - Google Gemini API)
1. **Phân hệ Khách hàng (Customer):**
   * **Trợ lý ảo AI Chatbot tư vấn & gợi ý tour thông minh:** Khách hàng trò chuyện tự nhiên (nhập yêu cầu về ngân sách, sở thích, số người, ngày đi), AI kết hợp dữ liệu tour thực tế từ database hệ thống để lọc và đề xuất tour phù hợp kèm thẻ xem nhanh (ảnh, giá, nút đặt ngay).
   * **Tự động giải đáp FAQ & Hỗ trợ tư vấn thủ tục Visa du lịch:** Chatbot giải đáp 24/7 các chính sách hoàn hủy tour, điều kiện thanh toán VietQR / Thẻ Visa, giấy tờ cần chuẩn bị để xin Visa du lịch theo từng quốc gia, thời hạn nộp hồ sơ.
   * **Gợi ý lịch trình cá nhân hóa (Personalized Itinerary Planner):** Tự động gợi ý lịch trình chi tiết theo từng ngày (ăn gì, chơi gì, điểm check-in tiêu biểu) dựa trên điểm đến của tour.
2. **Phân hệ Đại lý (Vendor):**
   * **AI Content Generator (Tự động sinh mô tả & lịch trình tour):** Hỗ trợ Vendor tạo bài viết mô tả tour hấp dẫn, chuẩn SEO và gợi ý phân bổ lịch trình chi tiết (Ngày 1, Ngày 2, Ngày 3...) chỉ với vài từ khóa đầu vào.
3. **Phân hệ Quản trị (Admin):**
   * **AI Sentiment Analysis (Phân tích cảm xúc đánh giá & hỗ trợ kiểm duyệt):** Tự động phân tích các đánh giá/bình luận của khách hàng để gắn nhãn (Hài lòng / Khiếu nại / Cảnh báo gian lận), hỗ trợ Admin phát hiện kịp thời các tour kém chất lượng.

---

## III. BẢNG KẾ HOẠCH TIẾN ĐỘ THỰC HIỆN CHI TIẾT (15 TUẦN)

> **Ghi chú điều chỉnh theo chuẩn đồ án thực tế:**
> * Các công việc vẽ sơ đồ / biểu đồ (Use Case Diagram, Activity Diagram, Sequence Diagram, Class Diagram,...) được thực hiện trực tiếp trong tài liệu báo cáo Word, không đưa vào danh mục nhiệm vụ kỹ thuật của phần mềm.
> * Tuần 1 và 2 tập trung vào khảo sát hiện trạng, phân tích yêu cầu SRS và **xây dựng bảng Đặc tả Use Case chi tiết** cho các phân hệ.
> * Tuần 3 và 4 tập trung vào **Thiết kế cơ sở dữ liệu quan hệ (Mô hình ERD)**, xây dựng từ điển dữ liệu, thiết kế giao diện UI/UX và khởi tạo dự án.

| Tuần | Thời gian | Nhiệm vụ (Công việc dự kiến) | Người phụ trách | Sản phẩm dự kiến | Kết quả | Chữ ký GVHD |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| **1** | 17/08 – 23/08/2026 | • Khảo sát các nền tảng đặt tour trực tuyến thực tế (Traveloka, Klook, Vietravel).<br>• Xác định mục tiêu, phạm vi và giải pháp công nghệ cho đề tài SmartTravel (Spring Boot 3, React, VietQR, Thẻ Visa, Gemini AI).<br>• Lập đề cương chi tiết đề tài và kế hoạch tiến độ 15 tuần nộp GVHD phê duyệt. | Cả nhóm | • Bản đề cương chi tiết đề tài TLCN.<br>• Bảng kế hoạch tiến độ 15 tuần có xác nhận của GVHD. | Đạt | |
| **2** | 24/08 – 30/08/2026 | • Thu thập và phân tích tài liệu đặc tả yêu cầu phần mềm (SRS).<br>• Phân tích yêu cầu chức năng cho 3 phân hệ (Customer, Vendor, Admin).<br>• Phân tích yêu cầu cổng thanh toán (VietQR, Thẻ quốc tế Visa) và các chức năng AI.<br>• Xác định các yêu cầu phi chức năng (bảo mật dữ liệu, xử lý concurrency, hiệu năng hệ thống).<br>• **Xây dựng bảng Đặc tả Use Case chi tiết** cho các luồng nghiệp vụ chính (mô tả mục tiêu, tác nhân, tiền điều kiện, hậu điều kiện, luồng sự kiện chính, luồng phụ và luồng ngoại lệ cho: Đăng ký/Đăng nhập, Quản lý Tour, Đặt tour & Khóa slot, Thanh toán, AI Chatbot). | Cả nhóm | • Tài liệu Đặc tả yêu cầu phần mềm (SRS).<br>• Bảng danh sách User Stories.<br>• Tập tài liệu Đặc tả Use Case chi tiết cho từng chức năng chính của hệ thống. | Đạt | |
| **3** | 31/08 – 06/09/2026 | • **Thiết kế Cơ sở dữ liệu quan hệ (Mô hình ERD)**:<br>  + Xác định các thực thể và mối quan hệ giữa các thực thể (Users, Roles, Tours, TourSchedules, Bookings, Payments, Reviews, VisaRequirements).<br>  + Xây dựng mô hình thực thể mối kết hợp (ERD).<br>  + Chuyển đổi mô hình ERD sang lược đồ cơ sở dữ liệu quan hệ (chuẩn hóa dữ liệu đạt dạng chuẩn 3NF).<br>  + Xây dựng Từ điển dữ liệu (Data Dictionary): mô tả kiểu dữ liệu, ràng buộc khóa chính/khóa ngoại, chỉ mục (Index) và giá trị mặc định.<br>• Viết kịch bản SQL khởi tạo cơ sở dữ liệu MySQL (`smarttravel_db.sql`). | Cả nhóm | • Bản thiết kế mô hình dữ liệu quan hệ (ERD).<br>• Bảng Từ điển dữ liệu (Data Dictionary) chi tiết.<br>• File script SQL khởi tạo cơ sở dữ liệu hoàn chỉnh. | Đạt | |
| **4** | 07/09 – 13/09/2026 | • Thiết kế kiến trúc tổng thể hệ thống (mô hình 3 tầng Controller - Service - Repository cho Backend REST API và kiến trúc Single Page Application cho Frontend).<br>• Thiết kế giao diện người dùng mẫu (Wireframe / Prototype trên Figma cho các màn hình: Trang chủ, Chi tiết tour, Đặt tour, Thanh toán, Dashboard Vendor, Dashboard Admin).<br>• Khởi tạo bộ khung dự án (Monorepo): cấu hình Spring Boot 3 (Java 17), React + TypeScript + TailwindCSS, cấu hình kết nối CSDL và các biến môi trường ban đầu. | Cả nhóm | • Bộ thiết kế giao diện UI/UX mẫu.<br>• Bộ khung dự án Monorepo đã cấu hình sẵn sàng cho việc lập trình. | Đạt | |
| **5** | 14/09 – 20/09/2026 | • Xây dựng module Xác thực và Phân quyền (Authentication & Authorization):<br>  + Cấu hình Spring Security 6 và JWT Provider (sinh Access Token & Refresh Token).<br>  + Phân quyền 3 vai trò: `ROLE_CUSTOMER`, `ROLE_VENDOR`, `ROLE_ADMIN`.<br>• Xây dựng chức năng Đăng ký tài khoản, gửi Email OTP kích hoạt và Quên/Đặt lại mật khẩu.<br>• Xây dựng API và giao diện Đăng nhập, Quản lý thông tin hồ sơ cá nhân (Profile, Avatar, Đổi mật khẩu). | Cả nhóm | • Hệ thống xác thực và phân quyền người dùng hoàn chỉnh cả Frontend và Backend.<br>• Bộ API Auth có tài liệu Swagger đầy đủ. | Đạt | |
| **6** | 21/09 – 27/09/2026 | • Xây dựng Phân hệ Đại lý du lịch (Vendor):<br>  + Quy trình nộp hồ sơ đăng ký nâng cấp tài khoản thành Vendor.<br>  + Quản lý Tour: Đăng bán tour mới, chỉnh sửa thông tin tour, tải lên thư viện hình ảnh (tích hợp Cloudinary).<br>  + Cấu hình chính sách và thủ tục Visa đối với tour quốc tế (chi phí làm visa có bao gồm trong giá tour hay không, hạn chót nộp hồ sơ xin visa).<br>  + Quản lý Lịch khởi hành (TourSchedule): Thiết lập ngày đi, ngày về, giá vé người lớn/trẻ em, cấu hình số lượng slot chỗ mở bán. | Cả nhóm | • Bộ RESTful APIs quản lý Tour và Lịch trình.<br>• Giao diện quản lý danh sách tour và cấu hình lịch trình/chính sách Visa của Vendor. | Đạt | |
| **7** | 28/09 – 04/10/2026 | • Xây dựng Phân hệ Khách hàng (Phần 1):<br>  + Xây dựng Trang chủ (Banner sự kiện, Danh sách tour nổi bật, Điểm đến thịnh hành).<br>  + Bộ lọc và tìm kiếm tour đa tiêu chí (điểm đến trong nước/quốc tế, khoảng giá, số ngày đi, đánh giá sao).<br>  + Trang Chi tiết tour: Hiển thị đầy đủ thông tin mô tả, lịch trình chi tiết từng ngày, chính sách tour và chọn ngày khởi hành còn chỗ trống.<br>  + Tích hợp mục **Thông tin & Hướng dẫn thủ tục hồ sơ Visa du lịch** cho các tour quốc tế (thời hạn nộp, danh mục giấy tờ cần chuẩn bị, quy định hoàn/hủy liên quan đến kết quả Visa). | Cả nhóm | • Giao diện tìm kiếm và xem chi tiết tour chuẩn responsive.<br>• Tab thông tin hướng dẫn thủ tục hồ sơ Visa rõ ràng, chi tiết.<br>• Bộ API tìm kiếm, lọc tour chính xác với tốc độ phản hồi nhanh. | Đạt | |
| **8** | 05/10 – 11/10/2026 | • Xây dựng Phân hệ Khách hàng (Phần 2):<br>  + Xây dựng quy trình Đặt tour (Booking): Chọn số lượng khách (người lớn/trẻ em), nhập thông tin liên lạc, danh sách hành khách và tích chọn nhu cầu hỗ trợ thủ tục Visa.<br>  + Xây dựng cơ chế kiểm tra và khóa giữ chỗ (Slot reservation) theo thời gian thực (xử lý concurrency, chống overbooking khi nhiều khách cùng đặt vé cuối).<br>  + Quản lý lịch sử đặt tour (Booking History) và theo dõi trạng thái đơn hàng của khách hàng. | Cả nhóm | • Luồng đặt tour hoàn chỉnh từ chọn lịch trình đến tạo đơn hàng thành công.<br>• Cơ chế giữ slot chỗ an toàn, không bị sai lệch dữ liệu. | Đạt | |
| **9** | 12/10 – 18/10/2026 | • Tích hợp Cổng thanh toán trực tuyến đa kênh:<br>  + Thanh toán tự động quét mã **VietQR**: Tự động sinh mã QR động theo số tiền đơn hàng và mã thanh toán, xây dựng Webhook tiếp nhận dữ liệu đối soát giao dịch tự động theo thời gian thực.<br>  + Mở rộng phương thức thanh toán qua **Thẻ quốc tế (Visa / MasterCard)** qua cổng thanh toán trực tuyến.<br>  + Tự động cập nhật trạng thái đơn hàng sang `PAID` ngay khi giao dịch thành công.<br>  + Tự động sinh Vé điện tử (E-Ticket) kèm mã QR tra cứu và gửi email xác nhận cho khách hàng. | Cả nhóm | • Cổng thanh toán tích hợp thành công cả 2 kênh: VietQR động và Thẻ quốc tế Visa/MasterCard.<br>• Hệ thống đối soát thanh toán tự động 100%.<br>• Mẫu Vé điện tử (E-Ticket) chuyên nghiệp được gửi tự động về hòm thư khách hàng. | Đạt | |
| **10** | 19/10 – 25/10/2026 | • Tích hợp Trí tuệ nhân tạo AI - Phân hệ Khách hàng (Google Gemini API):<br>  + Xây dựng Trợ lý ảo AI Chatbot tư vấn tour thông minh (kết hợp dữ liệu tour thực tế từ database để gợi ý theo ngân sách, sở thích, ngày đi).<br>  + Chatbot tự động giải đáp FAQ và **hỗ trợ tư vấn thủ tục làm Visa du lịch** (giấy tờ cần chuẩn bị, thời hạn xét duyệt, lưu ý phỏng vấn Visa theo từng quốc gia).<br>  + Tính năng AI gợi ý lịch trình ăn uống, vui chơi cá nhân hóa (Personalized Itinerary Planner).<br>• Xây dựng Floating Chat Widget ở góc màn hình giao diện khách hàng. | Cả nhóm | • Chatbot AI hoạt động ổn định trên website, phản hồi thời gian thực.<br>• Chatbot phản hồi thông minh, đề xuất đúng tour có sẵn và tư vấn chính xác thủ tục hồ sơ Visa. | Đạt | |
| **11** | 26/10 – 01/11/2026 | • Tích hợp Trí tuệ nhân tạo AI - Phân hệ Vendor & Admin:<br>  + Phân hệ Vendor: Tính năng **AI Content Generator** tự động viết bài mô tả tour hấp dẫn, chuẩn SEO và sinh gợi ý phân bổ lịch trình từng ngày cho Vendor khi đăng tour mới.<br>  + Phân hệ Admin: Tính năng **AI Sentiment Analysis** phân tích cảm xúc các đánh giá (Review) của khách hàng để gắn nhãn (Hài lòng / Khiếu nại) và đưa ra cảnh báo chất lượng tour của đại lý. | Cả nhóm | • Chức năng AI hỗ trợ đắc lực cho Vendor khi tạo tour mới.<br>• Báo cáo đánh giá của Admin có thêm phân tích cảm xúc tự động từ AI. | Đạt | |
| **12** | 02/11 – 08/11/2026 | • Xây dựng Phân hệ Quản trị viên (Admin Portal) & Đánh giá (Review):<br>  + Kiểm duyệt hồ sơ đăng ký của đại lý Vendor (Duyệt / Từ chối).<br>  + Kiểm duyệt nội dung tour đăng bán trước khi công khai lên sàn.<br>  + Quản lý danh mục địa danh, quản lý người dùng (Khóa / Mở tài khoản).<br>  + Báo cáo Dashboard: Biểu đồ doanh thu toàn sàn, tỷ lệ lấp đầy tour, dòng tiền đối soát hoa hồng.<br>• Xây dựng Phân hệ Đánh giá (Review): Khách hàng đánh giá sao và đăng kèm ảnh chụp thực tế sau khi hoàn thành chuyến đi. | Cả nhóm | • Phân hệ Quản trị Admin hoàn chỉnh phục vụ vận hành sàn du lịch.<br>• Module Review minh bạch, uy tín cho khách hàng. | Đạt | |
| **13** | 09/11 – 15/11/2026 | • Kiểm thử toàn diện hệ thống (Testing):<br>  + Kiểm thử chức năng (Functional Testing) cho toàn bộ 3 phân hệ (Customer, Vendor, Admin).<br>  + Kiểm thử chịu tải và tranh chấp đặt chỗ (Concurrency Testing khi chỉ còn 1 slot duy nhất).<br>  + Kiểm thử tính chính xác của thanh toán VietQR / Thẻ Visa và xử lý Webhook khi có sự cố mạng.<br>  + Kiểm thử độ phản hồi và an toàn câu lệnh đối với Chatbot AI.<br>• Rà soát bảo mật, tối ưu câu lệnh SQL, sửa các lỗi phát sinh. | Cả nhóm | • Bảng kịch bản kiểm thử (Test Cases) và Biên bản kết quả kiểm thử.<br>• Hệ thống vận hành ổn định, không còn lỗi nghiêm trọng. | Đạt | |
| **14** | 16/11 – 22/11/2026 | • Đóng gói và triển khai thử nghiệm hệ thống lên môi trường thực tế (Cloud / VPS / Render).<br>• Viết bản dự thảo Báo cáo Tiểu luận chuyên ngành (từ Chương 1 đến Chương 5).<br>• Gửi dự thảo báo cáo cho GVHD xem xét và xin ý kiến góp ý chỉnh sửa.<br>• Hoàn thiện các tài liệu hướng dẫn cài đặt và hướng dẫn sử dụng hệ thống. | Cả nhóm | • Bản thảo Báo cáo Tiểu luận chuyên ngành hoàn chỉnh.<br>• Bản demo trực tuyến chạy ổn định trên môi trường máy chủ.<br>• Tài liệu hướng dẫn cài đặt và vận hành. | Đạt | |
| **15** | 23/11 – 29/11/2026 | • Chỉnh sửa, hoàn thiện báo cáo chính thức theo góp ý của GVHD.<br>• Chuẩn bị slide thuyết trình và quay video clip demo minh họa hệ thống.<br>• Trao đổi lần cuối với GVHD, nghiệm thu đề tài và chuẩn bị bảo vệ trước Hội đồng. | Cả nhóm | • Quyển báo cáo TLCN hoàn chỉnh để in và nộp.<br>• Slide thuyết trình chuyên nghiệp.<br>• Video clip demo các luồng nghiệp vụ chính. | Đạt | |

---

## IV. BẢNG PHÂN CÔNG TRÁCH NHIỆM VÀ ĐÓNG GÓP CỦA THÀNH VIÊN

| STT | Thành viên thực hiện | Module phụ trách chính | Nội dung công việc chi tiết | Tỷ lệ đóng góp |
|:---:|:---|:---|:---|:---:|
| 1 | **Nguyễn Bảo Lợi**<br>*(MSSV: 23110256)* | **Kiến trúc Backend, CSDL, Bảo mật JWT, Cổng thanh toán (VietQR / Visa), AI Service & Phân hệ Admin** | • Thiết kế cơ sở dữ liệu quan hệ MySQL, xây dựng mô hình ERD, chuẩn hóa CSDL và viết script SQL.<br>• Cấu hình bảo mật hệ thống bằng Spring Security 6 & JSON Web Token (JJWT).<br>• Xây dựng Module Xác thực (Auth), gửi Email OTP kích hoạt tài khoản.<br>• Xây dựng RESTful API Quản lý Tour, Lịch trình khởi hành và giải quyết tranh chấp Slot đặt chỗ.<br>• Tích hợp Cổng thanh toán VietQR động và Thẻ quốc tế Visa/MasterCard; xây dựng Webhook xử lý đối soát giao dịch tự động.<br>• Xây dựng Backend Service kết nối Google Gemini API (Prompt Engineering, Chatbot logic, AI sinh nội dung tour).<br>• Xây dựng phân hệ Quản trị viên (Admin: kiểm duyệt tour, đối soát hoa hồng, thống kê doanh thu toàn sàn).<br>• Viết báo cáo Tiểu luận chuyên ngành: Lời mở đầu, Khảo sát hiện trạng, Phân tích yêu cầu và Thiết kế hệ thống CSDL (Chương 1, 2, 3). | **50%** |
| 2 | **Nguyễn Duy Quang**<br>*(MSSV: 23110290)* | **Giao diện Frontend (UI/UX), Phân hệ Khách hàng, Giao diện Chatbot AI, Module Visa & Phân hệ Vendor** | • Thiết kế giao diện người dùng (UI/UX) hiện đại bằng React, TypeScript và TailwindCSS.<br>• Xây dựng bảng Đặc tả Use Case chi tiết cho các ca sử dụng của hệ thống.<br>• Xây dựng giao diện Khách hàng: Trang chủ, Tìm kiếm tour đa tiêu chí, Trang chi tiết tour (kèm tab Thủ tục Visa), Đặt tour & Giữ slot chỗ trống.<br>• Xây dựng giao diện Vendor: Dashboard quản trị tour, quản lý lịch khởi hành, quản lý đơn đặt chỗ của đại lý.<br>• Thiết kế và hiện thực hóa Floating Chat Widget Trợ lý ảo AI Chatbot trên giao diện người dùng.<br>• Xây dựng module Đánh giá kèm ảnh thực tế (Customer Reviews).<br>• Viết báo cáo Tiểu luận chuyên ngành: Hiện thực hóa chương trình, Hướng dẫn sử dụng, Kiểm thử & Đánh giá kết quả (Chương 4, 5, Kết luận); Thiết kế Slide thuyết trình & Quay Video Demo bảo vệ đề tài. | **50%** |

---

## V. KẾT QUẢ VÀ SẢN PHẨM BÀN GIAO KHI KẾT THÚC ĐỀ TÀI

1. **Sản phẩm phần mềm ứng dụng:**
   * Mã nguồn Backend Spring Boot 3 hoàn chỉnh, đầy đủ tài liệu API trên Swagger UI (`/swagger-ui.html`).
   * Mã nguồn Frontend Web React + TypeScript hoàn chỉnh cho cả 3 vai trò (Customer, Vendor, Admin).
   * Kịch bản cơ sở dữ liệu mẫu (`smarttravel_db.sql`) có đầy đủ dữ liệu demo (các tour du lịch tiêu biểu tại Việt Nam và quốc tế, lịch khởi hành, tài khoản mẫu).
2. **Sản phẩm tài liệu & Báo cáo:**
   * Quyển báo cáo Tiểu luận chuyên ngành hoàn chỉnh (bản in đóng bìa mềm/cứng và file PDF/Word).
   * Slide trình chiếu báo cáo trước Hội đồng chấm điểm.
   * Video clip demo chi tiết toàn bộ các luồng nghiệp vụ chính của hệ thống.
   * Repository mã nguồn dự án trên GitHub kèm hướng dẫn triển khai trong file `README.md`.

---

## VI. Ý KIẾN VÀ XÁC NHẬN CỦA CÁC BÊN

*TP.HCM, ngày ...... tháng ...... năm 2026*

| GIẢNG VIÊN HƯỚNG DẪN | SINH VIÊN 1 (NHÓM TRƯỞNG) | SINH VIÊN 2 (THÀNH VIÊN) |
|:---:|:---:|:---:|
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br><br><br> | <br><br><br><br>**Nguyễn Bảo Lợi** | <br><br><br><br>**Nguyễn Duy Quang** |
