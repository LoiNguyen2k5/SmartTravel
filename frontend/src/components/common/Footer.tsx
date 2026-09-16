import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Facebook, Instagram, CreditCard, Mail, Phone, MapPin, Compass } from 'lucide-react';
import { ZaloIcon } from './ZaloIcon';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Cảm ơn bạn đã đăng ký nhận tin ưu đãi từ Smart Travel với email: ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-primary-950 text-slate-300 pt-16 pb-8 relative overflow-hidden border-t border-primary-900/60">
      
      {/* Subtle Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-800/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">

        {/* 1. NEWSLETTER BANNER */}
        <div className="glass-dark rounded-3xl p-8 md:p-10 border border-white/10 shadow-float text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs font-bold uppercase tracking-wider">
            <span>✨ Ưu đãi đặc quyền</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tiết kiệm thời gian và chi phí cho kỳ nghỉ hoàn hảo
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Đăng ký nhận bản tin sớm nhất để không bỏ lỡ các voucher giảm giá và lịch khởi hành tour độc quyền từ Smart Travel.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn..."
              className="w-full sm:flex-1 rounded-xl bg-white/95 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-400 shadow-sm placeholder:text-slate-400 font-medium"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white font-bold px-6 py-3 text-xs transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" /> 
              <span>Nhận ưu đãi</span>
            </button>
          </form>
        </div>

        {/* 2. FOOTER MAIN CONTENT COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs leading-relaxed pt-4">
          
          {/* Col 1: Về Smart Travel & Thông tin liên hệ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary-800 text-accent-400 p-2 rounded-xl border border-primary-700">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-black text-white tracking-tight">
                SMART TRAVEL
              </span>
            </div>

            <p className="text-slate-300/90 text-xs">
              Công Ty TNHH Dịch Vụ Du Lịch Và Sự Kiện Smart Travel — Đơn vị tiên phong cung cấp giải pháp lập lịch trình và đặt tour du lịch thông minh tại Việt Nam.
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Thành phố Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-400 flex-shrink-0" />
                <a href="tel:0941899554" className="hover:text-white font-semibold">0941 899 554</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:tiemnet.coaching.y3@gmail.com" className="hover:text-white truncate">
                  tiemnet.coaching.y3@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Dịch vụ & Chăm sóc khách hàng */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Chăm sóc khách hàng
            </h4>
            
            <div className="space-y-2.5 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Giờ làm việc</span>
                <span className="text-white font-semibold">08:00 — 17:30 (Thứ 2 đến Thứ 7)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Đường dây nóng hỗ trợ khẩn cấp</span>
                <span className="text-accent-400 font-extrabold text-sm">0941 899 554</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã số thuế doanh nghiệp</span>
                <span className="font-mono text-slate-200">0941899554</span>
              </div>
            </div>
          </div>

          {/* Col 3: Điều khoản & Chính sách */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Chính sách & Quy định
            </h4>
            
            <ul className="space-y-2.5 font-medium text-slate-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Giới thiệu về Smart Travel</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Quy chế hoạt động sàn</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Chính sách bảo mật dữ liệu</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Chính sách hoàn tiền & hủy tour</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Điều kiện & điều khoản giao dịch</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kết nối & Thanh toán an toàn */}
          <div className="space-y-6">
            
            <div className="space-y-3">
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                Kết nối với chúng tôi
              </h4>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.facebook.com/loiii.nguyen.397715" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 shadow-sm border border-white/10" 
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="https://zalo.me/0941899554" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-9 w-9 rounded-xl overflow-hidden hover:scale-105 transition shadow-sm flex items-center justify-center" 
                  title="Zalo 0941899554"
                >
                  <ZaloIcon className="h-9 w-9" />
                </a>
                <a 
                  href="https://www.instagram.com/loiiinguyen/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 shadow-sm border border-white/10" 
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                Thanh toán an toàn
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white text-primary-950 px-3 py-1.5 rounded-lg font-black text-[11px] shadow-sm tracking-wide">
                  VNPAY
                </span>
                <span className="bg-[#A50064] text-white px-3 py-1.5 rounded-lg font-black text-[11px] shadow-sm tracking-wide">
                  MoMo
                </span>
                <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black text-[11px] shadow-sm flex items-center gap-1.5 border border-slate-700">
                  <CreditCard className="h-3.5 w-3.5 text-accent-400" /> VISA / Master
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. COPYRIGHT BAR */}
        <div className="border-t border-slate-800/80 pt-8 text-center text-xs text-slate-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Smart Travel & Itinerary Planner. Tất cả các quyền được bảo lưu.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Hệ thống sẵn sàng 24/7
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
};
