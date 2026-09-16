import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compass, ArrowLeft } from 'lucide-react';
import { tourService } from '../../services/tourService';

export const CreateTourPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tourCode, setTourCode] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [childPrice, setChildPrice] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [durationNights, setDurationNights] = useState<number>(0);
  const [departureLocation, setDepartureLocation] = useState('TP.Hồ Chí Minh');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<'DOMESTIC' | 'NUOC_NGOAI'>('DOMESTIC');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || price <= 0 || !thumbnailUrl.trim()) {
      setError('Vui lòng điền đầy đủ tên tour, giá tour hợp lệ và hình ảnh đại diện!');
      return;
    }

    setLoading(true);
    try {
      const generatedCode = tourCode.trim() || `TOUR-${Date.now().toString().slice(-6)}`;
      await tourService.createTour({
        tourCode: generatedCode,
        title: title.trim(),
        description: description.trim(),
        price,
        childPrice: childPrice > 0 ? childPrice : Math.round(price * 0.7),
        durationDays,
        durationNights,
        departureLocation: departureLocation.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        category: category as any,
        remainingSeats: 40,
      } as any);

      alert('Tạo Tour du lịch mới thành công! Tour đã được gửi lên hệ thống.');
      navigate('/vendor/tours');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tạo tour. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Plus className="h-7 w-7 text-emerald-600" /> Tạo Tour Du Lịch Mới
          </h1>
          <p className="mt-1 text-sm text-slate-600">Thông tin sẽ được lưu trực tiếp vào MySQL Database</p>
        </div>
        <button
          onClick={() => navigate('/vendor/dashboard')}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tour *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: TOUR KHÁM PHÁ ĐÀ NẴNG - HỘI AN 3N2Đ"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mã Tour</label>
            <input
              type="text"
              value={tourCode}
              onChange={(e) => setTourCode(e.target.value.toUpperCase())}
              placeholder="VD: DN-HA-3N2D"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm uppercase focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại Tour</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none bg-white font-medium"
            >
              <option value="DOMESTIC">Trong nước (Domestic)</option>
              <option value="NUOC_NGOAI">Nước ngoài (International)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giá người lớn (VNĐ) *</label>
            <input
              type="number"
              min="0"
              required
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="3500000"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giá trẻ em (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={childPrice || ''}
              onChange={(e) => setChildPrice(Number(e.target.value))}
              placeholder="2450000"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số ngày</label>
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số đêm</label>
            <input
              type="number"
              min="0"
              value={durationNights}
              onChange={(e) => setDurationNights(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Điểm khởi hành</label>
            <input
              type="text"
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              placeholder="TP.Hồ Chí Minh"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">URL Ảnh Đại Diện (Thumbnail) *</label>
          <input
            type="text"
            required
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://... hoặc /images/tours/..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tổng quan</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết điểm nổi bật của hành trình du lịch..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
        >
          <Compass className="h-4 w-4" /> {loading ? 'Đang lưu vào Database...' : 'Lưu & Đăng Tải Tour Về Database'}
        </button>
      </form>
    </div>
  );
};
