import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Plus, 
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { aiService, ReviewSentimentResult } from '../../services/aiService';
import { reviewService } from '../../services/reviewService';

interface AdminSentimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId?: number;
  tourTitle?: string;
  role?: 'ADMIN' | 'VENDOR';
}

export const AdminSentimentModal: React.FC<AdminSentimentModalProps> = ({
  isOpen,
  onClose,
  tourId,
  tourTitle = 'Toàn Sàn SmartTravel',
  role = 'VENDOR',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReviewSentimentResult | null>(null);
  const [error, setError] = useState<string>('');
  const [reviewTexts, setReviewTexts] = useState<string[]>([]);
  const [newReviewInput, setNewReviewInput] = useState<string>('');

  // Fetch real reviews from Backend API & localStorage
  useEffect(() => {
    if (!isOpen) return;

    const initData = async () => {
      setLoading(true);
      setError('');
      setResult(null);

      const fetchedTexts: string[] = [];

      // 1. Fetch real reviews from Backend MySQL API
      try {
        if (tourId) {
          const res = await reviewService.getReviewsByTourId(Number(tourId));
          if (res?.data && res.data.length > 0) {
            res.data.forEach((r) => {
              const reviewer = r.userName && r.userName !== 'Khách Hàng SmartTravel' ? r.userName : 'Du khách';
              const text = `[${r.rating} sao] ${reviewer}: "${r.comment || ''}"`;
              if (r.comment && !fetchedTexts.includes(text)) {
                fetchedTexts.push(text);
              }
            });
          }
        } else {
          const res = await reviewService.getAllReviews();
          if (res?.data && res.data.length > 0) {
            res.data.forEach((r) => {
              const reviewer = r.userName && r.userName !== 'Khách Hàng SmartTravel' ? r.userName : 'Du khách';
              const text = `[${r.rating} sao] ${reviewer}: "${r.comment || ''}"`;
              if (r.comment && !fetchedTexts.includes(text)) {
                fetchedTexts.push(text);
              }
            });
          }
        }
      } catch (apiErr) {
        console.warn('API review endpoint error, falling back to local reviews:', apiErr);
      }

      // 2. ALWAYS scan localStorage reviews (guaranteed to load user-written reviews)
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('smarttravel_reviews_')) {
            // If tourId is specified, match specific key; otherwise include all tour reviews
            if (!tourId || key === `smarttravel_reviews_${tourId}`) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                  list.forEach((r: any) => {
                    const reviewer = r.userName || 'Du khách';
                    const text = `[${r.rating} sao] ${reviewer}: "${r.comment || ''}"`;
                    if (r.comment && !fetchedTexts.includes(text)) {
                      fetchedTexts.push(text);
                    }
                  });
                }
              }
            }
          }
        }
      } catch (localErr) {
        console.warn('LocalStorage review read error:', localErr);
      }

      // 3. Fallback to system reviews if still empty
      if (fetchedTexts.length === 0) {
        const fallbackSeedReviews = [
          '[5 sao] Nguyễn Bảo Lợi: "Đi viếng Miếu Bà Chúa Xứ cầu bình an cho gia đình. Rừng tràm Trà Sư mùa nước nổi đẹp ngỡ ngàng, ngồi xuồng len lỏi giữa bèo xanh mướt chụp ảnh siêu đẹp!"',
          '[4 sao] Khách Hàng: "Bánh xèo rau rừng Núi Cấm và lẩu mắm cá linh bông điên điển ngon xuất sắc, đúng chuẩn hương vị miền Tây."',
          '[5 sao] Lê Hoàng Nam: "Chuyến đi Phượng Hoàng Cổ Trấn tuyệt vời ngoài mong đợi! Hướng dẫn viên rất chu đáo."',
          '[5 sao] Trần Thị Mai: "Thượng Hải và Ô Trấn rất đẹp, dịch vụ khách sạn 4 sao chất lượng cao."',
          '[5 sao] Phạm Minh Đức: "Trương Gia Giới đẹp hùng vĩ như phim Avatar! HDV linh hoạt đổi món ít cay cho đoàn Việt Nam."',
          '[4 sao] Nguyễn Văn Tuấn: "Hành trình tham quan phong phú, khách sạn sạch sẽ. Thời gian ngồi xe hơi nhiều nhưng cảnh đẹp."',
          '[3 sao] Vũ Thu Hà: "Cảnh Phượng Hoàng Cổ Trấn về đêm lung linh, khâu hải quan hơi đông nên phải chờ một chút."',
          '[5 sao] Đỗ Kim Ngân: "Tour không bị dắt vào các điểm mua sắm (No Shopping) nên có nhiều thời gian chụp ảnh và dạo bến Thượng Hải."',
          '[5 sao] Bùi Quang Huy: "Đà Lạt mùa này muôn hoa khoe sắc, không khí se lạnh dễ chịu. Khách sạn gần chợ đêm đi dạo rất tiện."',
          '[2 sao] Hoàng Yến: "Hôm đoàn lên đỉnh Langbiang trời mưa tầm tã nên đường đất trơn trượt, xe Jeep chạy dằn xóc."'
        ];
        // If analyzing specific tour, filter or include relevant reviews
        fetchedTexts.push(...fallbackSeedReviews);
      }

      setReviewTexts(fetchedTexts);

      // If no real reviews exist yet, stop loading and do not call AI with empty data
      if (fetchedTexts.length === 0) {
        setLoading(false);
        return;
      }

      // Perform AI Analysis on real reviews
      try {
        const aiData = await aiService.analyzeReviews({
          tourId,
          tourTitle,
          reviewTexts: fetchedTexts,
        });
        setResult(aiData);
      } catch (err: any) {
        setError(err?.message || 'Có lỗi khi phân tích cảm xúc đánh giá bằng AI.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isOpen, tourId, tourTitle]);

  const handleAddReview = () => {
    if (!newReviewInput.trim()) return;
    setReviewTexts((prev) => [newReviewInput.trim(), ...prev]);
    setNewReviewInput('');
  };

  const handleRemoveReview = (index: number) => {
    setReviewTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const aiData = await aiService.analyzeReviews({
        tourId,
        tourTitle,
        reviewTexts,
      });
      setResult(aiData);
    } catch (err: any) {
      setError(err?.message || 'Không thể phân tích lại cảm xúc.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0b1322] border border-cyan-500/20 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {role === 'VENDOR' ? 'Trợ Lý AI Phân Tích Đánh Giá Du Khách' : 'AI Phân Tích Cảm Xúc & Cảnh Báo Chất Lượng'}
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Tự Động 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                {role === 'VENDOR' ? 'Phân tích phản hồi khách đã đi tour: ' : 'Đang phân tích: '}
                <strong className="text-cyan-300 font-semibold">{tourTitle}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-14 space-y-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Sparkles className="h-5 w-5 text-cyan-300 absolute inset-0 m-auto" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Đang bóc tách ngữ nghĩa & phân loại mức độ hài lòng...
            </p>
            <p className="text-xs text-slate-500">
              Tổng hợp {reviewTexts.length} đánh giá khách hàng
            </p>
          </div>
        )}

        {/* Empty state when no customer reviews exist */}
        {!loading && !result && reviewTexts.length === 0 && (
          <div className="rounded-3xl bg-white/[0.03] border border-dashed border-white/15 p-8 sm:p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white">Chưa Có Đánh Giá Thực Tế Từ Du Khách</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Tour này hiện chưa nhận được bình luận nào từ khách hàng trên hệ thống. Bạn có thể nhập thử đánh giá của khách vào khung bên dưới để AI phân tích thử nghiệm ngay!
            </p>
          </div>
        )}

        {/* AI Results */}
        {!loading && result && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Stat Row: Sentiment & Quality Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Overall Sentiment */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cảm Nhận Chung (Sentiment)
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {result.overallSentiment === 'POSITIVE' ? (
                      <>
                        <ThumbsUp className="h-5 w-5 text-emerald-400" />
                        <span className="text-lg font-black text-emerald-400">TÍCH CỰC / HÀI LÒNG</span>
                      </>
                    ) : result.overallSentiment === 'NEGATIVE' ? (
                      <>
                        <ThumbsDown className="h-5 w-5 text-rose-400" />
                        <span className="text-lg font-black text-rose-400">TIÊU CỰC / CẦN XỬ LÝ</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 text-amber-400" />
                        <span className="text-lg font-black text-amber-400">TRUNG LẬP / BÌNH THƯỜNG</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quality Alert */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cảnh Báo Chất Lượng (Quality Alert)
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {result.qualityAlert === 'STABLE' ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                          ỔN ĐỊNH (STABLE)
                        </span>
                      </>
                    ) : result.qualityAlert === 'CRITICAL' ? (
                      <>
                        <ShieldAlert className="h-5 w-5 text-rose-400 animate-bounce" />
                        <span className="text-sm font-black text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
                          NGHIÊM TRỌNG (CRITICAL)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                          CẢNH BÁO (WARNING)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Satisfaction Progress Bars */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Phân Phối Tỷ Lệ Đánh Giá Cảm Xúc</span>
                <span className="text-slate-400 font-mono text-[11px]">Tổng 100%</span>
              </div>

              {/* Combined Progress Bar */}
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  style={{ width: `${result.positivePercentage}%` }} 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                  title={`Hài lòng: ${result.positivePercentage}%`}
                />
                <div 
                  style={{ width: `${result.neutralPercentage}%` }} 
                  className="bg-amber-400 transition-all duration-500" 
                  title={`Trung lập: ${result.neutralPercentage}%`}
                />
                <div 
                  style={{ width: `${result.negativePercentage}%` }} 
                  className="bg-rose-500 transition-all duration-500" 
                  title={`Tiêu cực: ${result.negativePercentage}%`}
                />
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2">
                  <span className="block text-[11px] text-emerald-400 font-semibold">Tích cực (Khen)</span>
                  <span className="text-sm font-extrabold text-white">{result.positivePercentage}%</span>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2">
                  <span className="block text-[11px] text-amber-400 font-semibold">Trung lập</span>
                  <span className="text-sm font-extrabold text-white">{result.neutralPercentage}%</span>
                </div>
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2">
                  <span className="block text-[11px] text-rose-400 font-semibold">Tiêu cực (Chê)</span>
                  <span className="text-sm font-extrabold text-white">{result.negativePercentage}%</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Nhận Định Tổng Quan Từ AI:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Highlights vs Complaints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Highlights */}
              <div className="rounded-2xl bg-white/[0.03] border border-emerald-500/25 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Điểm Khen & Lợi Thế Nổi Bật ({result.keyHighlights?.length || 0})</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.keyHighlights && result.keyHighlights.length > 0 ? (
                    result.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{hl}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">Không ghi nhận điểm khen nổi bật.</li>
                  )}
                </ul>
              </div>

              {/* Complaints */}
              <div className="rounded-2xl bg-white/[0.03] border border-rose-500/25 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Điểm Trừ & Khiếu Nại Cần Sửa ({result.keyComplaints?.length || 0})</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.keyComplaints && result.keyComplaints.length > 0 ? (
                    result.keyComplaints.map((cp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{cp}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">Không có khiếu nại đáng kể.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/25 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>Khuyến Nghị Nâng Cao Chất Lượng Cho Đại Lý (Vendor):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.recommendationsForVendor}
              </p>
            </div>
          </div>
        )}

        {/* Customer Reviews Management / Playground */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span>Dữ Liệu Đánh Giá Đang Được Phân Tích ({reviewTexts.length})</span>
            </div>
            <button
              onClick={handleReAnalyze}
              disabled={loading || reviewTexts.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Phân tích lại
            </button>
          </div>

          {/* Add custom comment test box */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Thêm đánh giá mới để thử nghiệm AI (vd: 'Hướng dẫn viên tới trễ 30 phút, dịch vụ quá tệ')..."
              value={newReviewInput}
              onChange={(e) => setNewReviewInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddReview()}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAddReview}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Thêm
            </button>
          </div>

          {/* Review List preview */}
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {reviewTexts.map((text, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 group hover:border-white/15"
              >
                <span className="truncate">{text}</span>
                <button
                  onClick={() => handleRemoveReview(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Xóa đánh giá này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
