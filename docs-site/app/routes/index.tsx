import { Link } from "react-router";
import { CATEGORIES, docsByCategory } from "~/lib/docs";

export function meta() {
  return [
    { title: "Orbital Docs · 文档" },
    {
      name: "description",
      content:
        "Orbital 应用商城文档站：快速开始、应用接入、API 参考、订阅与授权、发卡系统与常见问题。",
    },
  ];
}

export default function DocsIndex() {
  return (
    <div className="container-x py-14">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-ink-900/60 px-3 py-1 text-xs text-ink-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
          React Router v8 · SSG
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          Orbital 文档
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink-300">
          应用发现、下载、许可证、订阅、发卡机制与文档站的一站式手册。
          选择下方分类开始阅读，或从「快速开始」上手。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/docs/quickstart"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-accent-deep"
          >
            5 分钟上手 →
          </Link>
          <Link
            to="/docs/overview"
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:bg-white/5"
          >
            项目概览
          </Link>
        </div>
      </section>

      {/* 分类卡片 */}
      <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const docs = docsByCategory(cat.id);
          if (docs.length === 0) return null;
          return (
            <div key={cat.id} className="card p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-800 text-accent-soft">
                  {cat.icon}
                </span>
                <h2 className="font-display text-base font-semibold text-ink-50">
                  {cat.name}
                </h2>
              </div>
              <ul className="space-y-1.5 text-sm">
                {docs.map((d) => (
                  <li key={d.slug}>
                    <Link
                      to={`/docs/${d.slug}`}
                      className="block rounded-md px-2 py-1.5 text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-100"
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
