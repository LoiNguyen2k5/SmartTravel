# -*- coding: utf-8 -*-
"""
Script to generate standard academic submission documents for:
1. Mục tiêu của đề tài (Muc_tieu_de_tai_SmartTravel.docx)
2. Phạm vi thực hiện của đề tài (Pham_vi_thuc_hien_de_tai_SmartTravel.docx)
"""

import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml, OxmlElement

BLACK = RGBColor(0x00, 0x00, 0x00)
PRIMARY_COLOR = RGBColor(0x1A, 0x36, 0x5D) # Deep Navy for academic accent
MUTED_COLOR = RGBColor(0x4A, 0x55, 0x68)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner padding for table cells in twips."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def set_cell_background(cell, color_hex="F0F4F8"):
    """Set cell background shading."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_border(cell, **kwargs):
    """
    Set cell borders: top, bottom, left, right.
    Format: {"val": "single", "sz": "4", "space": "0", "color": "D0D5DD"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for border_name, border_props in kwargs.items():
        el = parse_xml(f'<w:{border_name} {nsdecls("w")} '
                       f'w:val="{border_props.get("val", "single")}" '
                       f'w:sz="{border_props.get("sz", "4")}" '
                       f'w:space="{border_props.get("space", "0")}" '
                       f'w:color="{border_props.get("color", "CBD5E1")}"/>')
        tcBorders.append(el)
    tcPr.append(tcBorders)

def setup_page(doc):
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(2.0)
    
    # Configure normal style
    normal = doc.styles['Normal']
    normal.font.name = 'Times New Roman'
    normal.font.size = Pt(13)
    normal.font.color.rgb = BLACK
    rPr = normal.element.get_or_add_rPr()
    rPr.append(parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="Times New Roman"/>'))
    
    pf = normal.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.line_spacing = 1.3
    pf.space_before = Pt(2)
    pf.space_after = Pt(6)

def add_header_metadata(doc, title, subtitle):
    # University / Topic Banner
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(0)
    p_inst.paragraph_format.space_after = Pt(2)
    r1 = p_inst.add_run("BÁO CÁO TIỂU LUẬN CHUYÊN NGÀNH CÔNG NGHỆ THÔNG TIN")
    r1.font.bold = True
    r1.font.size = Pt(11)
    r1.font.color.rgb = MUTED_COLOR

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_before = Pt(0)
    p_proj.paragraph_format.space_after = Pt(14)
    r_proj = p_proj.add_run("ĐỀ TÀI: XÂY DỰNG NỀN TẢNG DU LỊCH TRỰC TUYẾN THÔNG MINH (SMARTTRAVEL) TÍCH HỢP TRÍ TUỆ NHÂN TẠO")
    r_proj.font.bold = True
    r_proj.font.size = Pt(12)
    r_proj.font.color.rgb = PRIMARY_COLOR

    # Main Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run(title.upper())
    r_title.font.bold = True
    r_title.font.size = Pt(16)
    r_title.font.color.rgb = PRIMARY_COLOR

    # Subtitle / Criteria note
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run(f"({subtitle})")
    r_sub.font.italic = True
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = MUTED_COLOR

    # Info Box Table
    info_table = doc.add_table(rows=2, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_widths = [Cm(8.0), Cm(8.0)]
    for row in info_table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = col_widths[idx]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            set_cell_background(cell, "F8FAFC")
            set_cell_border(cell, top={"sz": "2", "color": "E2E8F0"},
                                  bottom={"sz": "2", "color": "E2E8F0"},
                                  left={"sz": "2", "color": "E2E8F0"},
                                  right={"sz": "2", "color": "E2E8F0"})

    cell_00 = info_table.cell(0, 0)
    p00 = cell_00.paragraphs[0]
    p00.paragraph_format.line_spacing = 1.15
    p00.paragraph_format.space_after = Pt(2)
    r = p00.add_run("Sinh viên thực hiện:")
    r.font.bold = True
    r.font.size = Pt(11)
    p00_b = cell_00.add_paragraph()
    p00_b.paragraph_format.line_spacing = 1.15
    p00_b.paragraph_format.space_after = Pt(0)
    p00_b.add_run("1. Nguyễn Bảo Lợi\n2. Nguyễn Duy Quang").font.size = Pt(11)

    cell_01 = info_table.cell(0, 1)
    p01 = cell_01.paragraphs[0]
    p01.paragraph_format.line_spacing = 1.15
    p01.paragraph_format.space_after = Pt(2)
    r = p01.add_run("Giảng viên hướng dẫn:")
    r.font.bold = True
    r.font.size = Pt(11)
    p01_b = cell_01.add_paragraph()
    p01_b.paragraph_format.line_spacing = 1.15
    p01_b.paragraph_format.space_after = Pt(0)
    p01_b.add_run("ThS. Nguyễn Trần Thi Văn").font.size = Pt(11)

    cell_10 = info_table.cell(1, 0)
    p10 = cell_10.paragraphs[0]
    p10.paragraph_format.line_spacing = 1.15
    p10.paragraph_format.space_after = Pt(0)
    p10.add_run("Học kỳ: 1 (Năm học 2026 - 2027)").font.size = Pt(10.5)

    cell_11 = info_table.cell(1, 1)
    p11 = cell_11.paragraphs[0]
    p11.paragraph_format.line_spacing = 1.15
    p11.paragraph_format.space_after = Pt(0)
    p11.add_run("Chuyên ngành: Công nghệ phần mềm").font.size = Pt(10.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = PRIMARY_COLOR
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = BLACK
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.bold = True
    run.font.italic = True
    run.font.size = Pt(12.5)
    run.font.color.rgb = BLACK
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.75)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    
    r_bullet = p.add_run("•  ")
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = PRIMARY_COLOR
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.bold = True
        
    p.add_run(text)
    return p

def add_sub_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(1.5)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.2
    
    r_bullet = p.add_run("-  ")
    r_bullet.font.bold = True
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.bold = True
        
    p.add_run(text)
    return p

def add_footer_page_number(doc):
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    fPr = p.add_run("Trang ").font
    fPr.size = Pt(9.5)
    fPr.color.rgb = MUTED_COLOR
    fPr.name = 'Times New Roman'
    
    # XML page field
    fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    p._p.append(fldSimple)

def build_muc_tieu_document(output_path):
    doc = Document()
    setup_page(doc)
    add_header_metadata(doc, "MỤC TIÊU CỦA ĐỀ TÀI", "Tiêu chí: Tính thực tiễn của đề tài và sự hiểu biết về vấn đề nghiên cứu")

    add_heading_1(doc, "1. TỔNG QUAN VÀ TÍNH THỰC TIỄN CỦA ĐỀ TÀI")
    
    add_heading_2(doc, "1.1. Bối cảnh thực tiễn ngành Du lịch trực tuyến (OTA)")
    p = doc.add_paragraph()
    p.add_run("Trong bối cảnh nền kinh tế số và xu hướng phục hồi vượt bậc của ngành du lịch Việt Nam sau đại dịch COVID-19, nhu cầu ứng dụng công nghệ thông tin nhằm nâng cao trải nghiệm của du khách cũng như tối ưu hóa năng lực quản lý của các công ty lữ hành trở nên cấp thiết hơn bao giờ hết. Khách du lịch hiện đại đòi hỏi sự tiện lợi, nhanh chóng, minh bạch và an toàn khi tiếp cận các dịch vụ trực tuyến.")
    
    p2 = doc.add_paragraph()
    p2.add_run("Tuy nhiên, khảo sát thực tế các nền tảng OTA (Online Travel Agency) hiện hành trên thị trường cho thấy người dùng và doanh nghiệp lữ hành vẫn đang đối mặt với nhiều rào cản và bài toán kỹ thuật nhức nhối:")

    add_bullet(doc, "Phần lớn các nền tảng hiện nay hoạt động độc lập hoặc chỉ đáp ứng một phần chuỗi cung ứng. Du khách thường phải chuyển đổi qua lại giữa nhiều ứng dụng khác nhau: một nơi để tìm kiếm tour, một nơi khác để tra cứu thông tin thị thực (visa), tự lập lịch trình bằng ghi chú bên ngoài, và liên hệ hướng dẫn viên qua mạng xã hội.", "Trải nghiệm người dùng bị phân mảnh: ")
    
    add_bullet(doc, "Trong các đợt cao điểm hoặc khi nhiều khách hàng cùng truy cập đặt những suất vé cuối cùng của một tour du lịch, việc xử lý tranh chấp dữ liệu không triệt để dẫn tới tình trạng bán vượt số lượng thực tế, gây khiếu nại và thiệt hại uy tín cho nhà cung cấp.", "Hiện tượng bán vé vượt số chỗ (Overselling & Race Condition): ")

    add_bullet(doc, "Khách du lịch quốc tế và trong nước xuất ngoại thường gặp khó khăn trong việc chuẩn bị thủ tục visa do thông tin tản mác, thiếu hướng dẫn cụ thể theo từng loại hộ chiếu và điểm đến.", "Rào cản thông tin thủ tục thị thực (Visa): ")

    add_bullet(doc, "Các hệ thống hỏi đáp trực tuyến truyền thống phần lớn sử dụng chatbot dựa trên luật (rule-based) cứng nhắc, chỉ phản hồi các kịch bản định sẵn mà không thể giải đáp chi tiết theo ngữ cảnh sản phẩm thực tế, thiếu khả năng truy xuất dữ liệu động.", "Thiếu vắng trợ lý ảo thông minh đồng hành: ")

    add_heading_2(doc, "1.2. Sự cần thiết của đề tài SmartTravel")
    p3 = doc.add_paragraph()
    p3.add_run("Xuất phát từ các vấn đề thực tiễn trên, việc nghiên cứu và xây dựng đề tài ")
    r_b = p3.add_run("“Xây dựng nền tảng du lịch trực tuyến thông minh (SmartTravel) tích hợp Trí tuệ nhân tạo”")
    r_b.font.bold = True
    p3.add_run(" là vô cùng cần thiết. Dự án mang lại một giải pháp hệ sinh thái khép kín “All-in-One”, kết nối chặt chẽ ba đối tượng người dùng: ")
    p3.add_run("Khách hàng (Customer) - Nhà cung cấp tour (Vendor) - Quản trị viên hệ thống (Admin)").font.bold = True
    p3.add_run(", giải quyết triệt để bài toán tranh chấp số chỗ theo thời gian thực và tiên phong ứng dụng công nghệ GenAI hỗ trợ người dùng 24/7.")

    add_heading_1(doc, "2. MỤC TIÊU NGHIÊN CỨU VÀ PHÁT TRIỂN")

    add_heading_2(doc, "2.1. Mục tiêu tổng quát")
    p_gen = doc.add_paragraph()
    p_gen.add_run("Xây dựng thành công nền tảng du lịch trực tuyến thông minh SmartTravel trên nền kiến trúc Web hiện đại (Spring Boot 3, React 18, TypeScript) tích hợp công nghệ Trí tuệ nhân tạo thế hệ mới (Google Gemini API), cung cấp một môi trường giao dịch du lịch toàn diện, minh bạch, bảo mật và thân thiện, từ khâu tra cứu thông tin, lập kế hoạch hành trình, đặt chỗ, thanh toán số tức thì đến chăm sóc khách hàng tự động.")

    add_heading_2(doc, "2.2. Mục tiêu cụ thể")

    add_heading_3(doc, "a. Về mặt Nghiệp vụ & Kỹ thuật cốt lõi")
    add_bullet(doc, "Giải quyết bài toán tranh chấp giữ chỗ (Concurrency Control): Xây dựng thuật toán khóa chỗ ngồi tạm thời (Holding Slot) trong 3 phút khi khách hàng chuyển sang bước thanh toán, tự động giải phóng chỗ và hoàn trả số lượng khả dụng thông qua Scheduled Background Task (quét định kỳ 20 giây) nếu giao dịch quá hạn hoặc bị hủy.", "Chống Overselling vé tour: ")
    add_bullet(doc, "Tích hợp cổng thanh toán trực tuyến VNPay Sandbox (xác thực chữ ký số HMAC-SHA512) và giải pháp chuyển khoản ngân hàng tự động SePay VietQR (nhận thông báo Webhook theo thời gian thực và gạch nợ tức thì mà không cần sự can thiệp thủ công).", "Thanh toán đa kênh an toàn: ")
    add_bullet(doc, "Tự động xuất vé điện tử kèm mã QR tra cứu duy nhất và file hóa đơn định dạng PDF chuyên nghiệp ngay khi hệ thống xác nhận thanh toán thành công, đồng thời gửi thông tin vé qua Email của khách hàng.", "Vé điện tử & Hóa đơn tự động: ")
    add_bullet(doc, "Cung cấp công cụ cho phép khách hàng tự thiết kế lịch trình cá nhân hóa theo từng ngày, thêm các địa điểm tham quan/ẩm thực và quản lý ghi chú trực quan.", "Lập kế hoạch du lịch cá nhân (Itinerary Planner): ")

    add_heading_3(doc, "b. Về mặt Trí tuệ nhân tạo (AI Engine)")
    add_bullet(doc, "Tích hợp mô hình ngôn ngữ lớn Google Gemini API (phiên bản Flash/Pro) kết hợp kỹ thuật truy xuất dữ liệu tăng cường (RAG - Retrieval-Augmented Generation).", "Trợ lý du lịch thông minh 24/7: ")
    add_bullet(doc, "Chatbot có khả năng truy xuất ngữ cảnh dữ liệu thực tế từ cơ sở dữ liệu (danh sách tour đang mở bán, điểm đến, giá vé, lịch trình chi tiết, cẩm nang thị thực) để trả lời chính xác, trực tiếp điều hướng du khách tới đúng tour phù hợp, loại bỏ hiện tượng sinh thông tin ảo (hallucination).", "Tư vấn chính xác theo thời gian thực: ")

    add_heading_3(doc, "c. Về mặt Kiến trúc & Chuẩn mực phần mềm")
    add_bullet(doc, "Áp dụng kiến trúc đa tầng (Controller - Service - Repository) trên Spring Boot 3, phân chia rõ ràng trách nhiệm nghiệp vụ.", "Kiến trúc hệ thống chuẩn mực: ")
    add_bullet(doc, "Chuẩn hóa định dạng phản hồi API nhất quán bằng cấu trúc ApiResponse<T> (success, message, data, timestamp, status).", "Chuẩn hóa giao tiếp API: ")
    add_bullet(doc, "Phân quyền chặt chẽ trên Spring Security 6 với cơ chế mã hóa JWT (JSON Web Token), xác thực OTP Email 6 chữ số có hiệu lực trong 60 giây.", "Bảo mật và toàn vẹn dữ liệu: ")
    add_bullet(doc, "Xây dựng giao diện người dùng hiện đại, chuẩn thẩm mỹ, phản hồi linh hoạt (Responsive) trên mọi kích thước màn hình với React 18, TypeScript và Tailwind CSS.", "Giao diện trải nghiệm người dùng: ")

    add_heading_1(doc, "3. Ý NGHĨA KHOA HỌC VÀ THỰC TIỄN CỦA ĐỀ TÀI")

    add_heading_2(doc, "3.1. Ý nghĩa khoa học")
    add_bullet(doc, "Nghiên cứu và thực nghiệm mô hình ứng dụng Trí tuệ nhân tạo sinh sinh (Generative AI) kết hợp RAG vào bài toán thương mại điện tử dịch vụ lữ hành.", "Ứng dụng GenAI vào bài toán thực tế: ")
    add_bullet(doc, "Giải quyết bài toán kiểm soát tranh chấp tài nguyên (Concurrency Control) và đảm bảo tính nhất quán dữ liệu (ACID) trong quy trình giao dịch đặt vé phân tán trực tuyến.", "Kỹ thuật tối ưu hóa giao dịch số: ")

    add_heading_2(doc, "3.2. Ý nghĩa thực tiễn")
    add_bullet(doc, "Tiếp cận hệ sinh thái du lịch trọn vẹn, tiết kiệm thời gian tìm kiếm, đặt vé minh bạch, thanh toán an toàn và có trợ lý AI tư vấn xuyên suốt chuyến đi.", "Đối với Du khách (Khách hàng): ")
    add_bullet(doc, "Cung cấp giải pháp chuyển đổi số toàn diện: tự chủ tạo tour, quản lý lịch khởi hành, kiểm soát số lượng booking, theo dõi doanh thu và tinh gọn quy trình đối soát.", "Đối với Doanh nghiệp lữ hành (Vendor): ")
    add_bullet(doc, "Góp phần thúc đẩy xu hướng du lịch thông minh (Smart Tourism) theo định hướng chuyển đổi số quốc gia của ngành du lịch Việt Nam.", "Đối với Xã hội: ")

    add_footer_page_number(doc)
    doc.save(output_path)
    print(f"[OK] Saved: {output_path}")

def build_pham_vi_document(output_path):
    doc = Document()
    setup_page(doc)
    add_header_metadata(doc, "PHẠM VI THỰC HIỆN CỦA ĐỀ TÀI", "Tiêu chí: Phân tích nghiệp vụ, đặc tả yêu cầu và thiết kế – giải pháp")

    add_heading_1(doc, "1. PHẠM VI NGHIỆP VỤ VÀ CHỨC NĂNG HỆ THỐNG")
    p = doc.add_paragraph()
    p.add_run("Hệ thống SmartTravel được thiết kế và xây dựng theo mô hình sàn thương mại điện tử đa bên (Multi-vendor Platform), bao gồm 3 phân hệ chính với các phạm vi nghiệp vụ được đặc tả chi tiết như sau:")

    add_heading_2(doc, "1.1. Phân hệ Khách hàng (Customer Portal)")
    add_bullet(doc, "Đăng ký, đăng nhập tài khoản; quản lý hồ sơ cá nhân; xác thực bảo mật 2 lớp qua mã OTP Email (thời hạn 60 giây, cơ chế xác thực bảo vệ chống brute-force).", "Quản lý Tài khoản & Xác thực: ")
    add_bullet(doc, "Tìm kiếm đa tiêu chí (từ khóa điểm đến, mức giá, phương tiện di chuyển, thời gian xuất phát); xem chi tiết chương trình tour, danh sách điểm tham quan, lịch khởi hành khả dụng theo thời gian thực và đánh giá của khách hàng.", "Tìm kiếm, lọc & Khám phá Tour: ")
    add_bullet(doc, "Công cụ cho phép người dùng tự lên lịch trình du lịch cá nhân hóa theo từng ngày, thêm các địa điểm tham quan/ăn uống/lưu trú, quản lý ghi chú và tích hợp bản đồ trực quan.", "Lập kế hoạch hành trình cá nhân (Itinerary Planner): ")
    add_bullet(doc, "Chọn ngày khởi hành, nhập thông tin hành khách theo cơ cấu giá (người lớn, trẻ em, em bé), áp dụng mã giảm giá (Voucher), thực hiện khóa tạm thời số chỗ trong 3 phút (Holding Slot) nhằm chống tranh chấp vé giữa các người dùng.", "Đặt tour & Giữ chỗ tạm thời: ")
    add_bullet(doc, "Thanh toán an toàn qua cổng VNPay Sandbox (chuẩn HMAC-SHA512) hoặc quét mã VietQR ngân hàng qua SePay Webhook tự động khớp giao dịch.", "Thanh toán trực tuyến đa kênh: ")
    add_bullet(doc, "Tra cứu lịch sử đơn hàng, xem chi tiết tình trạng thanh toán, tải hóa đơn điện tử PDF chuyên nghiệp và xuất mã QR tra cứu/check-in vé.", "Quản lý Đơn hàng & Vé điện tử (E-ticket): ")
    add_bullet(doc, "Trò chuyện trực tuyến 24/7 với Gemini AI, tư vấn tour phù hợp sở thích cá nhân, giải đáp lịch trình và tra cứu cẩm nang thủ tục thị thực (Visa Handbook) của từng quốc gia.", "Trợ lý thông minh AI Chatbot: ")

    add_heading_2(doc, "1.2. Phân hệ Nhà cung cấp (Vendor Portal)")
    add_bullet(doc, "Quy trình nộp hồ sơ xin làm đối tác lữ hành, gửi thông tin pháp lý doanh nghiệp và theo dõi kết quả thẩm định từ Quản trị viên.", "Đăng ký & Thẩm định Đối tác: ")
    add_bullet(doc, "Khởi tạo, cập nhật thông tin tour, địa điểm khởi hành, mô tả chi tiết lịch trình từng ngày, chính sách hoàn hủy và tải lên bộ sưu tập hình ảnh media chất lượng cao.", "Quản lý Sản phẩm Tour: ")
    add_bullet(doc, "Thiết lập các đợt xuất phát, cài đặt số lượng chỗ mở bán tối đa (Capacity) và định giá linh hoạt theo từng đối tượng khách hàng (người lớn, trẻ em, em bé).", "Quản lý Lịch khởi hành & Giá vé: ")
    add_bullet(doc, "Tiếp nhận đơn hàng, tra cứu thông tin hành khách, kiểm tra trạng thái thanh toán và cập nhật tình trạng tham gia tour của khách hàng.", "Quản lý Đơn đặt tour (Booking Management): ")
    add_bullet(doc, "Biểu đồ trực quan theo dõi lượng vé bán ra, tổng doanh thu theo chu kỳ ngày/tháng và tỷ lệ lấp đầy chỗ ngồi của từng tour.", "Báo cáo Doanh thu & Thống kê: ")

    add_heading_2(doc, "1.3. Phân hệ Quản trị viên (Admin Portal)")
    add_bullet(doc, "Bảng điều khiển trực quan thống kê các chỉ số hoạt động toàn sàn: tổng số người dùng, đối tác đang hoạt động, tour đang mở bán, tổng doanh thu và tốc độ tăng trưởng.", "Dashboard Giám sát Toàn diện: ")
    add_bullet(doc, "Kiểm soát tài khoản người dùng, khóa/mở quyền truy cập tài khoản vi phạm, quản lý vai trò (ROLE_CUSTOMER, ROLE_VENDOR, ROLE_ADMIN).", "Quản lý Tài khoản & Phân quyền: ")
    add_bullet(doc, "Thẩm định hồ sơ đăng ký của các công ty lữ hành, phê duyệt hoặc từ chối kèm lý do phản hồi chi tiết qua hệ thống.", "Phê duyệt Hồ sơ Đối tác (Vendor Approval): ")
    add_bullet(doc, "Kiểm duyệt nội dung tour trước khi hiển thị công khai trên hệ thống, quản lý danh mục địa danh điểm đến và chuyên mục hướng dẫn thị thực (Visa Guide).", "Kiểm duyệt Nội dung & Điểm đến: ")
    add_bullet(doc, "Phát hành mã khuyến mãi theo tỷ lệ % hoặc số tiền cố định, thiết lập điều kiện áp dụng (giá trị đơn hàng tối thiểu, thời hạn, giới hạn số lượt sử dụng).", "Quản lý Mã ưu đãi (Voucher Management): ")

    add_heading_1(doc, "2. PHẠM VI DỮ LIỆU VÀ CƠ SỞ DỮ LIỆU")
    p_data = doc.add_paragraph()
    p_data.add_run("Hệ thống quản lý cơ sở dữ liệu quan hệ MySQL với ")
    p_data.add_run("15 bảng thực thể chuẩn hóa").font.bold = True
    p_data.add_run(", được phân chia logic thành 4 nhóm nghiệp vụ chặt chẽ:")

    # Table of DB entities
    table = doc.add_table(rows=5, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    widths = [Cm(3.5), Cm(5.5), Cm(7.0)]
    
    headers = ["Nhóm nghiệp vụ", "Các bảng thực thể (Entities)", "Mục đích lưu trữ & quan hệ"]
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].width = widths[i]
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        set_cell_background(hdr_cells[i], "1A365D")
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        r.font.size = Pt(11)

    row_data = [
        ("1. Người dùng & Bảo mật", "users, roles,\nuser_roles, email_otps", "Quản lý định danh tài khoản, phân quyền RBAC và mã OTP xác thực email có thời hạn 60s."),
        ("2. Danh mục Tour & Đối tác", "tours, tour_schedules,\ndestinations,\nvendor_applications", "Lưu trữ thông tin chi tiết tour, điểm đến, lịch khởi hành kèm số chỗ khả dụng, và hồ sơ đăng ký vendor."),
        ("3. Giao dịch & Đánh giá", "bookings, payments,\nvouchers, reviews", "Quản lý toàn bộ giao dịch đặt tour, chi tiết thanh toán VNPay/VietQR, mã giảm giá và phản hồi đánh giá sao."),
        ("4. Lịch trình cá nhân", "itineraries,\nitinerary_days,\nitinerary_items", "Lưu trữ lịch trình tự thiết kế của khách hàng theo từng ngày và các địa điểm chi tiết trong hành trình.")
    ]

    for row_idx, data in enumerate(row_data, start=1):
        row_cells = table.rows[row_idx].cells
        bg_col = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for c_idx, text in enumerate(data):
            row_cells[c_idx].width = widths[c_idx]
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)
            set_cell_background(row_cells[c_idx], bg_col)
            set_cell_border(row_cells[c_idx], top={"sz": "2", "color": "E2E8F0"},
                                              bottom={"sz": "2", "color": "E2E8F0"},
                                              left={"sz": "2", "color": "E2E8F0"},
                                              right={"sz": "2", "color": "E2E8F0"})
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(text)
            r.font.size = Pt(10.5)
            if c_idx == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_heading_1(doc, "3. PHẠM VI CÔNG NGHỆ VÀ KIẾN TRÚC HỆ THỐNG")
    
    add_bullet(doc, "Java 17, Spring Boot 3.x, Spring Data JPA (Hibernate), Spring Security 6, JWT, RESTful API (chuẩn ApiResponse), iText/OpenPDF (xuất hóa đơn PDF), JavaMailSender.", "Backend Architecture: ")
    add_bullet(doc, "React 18, TypeScript 5, Vite 5, Tailwind CSS, Redux Toolkit, React Query, Lucide Icons, Headless UI.", "Frontend Architecture: ")
    add_bullet(doc, "MySQL 8.0, cấu hình tối ưu chỉ mục (Indexing), khóa ngoại toàn vẹn dữ liệu, HikariCP Connection Pool.", "Cơ sở dữ liệu: ")
    add_bullet(doc, "Bao gồm 3 dịch vụ chuyên biệt:", "Tích hợp Dịch vụ Bên thứ ba: ")
    add_sub_bullet(doc, "Google Gemini API (2.5 Flash / Pro): Xử lý truy vấn thông minh, phân tích ngữ cảnh RAG cho Chatbot.", "• AI Engine: ")
    add_sub_bullet(doc, "VNPay Sandbox (xác thực HMAC-SHA512) và SePay VietQR Webhook (khớp giao dịch ngân hàng tức thì).", "• Cổng thanh toán số: ")
    add_sub_bullet(doc, "SMTP Google Mail: Tự động gửi mã xác thực OTP và thông báo đặt vé thành công.", "• Email Service: ")

    add_heading_1(doc, "4. PHẠM VI KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG (QA & TESTING)")
    add_bullet(doc, "Kiểm thử các hàm tính toán tài chính, áp dụng mã giảm giá, kiểm tra logic giải phóng holding slot sau 3 phút.", "Unit Testing & Service Testing: ")
    add_bullet(doc, "Mô phỏng kịch bản nhiều người dùng cùng đặt các vé cuối cùng của một tour để chứng minh hệ thống không bị bán lố (Zero Overbooking).", "Kiểm thử Tranh chấp tải (Concurrency Testing): ")
    add_bullet(doc, "Đảm bảo tính chính xác và toàn vẹn của dữ liệu trong các chuỗi giao dịch phức tạp (Tạo booking -> Khóa chỗ -> Gọi cổng thanh toán -> Nhận Webhook -> Xuất vé -> Gửi email).", "Kiểm thử Tích hợp (Integration Testing): ")
    add_bullet(doc, "Đảm bảo giao diện hiển thị mượt mà trên Chrome, Edge, Firefox, Safari và thích ứng hoàn hảo trên Desktop, Tablet và Mobile.", "UI/UX & Khả năng tương thích: ")

    add_heading_1(doc, "5. GIỚI HẠN VÀ NHỮNG ĐIỂM NGOÀI PHẠM VI ĐỀ TÀI (OUT OF SCOPE)")
    p_lim = doc.add_paragraph()
    p_lim.add_run("Để đảm bảo tính khả thi và chất lượng hoàn thiện của đề tài trong khuôn khổ thời lượng 15 tuần nghiên cứu của học phần Tiểu luận chuyên ngành, các nội dung sau được xác định nằm ngoài phạm vi thực hiện:")
    add_bullet(doc, "Hệ thống sử dụng môi trường Sandbox/Testnet của VNPay và tài khoản ngân hàng thử nghiệm của SePay, không sử dụng tài khoản doanh nghiệp thực tế để phát sinh giao dịch tiền tệ pháp định.", "Môi trường Thanh toán: ")
    add_bullet(doc, "Đề tài tập trung tối ưu trải nghiệm trên nền tảng Web App (Responsive chuẩn trên Mobile Browser), không đóng gói ứng dụng native cho iOS/Android trên kho ứng dụng.", "Nền tảng Di động: ")
    add_bullet(doc, "Chưa triển khai kiến trúc Microservices phân tán phức tạp mà áp dụng kiến trúc Modular Monolith chuẩn mực để tối ưu hóa hiệu năng và đơn giản hóa việc triển khai.", "Kiến trúc Phân tán: ")

    add_footer_page_number(doc)
    doc.save(output_path)
    print(f"[OK] Saved: {output_path}")

if __name__ == "__main__":
    out_dir = r"E:\Study\TieuLuanChuyenNganhPhanCode\docs"
    os.makedirs(out_dir, exist_ok=True)
    build_muc_tieu_document(os.path.join(out_dir, "Muc_tieu_de_tai_SmartTravel.docx"))
    build_pham_vi_document(os.path.join(out_dir, "Pham_vi_thuc_hien_de_tai_SmartTravel.docx"))
