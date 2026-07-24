import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { listApps } from '../api/apps.js'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useVending } from '../context/VendingContext.jsx'
import { EmptyState } from './Subscriptions.jsx'

const sections = [
  { id: 'installed', label: '已安装',  icon: Icon.Box     },
  { id: 'licensed',  label: '授权',    icon: Icon.Key     },
  { id: 'recent',    label: '最近浏览', icon: Icon.Clock   }
]

export default function Library() {
  const { installed, licenses, uninstall, subscribe, buyLicense } = useLibrary()
  const vending = useVending()
  const [toast, setToast] = useState(null)
  const [active, setActive] = useState('installed')
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [appMap, setAppMap] = useState({})

  useEffect(() => {
    listApps()
      .then((list) => {
        const map = {}
        for (const a of list || []) map[a.id] = a
        setAppMap(map)
      })
      .catch(() => {})
  }, [])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2400) }

  const installedApps = installed.map((e) => appMap[e.appId]).filter(Boolean)
  const licenseApps = licenses.map((l) => ({ ...appMap[l.appId], lic: l })).filter((a) => a.id)

  const onRedeem = async (e) => {
    e.preventDefault()
    const result = await vending.redeem(redeemCode)
    if (!result.ok) {
      setRedeemError(result.error)
      return
    }
    // 兑换成功：把权益加入资料库
    const card = result.card
    const app = appMap[card.appId]
    if (card.type === 'perpetual') await buyLicense(card.appId, card.planId)
    else if (card.type === 'subscription') await subscribe(card.appId, card.planId)
    flash(`兑换成功 · ${app?.name} 权益已激活`)
    setRedeemOpen(false)
    setRedeemCode('')
    setRedeemError('')
  }

  return (
    <PageTransition>
      <div className="container-x py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="label">资料库</div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">我的应用</h1>
            <p className="text-sm text-ink-400">管理已安装应用、永久授权与本地许可证密钥。</p>
          </div>
          <button onClick={() => setRedeemOpen(true)} className="btn-primary shrink-0">
            <Icon.Key /> 兑换卡密
          </button>
        </div>

        {/* summary cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="label">已安装</div>
              <Icon.Box className="h-4 w-4 text-accent-soft" />
            </div>
            <div className="stat-num mt-2">{installed.length}</div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="label">永久授权</div>
              <Icon.Key className="h-4 w-4 text-violet-300" />
            </div>
            <div className="stat-num mt-2">{licenses.length}</div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="label">本地存储</div>
              <Icon.Box className="h-4 w-4 text-ink-400" />
            </div>
            <div className="stat-num mt-2">
              {installedApps.reduce((s, a) => s + parseFloat(a.size), 0).toFixed(0)}<span className="text-sm text-ink-400"> MB</span>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-white/[0.06]">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${active === s.id ? 'text-white' : 'text-ink-400 hover:text-ink-100'}`}>
              <s.icon className="h-4 w-4" /> {s.label}
              {active === s.id && (
                <motion.span layoutId="lib-tab" className="absolute -bottom-px left-0 h-0.5 w-full bg-gradient-to-r from-accent-soft to-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {active === 'installed' && (
                installedApps.length === 0 ? (
                  <EmptyState icon={<Icon.Box />} title="还没有安装任何应用" desc="浏览目录，下载你的第一款应用。" cta="浏览应用" to="/apps" />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {installedApps.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="panel group p-5 hover:border-white/[0.14] transition-colors"
                      >
                        <Link to={`/apps/${app.id}`} className="flex items-center gap-3">
                          <img src={app.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-white">{app.name}</div>
                            <div className="truncate text-xs text-ink-400">v{app.version} · {app.size}</div>
                          </div>
                          <StatusBadge kind="installed" />
                        </Link>
                        <div className="mt-4 flex gap-2 border-t border-white/[0.06] pt-3">
                          <Link to={`/apps/${app.id}`} className="btn-quiet flex-1 justify-center text-xs">详情</Link>
                          <button onClick={async () => { await uninstall(app.id); flash(`已卸载 ${app.name}`) }}
                            className="btn-quiet text-red-300 hover:bg-red-500/10 text-xs">
                            <Icon.Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {active === 'licensed' && (
                licenseApps.length === 0 ? (
                  <EmptyState icon={<Icon.Key />} title="没有永久授权" desc="在应用详情页购买永久授权后，密钥会显示在这里。" cta="浏览应用" to="/apps" />
                ) : (
                  <div className="space-y-3">
                    {licenseApps.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="panel p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <Link to={`/apps/${app.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                            <img src={app.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-white">{app.name}</span>
                                <StatusBadge kind="licensed" />
                              </div>
                              <div className="truncate text-xs text-ink-400">{app.vendor} · {app.lic.planId === 'node' ? '节点永久授权' : app.lic.planId}</div>
                            </div>
                          </Link>

                          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 lg:max-w-md">
                            <Icon.Key className="h-4 w-4 shrink-0 text-violet-300" />
                            <code className="flex-1 truncate font-mono text-xs text-ink-100">{app.lic.licenseKey}</code>
                            <button
                              onClick={() => { navigator.clipboard?.writeText(app.lic.licenseKey); flash('授权码已复制到剪贴板') }}
                              className="shrink-0 text-xs text-accent-soft hover:text-white"
                            >
                              复制
                            </button>
                          </div>

                          <div className="text-xs text-ink-400">
                            购买于 {app.lic.createdAt}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {active === 'recent' && (
                <EmptyState icon={<Icon.Clock />} title="暂无浏览记录" desc="你最近查看过的应用会显示在这里。" cta="浏览应用" to="/apps" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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

      {/* 兑换卡密模态框 */}
      <AnimatePresence>
        {redeemOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
            onClick={() => { setRedeemOpen(false); setRedeemError('') }}
          >
            <motion.form
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={onRedeem}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-ink-900 p-6 shadow-panel"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-soft">
                  <Icon.Key />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">兑换卡密</h3>
                  <p className="text-xs text-ink-400">输入卡密码以激活对应权益。</p>
                </div>
              </div>

              <div className="mt-5">
                <label className="label">卡密码</label>
                <input
                  value={redeemCode}
                  onChange={(e) => { setRedeemCode(e.target.value); setRedeemError('') }}
                  placeholder="ORB-XXXX-XXXX-XXXX"
                  autoFocus
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-ink-950 px-4 py-3 font-mono text-sm text-white placeholder:text-ink-500 focus:border-accent/40 focus:outline-none"
                />
                {redeemError && (
                  <p className="mt-2 text-xs text-red-300">{redeemError}</p>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => { setRedeemOpen(false); setRedeemError('') }}
                  className="btn-ghost flex-1 justify-center">
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">兑换</button>
              </div>
              <p className="mt-3 text-center text-[11px] text-ink-400">
                卡密可在购买应用时自动发放，或在「发卡」页查看
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
