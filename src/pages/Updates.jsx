import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { listApps } from '../api/apps.js'
import { useLibrary } from '../context/LibraryContext.jsx'
import { EmptyState } from './Subscriptions.jsx'

export default function Updates() {
  const { updates, applyUpdate, installed } = useLibrary()
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(null)

  // 应用列表：从 API 拉取一次，构建 appMap 供本页查找
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

  const applyOne = async (appId) => {
    setBusy(appId)
    setTimeout(() => {
      lib_apply(appId)
      setBusy(null)
    }, 900)
  }
  const lib_apply = (appId) => {
    const app = appMap[appId]
    applyUpdate(appId)
    flash(`${app?.name} 已更新到 v${app?.update?.to}`)
  }

  const applyAll = async () => {
    for (const id of [...updates]) {
      setBusy(id)
      await new Promise((r) => setTimeout(r, 500))
      lib_apply(id)
    }
    setBusy(null)
  }

  const totalSize = updates.reduce((sum, id) => {
    const a = appMap[id]
    return sum + parseFloat(a?.update?.size || '0')
  }, 0)

  return (
    <PageTransition>
      <div className="container-x py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="label">更新</div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">可用更新</h1>
            <p className="mt-2 text-sm text-ink-400">
              {updates.length > 0
                ? `${updates.length} 个应用有可用更新 · 总计约 ${totalSize.toFixed(0)} MB`
                : '所有已安装应用均为最新版本。'}
            </p>
          </div>
          {updates.length > 0 && (
            <button onClick={applyAll} disabled={busy !== null}
              className="btn-primary shrink-0">
              <Icon.Refresh className={busy ? 'animate-spin' : ''} /> 全部更新
            </button>
          )}
        </div>

        {updates.length === 0 ? (
          <EmptyState
            icon={<Icon.Check />}
            title="已是最新"
            desc="你的已安装应用都已是最新版本，无需任何操作。"
            cta="浏览应用"
            to="/apps"
          />
        ) : (
          <div className="mt-8 space-y-3">
            <AnimatePresence>
              {updates.map((id, i) => {
                const app = appMap[id]
                if (!app) return null
                const updateInfo = app.update || {}
                const isBusy = busy === id
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.04 }}
                    className="panel p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <Link to={`/apps/${app.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                        <img src={app.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-white">{app.name}</span>
                            <StatusBadge kind="pending" />
                          </div>
                          <div className="truncate text-xs text-ink-400">{app.vendor}</div>
                        </div>
                      </Link>

                      {/* version diff */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-xs text-ink-300">v{updateInfo.from}</span>
                        <Icon.ArrowRight className="h-4 w-4 text-accent-soft" />
                        <span className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent-soft">v{updateInfo.to}</span>
                        <span className="text-xs text-ink-400">· {updateInfo.size}</span>
                      </div>

                      <button
                        onClick={() => applyOne(id)}
                        disabled={isBusy}
                        className="btn-primary shrink-0"
                      >
                        {isBusy ? <><Icon.Refresh className="animate-spin" /> 更新中…</> : <><Icon.Download /> 更新</>}
                      </button>
                    </div>

                    {/* changelog */}
                    <div className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
                      {(updateInfo.notes || []).map((n, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-ink-300">
                          <Icon.Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* recently up to date */}
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-white">已安装且为最新</h2>
          <p className="mt-1 text-sm text-ink-400">这些应用没有待处理的更新。</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {installed.filter((e) => !updates.includes(e.appId)).map((e) => {
              const app = appMap[e.appId]
              if (!app) return null
              return (
                <Link key={e.appId} to={`/apps/${app.id}`} className="panel group flex items-center gap-3 p-4 hover:border-white/[0.14] transition-colors">
                  <img src={app.icon} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{app.name}</div>
                    <div className="truncate text-xs text-ink-400">v{app.version}</div>
                  </div>
                  <StatusBadge kind="installed" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-ink-900/95 px-4 py-3 text-sm text-white shadow-panel backdrop-blur-md"
          >
            <Icon.Check className="h-4 w-4 text-emerald-300" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
