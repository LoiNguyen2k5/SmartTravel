import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posts } from '../../data/blogPosts';
import type { Category } from '../../data/blogPosts';
import {
  BookOpen, Map, Camera, Utensils, Backpack, Globe,
  Clock, Tag, ArrowRight, Search, Sparkles, TrendingUp, Eye
} from 'lucide-react';

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tất cả', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'kinhNghiem', label: 'Kinh nghiệm', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'diaDiem', label: 'Địa điểm', icon: <Map className="h-4 w-4" /> },
  { id: 'amThuc', label: 'Ẩm thực', icon: <Utensils className="h-4 w-4" /> },
  { id: 'backpacker', label: 'Phượt', icon: <Backpack className="h-4 w-4" /> },
  { id: 'nuocNgoai', label: 'Quốc tế', icon: <Globe className="h-4 w-4" /> },
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
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-4">
            Cẩm Nang
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-white to-sky-200">
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
				<Link
				  key={post.id}
				  to={`/blogs/${post.id}`}
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
                </Link>
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
				<Link
				  key={post.id}
				  to={`/blogs/${post.id}`}
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
                </Link>
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
