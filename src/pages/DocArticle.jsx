import { useParams, Link, Navigate } from 'react-router'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import CodeBlock from '../components/CodeBlock.jsx'
import Icon from '../components/Icon.jsx'
import { getDoc, listDocs } from '../api/docs.js'

export default function DocArticle() {
  const { slug } = useParams()
  const [doc, setDoc] = useState(null)
  const [categories, setCategories] = useState([])
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setNotFound(false); setDoc(null)
    getDoc(slug)
      .then((data) => { if (!cancelled) setDoc(data); })
      .catch((e) => { if (cancelled) return; if (e.status === 404) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    // 同时拉取文档索引用于侧边栏 / 上下篇 / 相关
    listDocs()
      .then((data) => {
        if (cancelled) return
        setCategories(data?.categories || [])
        setDocs(data?.docs || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [slug])

  const docsByCategory = (catId) => docs.filter((d) => d.category === catId)

  if (loading) {
    return (
      <PageTransition>
        <div className="container-x py-24 text-center text-ink-400">加载中…</div>
      </PageTransition>
    )
  }

  if (notFound || !doc) return <Navigate to="/docs" replace />

  // 计算上一篇 / 下一篇
  const flat = docs
  const idx = flat.findIndex((d) => d.slug === slug)
  const prev = idx > 0 ? flat[idx - 1] : null
  const next = idx < flat.length - 1 ? flat[idx + 1] : null

  // 同分类的相关文档
  const related = docsByCategory(doc.category).filter((d) => d.slug !== slug).slice(0, 4)

  return (
    <PageTransition>
      <div className="container-x py-10">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* 侧边栏导航 */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <Link to="/docs" className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white mb-4">
                <Icon.ArrowLeft className="h-4 w-4" /> 文档首页
              </Link>
              <nav className="space-y-6">
                {categories.map((cat) => {
                  const items = docsByCategory(cat.id)
                  if (items.length === 0) return null
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
                        <span className="text-accent-soft">{cat.icon}</span> {cat.name}
                      </div>
                      <ul className="mt-2 space-y-0.5">
                        {items.map((d) => (
                          <li key={d.slug}>
                            <Link to={`/docs/${d.slug}`}
                              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                d.slug === slug
                                  ? 'bg-accent/10 text-accent-soft font-medium'
                                  : 'text-ink-300 hover:bg-white/[0.03] hover:text-white'
                              }`}>
                              {d.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* 正文 */}
          <motion.article
            key={slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-w-0 max-w-3xl"
          >
            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <Link to="/docs" className="hover:text-white">文档</Link>
              <span>/</span>
              <span className="text-ink-300">{categories.find((c) => c.id === doc.category)?.name}</span>
            </div>

            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">{doc.title}</h1>
            <p className="mt-3 text-lg text-ink-300 leading-relaxed">{doc.summary}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-ink-400">
              <span className="flex items-center gap-1.5"><Icon.Clock className="h-3.5 w-3.5" /> 更新于 {doc.updatedAt}</span>
            </div>

            <div className="mt-10 space-y-10">
              {(doc.sections || []).map((sec, i) => (
                <section key={i} id={`sec-${i}`} className="scroll-mt-24">
                  <h2 className="font-display text-xl font-semibold text-white flex items-center gap-3">
                    <span className="text-accent-soft/60 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                    {sec.h}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-200">{sec.body}</p>
                  {sec.code && <CodeBlock code={sec.code.content} lang={sec.code.lang} />}
                </section>
              ))}
            </div>

            {/* 上一篇 / 下一篇 */}
            <div className="mt-16 grid gap-3 sm:grid-cols-2 border-t border-white/[0.06] pt-8">
              {prev ? (
                <Link to={`/docs/${prev.slug}`} className="panel group p-4 hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center gap-1.5 text-xs text-ink-400"><Icon.ArrowLeft className="h-3 w-3" /> 上一篇</div>
                  <div className="mt-1 font-medium text-white group-hover:text-accent-soft">{prev.title}</div>
                </Link>
              ) : <div />}
              {next ? (
                <Link to={`/docs/${next.slug}`} className="panel group p-4 text-right hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-ink-400">下一篇 <Icon.ArrowRight className="h-3 w-3" /></div>
                  <div className="mt-1 font-medium text-white group-hover:text-accent-soft">{next.title}</div>
                </Link>
              ) : <div />}
            </div>

            {/* 相关文档 */}
            {related.length > 0 && (
              <div className="mt-10">
                <div className="label">相关文档</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link key={r.slug} to={`/docs/${r.slug}`}
                      className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-white/[0.14] transition-colors">
                      <span className="text-sm text-ink-200 group-hover:text-white">{r.title}</span>
                      <Icon.ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-500 group-hover:text-accent-soft group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        </div>
      </div>
    </PageTransition>
  )
}
