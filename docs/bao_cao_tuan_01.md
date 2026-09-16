# BÁO CÁO TIẾN ĐỘ TUẦN 1 - TIỂU LUẬN CHUYÊN NGÀNH
**HỌC KỲ I – NĂM HỌC 2026 - 2027**  
**Đề tài:** Nền tảng thương mại điện tử đặt tour du lịch trực tuyến SmartTravel  
**Thời gian Tuần 1:** Từ ngày **14/09/2026** đến ngày **20/09/2026**  
**Sinh viên thực hiện:**  
1. Nguyễn Bảo Lợi – MSSV: 23110256  
2. Nguyễn Duy Quang – MSSV: 23110290  

---

## PHẦN 1: BÁO CÁO TIẾN ĐỘ CÔNG VIỆC (THEO NGÀY - DẠNG BẢNG)
*(Dùng để in kèm báo cáo hoặc nộp theo mẫu bảng của Bộ môn)*

| Tuần | Ngày | Nội dung: Công việc | Chi tiết thực hiện |
|:---:|:---:|:---|:---|
| **1** | **14/09 - 15/09** | **Lập kế hoạch thực hiện, khảo sát & chốt công nghệ** | • Tham khảo kế hoạch mẫu, hoàn thiện bảng kế hoạch 15 tuần và đề cương đề tài.<br>• Khảo sát nhanh quy trình nghiệp vụ trên các nền tảng OTA thực tế (Traveloka, Klook).<br>• Chốt ngăn xếp công nghệ: Backend Java 17 + Spring Boot 3, Frontend React + TypeScript, CSDL MySQL, thanh toán VietQR / Thẻ Visa và Google Gemini AI. |
| **1** | **16/09 - 17/09** | **Phân tích nghiệp vụ & Phác thảo sơ đồ Use Case sơ bộ** | • Xác định các tác nhân chính trong hệ thống: Khách hàng (Customer), Đại lý du lịch (Vendor) và Quản trị viên (Admin).<br>• Liệt kê danh mục chức năng tổng quan của từng phân hệ.<br>• Sử dụng công cụ PlantUML để phác thảo sơ đồ Use Case Diagram tổng thể (`usecase_diagram.puml`) phục vụ cho việc đặc tả chi tiết ở tuần sau. |
| **1** | **18/09 - 20/09** | **Khởi tạo repository Git & Thiết lập khung dự án sơ bộ** | • Khởi tạo repository Git trên GitHub, thiết lập các nhánh làm việc và phân quyền cho 2 thành viên.<br>• Thiết lập môi trường phát triển và khởi tạo bộ khung Monorepo ban đầu:<br>  + Backend: Cấu hình project Spring Boot 3 (Maven, Java 17), kiểm tra kết nối CSDL MySQL ban đầu.<br>  + Frontend: Khởi tạo project React với TypeScript và cài đặt TailwindCSS.<br>• Chạy thử nghiệm khung dự án cơ bản đảm bảo môi trường 2 bên hoạt động thông suốt. |

---

## PHẦN 2: NỘI DUNG NHẬT KÝ BÁO CÁO TUẦN 1 (DÁN VÀO FORM HỆ THỐNG)
*(Copy toàn bộ đoạn văn dưới đây dán vào ô **"Nội dung (hỗ trợ Markdown)"** trên trang nộp báo cáo)*

### 1. Những việc đã làm được:
- Hoàn thành bản Đề cương chi tiết và Bảng kế hoạch thực hiện 15 tuần có phân chia công việc cụ thể (50% - 50%) giữa 2 thành viên.
- Khảo sát các nền tảng đặt tour trực tuyến thực tế (Traveloka, Klook) để xác định bài toán nghiệp vụ cho đề tài SmartTravel.
- Thống nhất kiến trúc và ngăn xếp công nghệ: Spring Boot 3 (Java 17), React + TypeScript + TailwindCSS, MySQL, cổng thanh toán VietQR & Visa/MasterCard, Gemini AI.
- Phân tích sơ bộ các tác nhân (Customer, Vendor, Admin) và phác thảo xong sơ đồ Use Case Diagram tổng thể bằng PlantUML.
- Khởi tạo repository Git trên GitHub và thiết lập bộ khung dự án Monorepo ban đầu (Spring Boot 3 cho Backend và React TypeScript cho Frontend), kiểm tra kết nối CSDL thành công.

### 2. Những việc chưa làm được:
- Mới dừng ở mức sơ đồ Use Case tổng thể, chưa viết bảng Đặc tả Use Case chi tiết (luồng chính, luồng phụ, ngoại lệ) cho từng chức năng.

### 3. Những vướng mắc, khó khăn:
- Việc tích hợp đồng thời cả thanh toán quét mã VietQR động và Thẻ quốc tế Visa cần tìm hiểu kỹ cơ chế xác thực Webhook đối soát theo thời gian thực để tránh lỗi trạng thái đơn hàng.

### 4. Câu hỏi (nếu có):
- Thưa Thầy/Cô, đối với tính năng hướng dẫn thủ tục Visa du lịch cho tour quốc tế, nhóm nên thiết kế danh mục hồ sơ giấy tờ mẫu để khách hàng tự chuẩn bị hay cần làm thêm form cho phép khách hàng tải ảnh hồ sơ lên để đại lý kiểm tra trước ạ?

### 5. Những việc sẽ làm trong 2 tuần tiếp (Tuần 2 & Tuần 3):
- **Tuần 2 (21/09 – 27/09):** Hoàn thiện tài liệu Đặc tả yêu cầu phần mềm (SRS); xây dựng tập tài liệu Đặc tả Use Case chi tiết cho các ca sử dụng cốt lõi (Đăng ký/Đăng nhập, Quản lý Tour, Đặt tour & Khóa slot, Thanh toán, AI Chatbot).
- **Tuần 3 (28/09 – 04/10):** Thiết kế mô hình cơ sở dữ liệu quan hệ (ERD), chuẩn hóa dữ liệu đạt dạng chuẩn 3NF, xây dựng bảng Từ điển dữ liệu (Data Dictionary) chi tiết và viết kịch bản SQL khởi tạo database (`smarttravel_db.sql`).

---

## PHẦN 3: KHAI BÁO SỬ DỤNG AI (ĐIỀN VÀO FORM HỆ THỐNG)
*(Copy thông tin tương ứng điền vào phần Khai báo AI)*

* **Bạn có dùng LLM/AI code/AI agent hỗ trợ công việc tuần này không?**  
  👉 Chọn: **Có**

* **Công cụ AI:**  
  `Google Antigravity / Gemini` *(hoặc ChatGPT / Claude)*

* **Phiên bản / model:**  
  `Gemini 2.5 Pro` *(hoặc Gemini 1.5 Pro)*

* **Prompt đã dùng:**  
  ```text
  Hãy đóng vai trò chuyên gia phân tích nghiệp vụ và kiến trúc phần mềm, hỗ trợ xây dựng đề cương 15 tuần cho đề tài 'Nền tảng đặt tour du lịch trực tuyến SmartTravel'. Gợi ý ngăn xếp công nghệ tối ưu (Spring Boot 3, React TypeScript, MySQL, VietQR, Visa, Gemini API), hỗ trợ phân tích các tác nhân chính và phác thảo cú pháp PlantUML cho sơ đồ Use Case Diagram tổng thể.
  ```

* **Nội dung AI tạo ra:**  
  ```text
  AI hỗ trợ gợi ý cấu trúc phân bổ 15 tuần làm việc; tư vấn ngăn xếp công nghệ phù hợp; đề xuất danh mục các Use Case chính cho 3 phân hệ (Customer, Vendor, Admin) và hỗ trợ sinh mã PlantUML sơ đồ Use Case tổng quan.
  ```
