import { Link, NavLink, useNavigate, useLocation } from 'react-router'
import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'

const links = [
  { to: '/',              label: '发现',   end: true },
  { to: '/apps',          label: '浏览' },
  { to: '/subscriptions', label: '订阅' },
  { to: '/updates',       label: '更新' },
  { to: '/vending',       label: '发卡' },
  { to: '/library',       label: '资料库' },
  { to: '/docs',          label: '文档' }
]

export default function Navbar() {
  const { subscriptions, updates, installed } = useLibrary()
  const nav = useNavigate()
  const loc = useLocation()
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // clear search on route change
  useEffect(() => { setQ('') }, [loc.pathname])

  const onSubmit = (e) => {
    e.preventDefault()
    if (q.trim()) nav(`/apps?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled ? 'border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent'}`}>
      <div className="container-x flex h-16 items-center gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 group">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-soft to-accent-deep shadow-glow">
            <span className="absolute inset-0 rounded-lg ring-1 ring-white/20" />
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className="leading-none">
            <div className="font-display text-[15px] font-semibold tracking-tight text-white">Orbital</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">marketplace</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {({ isActive }) => (
                <span className="relative">
                  {l.label}
                  {l.to === '/updates' && updates.length > 0 && (
                    <span className="absolute -right-3 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                      {updates.length}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-accent-soft to-accent" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSubmit} className="ml-auto hidden sm:flex items-center">
          <div className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 transition-colors focus-within:border-accent/40 focus-within:bg-white/[0.04] w-56 lg:w-72">
            <Icon.Search className="text-ink-400 group-focus-within:text-accent-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索应用、厂商、标签…"
              className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none"
            />
            <kbd className="hidden lg:inline rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-ink-400">⌘K</kbd>
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Link to="/library" className="btn-quiet hidden lg:inline-flex" title="已安装">
            <Icon.Box /> <span className="text-xs text-ink-300">{installed.length}</span>
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] py-1.5 pl-1.5 pr-3">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-deep text-xs font-semibold text-white">L</span>
            <div className="hidden sm:block leading-none">
              <div className="text-xs font-medium text-ink-100">Lumen</div>
              <div className="text-[10px] text-ink-400">{subscriptions.length} 订阅</div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden border-t border-white/[0.06] overflow-x-auto">
        <div className="container-x flex items-center gap-1 py-2">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white/[0.06] text-white' : 'text-ink-300'}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
