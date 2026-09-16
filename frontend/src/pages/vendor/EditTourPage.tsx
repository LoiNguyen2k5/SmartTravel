import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Compass, Save, ArrowLeft, Image, Plus, Trash2 } from 'lucide-react';
import { tourService } from '../../services/tourService';

export const EditTourPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form Fields
  const [title, setTitle] = useState('');
  const [tourCode, setTourCode] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [childPrice, setChildPrice] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [durationNights, setDurationNights] = useState<number>(0);
  const [departureLocation, setDepartureLocation] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<'DOMESTIC' | 'NUOC_NGOAI'>('DOMESTIC');
  const [description, setDescription] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchTourDetail(Number(id));
    }
  }, [id]);

  const fetchTourDetail = async (tourId: number) => {
    setLoading(true);
    try {
      const res = await tourService.getTourById(tourId);
      if (res.data) {
        const t = res.data;
        setTitle(t.title || '');
        setTourCode(t.tourCode || '');
        setPrice(t.price || 0);
        setChildPrice(t.childPrice || Math.round((t.price || 0) * 0.7));
        setDurationDays(t.durationDays || 1);
        setDurationNights(t.durationNights || 0);
        setDepartureLocation(t.departureLocation || '');
        setThumbnailUrl(t.thumbnailUrl || '');
        setCategory((t.category as any) || 'DOMESTIC');
        setDescription(t.description || '');
        setGalleryImages(t.gallery || (t.thumbnailUrl ? [t.thumbnailUrl] : []));
      }
    } catch (err) {
      console.error('Lỗi tải tour:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (newImageUrl.trim()) {
      setGalleryImages([...galleryImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || price <= 0 || !thumbnailUrl.trim()) {
      setError('Vui lòng nhập đầy đủ Tên tour, Giá và Ảnh đại diện!');
      return;
    }

    setSaving(true);
    try {
      await tourService.updateTour(Number(id), {
        title: title.trim(),
        price,
        childPrice,
        durationDays,
        durationNights,
        departureLocation: departureLocation.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        category: category as any,
        description: description.trim(),
      });

      setSuccessMsg('Đã cập nhật thông tin tour thành công!');
      setTimeout(() => navigate('/vendor/tours'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu thay đổi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Compass className="h-8 w-8 text-emerald-600" /> Chỉnh Sửa Tour Du Lịch
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cập nhật lịch trình, thư viện ảnh chất lượng cao và cài đặt giá linh hoạt
          </p>
        </div>

        <button
          onClick={() => navigate('/vendor/tours')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Danh sách Tour
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* BASIC TOUR DETAILS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            1. Thông Tin Cơ Bản & Giá Cả Linh Hoạt
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên Tour Du Lịch *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã Tour (Code)</label>
                <input
                  type="text"
                  value={tourCode}
                  onChange={(e) => setTourCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono uppercase font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phân loại Tour</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="DOMESTIC">Trong Nước (Domestic)</option>
                  <option value="NUOC_NGOAI">Nước Ngoài (International)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giá Người Lớn (VNĐ) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-rose-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giá Trẻ Em (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={childPrice}
                  onChange={(e) => setChildPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số Ngày</label>
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số Đêm</label>
                <input
                  type="number"
                  min="0"
                  value={durationNights}
                  onChange={(e) => setDurationNights(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Điểm Khởi Hành</label>
                <input
                  type="text"
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* THƯ VIỆN ẢNH */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Image className="h-5 w-5 text-emerald-600" /> 2. Ảnh Đại Diện & Thư Viện Ảnh Chất Lượng Cao
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">URL Ảnh Đại Diện (Thumbnail) *</label>
              <input
                type="text"
                required
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Gallery Image Links List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Thư Viện Ảnh Tour (Gallery Album)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add image link input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Dán link ảnh (/images/tours/... hoặc https://...)"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm Ảnh
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô Tả Chi Tiết Hành Trình</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Tour'}
          </button>
        </div>
      </form>
    </div>
  );
};
