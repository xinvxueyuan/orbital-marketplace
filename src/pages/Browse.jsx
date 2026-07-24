import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import AppCard from '../components/AppCard.jsx'
import Icon from '../components/Icon.jsx'
import { categories } from '../data/apps.js'
import { listApps } from '../api/apps.js'

const sorts = [
  { id: 'popular',  label: '热门' },
  { id: 'rating',   label: '评分' },
  { id: 'newest',   label: '最新' },
  { id: 'name',     label: '名称' }
]

const toDownloads = (s) => {
  const n = parseFloat(s)
  const mult = s.endsWith('M') ? 1e6 : s.endsWith('K') ? 1e3 : 1
  return n * mult
}

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('cat') || 'all'

  const [sort, setSort] = useState('popular')
  const [query, setQuery] = useState(q)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  // 一次性拉取全部应用，筛选/排序在前端完成（保持与原 mock 行为一致）
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listApps()
      .then((list) => { if (!cancelled) setApps(list || []) })
      .catch(() => { if (!cancelled) setApps([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => { setQuery(q) }, [q])

  const setCat = (c) => {
    const next = new URLSearchParams(params)
    if (c === 'all') next.delete('cat'); else next.set('cat', c)
    setParams(next, { replace: true })
  }

  const onSearch = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    if (query.trim()) next.set('q', query.trim()); else next.delete('q')
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    let l = cat === 'all' ? apps : apps.filter((a) => a.category === cat)
    if (q.trim()) {
      const term = q.trim().toLowerCase()
      l = l.filter((a) =>
        a.name.toLowerCase().includes(term) ||
        a.vendor.toLowerCase().includes(term) ||
        a.tagline.toLowerCase().includes(term) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(term))
      )
    }
    const sorted = [...l]
    switch (sort) {
      case 'rating':  sorted.sort((a, b) => b.rating - a.rating); break
      case 'newest':  sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); break
      case 'name':    sorted.sort((a, b) => a.name.localeCompare(b.name)); break
      default:        sorted.sort((a, b) => toDownloads(b.downloads) - toDownloads(a.downloads))
    }
    return sorted
  }, [apps, cat, q, sort])

  return (
    <PageTransition>
      <div className="container-x py-12">
        <div className="flex flex-col gap-2">
          <div className="label">浏览</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">应用目录</h1>
          <p className="text-sm text-ink-400">共 {apps.length} 款应用 · 当前显示 {list.length} 款</p>
        </div>

        {/* search + sort bar */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearch} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 lg:w-96 focus-within:border-accent/40">
            <Icon.Search className="text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名称、厂商、标签…"
              className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); const n = new URLSearchParams(params); n.delete('q'); setParams(n, { replace: true }) }}
                className="text-ink-400 hover:text-white"><Icon.Close width={14} height={14} /></button>
            )}
          </form>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
            {sorts.map((s) => (
              <button key={s.id} onClick={() => setSort(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sort === s.id ? 'bg-white/[0.08] text-white' : 'text-ink-300 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* categories */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                cat === c.id
                  ? 'border-accent/40 bg-accent/10 text-accent-soft'
                  : 'border-white/[0.08] bg-white/[0.02] text-ink-300 hover:border-white/[0.16] hover:text-white'
              }`}>
              <span>{c.icon}</span> {c.name}
              <span className="text-ink-500">{c.id === 'all' ? apps.length : apps.filter((a) => a.category === c.id).length}</span>
            </button>
          ))}
        </div>

        {/* results */}
        {loading ? (
          <div className="mt-16 text-center text-sm text-ink-400">加载中…</div>
        ) : list.length === 0 ? (
          <div className="mt-16 grid place-items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] text-ink-400">
              <Icon.Search />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-white">没有找到匹配的应用</p>
            <p className="mt-1 text-sm text-ink-400">尝试更换关键词或分类筛选。</p>
            <button className="mt-5 btn-ghost" onClick={() => { setQuery(''); setCat('all') }}>清除筛选</button>
          </div>
        ) : (
          <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
