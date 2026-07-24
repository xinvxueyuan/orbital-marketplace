import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { listApps } from '../api/apps.js'
import { useLibrary } from '../context/LibraryContext.jsx'

// 后端 LibraryEntry 不跟踪 seats / renewsOn，这里从 createdAt 推导
// renewsOn = createdAt + 1 个月（YYYY-MM-DD）
const renewsOnFrom = (createdAt) => {
  const d = new Date(createdAt)
  if (isNaN(d.getTime())) return createdAt || '—'
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

export default function Subscriptions() {
  const { subscriptions, cancelSubscription } = useLibrary()
  const [toast, setToast] = useState(null)
  const [appsList, setAppsList] = useState([])
  const appMap = useMemo(() => {
    const m = {}
    for (const a of appsList) m[a.id] = a
    return m
  }, [appsList])

  useEffect(() => {
    listApps()
      .then((list) => setAppsList(list || []))
      .catch(() => {})
  }, [])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2400) }

  const monthly = subscriptions.reduce((sum, s) => {
    const app = appMap[s.appId]
    const plan = app?.plans.find((p) => p.planId === s.planId)
    return sum + (plan?.price || 0)
  }, 0)

  const nextRenew = subscriptions
    .map((s) => renewsOnFrom(s.createdAt))
    .sort()[0]

  return (
    <PageTransition>
      <div className="container-x py-12">
        <div className="flex flex-col gap-2">
          <div className="label">订阅</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">我的订阅</h1>
          <p className="text-sm text-ink-400">管理按月付费的应用订阅，查看续费日期与席位。</p>
        </div>

        {/* summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="panel p-5">
            <div className="label">活跃订阅</div>
            <div className="stat-num mt-2">{subscriptions.length}</div>
          </div>
          <div className="panel p-5">
            <div className="label">月度支出</div>
            <div className="stat-num mt-2">¥{monthly}<span className="text-sm text-ink-400"> /月</span></div>
          </div>
          <div className="panel p-5">
            <div className="label">下次续费</div>
            <div className="stat-num mt-2">{nextRenew || '—'}</div>
          </div>
        </div>

        {/* list */}
        {subscriptions.length === 0 ? (
          <EmptyState
            icon={<Icon.Refresh />}
            title="还没有任何订阅"
            desc="浏览应用目录，找到适合你工作流的工具并订阅。"
            cta="浏览应用"
            to="/apps"
          />
        ) : (
          <div className="mt-8 space-y-3">
            <AnimatePresence>
              {subscriptions.map((s, i) => {
                const app = appMap[s.appId]
                if (!app) return null
                const plan = app.plans.find((p) => p.planId === s.planId)
                return (
                  <motion.div
                    key={s.appId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className="panel group p-5 hover:border-white/[0.14] transition-colors"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Link to={`/apps/${app.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                        <img src={app.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-white">{app.name}</span>
                            <StatusBadge kind="subscribed" />
                          </div>
                          <div className="truncate text-xs text-ink-400">{app.vendor} · {plan?.name} 计划</div>
                        </div>
                      </Link>

                      <div className="grid grid-cols-3 gap-6 sm:flex sm:items-center sm:gap-8">
                        <div>
                          <div className="label">价格</div>
                          <div className="mt-1 text-sm font-medium text-white">¥{plan?.price}<span className="text-ink-400">/月</span></div>
                        </div>
                        <div>
                          <div className="label">席位</div>
                          <div className="mt-1 text-sm font-medium text-white">1</div>
                        </div>
                        <div>
                          <div className="label">续费</div>
                          <div className="mt-1 text-sm font-medium text-white">{renewsOnFrom(s.createdAt)}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => { cancelSubscription(s.appId); flash(`已取消 ${app.name} 订阅`) }}
                        className="btn-quiet text-red-300 hover:text-red-200 hover:bg-red-500/10"
                      >
                        <Icon.Close /> 取消
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/95 px-4 py-3 text-sm text-white shadow-panel backdrop-blur-md"
          >
            <Icon.Check className="h-4 w-4 text-emerald-300" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

export function EmptyState({ icon, title, desc, cta, to }) {
  return (
    <div className="mt-16 grid place-items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] text-ink-400">
        {icon}
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-400">{desc}</p>
      {cta && to && (
        <Link to={to} className="mt-5 btn-primary">{cta} <Icon.ArrowRight /></Link>
      )}
    </div>
  )
}
