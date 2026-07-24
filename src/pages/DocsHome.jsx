import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import { listDocs } from '../api/docs.js'

export default function DocsHome() {
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listDocs()
      .then((data) => {
        if (cancelled) return
        setCategories(data?.categories || [])
        setDocs(data?.docs || [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!q.trim()) return null
    const term = q.trim().toLowerCase()
    return docs.filter((d) =>
      d.title.toLowerCase().includes(term) ||
      d.summary.toLowerCase().includes(term)
    )
  }, [q, docs])

  // 热门文档
  const popular = ['quickstart', 'vending-overview', 'api-overview', 'subscriptions']
    .map((s) => docs.find((d) => d.slug === s)).filter(Boolean)

  const docsByCategory = (catId) => docs.filter((d) => d.category === catId)

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/[0.08] to-transparent" />
        <div className="container-x py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="chip mb-5 backdrop-blur-md">
              <Icon.Sparkle className="h-3.5 w-3.5 text-accent-soft" /> Orbital 文档
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
              阅读、接入、<span className="bg-gradient-to-r from-accent-soft to-accent-glow bg-clip-text text-transparent">部署</span>
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-lg text-ink-300 leading-relaxed">
              从快速上手到 API 参考，再到发卡机制 —— 所有你需要了解 Orbital 商城的内容，都在这里。
            </p>

            {/* 搜索 */}
            <div className="mt-8 mx-auto max-w-xl">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-900/60 px-4 py-3 focus-within:border-accent/40">
                <Icon.Search className="text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜索文档标题或摘要…"
                  className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none"
                />
                {q && (
                  <button onClick={() => setQ('')} className="text-ink-400 hover:text-white">
                    <Icon.Close width={14} height={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-x py-16">
        {loading ? (
          <div className="text-center text-sm text-ink-400">加载中…</div>
        ) : filtered ? (
          <div>
            <h2 className="font-display text-xl font-semibold text-white">搜索结果 · {filtered.length}</h2>
            {filtered.length === 0 ? (
              <p className="mt-4 text-sm text-ink-400">没有匹配的文档。</p>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {filtered.map((d, i) => {
                  const cat = categories.find((c) => c.id === d.category)
                  return (
                    <motion.div key={d.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Link to={`/docs/${d.slug}`} className="panel group block p-5 hover:border-white/[0.14] transition-colors">
                        <div className="flex items-center gap-2 text-xs text-ink-400">
                          <span className="text-accent-soft">{cat?.icon}</span> {cat?.name}
                        </div>
                        <div className="mt-2 font-medium text-white group-hover:text-accent-soft">{d.title}</div>
                        <div className="mt-1 text-sm text-ink-400 line-clamp-2">{d.summary}</div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 热门文档 */}
            <div>
              <div className="label">热门文档</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {popular.map((d, i) => {
                  const cat = categories.find((c) => c.id === d.category)
                  return (
                    <motion.div key={d.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/docs/${d.slug}`} className="panel group block h-full p-5 hover:border-accent/30 hover:shadow-glow transition-all">
                        <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-accent-soft">
                          {cat?.icon}
                        </span>
                        <div className="mt-4 font-medium text-white group-hover:text-accent-soft">{d.title}</div>
                        <div className="mt-1 text-xs text-ink-400 line-clamp-2">{d.summary}</div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* 分类导航 */}
            <div className="mt-16">
              <div className="label">按分类浏览</div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {categories.map((cat, i) => {
                  const items = docsByCategory(cat.id)
                  if (items.length === 0) return null
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="panel p-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-lg text-accent-soft">
                          {cat.icon}
                        </span>
                        <h3 className="font-display text-lg font-semibold text-white">{cat.name}</h3>
                        <span className="ml-auto text-xs text-ink-400">{items.length} 篇</span>
                      </div>
                      <ul className="mt-4 space-y-1">
                        {items.map((d) => (
                          <li key={d.slug}>
                            <Link to={`/docs/${d.slug}`}
                              className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-300 hover:bg-white/[0.03] hover:text-white transition-colors">
                              <span className="flex-1 truncate">{d.title}</span>
                              <Icon.ArrowRight className="h-3.5 w-3.5 text-ink-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
