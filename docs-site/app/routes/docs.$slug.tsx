import { Link, useParams } from "react-router";
import { getAdjacent, getDoc, categoryName } from "~/lib/docs";
import { Sidebar } from "~/components/Sidebar";

export function meta({ params }: { params: { slug?: string } }) {
  const doc = params.slug ? getDoc(params.slug) : null;
  if (!doc) return [{ title: "文档不存在 · Orbital Docs" }];
  return [
    { title: `${doc.meta.title} · Orbital Docs` },
    { name: "description", content: doc.meta.summary },
  ];
}

export default function DocPage() {
  const { slug = "" } = useParams();
  const doc = getDoc(slug);

  if (!doc) {
    throw new Response("文档不存在", { status: 404 });
  }

  const { meta, Component } = doc;
  const { prev, next } = getAdjacent(slug);

  return (
    <div className="container-x py-10">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        {/* 侧边栏：桌面端粘性，移动端隐藏 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <Sidebar />
          </div>
        </aside>

        {/* 正文 */}
        <article className="min-w-0 max-w-3xl">
          <p className="mb-3 text-sm text-accent-soft">
            {categoryName(meta.category)}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-50">
            {meta.title}
          </h1>
          <p className="mt-3 text-ink-300">{meta.summary}</p>
          <p className="mt-2 text-xs text-ink-400">
            最后更新：{meta.updatedAt}
          </p>

          <hr className="my-8 border-white/5" />

          <div className="prose">
            <Component />
          </div>

          {/* 上一篇 / 下一篇 */}
          <nav className="mt-12 grid gap-4 border-t border-white/5 pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/docs/${prev.slug}`}
                className="card group p-4 transition-colors hover:border-accent/30"
              >
                <span className="text-xs text-ink-400">← 上一篇</span>
                <p className="mt-1 font-medium text-ink-100 group-hover:text-accent-soft">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/docs/${next.slug}`}
                className="card group p-4 text-right transition-colors hover:border-accent/30"
              >
                <span className="text-xs text-ink-400">下一篇 →</span>
                <p className="mt-1 font-medium text-ink-100 group-hover:text-accent-soft">
                  {next.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
