import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  RefreshCw, 
  MapPin 
} from 'lucide-react';
import { aiService, TourAiGenerateResult } from '../../services/aiService';

interface AiTourGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: TourAiGenerateResult) => void;
  defaultDestination?: string;
}

export const AiTourGeneratorModal: React.FC<AiTourGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  defaultDestination = '',
}) => {
  const [destination, setDestination] = useState(defaultDestination);
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [category, setCategory] = useState<'DOMESTIC' | 'NUOC_NGOAI'>('DOMESTIC');
  const [departureLocation, setDepartureLocation] = useState('TP.Hồ Chí Minh');
  const [highlightKeywords, setHighlightKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('Gia đình, bạn bè');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TourAiGenerateResult | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!destination.trim()) {
      setError('Vui lòng nhập tên điểm đến hoặc địa danh tour!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await aiService.generateTourContent({
        destination: destination.trim(),
        durationDays,
        durationNights,
        category,
        departureLocation,
        highlightKeywords: highlightKeywords.trim(),
        targetAudience,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo nội dung với AI. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">AI Content Generator</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                  Tự Động 24/7
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tự động viết mô tả hấp dẫn & lên lịch trình từng ngày cho Vendor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-200">
              {error}
            </div>
          )}

          {/* INPUT FIELDS */}
          {!result && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Điểm đến hoặc Địa danh chính *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="VD: Hạ Long, Đà Nẵng - Hội An, Thượng Hải, Tokyo..."
                    className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số ngày</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số đêm</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={durationNights}
                    onChange={(e) => setDurationNights(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại hình tour</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold focus:outline-none bg-white"
                  >
                    <option value="DOMESTIC">Trong nước</option>
                    <option value="NUOC_NGOAI">Quốc tế</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm khởi hành</label>
                  <input
                    type="text"
                    value={departureLocation}
                    onChange={(e) => setDepartureLocation(e.target.value)}
                    placeholder="TP.Hồ Chí Minh, Hà Nội..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng ưu tiên</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Gia đình, cặp đôi, nhóm trẻ..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Từ khóa điểm nhấn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={highlightKeywords}
                  onChange={(e) => setHighlightKeywords(e.target.value)}
                  placeholder="VD: Khách sạn 4 sao, tắm suối khoáng, lặn san hô, đặc sản lẩu nướng..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-black text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    AI đang soạn thảo mô tả & lên lịch trình...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Tạo Nội Dung Bằng AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* RESULT PREVIEW */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" /> AI đã sinh nội dung hoàn chỉnh!
                </span>
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Tạo lại
                </button>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tiêu đề đề xuất</span>
                  <h4 className="text-sm font-black text-slate-900">{result.title}</h4>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Mã: {result.tourCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giá người lớn đề xuất</span>
                    <p className="font-black text-rose-600">{(result.suggestedPrice || 0).toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giá trẻ em</span>
                    <p className="font-bold text-slate-700">{(result.suggestedChildPrice || 0).toLocaleString('vi-VN')} đ</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đoạn văn mô tả</span>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 mt-1">
                    {result.description}
                  </p>
                </div>

                {result.includedServices && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dịch vụ bao gồm</span>
                    <p className="text-[11px] text-slate-600 whitespace-pre-line mt-0.5">
                      {result.includedServices}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {result && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-900/20"
            >
              <Check className="h-4 w-4" /> Áp Dụng Vào Form Tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
