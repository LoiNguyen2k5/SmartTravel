import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Globe, 
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { destinationService, Destination } from '../../services/destinationService';

export const DestinationManagementPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState<Partial<Destination>>({
    name: '',
    city: '',
    country: 'Việt Nam',
    imageUrl: '',
    description: '',
    latitude: 0,
    longitude: 0,
  });

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; destination: Destination | null }>({
    isOpen: false,
    destination: null,
  });

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await destinationService.getAllDestinations();
      if (res.data) {
        setDestinations(res.data);
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDestination(null);
    setFormData({
      name: '',
      city: '',
      country: 'Việt Nam',
      imageUrl: '',
      description: '',
      latitude: 16.0,
      longitude: 108.0,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Destination) => {
    setEditingDestination(item);
    setFormData({
      name: item.name,
      city: item.city,
      country: item.country,
      imageUrl: item.imageUrl,
      description: item.description,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      alert('Vui lòng nhập đầy đủ Tên địa danh và Tỉnh/Thành phố.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingDestination) {
        const res = await destinationService.updateDestination(editingDestination.id, formData);
        if (res.data) {
          setDestinations(prev => prev.map(d => d.id === editingDestination.id ? res.data : d));
        }
      } else {
        const res = await destinationService.createDestination(formData);
        if (res.data) {
          setDestinations(prev => [...prev, res.data]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving destination:', err);
      alert('Không thể lưu điểm đến. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(true);
      await destinationService.deleteDestination(id);
      setDestinations(prev => prev.filter(d => d.id !== id));
      setDeleteModal({ isOpen: false, destination: null });
    } catch (err) {
      console.error('Error deleting destination:', err);
      alert('Không thể xóa điểm đến (có thể đang có tour liên kết).');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = destinations.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="h-8 w-8 text-sky-600" />
            Quản Trị Danh Mục & Điểm Đến Du Lịch
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý danh mục Tỉnh/Thành phố, địa danh du lịch và tọa độ hiển thị trên bản đồ hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDestinations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Thêm Điểm Đến Mới
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên địa danh, thành phố, quốc gia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition"
        />
      </div>

      {/* Destinations Grid Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-sky-600 mb-2" />
          Đang tải danh sách điểm đến...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dest.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500'}
                    alt={dest.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                      <Globe className="h-3 w-3 text-sky-600" />
                      {dest.city}, {dest.country}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {dest.description || 'Chưa có mô tả chi tiết cho địa danh này.'}
                  </p>
                  {(dest.latitude || dest.longitude) && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      Tọa độ: {dest.latitude?.toFixed(4)}, {dest.longitude?.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border-t border-white/8">
                <span className="text-xs text-slate-400 font-mono">ID: #{dest.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(dest)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-white/[0.06] transition"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, destination: dest })}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                    title="Xóa địa danh"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Không tìm thấy điểm đến nào phù hợp.
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                {editingDestination ? 'Chỉnh Sửa Điểm Đến' : 'Thêm Điểm Đến Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Địa Danh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vịnh Hạ Long, Phố Cổ Hội An..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỉnh / Thành Phố *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Quảng Ninh, Đà Nẵng..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quốc Gia</label>
                  <input
                    type="text"
                    placeholder="Việt Nam"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Hình Ảnh</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vĩ Độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="20.9101"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kinh Độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="107.1839"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả vẻ đẹp, điểm đặc sắc, trải nghiệm du lịch..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Đang Lưu...' : editingDestination ? 'Cập Nhật Điểm Đến' : 'Tạo Điểm Đến Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.destination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác Nhận Xóa Điểm Đến?</h3>
                <p className="text-xs text-slate-500">
                  Địa danh: <strong className="text-slate-800">{deleteModal.destination.name}</strong>
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa địa danh này khỏi danh mục hệ thống? Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, destination: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteModal.destination!.id)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
