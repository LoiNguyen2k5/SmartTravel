import { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

import { posts } from '../../data/blogPosts';
import { blogContents } from '../../data/blogContents';
import { tourBlogArticles } from '../../data/tourBlogArticles';
import { MOCK_TOURS } from '../../data/mockTours';

interface ArticleImageProps {
  src: string;
  title: string;
}

const ArticleImage = ({ src, title }: ArticleImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="mb-8 flex min-h-48 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 px-6 py-12">
        <p className="text-center text-sm text-slate-400">
          Ảnh bài viết hiện chưa tải được.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-slate-900">
      <img
        src={src}
        alt={title}
        className="max-h-[480px] w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const savedFrom: unknown = location.state?.from;

  const backToBlogs =
    typeof savedFrom === 'string' &&
    /^\/blogs(?:\?[^#]*)?$/.test(savedFrom)
      ? savedFrom
      : '/blogs';
  const post = posts.find(item => String(item.id) === id);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#020204] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold">
            Không tìm thấy bài viết
          </h1>

          <p className="mb-6 text-slate-400">
            Bài viết có thể đã được thay đổi hoặc đường dẫn chưa đúng.
          </p>

          <Link
            to={backToBlogs}
            className="inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500"
          >
            Quay lại cẩm nang
          </Link>
        </div>
      </main>
    );
  }

  const sections = blogContents[post.id] ?? [];

  const tourArticle = tourBlogArticles.find(
    article => article.id === post.id,
  );

  const relatedTour = tourArticle
    ? MOCK_TOURS.find(
        tour => tour.tourCode === tourArticle.tourCode,
      )
    : undefined;

  return (
    <main className="min-h-screen bg-[#020204] px-6 py-12 text-white">
      <article className="mx-auto max-w-3xl">
        <Link
          to={backToBlogs}
          className="mb-8 inline-block text-sm font-medium text-sky-400 hover:underline"
        >
          ← Quay lại cẩm nang
        </Link>

        <div className="mb-4">
          <span
            className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold text-white ${post.tagColor}`}
          >
            {post.tag}
          </span>
        </div>

        <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl">
          {post.title}
        </h1>

        <p className="mb-8 text-sm text-slate-400">
          {post.date} · {post.readTime} đọc
        </p>

        {tourArticle?.isDemo && (
          <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">
            Đây là bài giải thích mục thử nghiệm thanh toán,
            không phải chương trình du lịch.
          </div>
        )}

        <ArticleImage
          key={`${post.id}-${post.image}`}
          src={post.image}
          title={post.title}
        />

        <p className="mb-10 text-lg leading-8 text-slate-300">
          {post.desc}
        </p>

        {sections.length > 0 ? (
          sections.map((section, sectionIndex) => (
            <section
              key={`${post.id}-${sectionIndex}`}
              className="mb-10"
            >
              <h2 className="mb-4 text-2xl font-semibold leading-snug">
                {section.heading}
              </h2>

              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${sectionIndex}-${paragraphIndex}`}
                  className="mb-4 leading-8 text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))
        ) : (
          <p className="mb-10 text-slate-400">
            Nội dung bài viết đang được cập nhật.
          </p>
        )}

        {relatedTour && (
          <aside className="my-10 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              {tourArticle?.isDemo ? 'Mục thử nghiệm liên quan' : 'Tour liên quan'}
            </p>

            <h2 className="mb-4 text-xl font-semibold leading-snug">
              {relatedTour.title}
            </h2>

            <dl className="mb-6 space-y-2 text-sm">
              <div>
                <dt className="inline text-slate-400">
                  Khởi hành:
                </dt>{' '}
                <dd className="inline text-slate-200">
                  {relatedTour.departureLocation}
                </dd>
              </div>

              <div>
                <dt className="inline text-slate-400">
                  Thời gian:
                </dt>{' '}
                <dd className="inline text-slate-200">
                  {relatedTour.durationDays} ngày{' '}
                  {relatedTour.durationNights} đêm
                </dd>
              </div>

              <div>
                <dt className="inline text-slate-400">
                  Mã tour:
                </dt>{' '}
                <dd className="inline text-slate-200">
                  {relatedTour.tourCode}
                </dd>
              </div>
            </dl>

            <Link
              to={`/tours/${relatedTour.id}`}
			  state={{
			    fromBlog: location.pathname + location.search,
			    blogListUrl: backToBlogs,
			  }}
              className="inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-500"
            >
			{tourArticle?.isDemo
			  ? 'Xem thông tin mục thử nghiệm →'
			  : 'Xem chi tiết tour →'}
            </Link>
          </aside>
        )}

        <div className="border-t border-white/10 pt-8">
          <Link
            to={backToBlogs}
            className="inline-block rounded-xl border border-white/20 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Xem các bài viết khác
          </Link>
        </div>
      </article>
    </main>
  );
};