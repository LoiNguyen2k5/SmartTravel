import { Link, useParams } from 'react-router-dom';
import { posts } from '../../data/blogPosts';
import { blogContents } from '../../data/blogContents';

export const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const post = posts.find(item => String(item.id) === id);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#020204] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold">
            Không tìm thấy bài viết
          </h1>
          <Link to="/blogs" className="text-sky-400 underline">
            Quay lại cẩm nang
          </Link>
        </div>
      </main>
    );
  }

  const sections = blogContents[post.id] ?? [];

  return (
    <main className="min-h-screen bg-[#020204] px-6 py-12 text-white">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blogs"
          className="mb-8 inline-block text-sky-400 hover:underline"
        >
          ← Quay lại cẩm nang
        </Link>

        <p className="mb-3 text-sm text-sky-300">{post.tag}</p>

        <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl">
          {post.title}
        </h1>

        <p className="mb-8 text-sm text-slate-400">
          {post.date} · Nội dung mẫu
        </p>

        <div className="mb-8 overflow-hidden rounded-2xl bg-slate-900">
          <img
            key={post.image}
            src={post.image}
            alt={post.title}
            className="max-h-[480px] w-full object-cover"
            onError={event => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <p className="mb-10 text-lg leading-8 text-slate-300">
          {post.desc}
        </p>

        {sections.length > 0 ? (
          sections.map(section => (
            <section key={section.heading} className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold">
                {section.heading}
              </h2>

              {section.paragraphs.map(paragraph => (
                <p
                  key={paragraph}
                  className="mb-4 leading-8 text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))
        ) : (
          <p className="text-slate-400">
            Nội dung bài viết đang được cập nhật.
          </p>
        )}

        <Link
          to="/blogs"
          className="inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold hover:bg-sky-500"
        >
          Xem các bài viết khác
        </Link>
      </article>
    </main>
  );
};