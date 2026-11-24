import React from 'react';

import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import { posts } from '../../data/blogPosts';
import type { Category } from '../../data/blogPosts';
import {
  BookOpen, MapPin, Camera, Utensils,
  Clock, Tag, ArrowRight, Search, Sparkles, TrendingUp, Eye
} from 'lucide-react';

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tất cả', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'diaDiem', label: 'Địa điểm', icon: <MapPin className="h-4 w-4" /> },
  { id: 'kinhNghiem', label: 'Kinh nghiệm', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'amThuc', label: 'Ẩm thực', icon: <Utensils className="h-4 w-4" /> },
];

export const BlogsPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	const PAGE_SIZE = 9;

	const categoryParam = searchParams.get('category');

	const activeCat: Category =
	  categories.find(category => category.id === categoryParam)?.id ?? 'all';

	const searchQ = searchParams.get('q') ?? '';

	const pageParam = Number(searchParams.get('page') ?? '1');

	const requestedPage =
	  Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;

	const normalizedSearch = searchQ.trim().toLocaleLowerCase('vi');

	const filtered = posts.filter(post => {
	  const matchCategory =
	    activeCat === 'all' || post.cat === activeCat;

	  const matchSearch =
	    normalizedSearch === '' ||
	    post.title.toLocaleLowerCase('vi').includes(normalizedSearch);

	  return matchCategory && matchSearch;
	});

	// Xếp bài nổi bật trước, rồi mới chia trang.
	// Mỗi trang có tối đa 9 bài tính cả bài nổi bật.
	const orderedPosts = [
	  ...filtered.filter(post => post.featured),
	  ...filtered.filter(post => !post.featured),
	];

	const totalPages = Math.max(
	  1,
	  Math.ceil(orderedPosts.length / PAGE_SIZE),
	);

	const currentPage = Math.min(requestedPage, totalPages);
	const startIndex = (currentPage - 1) * PAGE_SIZE;

	const pagePosts = orderedPosts.slice(
	  startIndex,
	  startIndex + PAGE_SIZE,
	);

	const featured = pagePosts.filter(post => post.featured);
	const regular = pagePosts.filter(post => !post.featured);

	const firstItem = orderedPosts.length === 0 ? 0 : startIndex + 1;
	const lastItem = Math.min(
	  startIndex + PAGE_SIZE,
	  orderedPosts.length,
	);

	const listUrl = location.pathname + location.search;

	const changeSearch = (value: string) => {
	  const next = new URLSearchParams(searchParams);

	  if (value) {
	    next.set('q', value);
	  } else {
	    next.delete('q');
	  }

	  next.delete('page');
	  setSearchParams(next, { replace: true });
	};

	const changeCategory = (value: Category) => {
	  const next = new URLSearchParams(searchParams);

	  if (value === 'all') {
	    next.delete('category');
	  } else {
	    next.set('category', value);
	  }

	  next.delete('page');
	  setSearchParams(next);
	};

	const changePage = (value: number) => {
	  const next = new URLSearchParams(searchParams);

	  if (value === 1) {
	    next.delete('page');
	  } else {
	    next.set('page', String(value));
	  }

	  setSearchParams(next);

	  document.getElementById('blog-results')?.scrollIntoView({
	    behavior: 'smooth',
	    block: 'start',
	  });
	};
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A]">

      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-14 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full mb-6">
            <BookOpen className="h-3.5 w-3.5" />
            Cẩm nang du lịch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#0F172A] leading-normal mb-5">
            Cẩm Nang
            <span 
              className="block mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-white to-sky-200"
              style={{ paddingTop: '0.2em', paddingBottom: '0.25em' }}
            >
              Khám Phá Thế Giới
            </span>
          </h1>
          <p className="text-sm text-[#526071] max-w-xl mx-auto leading-relaxed mb-8">
            Kinh nghiệm du lịch, địa điểm nổi bật, ẩm thực đặc sản — tất cả được biên soạn bởi các chuyên gia và khách hàng của Smart Travel.
          </p>

          {/* Search */}
          <div className="flex items-center gap-2 max-w-md mx-auto bg-[#FAF8F5] border border-[#E6E1DA] focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20 px-4 py-3 rounded-2xl transition-all">
            <Search className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={searchQ}
              onChange={e => changeSearch(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-sm text-[#334155] placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-y border-[#E6E1DA] bg-[#FAF8F5] py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 flex-wrap justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => changeCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCat === cat.id
                  ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-[#FAF8F5] text-[#526071] hover:text-[#0F172A] hover:bg-[#F4F1EC] border border-[#E6E1DA]'
              }`}
            >
              {cat.icon}{cat.label}
            </button>
          ))}
        </div>
      </div>

	  <div
	    id="blog-results"
	    className="max-w-7xl mx-auto px-6 py-14 space-y-14 scroll-mt-28"
	  >
	    <p className="text-sm text-[#526071]" aria-live="polite">
	      Hiển thị {firstItem}–{lastItem} trong {orderedPosts.length} bài viết
	    </p>

        {/* Featured posts */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-7">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Nổi bật</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map(post => (
				<Link
				  key={post.id}
				  to={`/blogs/${post.id}`}
				  state={{ from: listUrl }}
				  className="group relative rounded-3xl overflow-hidden border border-[#E6E1DA] bg-[#FAF8F5] hover:border-[#CBD5E1] transition-all duration-300 cursor-pointer hover:-translate-y-1"
				  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
				>
                  <div className="relative h-56 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B49]/75 via-[#0B3B49]/15 to-transparent" />
                    <span className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-lg text-[#0F172A] ${post.tagColor}`}>{post.tag}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold text-[#0F172A] leading-snug mb-2 group-hover:text-[#0B3B49] transition-colors">{post.title}</h3>
                    <p className="text-xs text-[#526071] leading-relaxed mb-4 line-clamp-2">{post.desc}</p>
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
              <Camera className="h-4 w-4 text-[#526071]" />
              <span className="text-xs font-bold text-[#526071] uppercase tracking-wider">Bài viết mới nhất</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {regular.map(post => (
				<Link
				  key={post.id}
				  to={`/blogs/${post.id}`}
				  state={{ from: listUrl }}
				  className="group rounded-2xl overflow-hidden border border-[#E6E1DA] bg-[#FAF8F5] hover:border-[#CBD5E1] transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
				>
                  <div className="relative h-44 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md text-[#0F172A] ${post.tagColor}`}>{post.tag}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-snug mb-2 line-clamp-2 group-hover:text-[#0B3B49] transition-colors">{post.title}</h3>
                    <p className="text-xs text-[#526071] leading-relaxed line-clamp-2 mb-3">{post.desc}</p>
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
		{totalPages > 1 && (
		  <nav
		    aria-label="Phân trang cẩm nang"
		    className="flex flex-wrap items-center justify-center gap-2"
		  >
		    <button
		      type="button"
		      onClick={() => changePage(currentPage - 1)}
		      disabled={currentPage === 1}
		      className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F4F1EC] disabled:cursor-not-allowed disabled:opacity-40"
		    >
		      ← Trang trước
		    </button>

		    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
		      page => (
		        <button
		          key={page}
		          type="button"
		          onClick={() => changePage(page)}
		          aria-label={`Trang ${page}`}
		          aria-current={page === currentPage ? 'page' : undefined}
		          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
		            page === currentPage
		              ? 'border-sky-500 bg-sky-600 text-white'
		              : 'border-[#CBD5E1] text-[#475569] hover:bg-[#F4F1EC]'
		          }`}
		        >
		          {page}
		        </button>
		      ),
		    )}

		    <button
		      type="button"
		      onClick={() => changePage(currentPage + 1)}
		      disabled={currentPage === totalPages}
		      className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F4F1EC] disabled:cursor-not-allowed disabled:opacity-40"
		    >
		      Trang sau →
		    </button>
		  </nav>
		)}
      </div>

      {/* CTA */}
      <div className="border-t border-[#E6E1DA] py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-black text-[#0F172A] mb-3">Lên kế hoạch ngay hôm nay!</h2>
          <p className="text-sm text-[#526071] mb-7">Đã tìm được điểm đến ưng ý? Đặt tour ngay để không lỡ chỗ.</p>
          <button
            onClick={() => navigate('/tours')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-[#0F172A] transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: '#D95D39',
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
