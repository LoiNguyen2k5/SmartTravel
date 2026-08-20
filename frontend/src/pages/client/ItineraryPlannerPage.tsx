import React, { useState } from 'react';
import { MapViewer } from '../../components/map/MapViewer';
import { ItineraryPdfExporter, ActivityPdfItem } from '../../components/itinerary/ItineraryPdfExporter';
import { 
  Plus, Calendar, MapPin, Trash2, GripVertical, 
  Share2, Copy, Check, Compass, Utensils, Hotel, Car, Lightbulb,
  FileText, Image as ImageIcon
} from 'lucide-react';

interface ActivityItem {
  id: number;
  time: string;
  name: string;
  location: string;
  category: 'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT';
  cost: number;
  lat: number;
  lng: number;
  imageUrl: string;
}

const CATEGORY_ICONS: Record<string, { icon: any; color: string; label: string; defaultImg: string }> = {
  ATTRACTION: { 
    icon: Compass, 
    color: 'bg-sky-100 text-sky-700', 
    label: 'Tham quan',
    defaultImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  RESTAURANT: { 
    icon: Utensils, 
    color: 'bg-amber-100 text-amber-700', 
    label: 'Ẩm thực',
    defaultImg: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
  },
  HOTEL: { 
    icon: Hotel, 
    color: 'bg-purple-100 text-purple-700', 
    label: 'Khách sạn',
    defaultImg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  TRANSPORT: { 
    icon: Car, 
    color: 'bg-emerald-100 text-emerald-700', 
    label: 'Di chuyển',
    defaultImg: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80'
  },
};

export const ItineraryPlannerPage: React.FC = () => {
  // Demo Budget Limits
  const [estimatedBudget, setEstimatedBudget] = useState<number>(10000000);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Initial Activities with real images from dulichnewtour.vn for Tour Ân Thi - Phượng Hoàng Cổ Trấn
  const [activities, setActivities] = useState<ActivityItem[]>([
    { 
      id: 1, 
      time: '08:00', 
      name: 'Tham quan Long Lân Cung (Ân Thi)', 
      location: 'Ân Thi, Hồ Bắc', 
      category: 'ATTRACTION', 
      cost: 350000, 
      lat: 30.2917, 
      lng: 109.4886,
      imageUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image1.png'
    },
    { 
      id: 2, 
      time: '12:00', 
      name: 'Thưởng thức ẩm thực Thổ Gia & Ngắm cảnh đêm Tuyên Ân', 
      location: 'Tuyên Ân, Hồ Bắc', 
      category: 'RESTAURANT', 
      cost: 450000, 
      lat: 29.9867, 
      lng: 109.4839,
      imageUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image2.png'
    },
    { 
      id: 3, 
      time: '15:30', 
      name: 'Dạo bước Phố cổ & Check-in Hồng Kiều Nghệ Thuật Lâu', 
      location: 'Phượng Hoàng Cổ Trấn', 
      category: 'ATTRACTION', 
      cost: 200000, 
      lat: 27.9485, 
      lng: 109.5986,
      imageUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image3.png'
    },
    { 
      id: 4, 
      time: '19:00', 
      name: 'Chinh phục Cổng Trời Thiên Môn Sơn & Sạn Đạo Kính', 
      location: 'Trương Gia Giới', 
      category: 'HOTEL', 
      cost: 1500000, 
      lat: 29.1170, 
      lng: 110.4783,
      imageUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image4.png'
    },
  ]);

  // Form input state
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT'>('ATTRACTION');
  const [cost, setCost] = useState<number>(0);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Randomize nearby coordinates if not specified
    const baseLat = 16.054407 + (Math.random() - 0.5) * 0.1;
    const baseLng = 108.202167 + (Math.random() - 0.5) * 0.1;

    const defaultImg = CATEGORY_ICONS[category]?.defaultImg || CATEGORY_ICONS.ATTRACTION.defaultImg;

    const newItem: ActivityItem = {
      id: Date.now(),
      time: time || '12:00',
      name: name.trim(),
      location: location.trim() || 'Đà Nẵng',
      category: category,
      cost: Number(cost) || 0,
      lat: baseLat,
      lng: baseLng,
      imageUrl: customImageUrl.trim() || defaultImg,
    };

    setActivities([...activities, newItem]);
    setTime('');
    setName('');
    setLocation('');
    setCost(0);
    setCustomImageUrl('');
  };

  const handleDelete = (id: number) => {
    setActivities(activities.filter((item) => item.id !== id));
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...activities];
    const itemMoved = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, itemMoved);
    setDraggedIndex(index);
    setActivities(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Total cost calculations
  const totalCost = activities.reduce((acc, curr) => acc + curr.cost, 0);
  const budgetPct = Math.min(100, Math.round((totalCost / estimatedBudget) * 100));

  const handleGenerateShare = () => {
    const token = 'TRIP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setShareToken(token);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/itinerary/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map data to PDF format
  const pdfActivities: ActivityPdfItem[] = activities.map((act) => ({
    id: act.id,
    time: act.time,
    name: act.name,
    location: act.location,
    category: act.category,
    categoryLabel: CATEGORY_ICONS[act.category]?.label || 'Hoạt động',
    cost: act.cost,
    imageUrl: act.imageUrl,
  }));

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title & Action Buttons Widget */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-widest">
              <Compass className="h-4 w-4" /> Smart Itinerary Planner
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Lập Kế Hoạch Du Lịch Thông Minh</h1>
            <p className="text-xs text-slate-500 mt-1">
              Kéo thả sắp xếp địa điểm, quản lý chi phí và xuất file PDF với bộ sưu tập hình ảnh riêng cho từng nơi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs font-extrabold transition shadow-md flex items-center gap-2 active:scale-95"
            >
              <FileText className="h-4 w-4" /> Xuất PDF Lịch Trình
            </button>

            <button
              onClick={handleGenerateShare}
              className="rounded-2xl bg-sky-900 hover:bg-sky-950 text-white px-5 py-3 text-xs font-extrabold transition shadow-md flex items-center gap-2 active:scale-95"
            >
              <Share2 className="h-4 w-4" /> Chia Sẻ Kế Hoạch
            </button>
          </div>
        </div>

        {/* Real-time Budget Bar Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500">DỰ TOÁN NGÂN SÁCH CHUYẾN ĐI</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{totalCost.toLocaleString('vi-VN')} đ</span>
                <span className="text-xs text-slate-400">/ Ngân sách {estimatedBudget.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Hạn mức ngân sách:</span>
              <input
                type="number"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                className="w-36 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Đã chi tiêu: {budgetPct}%</span>
              <span>Còn lại: {Math.max(0, estimatedBudget - totalCost).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Interactive Drag-Drop Builder vs Leaflet Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Drag & Drop Activity Timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  <span>Danh Sách Hoạt Động (Kéo thả để sắp xếp)</span>
                </div>
                <span className="text-xs text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full">
                  {activities.length} Địa điểm
                </span>
              </div>

              {/* Drag and Drop Activities List */}
              <div className="space-y-3">
                {activities.map((act, index) => {
                  const catInfo = CATEGORY_ICONS[act.category] || CATEGORY_ICONS.ATTRACTION;
                  const IconComponent = catInfo.icon;
                  return (
                    <div
                      key={act.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-move ${
                        draggedIndex === index
                          ? 'border-sky-500 bg-sky-50 opacity-60 shadow-lg scale-[0.99]'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0 cursor-grab" />
                        
                        <img
                          src={act.imageUrl}
                          alt={act.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                        />

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-900 text-white px-2 py-0.5 text-[11px] font-black font-mono">
                              #{index + 1} | {act.time}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900">{act.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${catInfo.color}`}>
                              <IconComponent className="h-3 w-3" />
                              {catInfo.label}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <MapPin className="h-3 w-3 text-sky-600" /> {act.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-rose-600">
                          {act.cost > 0 ? `${act.cost.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                        <button 
                          onClick={() => handleDelete(act.id)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Activity Form */}
              <form onSubmit={handleAddActivity} className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> Thêm hoạt động mới vào lịch trình
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Giờ (08:30)"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Tên hoạt động / địa điểm *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                  />

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                  >
                    <option value="ATTRACTION">Tham quan</option>
                    <option value="RESTAURANT">Ẩm thực</option>
                    <option value="HOTEL">Khách sạn</option>
                    <option value="TRANSPORT">Di chuyển</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Vị trí (Đà Nẵng, Sơn Trà...)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                  />

                  <input
                    type="number"
                    placeholder="Chi phí dự kiến (đ)"
                    value={cost || ''}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium"
                  />

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Link ảnh minh họa riêng cho địa điểm này (tùy chọn)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none bg-slate-50 font-medium text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-bold py-2 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Thêm địa điểm
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* Right Column: Leaflet Interactive Map */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-600" /> Bản Đồ Tọa Độ Hành Trình
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Tự động gắn ghim</span>
              </div>

              <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <MapViewer
                  center={[16.054407, 108.202167]}
                  zoom={11}
                  markers={activities.map((a) => ({
                    id: a.id,
                    lat: a.lat,
                    lng: a.lng,
                    title: `${a.time} - ${a.name}`,
                  }))}
                />
              </div>
            </div>
          </div>

        </div>

        {/* PDF EXPORT PREVIEW MODAL */}
        <ItineraryPdfExporter
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          activities={pdfActivities}
          estimatedBudget={estimatedBudget}
          totalCost={totalCost}
        />

        {/* SHARE LINK MODAL */}
        {shareToken && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
                  <Share2 className="h-5 w-5" /> Chia Sẻ Lịch Trình Du Lịch
                </div>
                <button onClick={() => setShareToken(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600">Link chia sẻ kế hoạch hành trình dành cho bạn bè và gia đình:</p>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/itinerary/share/${shareToken}`}
                    className="flex-1 bg-transparent font-mono text-[11px] text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-sky-900 text-white font-bold hover:bg-sky-950 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-white font-bold" />}
                  </button>
                </div>
                {copied && <p className="text-[11px] font-bold text-emerald-600">Đã sao chép liên kết vào bộ nhớ tạm!</p>}
              </div>

              <button
                onClick={() => setShareToken(null)}
                className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-xs font-bold hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
