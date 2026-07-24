import { Link } from "react-router";

/** 顶部导航：品牌 + 文档首页 + GitHub */
export function Header() {
  return (
    <header className="hairline sticky top-0 z-30 border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-deep font-display text-sm font-bold text-white shadow-glow">
            O
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-50">
            Orbital<span className="text-accent-soft"> Docs</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className="text-ink-300 transition-colors hover:text-ink-50"
          >
            文档首页
          </Link>
          <a
            href="https://github.com/xinvxueyuan/orbital-marketplace"
            target="_blank"
            rel="noreferrer"
            className="text-ink-300 transition-colors hover:text-ink-50"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
