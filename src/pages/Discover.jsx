import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import AppCard from '../components/AppCard.jsx'
import Icon from '../components/Icon.jsx'
import { categories } from '../data/apps.js'
import { listApps } from '../api/apps.js'
import { useLibrary } from '../context/LibraryContext.jsx'

const stats = [
  { label: '上架应用', value: '128' },
  { label: '入驻厂商', value: '34' },
  { label: '累计下载', value: '6.4M' },
  { label: '活跃订阅', value: '92K' }
]

export default function Discover() {
  const [apps, setApps] = useState([])
  const { subscriptions, updates, installed } = useLibrary()

  useEffect(() => {
    let cancelled = false
    listApps()
      .then((list) => { if (!cancelled) setApps(list || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const featuredApps = apps.filter((a) => a.featured)
  const hero = featuredApps[0]
  const rest = featuredApps.slice(1)

  if (!hero) {
    return (
      <PageTransition>
        <div className="container-x py-24 text-center text-sm text-ink-400">加载中…</div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      {/* HERO — full-bleed poster */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={hero.cover} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-ink-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
        </div>

        <div className="container-x pt-16 pb-20 lg:pt-24 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span className="chip mb-6 backdrop-blur-md">
              <Icon.Sparkle className="h-3.5 w-3.5 text-accent-soft" />
              本周精选 · {hero.name} {hero.update.to}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[0.98]">
              一处管理<br/>
              <span className="bg-gradient-to-r from-accent-soft via-white to-accent-glow bg-clip-text text-transparent">
                下载 · 订阅 · 授权
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-200 leading-relaxed">
              面向开发者团队的本地优先应用商城。一次安装，统一更新；订阅、永久授权与试用，在同一资料库里清晰可循。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={`/apps/${hero.id}`} className="btn-primary">
                <Icon.Download /> 下载 {hero.name}
              </Link>
              <Link to="/apps" className="btn-ghost">
                浏览全部应用 <Icon.ArrowRight />
              </Link>
            </div>

            {/* hero meta line */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-300">
              <span className="flex items-center gap-1.5"><Icon.Star className="h-3.5 w-3.5 text-amber-300" /> {hero.rating} · {hero.reviews.toLocaleString()} 评价</span>
              <span className="flex items-center gap-1.5"><Icon.Download className="h-3.5 w-3.5" /> {hero.downloads} 下载</span>
              <span className="flex items-center gap-1.5"><Icon.Box className="h-3.5 w-3.5" /> v{hero.version} · {hero.size}</span>
              <span className="flex items-center gap-1.5"><Icon.Shield className="h-3.5 w-3.5" /> 已签名校验</span>
            </div>
          </motion.div>

          {/* hero floating featured card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-80"
          >
            <Link to={`/apps/${hero.id}`} className="panel block p-5 hover:border-white/[0.14] transition-colors">
              <div className="flex items-center gap-3">
                <img src={hero.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                <div>
                  <div className="font-display font-semibold text-white">{hero.name}</div>
                  <div className="text-xs text-ink-400">{hero.vendor}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-300 leading-relaxed line-clamp-2">{hero.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {hero.tags.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                <span className="text-ink-400">{hero.license.trial}</span>
                <span className="text-accent-soft font-medium">查看详情 →</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS strip */}
      <section className="border-y border-white/[0.06] bg-ink-900/40">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="px-6 py-7 first:pl-0"
            >
              <div className="stat-num">{s.value}</div>
              <div className="label mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-x py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="label">精选应用</div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">编辑推荐</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-400">由编辑团队挑选的高质量应用，覆盖设计、开发、AI 与安全方向。</p>
          </div>
          <Link to="/apps" className="btn-quiet shrink-0">查看全部 <Icon.ArrowRight /></Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.concat(apps.filter((a) => !a.featured).slice(0, 1)).map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x pb-20">
        <div className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_2fr]">
            <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
              <div className="label">分类导航</div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">按方向浏览</h2>
              <p className="mt-3 text-sm text-ink-400">选择一个分类，快速找到适合你工作流的应用。</p>
              <Link to="/apps" className="mt-6 inline-flex btn-ghost">浏览全部分类 <Icon.ArrowRight /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-white/[0.05]">
              {categories.filter((c) => c.id !== 'all').map((c) => (
                <Link key={c.id} to={`/apps?cat=${c.id}`}
                  className="group flex items-center gap-3 p-6 transition-colors hover:bg-white/[0.03]">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-accent-soft text-lg transition-colors group-hover:border-accent/40 group-hover:bg-accent/10">
                    {c.icon}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-ink-400">{apps.filter((a) => a.category === c.id).length} 款</div>
                  </div>
                  <Icon.ArrowRight className="ml-auto h-4 w-4 text-ink-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT SUMMARY */}
      <section className="container-x pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { to: '/library',       icon: Icon.Box,      label: '我的资料库', value: installed.length, unit: '已安装', note: '查看与管理本机已安装应用' },
            { to: '/subscriptions', icon: Icon.Refresh,  label: '活跃订阅',   value: subscriptions.length, unit: '订阅中', note: '查看续费日期与席位' },
            { to: '/updates',       icon: Icon.Download, label: '待处理更新', value: updates.length, unit: '可更新', note: '一键应用全部可用更新' }
          ].map((s) => (
            <Link key={s.to} to={s.to} className="panel group p-6 hover:border-white/[0.14] transition-colors">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-accent-soft">
                  <s.icon />
                </span>
                <Icon.ArrowRight className="h-4 w-4 text-ink-500 transition-all group-hover:text-white group-hover:translate-x-0.5" />
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="stat-num">{s.value}</span>
                <span className="text-xs text-ink-400">{s.unit}</span>
              </div>
              <div className="mt-1 text-sm font-medium text-white">{s.label}</div>
              <div className="mt-1 text-xs text-ink-400">{s.note}</div>
            </Link>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
