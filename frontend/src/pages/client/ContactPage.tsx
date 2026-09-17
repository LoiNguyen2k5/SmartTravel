import React, { useState } from 'react';
import {
  Phone, Mail, MapPin, Clock, Send, MessageSquare,
  CheckCircle2, Sparkles, Facebook, Instagram, HeadphonesIcon, Loader2
} from 'lucide-react';
import { contactService } from '../../services/contactService';
import { notificationService } from '../../services/notificationService';
import { ZaloIcon } from '../../components/common/ZaloIcon';

const contactInfo = [
  {
    icon: <Phone className="h-5 w-5" />,
    label: 'Hotline',
    value: '0941 899 554',
    sub: 'Thứ 2 – Thứ 7 • 8:00 – 17:30',
    color: 'from-amber-500 to-orange-400',
    glow: 'rgba(245,158,11,0.25)',
    href: 'tel:0941899554',
  },
  {
    icon: <Mail className="h-5 w-5" />,
    label: 'Email hỗ trợ',
    value: 'tiemnet.coaching.y3@gmail.com',
    sub: 'Phản hồi trong vòng 2 giờ',
    color: 'from-sky-500 to-cyan-400',
    glow: 'rgba(56,189,248,0.25)',
    href: 'mailto:tiemnet.coaching.y3@gmail.com',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: 'Địa chỉ',
    value: 'Thủ Đức, Hồ Chí Minh',
    sub: 'Văn phòng giao dịch chính',
    color: 'from-rose-500 to-pink-400',
    glow: 'rgba(244,63,94,0.25)',
    href: 'https://maps.google.com/?q=Thu+Duc,+Ho+Chi+Minh+City',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: 'Giờ làm việc',
    value: '8:00 — 17:30',
    sub: 'Thứ 2 đến Thứ 7 (nghỉ CN)',
    color: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.25)',
    href: null,
  },
];

const faqs = [
  {
    q: 'Tôi có thể hủy tour sau khi đặt không?',
    a: 'Bạn có thể hủy tour trước 7 ngày khởi hành để nhận hoàn tiền 100%. Hủy trong 3–7 ngày hoàn 50%. Hủy dưới 3 ngày không hoàn tiền.',
  },
  {
    q: 'Thanh toán qua VietQR an toàn không?',
    a: 'Hoàn toàn an toàn. Hệ thống kết nối trực tiếp với ngân hàng, mỗi giao dịch đều có mã xác nhận độc lập và Smart Travel không lưu thông tin thẻ.',
  },
  {
    q: 'Tour có bảo hiểm du lịch không?',
    a: 'Tất cả các tour đều được tích hợp bảo hiểm du lịch cơ bản. Bạn có thể nâng cấp gói bảo hiểm toàn diện khi đặt tour.',
  },
  {
    q: 'Làm thế nào để liên hệ hướng dẫn viên?',
    a: 'Thông tin hướng dẫn viên sẽ được gửi qua email 24 giờ trước ngày khởi hành, bao gồm số điện thoại và điểm hẹn.',
  },
];

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await contactService.sendContactMessage(form);
      setSent(true);

      // 1. Thêm thông báo hệ thống xác nhận đã tiếp nhận
      notificationService.addNotification({
        title: `✈️ Đã tiếp nhận yêu cầu: ${form.subject || 'Tư vấn du lịch'}`,
        message: `Yêu cầu của bạn ("${form.message.slice(0, 50)}...") đã được chuyển tới CSKH. Vui lòng kiểm tra email xác nhận!`,
        type: 'SYSTEM',
        sender: 'Hệ thống Smart Travel'
      }, form.email);

      // 2. Sau 4 giây, tự động kích hoạt thông báo phản hồi từ CSKH trên chuông thông báo
      setTimeout(() => {
        notificationService.addNotification({
          title: '🎧 CSKH Smart Travel đã phản hồi câu hỏi của bạn',
          message: `Chào ${form.name}, chúng tôi đã gửi giải đáp chi tiết cho câu hỏi "${form.message.slice(0, 45)}..." về email ${form.email}.`,
          replyContent: `Xin chào Quý khách ${form.name}!\n\nĐội ngũ Chăm Sóc Khách Hàng Smart Travel đã tiếp nhận và giải quyết yêu cầu của bạn về chủ đề: "${form.subject || 'Dịch vụ du lịch'}".\n\nNội dung tư vấn chi tiết cùng các chính sách hỗ trợ tốt nhất đã được chuyên viên gửi trực tiếp vào hòm thư email: ${form.email}.\n\nNếu bạn cần hỗ trợ khẩn cấp hoặc tư vấn trực tiếp 1-1, xin vui lòng gọi ngay Hotline 0941 899 554 (8:00 - 17:30).\n\nChúc bạn có những trải nghiệm khám phá đáng nhớ cùng Smart Travel!`,
          sender: 'Bộ phận CSKH Smart Travel',
          type: 'CSKH_REPLY'
        }, form.email);
      }, 4000);

    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setErrorMsg(err?.message || 'Không thể kết nối đến máy chủ. Bạn cũng có thể liên hệ trực tiếp qua email tiemnet.coaching.y3@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white">

      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-14 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-emerald-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-6">
            <HeadphonesIcon className="h-3.5 w-3.5" />
            Luôn sẵn sàng hỗ trợ bạn
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-snug mb-4">
            Liên Hệ
            <span className="block mt-2.5 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-cyan-200">
              Smart Travel
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng hỗ trợ bạn — từ lựa chọn tour đến thủ tục visa và mọi vấn đề phát sinh trong hành trình.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map((c, i) => (
            <a
              key={i}
              href={c.href ?? undefined}
              target={c.href?.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className={`group relative rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-1 ${c.href ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(350px circle at 50% 0%, ${c.glow}, transparent 70%)` }}
              />
              <div
                className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} text-white mb-4`}
                style={{ boxShadow: `0 6px 20px ${c.glow}` }}
              >
                {c.icon}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{c.label}</div>
              <div className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">{c.value}</div>
              <div className="text-[11px] text-slate-500">{c.sub}</div>
            </a>
          ))}
        </div>

        {/* Form + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact Form */}
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(56,189,248,0.3)]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Gửi tin nhắn</h2>
                <p className="text-[11px] text-slate-500">Chúng tôi phản hồi trong vòng 2 giờ</p>
              </div>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-bold text-white">Gửi tin nhắn thành công!</h3>
                <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                  Tin nhắn của bạn đã được chuyển tiếp trực tiếp đến hộp thư hỗ trợ:{' '}
                  <strong className="text-sky-300">tiemnet.coaching.y3@gmail.com</strong>
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Đội ngũ chăm sóc khách hàng Smart Travel sẽ kiểm tra nội dung và phản hồi qua email <span className="text-white font-medium">{form.email}</span> trong thời gian sớm nhất.
                </p>
                <button 
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-cyan-300 border border-white/10 transition cursor-pointer"
                >
                  Gửi tin nhắn khác →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0901 234 567"
                      className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chủ đề</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition [&>option]:bg-slate-900">
                    <option value="">Chọn chủ đề...</option>
                    <option value="Tư vấn tour du lịch">Tư vấn tour du lịch</option>
                    <option value="Hỗ trợ đặt tour / thanh toán">Hỗ trợ đặt tour / thanh toán</option>
                    <option value="Dịch vụ Visa">Dịch vụ Visa</option>
                    <option value="Phản ánh / Khiếu nại">Phản ánh / Khiếu nại</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tin nhắn *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Cho chúng tôi biết bạn cần hỗ trợ gì..."
                    className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition resize-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: 'linear-gradient(to top, #9ad9ec 1px, #79e0f1 2px, #14a8c6 5px, #038aa8 7px, #006180 9px, #04465a 13px, #0a2a37 18px, #0a111d 32px)',
                    boxShadow: '0 0 12px rgba(60,190,235,.20), 0 4px 16px -2px rgba(90,220,255,.35)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang chuyển tin nhắn tới CSKH...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ + Social */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">Câu hỏi thường gặp</h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-white/8 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white hover:text-sky-300 transition-colors"
                    >
                      {faq.q}
                      <span className={`text-slate-500 transition-transform duration-200 ml-3 flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/8 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
              <h3 className="text-sm font-bold text-white mb-4">Kết nối với chúng tôi</h3>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { 
                    icon: <Facebook className="h-4 w-4" />, 
                    label: 'Facebook', 
                    color: 'from-blue-600 to-blue-500', 
                    href: 'https://www.facebook.com/loiii.nguyen.397715' 
                  },
                  { 
                    icon: <ZaloIcon className="h-4 w-4" />, 
                    label: 'Zalo', 
                    color: 'from-sky-500 to-cyan-400', 
                    href: 'https://zalo.me/0941899554' 
                  },
                  { 
                    icon: <Instagram className="h-4 w-4" />, 
                    label: 'Instagram', 
                    color: 'from-amber-500 via-rose-500 to-purple-600', 
                    href: 'https://www.instagram.com/loiiinguyen/' 
                  },
                ].map((s, i) => (
                  <a 
                    key={i} 
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white text-xs font-semibold hover:-translate-y-0.5 hover:brightness-110 transition-all shadow-md`}
                  >
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map embed */}
        <div className="rounded-3xl border border-white/8 overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-3 px-7 py-4 border-b border-white/8 bg-white/[0.03]">
            <MapPin className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-bold text-white">Thủ Đức, Hồ Chí Minh</span>
          </div>
          <iframe
            title="Smart Travel Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485458231267!2d106.77165917480608!3d10.850632389302663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x1327f63110996894!2zVGjhu6cgxJDhu6ljLCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
            width="100%" height="320"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};
