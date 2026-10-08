import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Compass, 
  ExternalLink, 
  Minimize2,
  Facebook,
  Instagram,
  Phone,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiService, ChatMessage } from '../../services/aiService';
import { ZaloIcon } from '../common/ZaloIcon';

const QUICK_PROMPTS = [
  { label: '🏮 Tour Trung Quốc hot', prompt: 'Gợi ý cho tôi các tour du lịch Trung Quốc nổi bật nhất kèm giá vé' },
  { label: '🌸 Thủ tục Visa Nhật Bản', prompt: 'Tôi cần chuẩn bị những giấy tờ gì để xin Visa du lịch Nhật Bản?' },
  { label: '💳 Cách thanh toán VietQR', prompt: 'Hướng dẫn tôi cách thanh toán vé tour qua quét mã VietQR' },
  { label: '🏖️ Tour 4 ngày 3 đêm', prompt: 'Gợi ý lịch trình tour du lịch 4 ngày 3 đêm phù hợp cho gia đình' },
];

export const AiChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('smarttravel_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: 'Xin chào quý khách! Tôi là **SmartTravel AI Assistant** 🤖\n\nTôi có thể giúp bạn tìm kiếm tour du lịch phù hợp với ngân sách, tư vấn thủ tục xin Visa quốc tế hoặc giải đáp mọi thắc mắc về thanh toán VietQR & Thẻ Visa.\n\nBạn đang có kế hoạch du lịch ở đâu?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lưu lịch sử chat vào localStorage
  useEffect(() => {
    localStorage.setItem('smarttravel_ai_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lắng nghe sự kiện mở widget từ các nút bên ngoài (ví dụ Hero Banner)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_ai_chat', handleOpen);

    // Bắt trigger trên nút HTML có thuộc tính data-ai-chat-trigger
    const triggers = document.querySelectorAll('[data-ai-chat-trigger]');
    triggers.forEach((btn) => btn.addEventListener('click', handleOpen));

    return () => {
      window.removeEventListener('open_ai_chat', handleOpen);
      triggers.forEach((btn) => btn.removeEventListener('click', handleOpen));
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Chuẩn bị lịch sử trò chuyện để gửi cho AI
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await aiService.chat(query, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedTours: res.suggestedTours,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'Xin lỗi bạn, kết nối tới máy chủ AI đang gặp gián đoạn. Bạn vui lòng thử lại sau giây lát nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialMsg: ChatMessage = {
      id: 'welcome',
      role: 'model',
      text: 'Đã làm mới cuộc trò chuyện! Bạn muốn tìm hiểu tour nào hoặc cần hỗ trợ thủ tục Visa nước nào hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    localStorage.removeItem('smarttravel_ai_chat_history');
  };

  // Helper render text có markdown đơn giản
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold text **...**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-slate-700">
            {formattedLine}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-700">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* ─── FLOATING CONTACT & AI ACTION HUB (FIXED BOTTOM-6 RIGHT-6) ─── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-center">
        {/* 1. ROBOT ICON BUTTON (1 icon robot, không text, nằm trên Zalo) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative h-11 w-11 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 focus:outline-none cursor-pointer ${
            isOpen 
              ? 'bg-emerald-700 text-white shadow-emerald-950/50' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-emerald-900/30'
          }`}
          title="Trợ lý ảo AI - Tư Vấn Tour 24/7"
        >
          <Bot className="h-6 w-6 transition-transform group-hover:rotate-12" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          )}
        </button>

        {/* 2. ZALO ICON */}
        <a
          href="https://zalo.me/0941899554"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl overflow-hidden shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-white border border-white/30"
          title="Tư vấn qua Zalo (0941 899 554)"
        >
          <ZaloIcon className="h-11 w-11" />
        </a>

        {/* 3. FACEBOOK */}
        <a
          href="https://www.facebook.com/loiii.nguyen.397715"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Trang Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>

        {/* 4. INSTAGRAM */}
        <a
          href="https://www.instagram.com/loiiinguyen/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Instagram"
        >
          <Instagram className="h-5 w-5" />
        </a>

        {/* 5. HOTLINE PHONE */}
        <a
          href="tel:0941899554"
          className="h-11 w-11 rounded-2xl bg-accent-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Gọi Hotline: 0941 899 554"
        >
          <Phone className="h-5 w-5 fill-white" />
        </a>

        {/* 6. GOOGLE MAPS */}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Địa chỉ công ty"
        >
          <MapPin className="h-5 w-5" />
        </a>
      </div>

      {/* ─── CHAT WINDOW MODAL ─── */}
      {isOpen && (
        <div className="fixed bottom-6 right-20 sm:right-24 z-50 flex h-[560px] max-h-[85vh] w-[calc(100vw-32px)] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">SmartTravel AI</h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="h-2.5 w-2.5 text-amber-300" /> Trực Tuyến
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Trợ lý du lịch & thủ tục Visa trực tuyến</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearHistory}
                className="rounded-xl p-2 hover:bg-white/10 hover:text-white transition"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 hover:bg-white/10 hover:text-white transition"
                title="Thu nhỏ cửa sổ"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 hover:bg-white/10 hover:text-white transition"
                title="Đóng chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-1.5">{renderFormattedText(msg.text)}</div>
                    )}
                  </div>

                  <span className="mt-1 text-[10px] text-slate-400 px-1">
                    {msg.timestamp}
                  </span>

                  {/* SUGGESTED TOURS CARDS */}
                  {!isUser && msg.suggestedTours && msg.suggestedTours.length > 0 && (
                    <div className="mt-3 w-full space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-emerald-600" /> Tour gợi ý phù hợp:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggestedTours.map((t) => (
                          <div
                            key={t.id}
                            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              navigate(`/tours/${t.id}`);
                              setIsOpen(false);
                            }}
                          >
                            <img
                              src={t.thumbnailUrl || '/images/tours/ha-noi-ha-long-ninh-binh/01.jpg'}
                              alt={t.title}
                              className="h-14 w-16 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                                {t.title}
                              </h4>
                              <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                                {(t.price || 0).toLocaleString('vi-VN')} đ
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{t.durationDays ? `${t.durationDays}N` : ''}</span>
                                <span>•</span>
                                <span className="truncate">{t.departureLocation || 'TP.HCM'}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tours/${t.id}`);
                                setIsOpen(false);
                              }}
                              className="flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2.5 py-1.5 text-[10px] font-black text-emerald-700 transition flex-shrink-0"
                            >
                              Xem ngay <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200/80 px-4 py-3 w-fit text-slate-500">
                <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
                <span className="text-xs font-semibold">AI đang suy nghĩ và tra cứu tour...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPTS CHIPS */}
          <div className="border-t border-slate-100 bg-white px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="whitespace-nowrap rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/60 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition flex-shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-slate-200/80 bg-white p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về tour, giá vé, visa..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-500 transition disabled:opacity-40 disabled:hover:bg-emerald-600"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
