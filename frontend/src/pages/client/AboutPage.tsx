import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Award, Target, Eye, Compass, CheckCircle2, ChevronRight,
  Plane, QrCode, Bot, FileText, Map, Star, Users, Globe, Sparkles,
  Lock, Scale, ScrollText, UserCheck, ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('intro');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'intro', label: 'Giới thiệu', icon: <Compass className="h-4 w-4" /> },
    { id: 'services', label: 'Giới thiệu dịch vụ', icon: <Star className="h-4 w-4" /> },
    { id: 'terms', label: 'Điều kiện & điều khoản', icon: <Scale className="h-4 w-4" /> },
    { id: 'rules', label: 'Quy chế hoạt động', icon: <ScrollText className="h-4 w-4" /> },
    { id: 'privacy', label: 'Chính sách riêng tư', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'security', label: 'Chính sách bảo mật', icon: <Lock className="h-4 w-4" /> },
  ];

  const serviceCards = [
    { icon: <Plane className="h-6 w-6" />, color: 'from-sky-500 to-cyan-400', glow: 'rgba(56,189,248,0.2)', title: 'Tour Trọn Gói', desc: 'Hành trình được thiết kế hoàn toàn — vé máy bay, khách sạn, xe đưa đón, HDV và bảo hiểm trong một gói duy nhất. Phù hợp cả gia đình, nhóm bạn và doanh nghiệp.' },
    { icon: <QrCode className="h-6 w-6" />, color: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,0.2)', title: 'Thanh Toán VietQR', desc: 'Đặt tour và thanh toán ngay lập tức qua mã QR chuẩn VietQR — hỗ trợ 40+ ngân hàng Việt Nam, xác nhận tự động trong 60 giây, không cần tiền mặt.' },
    { icon: <Bot className="h-6 w-6" />, color: 'from-violet-500 to-purple-400', glow: 'rgba(139,92,246,0.2)', title: 'Tư Vấn AI Gemini', desc: 'Trợ lý Gemini AI hoạt động 24/7 — phân tích sở thích, ngân sách và đề xuất lịch trình cá nhân hoá chính xác. Không cần chờ đợi, không cần gọi điện.' },
    { icon: <FileText className="h-6 w-6" />, color: 'from-rose-500 to-pink-400', glow: 'rgba(244,63,94,0.2)', title: 'Dịch Vụ Visa', desc: 'Hỗ trợ toàn bộ thủ tục xin visa 50+ quốc gia — tư vấn hồ sơ, điền đơn, theo dõi trực tuyến và cam kết tỷ lệ đậu cao.' },
    { icon: <ShieldCheck className="h-6 w-6" />, color: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.2)', title: 'Bảo Hiểm Du Lịch', desc: 'Bảo hiểm toàn diện — tai nạn, bệnh tật, mất hành lý, hủy chuyến và hỗ trợ khẩn cấp 24/7 khi ở nước ngoài.' },
  ];

  const sectionStyle = "space-y-8 text-sm text-slate-300 leading-relaxed";
  const h1Style = "text-2xl font-black text-white uppercase tracking-tight pb-4 border-b border-white/10";
  const h2Style = "text-base font-black text-white uppercase tracking-tight flex items-center gap-2 pt-2";
  const h3Style = "text-xs font-black text-sky-300 uppercase flex items-center gap-1.5 mb-2";
  const blockquoteStyle = "pl-4 border-l-2 border-sky-500/60 text-slate-300";

  return (
    <div className="min-h-screen bg-[#020204] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-sky-400 transition">Trang Chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300 font-bold">Giới thiệu</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-3">
            <div
              className="rounded-2xl border border-white/8 p-3 space-y-1 sticky top-24"
              style={{ background: 'rgba(10,17,29,0.85)', backdropFilter: 'blur(16px)' }}
            >
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                    activeTab === item.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={activeTab === item.id ? 'text-sky-400' : 'text-slate-600'}>{item.icon}</span>
                    {item.label}
                  </span>
                  {activeTab === item.id && <ChevronRight className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main
            className="lg:col-span-9 rounded-2xl border border-white/8 p-8 space-y-8"
            style={{ background: 'rgba(10,17,29,0.85)', backdropFilter: 'blur(16px)' }}
          >

            {/* ── GIỚI THIỆU ── */}
            {activeTab === 'intro' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>CÔNG TY TNHH DỊCH VỤ DU LỊCH VÀ SỰ KIỆN SMART TRAVEL</h1>

                <div className="space-y-4">
                  <p className="font-extrabold text-white text-base">Kính thưa Quý khách!</p>
                  <p>Lời đầu tiên, thay mặt cho Ban Lãnh Đạo và đội ngũ nhân viên Công ty TNHH Dịch vụ Du lịch và Sự kiện Smart Travel, chúng tôi xin gửi đến Quý khách lời chào trân trọng và những lời chúc tốt đẹp nhất. Smart Travel xin chân thành cảm ơn Quý khách đã luôn tin tưởng và ủng hộ trong suốt chặng đường phát triển.</p>
                  <p>Smart Travel được thành lập dưới sự lãnh đạo của Ban Lãnh Đạo có kinh nghiệm trên <strong className="text-sky-300">15 năm</strong> trong lĩnh vực Du lịch và Sự kiện. Đội ngũ nhân sự trẻ trung, đầy nhiệt huyết, được đào tạo bài bản và chuyên nghiệp, luôn sẵn sàng cống hiến để mang đến những dịch vụ tốt nhất cho khách hàng.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  {[
                    { icon: <Users className="h-5 w-5" />, val: '12,000+', lbl: 'Khách hàng', color: 'text-sky-400' },
                    { icon: <Globe className="h-5 w-5" />, val: '50+', lbl: 'Quốc gia', color: 'text-emerald-400' },
                    { icon: <Award className="h-5 w-5" />, val: '15+', lbl: 'Năm kinh nghiệm', color: 'text-amber-400' },
                    { icon: <Star className="h-5 w-5" />, val: '4.9/5', lbl: 'Đánh giá', color: 'text-rose-400' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col items-center text-center gap-1">
                      <span className={s.color}>{s.icon}</span>
                      <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                      <div className="text-[11px] text-slate-500">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-2 border-t border-white/8">
                  <h2 className={h2Style}><Compass className="h-5 w-5 text-sky-400" /> TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI</h2>

                  <div>
                    <h3 className={h3Style}><Eye className="h-4 w-4 text-sky-400" /> TẦM NHÌN</h3>
                    <p className={blockquoteStyle}>Smart Travel trở thành công ty uy tín, chất lượng, đáng tin cậy — là sự lựa chọn hàng đầu của khách hàng trong lĩnh vực du lịch và sự kiện tại thị trường Việt Nam và khu vực Đông Nam Á.</p>
                  </div>

                  <div>
                    <h3 className={h3Style}><Target className="h-4 w-4 text-emerald-400" /> SỨ MỆNH</h3>
                    <p className={blockquoteStyle}>Với sứ mệnh <strong className="text-white">"Khách hàng là trên hết"</strong>, Smart Travel luôn mong muốn được đồng hành và phục vụ khách hàng bằng tất cả trách nhiệm và danh dự. Chúng tôi không ngừng lắng nghe, học hỏi để đáp ứng yêu cầu ngày một tốt hơn.</p>
                  </div>

                  <div>
                    <h3 className={h3Style}><Award className="h-4 w-4 text-amber-400" /> GIÁ TRỊ CỐT LÕI</h3>
                    <div className="space-y-3">
                      {[
                        ['text-emerald-400', 'An toàn', 'Luôn đặt sự an toàn của khách hàng lên hàng đầu. Mọi dịch vụ và hoạt động đều được kiểm tra kỹ lưỡng để đảm bảo an toàn tuyệt đối.'],
                        ['text-sky-400', 'Sáng tạo', 'Không ngừng đổi mới để mang đến những trải nghiệm du lịch độc đáo và mới lạ, vượt ngoài mong đợi.'],
                        ['text-amber-400', 'Đáng giá', 'Cam kết mang lại giá trị tốt nhất cho mỗi đồng khách hàng bỏ ra. Mỗi dịch vụ đều được thiết kế để mang lại sự hài lòng tối đa.'],
                        ['text-violet-400', 'Chuyên nghiệp', 'Đội ngũ nhân sự được đào tạo bài bản, quy trình làm việc chuẩn quốc tế, đảm bảo trải nghiệm liền mạch từ đặt tour đến kết thúc hành trình.'],
                      ].map(([color, title, desc], i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5`} />
                          <div><strong className="text-white">{title}:</strong> {desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── GIỚI THIỆU DỊCH VỤ ── */}
            {activeTab === 'services' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>GIỚI THIỆU DỊCH VỤ</h1>
                <p>Smart Travel cung cấp đầy đủ các dịch vụ du lịch hiện đại — từ tour trọn gói đến lịch trình cá nhân hoá, tích hợp công nghệ thanh toán VietQR và tư vấn AI thông minh, mang đến trải nghiệm du lịch hoàn hảo từ A đến Z.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceCards.map((svc, i) => (
                    <div key={i} className="group relative rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(300px circle at 30% 0%, ${svc.glow}, transparent 70%)` }} />
                      <div className={`relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${svc.color} text-white mb-3`}
                        style={{ boxShadow: `0 6px 20px ${svc.glow}` }}>
                        {svc.icon}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{svc.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{svc.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/8 text-center">
                  <button onClick={() => navigate('/services')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(to top, #9ad9ec 1px, #14a8c6 5px, #04465a 13px, #0a111d 32px)', boxShadow: '0 0 12px rgba(60,190,235,.2)' }}>
                    Xem chi tiết dịch vụ <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── ĐIỀU KIỆN & ĐIỀU KHOẢN ── */}
            {activeTab === 'terms' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>ĐIỀU KIỆN & ĐIỀU KHOẢN ĐẶT TOUR</h1>
                <p>Khi đặt tour tại Smart Travel, Quý khách xác nhận đã đọc, hiểu và đồng ý với toàn bộ các điều khoản dưới đây.</p>
                {[
                  ['1. Đặt cọc và thanh toán', 'Để xác nhận đặt tour, Quý khách cần thanh toán đặt cọc tối thiểu 30% tổng giá trị tour. Số tiền còn lại thanh toán đầy đủ trước ngày khởi hành ít nhất 7 ngày. Smart Travel chấp nhận thanh toán qua chuyển khoản ngân hàng, VietQR và tiền mặt tại văn phòng.'],
                  ['2. Chính sách hủy tour', 'Hủy trước 15 ngày: hoàn 100% tiền đặt cọc. Hủy trước 8–14 ngày: hoàn 70%. Hủy trước 3–7 ngày: hoàn 50%. Hủy dưới 3 ngày hoặc không đến: không hoàn tiền. Trường hợp hủy do thiên tai, dịch bệnh: hoàn 100% hoặc đổi lịch miễn phí.'],
                  ['3. Thay đổi lịch trình', 'Smart Travel có quyền thay đổi lịch trình, khách sạn hoặc phương tiện khi có lý do bất khả kháng, đồng thời thông báo sớm nhất có thể và đảm bảo chất lượng dịch vụ tương đương hoặc tốt hơn.'],
                  ['4. Trách nhiệm của khách hàng', 'Quý khách có trách nhiệm cung cấp thông tin chính xác khi đặt tour (tên, ngày sinh, số CMND/CCCD/hộ chiếu), tự bảo quản giấy tờ và tài sản cá nhân, tuân thủ lịch trình và hướng dẫn của HDV.'],
                ].map(([title, content], i) => (
                  <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-2">
                    <h3 className="text-sm font-bold text-sky-300">{title}</h3>
                    <p className="text-xs">{content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── QUY CHẾ HOẠT ĐỘNG ── */}
            {activeTab === 'rules' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>QUY CHẾ HOẠT ĐỘNG</h1>
                <p>Smart Travel hoạt động theo Giấy phép kinh doanh lữ hành quốc tế số <strong className="text-sky-300">7900068956</strong> do Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh cấp, tuân thủ đầy đủ Luật Du lịch Việt Nam 2017.</p>
                {[
                  ['Cam kết chất lượng dịch vụ', 'Toàn bộ tour được thiết kế và vận hành theo quy trình chuẩn, đảm bảo đúng lịch trình, đúng hạng khách sạn, đúng phương tiện và đầy đủ các dịch vụ đã cam kết trong hợp đồng.'],
                  ['Đội ngũ hướng dẫn viên', 'Tất cả HDV của Smart Travel đều có thẻ HDV du lịch hợp lệ, được đào tạo chuyên nghiệp, có kinh nghiệm và khả năng xử lý tình huống linh hoạt. HDV quốc tế thông thạo ít nhất một ngoại ngữ.'],
                  ['Bảo hiểm bắt buộc', 'Smart Travel mua bảo hiểm du lịch bắt buộc cho 100% khách hàng tham gia tour theo đúng quy định của Luật Du lịch. Mức bảo hiểm tối thiểu 10 triệu đồng/người/chuyến đi trong nước và 50 triệu đồng/người/chuyến đi nước ngoài.'],
                  ['Giải quyết khiếu nại', 'Mọi khiếu nại của Quý khách được tiếp nhận và xử lý trong vòng 24 giờ. Smart Travel cam kết giải quyết thỏa đáng, đặt quyền lợi khách hàng lên hàng đầu.'],
                ].map(([title, content], i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.03]">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                      <p className="text-xs">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CHÍNH SÁCH RIÊNG TƯ ── */}
            {activeTab === 'privacy' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>CHÍNH SÁCH RIÊNG TƯ</h1>
                <p>Smart Travel cam kết bảo vệ quyền riêng tư của Quý khách. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của Quý khách.</p>
                {[
                  { icon: <UserCheck className="h-5 w-5 text-sky-400" />, title: 'Thông tin chúng tôi thu thập', content: 'Chúng tôi thu thập thông tin cá nhân cần thiết để xử lý đặt tour: họ tên, số điện thoại, email, ngày sinh, số CMND/CCCD/hộ chiếu, và thông tin thanh toán. Thông tin được thu thập trực tiếp từ Quý khách khi đặt tour hoặc qua website.' },
                  { icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />, title: 'Mục đích sử dụng', content: 'Thông tin của Quý khách được sử dụng để: xác nhận và xử lý đặt tour, cung cấp dịch vụ khách hàng, gửi thông báo về chuyến đi, cải thiện dịch vụ và gửi thông tin khuyến mãi (nếu Quý khách đồng ý).' },
                  { icon: <Lock className="h-5 w-5 text-amber-400" />, title: 'Bảo vệ thông tin', content: 'Smart Travel áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của Quý khách khỏi truy cập trái phép, mất mát hoặc tiết lộ.' },
                  { icon: <Globe className="h-5 w-5 text-violet-400" />, title: 'Chia sẻ thông tin', content: 'Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của Quý khách với bên thứ ba vì mục đích thương mại, ngoại trừ các đối tác cung cấp dịch vụ (khách sạn, hãng bay) cần thiết để thực hiện tour của Quý khách.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.03]">
                    <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-xs">{item.content}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-500 border-t border-white/8 pt-4">Quý khách có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ với chúng tôi qua email: <a href="mailto:support@smarttravel.vn" className="text-sky-400 hover:underline">support@smarttravel.vn</a></p>
              </div>
            )}

            {/* ── CHÍNH SÁCH BẢO MẬT ── */}
            {activeTab === 'security' && (
              <div className={sectionStyle}>
                <h1 className={h1Style}>CHÍNH SÁCH BẢO MẬT THÔNG TIN</h1>
                <p>Smart Travel sử dụng các tiêu chuẩn bảo mật cao nhất để đảm bảo an toàn cho thông tin và giao dịch của Quý khách trên toàn bộ nền tảng.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: '🔐', title: 'Mã hóa SSL/TLS', desc: 'Toàn bộ dữ liệu truyền tải giữa trình duyệt và máy chủ được mã hóa bằng SSL/TLS 256-bit, đảm bảo không bị đánh cắp trong quá trình truyền.' },
                    { icon: '🏦', title: 'Bảo mật thanh toán', desc: 'Giao dịch VietQR được xử lý trực tiếp qua cổng ngân hàng, Smart Travel không lưu trữ thông tin thẻ ngân hàng hay mật khẩu của Quý khách.' },
                    { icon: '🛡️', title: 'Xác thực 2 bước', desc: 'Hệ thống xác thực 2 bước (2FA) qua OTP SMS bảo vệ tài khoản khách hàng khỏi truy cập trái phép ngay cả khi mật khẩu bị lộ.' },
                    { icon: '📋', title: 'Nhật ký kiểm toán', desc: 'Mọi thao tác trên hệ thống đều được ghi lại nhật ký đầy đủ, cho phép truy vết và phát hiện nhanh các hoạt động bất thường.' },
                    { icon: '🔄', title: 'Sao lưu dữ liệu', desc: 'Dữ liệu được sao lưu tự động mỗi ngày và lưu trữ tại nhiều vị trí địa lý khác nhau, đảm bảo khôi phục nhanh chóng trong mọi tình huống.' },
                    { icon: '🚨', title: 'Phát hiện xâm nhập', desc: 'Hệ thống giám sát 24/7 với AI phát hiện và ngăn chặn tự động các cuộc tấn công DDoS, SQL injection và các mối đe dọa bảo mật khác.' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-300 mb-1">Cam kết bảo mật</p>
                    <p className="text-xs text-slate-400">Smart Travel cam kết thông báo cho Quý khách trong vòng 72 giờ nếu phát hiện bất kỳ sự cố bảo mật nào có thể ảnh hưởng đến thông tin của Quý khách, theo đúng quy định của Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</p>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
