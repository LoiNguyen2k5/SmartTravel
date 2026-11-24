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

      // 2. Read reviews from localStorage to include in sentiment analysis
      try {
        if (tourId) {
          const localSaved = localStorage.getItem(`smarttravel_reviews_${tourId}`);
          if (localSaved) {
            const localList = JSON.parse(localSaved);
            localList.forEach((r: any) => {
              const reviewer = r.userName && r.userName !== 'Khách Hàng SmartTravel' ? r.userName : 'Du khách';
              const text = `[${r.rating} sao] ${reviewer}: "${r.comment || ''}"`;
              if (r.comment && !fetchedTexts.includes(text)) {
                fetchedTexts.push(text);
              }
            });
          }
        } else {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('smarttravel_reviews_')) {
              try {
                const localList = JSON.parse(localStorage.getItem(key) || '[]');
                localList.forEach((r: any) => {
                  const reviewer = r.userName && r.userName !== 'Khách Hàng SmartTravel' ? r.userName : 'Du khách';
                  const text = `[${r.rating} sao] ${reviewer}: "${r.comment || ''}"`;
                  if (r.comment && !fetchedTexts.includes(text)) {
                    fetchedTexts.push(text);
                  }
                });
              } catch (_) {}
            }
          }
        }
      } catch (localErr) {
        console.warn('LocalStorage review read error:', localErr);
      }

      setReviewTexts(fetchedTexts);

      // If no real reviews exist yet, stop loading and do not call AI with empty data
      if (fetchedTexts.length === 0) {
        setResult(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F5] backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0b1322] border border-cyan-500/20 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7 space-y-6 text-[#0F172A] max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6E1DA] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                  {role === 'VENDOR' ? 'Trợ Lý AI Phân Tích Đánh Giá Du Khách' : 'AI Phân Tích Cảm Xúc & Cảnh Báo Chất Lượng'}
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-[#0D9488] font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Tự Động 24/7
                </span>
              </div>
              <p className="text-xs text-[#526071] mt-0.5 truncate max-w-md">
                {role === 'VENDOR' ? 'Phân tích phản hồi khách đã đi tour: ' : 'Đang phân tích: '}
                <strong className="text-[#0D9488] font-semibold">{tourTitle}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#526071] hover:text-[#0F172A] hover:bg-[#F4F1EC] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#D95D39]" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-14 space-y-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Sparkles className="h-5 w-5 text-[#0D9488] absolute inset-0 m-auto" />
            </div>
            <p className="text-sm font-semibold text-[#475569]">
              Đang bóc tách ngữ nghĩa & phân loại mức độ hài lòng...
            </p>
            <p className="text-xs text-slate-500">
              Tổng hợp {reviewTexts.length} đánh giá khách hàng
            </p>
          </div>
        )}

        {/* Empty state when no customer reviews exist */}
        {!loading && reviewTexts.length === 0 && (
          <div className="rounded-3xl bg-[#FAF8F5] border border-dashed border-[#CBD5E1] p-8 sm:p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-[#0D9488] mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Chưa có đánh giá để phân tích</h4>
            <p className="text-xs text-[#526071] max-w-md mx-auto leading-relaxed">
              Tour này hiện chưa có đánh giá nào từ khách hàng để phân tích cảm xúc. Khi du khách hoàn tất chuyến đi và để lại nhận xét, hệ thống AI sẽ tự động phân tích mức độ hài lòng tại đây.
            </p>
          </div>
        )}

        {/* AI Results */}
        {!loading && result && reviewTexts.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Stat Row: Sentiment & Quality Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Overall Sentiment */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider block">
                    Cảm Nhận Chung (Sentiment)
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {result.overallSentiment === 'POSITIVE' ? (
                      <>
                        <ThumbsUp className="h-5 w-5 text-emerald-700" />
                        <span className="text-lg font-black text-emerald-700">TÍCH CỰC / HÀI LÒNG</span>
                      </>
                    ) : result.overallSentiment === 'NEGATIVE' ? (
                      <>
                        <ThumbsDown className="h-5 w-5 text-[#D95D39]" />
                        <span className="text-lg font-black text-[#D95D39]">TIÊU CỰC / CẦN XỬ LÝ</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 text-amber-700" />
                        <span className="text-lg font-black text-amber-700">TRUNG LẬP / BÌNH THƯỜNG</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quality Alert */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider block">
                    Cảnh Báo Chất Lượng (Quality Alert)
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {result.qualityAlert === 'STABLE' ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                        <span className="text-sm font-black text-emerald-700 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                          ỔN ĐỊNH (STABLE)
                        </span>
                      </>
                    ) : result.qualityAlert === 'CRITICAL' ? (
                      <>
                        <ShieldAlert className="h-5 w-5 text-[#D95D39] animate-bounce" />
                        <span className="text-sm font-black text-rose-700 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
                          NGHIÊM TRỌNG (CRITICAL)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-700" />
                        <span className="text-sm font-black text-amber-800 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                          CẢNH BÁO (WARNING)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Satisfaction Progress Bars */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#475569]">Phân Phối Tỷ Lệ Đánh Giá Cảm Xúc</span>
                <span className="text-[#526071] font-mono text-[11px]">Tổng 100%</span>
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
                  <span className="block text-[11px] text-emerald-700 font-semibold">Tích cực (Khen)</span>
                  <span className="text-sm font-extrabold text-[#0F172A]">{result.positivePercentage}%</span>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2">
                  <span className="block text-[11px] text-amber-700 font-semibold">Trung lập</span>
                  <span className="text-sm font-extrabold text-[#0F172A]">{result.neutralPercentage}%</span>
                </div>
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2">
                  <span className="block text-[11px] text-[#D95D39] font-semibold">Tiêu cực (Chê)</span>
                  <span className="text-sm font-extrabold text-[#0F172A]">{result.negativePercentage}%</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] mb-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Nhận Định Tổng Quan Từ AI:</span>
              </div>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Highlights vs Complaints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Highlights */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-emerald-500/25 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Điểm Khen & Lợi Thế Nổi Bật ({result.keyHighlights?.length || 0})</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#475569]">
                  {result.keyHighlights && result.keyHighlights.length > 0 ? (
                    result.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold mt-0.5">•</span>
                        <span>{hl}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">Không ghi nhận điểm khen nổi bật.</li>
                  )}
                </ul>
              </div>

              {/* Complaints */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-rose-500/25 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D95D39]">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Điểm Trừ & Khiếu Nại Cần Sửa ({result.keyComplaints?.length || 0})</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#475569]">
                  {result.keyComplaints && result.keyComplaints.length > 0 ? (
                    result.keyComplaints.map((cp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D95D39] font-bold mt-0.5">•</span>
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
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>Khuyến Nghị Nâng Cao Chất Lượng Cho Đại Lý (Vendor):</span>
              </div>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {result.recommendationsForVendor}
              </p>
            </div>
          </div>
        )}

        {/* Customer Reviews Management / Playground */}
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
              <MessageSquare className="h-4 w-4 text-[#0D9488]" />
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
              className="flex-1 bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAddReview}
              className="px-3.5 py-2 bg-[#F4F1EC] hover:bg-[#E6F4F1] text-[#0F172A] rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Thêm
            </button>
          </div>

          {/* Review List preview */}
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {reviewTexts.map((text, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs text-[#475569] group hover:border-[#CBD5E1]"
              >
                <span className="truncate">{text}</span>
                <button
                  onClick={() => handleRemoveReview(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-[#D95D39] transition"
                  title="Xóa đánh giá này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E6E1DA]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F4F1EC] transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
