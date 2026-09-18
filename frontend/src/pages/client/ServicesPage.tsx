import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, ShieldCheck, Bot, Plane, FileText,
  Star, ArrowRight, CheckCircle2, Sparkles, Globe, Users, Award
} from 'lucide-react';

const services = [
  {
    icon: <Plane className="h-7 w-7" />,
    color: 'from-sky-500 to-cyan-400',
    glow: 'rgba(56,189,248,0.25)',
    title: 'Tour Trọn Gói',
    desc: 'Hành trình được thiết kế hoàn toàn — vé máy bay, khách sạn, xe đưa đón, hướng dẫn viên và bảo hiểm du lịch trong một gói duy nhất.',
    features: ['Vé máy bay khứ hồi', 'Khách sạn 3–5 sao', 'Hướng dẫn viên song ngữ', 'Bảo hiểm toàn chuyến'],
  },
  {
    icon: <QrCode className="h-7 w-7" />,
    color: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.25)',
    title: 'Thanh Toán VietQR',
    desc: 'Đặt tour và thanh toán ngay lập tức qua mã QR chuẩn VietQR — hỗ trợ toàn bộ ngân hàng Việt Nam, tự động xác nhận đơn trong vòng 60 giây.',
    features: ['Hỗ trợ 40+ ngân hàng', 'Xác nhận tức thì', 'Mã QR động theo đơn', 'Lịch sử giao dịch rõ ràng'],
  },
  {
    icon: <Bot className="h-7 w-7" />,
    color: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.25)',
    title: 'Tư Vấn AI Gemini',
    desc: 'Trợ lý Gemini AI hoạt động 24/7 — phân tích sở thích, ngân sách, thời gian và đề xuất lịch trình cá nhân hoá chính xác cho từng khách hàng.',
    features: ['Đề xuất theo sở thích', 'So sánh giá real-time', 'Lịch trình tối ưu chi phí', 'Phản hồi ngay lập tức'],
  },
  {
    icon: <FileText className="h-7 w-7" />,
    color: 'from-rose-500 to-pink-400',
    glow: 'rgba(244,63,94,0.25)',
    title: 'Dịch Vụ Visa',
    desc: 'Hỗ trợ toàn bộ thủ tục xin visa quốc tế — tư vấn hồ sơ, điền đơn, theo dõi tiến trình và cam kết tỷ lệ đậu visa cao.',
    features: ['Visa 50+ quốc gia', 'Tư vấn hồ sơ chuyên sâu', 'Theo dõi trạng thái online', 'Cam kết hoàn tiền nếu từ chối'],
  },

  {
    icon: <ShieldCheck className="h-7 w-7" />,
    color: 'from-teal-500 to-cyan-500',
    glow: 'rgba(20,184,166,0.25)',
    title: 'Bảo Hiểm Du Lịch',
    desc: 'Bảo hiểm toàn diện cho mọi chuyến đi — tai nạn, bệnh tật, mất hành lý, hủy chuyến và hỗ trợ khẩn cấp 24/7 khi ở nước ngoài.',
    features: ['Bảo hiểm tai nạn & y tế', 'Bồi thường hành lý', 'Hỗ trợ khẩn cấp 24/7', 'Hủy chuyến được bồi hoàn'],
  },
];

const stats = [
  { icon: <Users className="h-5 w-5" />, value: '12,000+', label: 'Khách hàng tin dùng', color: 'text-sky-400' },
  { icon: <Globe className="h-5 w-5" />, value: '50+', label: 'Quốc gia & vùng lãnh thổ', color: 'text-emerald-400' },
  { icon: <Award className="h-5 w-5" />, value: '98%', label: 'Khách hàng hài lòng', color: 'text-amber-400' },
  { icon: <Star className="h-5 w-5" />, value: '4.9/5', label: 'Đánh giá trung bình', color: 'text-rose-400' },
];

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204] text-white">

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Dịch vụ du lịch Smart Travel
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-5">
            Dịch Vụ
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-cyan-200">
              Trọn Vẹn & Hiện Đại
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Từ tour trọn gói đến lịch trình cá nhân hoá, thanh toán VietQR tức thì đến tư vấn AI — Smart Travel mang đến trải nghiệm du lịch hoàn hảo từ A đến Z.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-white/8 bg-white/[0.02] py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              <div className={`${s.color} mb-1`}>{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <div
              key={i}
              className="group relative rounded-3xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.3)` }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(400px circle at 50% 0%, ${svc.glow}, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.color} text-white mb-5 shadow-lg`}
                style={{ boxShadow: `0 8px 24px ${svc.glow}` }}
              >
                {svc.icon}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">{svc.desc}</p>

              {/* Feature list */}
              <ul className="space-y-2">
                {svc.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative border-t border-white/8 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-4">Sẵn sàng khám phá?</h2>
          <p className="text-slate-400 text-sm mb-8">Hàng ngàn tour trong nước và quốc tế đang chờ bạn. Đặt ngay hôm nay!</p>
          <button
            onClick={() => navigate('/tours')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            style={{
              background: 'linear-gradient(to top, #9ad9ec 1px, #79e0f1 2px, #14a8c6 5px, #038aa8 7px, #006180 9px, #04465a 13px, #0a2a37 18px, #0a111d 32px)',
              boxShadow: '0 0 12px rgba(60,190,235,.25), 0 4px 16px -2px rgba(90,220,255,.4)',
            }}
          >
            Xem tất cả tour <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
