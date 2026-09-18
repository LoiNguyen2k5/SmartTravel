import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Map, Camera, Utensils, Backpack, Globe,
  Clock, Tag, ArrowRight, Search, Sparkles, TrendingUp, Eye
} from 'lucide-react';

type Category = 'all' | 'kinhNghiem' | 'diaDiem' | 'amThuc' | 'backpacker' | 'nuocNgoai';

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tất cả', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'kinhNghiem', label: 'Kinh nghiệm', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'diaDiem', label: 'Địa điểm', icon: <Map className="h-4 w-4" /> },
  { id: 'amThuc', label: 'Ẩm thực', icon: <Utensils className="h-4 w-4" /> },
  { id: 'backpacker', label: 'Phượt', icon: <Backpack className="h-4 w-4" /> },
  { id: 'nuocNgoai', label: 'Quốc tế', icon: <Globe className="h-4 w-4" /> },
];

const posts = [
  {
    id: 1, cat: 'kinhNghiem' as Category,
    tag: 'Kinh nghiệm', tagColor: 'bg-sky-500/90',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    title: 'Bí kíp đặt tour giá rẻ mùa cao điểm',
    desc: 'Những mẹo giúp bạn tiết kiệm tới 40% chi phí khi đặt tour vào mùa hè và dịp lễ tết mà vẫn có trải nghiệm tuyệt vời.',
    date: '12/09/2026', readTime: '5 phút', views: '2.4K',
    featured: true,
  },
  {
    id: 2, cat: 'diaDiem' as Category,
    tag: 'Địa điểm', tagColor: 'bg-emerald-500/90',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
    title: 'Phượng Hoàng Cổ Trấn — Kiến trúc ngàn năm còn đó',
    desc: 'Khám phá thị trấn cổ được xây dựng bên dòng sông Đà Giang với những ngôi nhà sàn độc đáo và nền văn hóa Miêu tộc huyền bí.',
    date: '08/09/2026', readTime: '7 phút', views: '3.1K',
    featured: false,
  },
  {
    id: 3, cat: 'amThuc' as Category,
    tag: 'Ẩm thực', tagColor: 'bg-amber-500/90',
    image: 'https://images.unsplash.com/photo-1569451092049-c68e9a8f7869?w=600&q=80',
    title: 'Đặc sản Đà Lạt không thể bỏ qua',
    desc: 'Bánh tráng nướng, sữa đậu nành nóng, nem nướng Đà Lạt — hành trình ẩm thực xứ ngàn hoa dành cho mọi tín đồ đam mê khám phá.',
    date: '05/09/2026', readTime: '4 phút', views: '1.8K',
    featured: false,
  },
  {
    id: 4, cat: 'nuocNgoai' as Category,
    tag: 'Quốc tế', tagColor: 'bg-rose-500/90',
    image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=600&q=80',
    title: 'Thượng Hải — Ô Trấn, hành trình cổ kim giao thoa',
    desc: 'Từ những tòa nhà chọc trời ở Bund đến con sông cổ kính ở Ô Trấn — Thượng Hải là sự pha trộn hoàn hảo giữa hiện đại và truyền thống.',
    date: '01/09/2026', readTime: '8 phút', views: '4.2K',
    featured: true,
  },
  {
    id: 5, cat: 'backpacker' as Category,
    tag: 'Phượt', tagColor: 'bg-violet-500/90',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    title: 'Núi Chứa Chan — Phượt 1 ngày từ TP.HCM',
    desc: 'Cách TP.HCM chỉ 100km, Núi Chứa Chan là điểm leo núi lý tưởng cuối tuần với cảnh quan hùng vĩ và chùa Bửu Quang linh thiêng.',
    date: '28/08/2026', readTime: '6 phút', views: '2.0K',
    featured: false,
  },
  {
    id: 6, cat: 'kinhNghiem' as Category,
    tag: 'Kinh nghiệm', tagColor: 'bg-sky-500/90',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
    title: 'Chuẩn bị hành lý du lịch biển đúng cách',
    desc: 'Checklist đầy đủ cho chuyến đi biển: từ kem chống nắng, phao bơi đến thuốc say sóng và những vật dụng không thể thiếu.',
    date: '25/08/2026', readTime: '5 phút', views: '1.5K',
    featured: false,
  },
];

export const BlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<Category>('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = posts.filter(p => {
    const matchCat = activeCat === 'all' || p.cat === activeCat;
    const matchQ = searchQ === '' || p.title.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchQ;
  });

  const featured = filtered.filter(p => p.featured);
  const regular = filtered.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#020204] text-white">

      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-14 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full mb-6">
            <BookOpen className="h-3.5 w-3.5" />
            Cẩm nang du lịch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-normal mb-5">
            Cẩm Nang
            <span 
              className="block mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-white to-sky-200"
              style={{ paddingTop: '0.2em', paddingBottom: '0.25em' }}
            >
              Khám Phá Thế Giới
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
            Kinh nghiệm du lịch, địa điểm nổi bật, ẩm thực đặc sản — tất cả được biên soạn bởi các chuyên gia và khách hàng của Smart Travel.
          </p>

          {/* Search */}
          <div className="flex items-center gap-2 max-w-md mx-auto bg-white/5 border border-white/10 focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20 px-4 py-3 rounded-2xl transition-all">
            <Search className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-sm text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-y border-white/8 bg-white/[0.02] py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 flex-wrap justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCat === cat.id
                  ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/8'
              }`}
            >
              {cat.icon}{cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-14">

        {/* Featured posts */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-7">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Nổi bật</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map(post => (
                <div
                  key={post.id}
                  className="group relative rounded-3xl overflow-hidden border border-white/8 bg-white/[0.03] hover:border-white/15 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-black/20 to-transparent" />
                    <span className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white ${post.tagColor}`}>{post.tag}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-sky-300 transition-colors">{post.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{post.desc}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                      </div>
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular posts */}
        {regular.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-7">
              <Camera className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài viết mới nhất</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {regular.map(post => (
                <div
                  key={post.id}
                  className="group rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03] hover:border-white/15 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${post.tagColor}`}>{post.tag}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-sky-300 transition-colors">{post.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">{post.desc}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Không tìm thấy bài viết phù hợp.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-white/8 py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-black text-white mb-3">Lên kế hoạch ngay hôm nay!</h2>
          <p className="text-sm text-slate-400 mb-7">Đã tìm được điểm đến ưng ý? Đặt tour ngay để không lỡ chỗ.</p>
          <button
            onClick={() => navigate('/tours')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(to top, #9ad9ec 1px, #79e0f1 2px, #14a8c6 5px, #038aa8 7px, #006180 9px, #04465a 13px, #0a2a37 18px, #0a111d 32px)',
              boxShadow: '0 0 12px rgba(60,190,235,.25), 0 4px 16px -2px rgba(90,220,255,.4)',
            }}
          >
            Xem tour ngay <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
