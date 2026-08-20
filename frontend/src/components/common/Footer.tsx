import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Facebook, Instagram, CreditCard } from 'lucide-react';
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
    <footer className="bg-[#0275b8] text-white pt-12 pb-6 relative overflow-hidden">
      
      {/* Background Silhouette Watermark Pattern matching reference screenshot */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-repeat-x bg-bottom"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200' viewBox='0 0 800 200'%3E%3Cpath fill='%23ffffff' d='M50 200 L50 120 L70 90 L90 120 L90 200 M150 200 L150 50 L170 30 L190 50 L190 200 M280 200 L280 140 L310 100 L340 140 L340 200 M450 200 L450 60 L480 30 L510 60 L510 200 M620 200 L620 110 L640 80 L660 110 L660 200' /%3E%3C/svg%3E")`,
          backgroundSize: '800px 200px'
        }}
      />

      <div className="relative z-10">

        {/* 1. NEWSLETTER BANNER (Khớp Screenshot 4) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 pb-10 border-b border-sky-400/30">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tiết kiệm thời gian và tiền bạc!
          </h3>
          <p className="text-xs text-sky-100 font-medium max-w-xl mx-auto">
            Hãy đăng ký và chúng tôi sẽ gửi những ưu đãi tốt nhất cho bạn
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex items-center gap-2 pt-3">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Nhập địa chỉ email"
              className="flex-1 rounded-md bg-white px-4 py-2.5 text-xs text-slate-900 focus:outline-none shadow-md placeholder-slate-400"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-[#004a80] hover:bg-[#003860] text-white font-extrabold px-6 py-2.5 text-xs transition shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5 text-sky-200" /> Nhận ưu đãi
            </button>
          </form>
        </div>

        {/* 2. FOOTER MAIN COLUMNS (Khớp Screenshot 4) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-sky-100 leading-relaxed">
            
            {/* Col 1: THÔNG TIN LIÊN HỆ */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">THÔNG TIN LIÊN HỆ</h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sky-200 block text-[11px]">Tên công ty</span>
                  <strong className="text-white font-bold">Công Ty TNHH Dịch Vụ Du Lịch Và Sự Kiện Smart Travel</strong>
                </div>

                <div>
                  <span className="text-sky-200 block text-[11px]">Địa chỉ</span>
                  <span className="text-white font-medium">Thủ Đức, Hồ Chí Minh</span>
                </div>

                <div>
                  <span className="text-sky-200 block text-[11px]">Email</span>
                  <a href="mailto:tiemnet.coaching.y3@gmail.com" className="text-white hover:underline font-medium">tiemnet.coaching.y3@gmail.com</a>
                </div>

                <div>
                  <span className="text-sky-200 block text-[11px]">MST</span>
                  <span className="text-white font-mono font-bold">0941899554</span>
                </div>
              </div>
            </div>

            {/* Col 2: CHĂM SÓC KHÁCH HÀNG */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">CHĂM SÓC KHÁCH HÀNG</h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sky-200 block text-[11px]">Thời gian hỗ trợ</span>
                  <span className="text-white font-medium">Mon - Sat: 08:00 AM - 17:30 PM</span>
                </div>

                <div>
                  <span className="text-sky-200 block text-[11px]">Hotline</span>
                  <span className="text-white font-bold text-xs">Hỗ trợ: 0941899554</span>
                </div>
              </div>
            </div>

            {/* Col 3: THÔNG TIN */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">THÔNG TIN</h4>
              
              <ul className="space-y-2 font-medium">
                <li><Link to="/about" className="hover:underline transition">Giới thiệu dịch vụ</Link></li>
                <li><Link to="/about" className="hover:underline transition">Quy chế hoạt động</Link></li>
                <li><Link to="/about" className="hover:underline transition">Chính sách bảo mật</Link></li>
                <li><Link to="/about" className="hover:underline transition">Chính sách riêng tư</Link></li>
                <li><Link to="/about" className="hover:underline transition">Điều kiện & điều khoản</Link></li>
              </ul>
            </div>

            {/* Col 4: KẾT NỐI & PHƯƠNG THỨC THANH TOÁN */}
            <div className="space-y-6">
              
              {/* KẾT NỐI */}
              <div className="space-y-3">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">KẾT NỐI</h4>
                <div className="flex items-center gap-3">
                  <a href="https://www.facebook.com/loiii.nguyen.397715" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-sm" title="Facebook Cao Thái Mào">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://zalo.me/0941899554" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full overflow-hidden hover:scale-110 transition shadow-md flex items-center justify-center" title="Zalo 0941899554">
                  <ZaloIcon className="h-8 w-8" />
                </a>
                <a href="https://www.instagram.com/loiiinguyen/" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-sm" title="Instagram loiiinguyen">
                  <Instagram className="h-4 w-4" />
                </a>
                </div>
              </div>

              {/* PHƯƠNG THỨC THANH TOÁN */}
              <div className="space-y-3">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">PHƯƠNG THỨC THANH TOÁN</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white text-[#0275b8] px-2.5 py-1 rounded font-black text-[11px] shadow-sm">
                    VNPAY
                  </span>
                  <span className="bg-pink-600 text-white px-2.5 py-1 rounded font-black text-[11px] shadow-sm">
                    MoMo
                  </span>
                  <span className="bg-slate-900 text-white px-2.5 py-1 rounded font-black text-[11px] shadow-sm flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-amber-400" /> VISA
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3. COPYRIGHT BAR (Khớp Screenshot 4) */}
        <div className="border-t border-sky-400/30 pt-6 text-center text-[11px] text-sky-100 font-medium">
          © Bản quyền thuộc về Smart Travel
        </div>

      </div>

    </footer>
  );
};
