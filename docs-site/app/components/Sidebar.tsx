import { NavLink } from "react-router";
import { CATEGORIES, docsByCategory } from "~/lib/docs";

/** 文档左侧导航：按分类聚合，高亮当前文档 */
export function Sidebar() {
  return (
    <nav className="space-y-7 text-sm">
      {CATEGORIES.map((cat) => {
        const docs = docsByCategory(cat.id);
        if (docs.length === 0) return null;
        return (
          <div key={cat.id}>
            <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
            </p>
            <ul className="space-y-0.5">
              {docs.map((d) => (
                <li key={d.slug}>
                  <NavLink
                    to={`/docs/${d.slug}`}
                    className={({ isActive }) =>
                      [
                        "block rounded-lg px-3 py-1.5 transition-colors",
                        isActive
                          ? "bg-accent/15 text-accent-soft"
                          : "text-ink-300 hover:bg-white/5 hover:text-ink-100",
                      ].join(" ")
                    }
                  >
                    {d.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
