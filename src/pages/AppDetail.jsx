import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getApp, listApps } from '../api/apps.js'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useVending } from '../context/VendingContext.jsx'

const tabs = [
  { id: 'overview', label: '概览' },
  { id: 'plans',    label: '订阅与授权' },
  { id: 'updates',  label: '更新历史' }
]

export default function AppDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const lib = useLibrary()
  const vending = useVending()
  const [tab, setTab] = useState('overview')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [activeShot, setActiveShot] = useState(0)
  const [toast, setToast] = useState(null)
  const [issuedCard, setIssuedCard] = useState(null)

  const [app, setApp] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setNotFound(false); setApp(null); setRelated([]); setActiveShot(0)
    getApp(id)
      .then((data) => {
        if (cancelled) return
        setApp(data)
        setLoading(false)
        return listApps({ category: data.category })
          .then((list) => {
            if (cancelled) return
            setRelated((list || []).filter((a) => a.id !== data.id).slice(0, 3))
          })
          .catch(() => {})
      })
      .catch((e) => {
        if (cancelled) return
        if (e.status === 404) setNotFound(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="container-x py-24 text-center text-ink-400">加载中…</div>
      </PageTransition>
    )
  }

  if (notFound || !app) {
    return (
      <PageTransition>
        <div className="container-x py-24 text-center">
          <h1 className="font-display text-3xl font-semibold text-white">应用未找到</h1>
          <p className="mt-2 text-sm text-ink-400">该应用可能已下架或链接有误。</p>
          <Link to="/apps" className="mt-6 btn-primary"><Icon.ArrowLeft /> 返回目录</Link>
        </div>
      </PageTransition>
    )
  }

  const installed = lib.isInstalled(app.id)
  const update = lib.hasUpdate(app.id)
  const sub = lib.subscriptionFor(app.id)
  const lic = lib.licenseFor(app.id)
  const license = app.license || {}
  const updateInfo = app.update || {}

  const onInstall = async () => {
    if (installed) { await lib.uninstall(app.id); flash(`已卸载 ${app.name}`) }
    else { await lib.install(app.id); flash(`开始下载 ${app.name} v${app.version} · ${app.size}`) }
  }

  const onSubscribe = async (planId) => {
    const plan = app.plans.find((p) => p.planId === planId)
    try {
      const result = await vending.autoIssue(app.id, planId, 'subscription', plan.price)
      await lib.subscribe(app.id, planId)
      setIssuedCard(result.card)
      flash(`已订阅 ${app.name} · ${plan.name} · 卡密已自动发放`)
    } catch (e) {
      await lib.subscribe(app.id, planId)
      flash(`已订阅 ${app.name} · ${plan.name}（库存不足，未发卡）`)
    }
    setSelectedPlan(null)
  }

  const onBuyLicense = async (planId) => {
    const plan = app.plans.find((p) => p.planId === planId)
    try {
      const result = await vending.autoIssue(app.id, planId, 'perpetual', plan.price)
      await lib.buyLicense(app.id, planId)
      setIssuedCard(result.card)
      flash(`购买成功 · ${app.name} ${plan.name} · 授权卡密已发放`)
    } catch (e) {
      await lib.buyLicense(app.id, planId)
      flash(`购买成功 · 授权码已生成（卡密库存不足）`)
    }
    setSelectedPlan(null)
  }

  const onApplyUpdate = () => {
    lib.applyUpdate(app.id)
    flash(`已应用更新 v${updateInfo.to}`)
  }

  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 h-[420px]">
          <img src={app.cover} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />
        </div>

        <div className="container-x pt-10 pb-10">
          <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition-colors">
            <Icon.ArrowLeft className="h-4 w-4" /> 返回目录
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-5">
              <img src={app.icon} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/15 shadow-panel" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-4xl font-semibold tracking-tight text-white">{app.name}</h1>
                  {sub && <StatusBadge kind="subscribed" />}
                  {lic && <StatusBadge kind="licensed" />}
                  {installed && !update && <StatusBadge kind="installed" />}
                  {update && <StatusBadge kind="pending" />}
                </div>
                <p className="mt-1 text-sm text-ink-300">{app.vendor}</p>
                <p className="mt-3 max-w-xl text-ink-200">{app.tagline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-300">
                  <span className="flex items-center gap-1.5"><Icon.Star className="h-4 w-4 text-amber-300" /> <span className="font-medium text-white">{app.rating}</span> · {app.reviews.toLocaleString()} 评价</span>
                  <span className="flex items-center gap-1.5"><Icon.Download /> {app.downloads} 下载</span>
                  <span className="flex items-center gap-1.5"><Icon.Box /> v{app.version}</span>
                  <span className="flex items-center gap-1.5"><Icon.Clock /> 更新于 {app.updatedAt}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {app.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="panel p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="label">起始价</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-3xl font-semibold text-white">
                        ¥{Math.min(...app.plans.filter((p) => p.price > 0).map((p) => p.price), app.plans.find((p) => p.price === 0) ? 0 : 999)}
                      </span>
                      <span className="text-xs text-ink-400">/ 起</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-ink-400">
                    <div>{license.trial}</div>
                    <div>{license.model === 'perpetual' ? '永久授权' : '按席位'}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {update ? (
                    <button onClick={onApplyUpdate} className="btn-primary w-full">
                      <Icon.Refresh /> 更新到 v{updateInfo.to}
                    </button>
                  ) : (
                    <button onClick={onInstall} className={`w-full ${installed ? 'btn-ghost' : 'btn-primary'}`}>
                      {installed ? <><Icon.Check /> 已安装 · 卸载</> : <><Icon.Download /> 下载 · {app.size}</>}
                    </button>
                  )}
                  <button onClick={() => setTab('plans')} className="btn-ghost w-full">
                    <Icon.Tag /> 查看订阅与授权
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4 text-center">
                  <div><div className="stat-num text-lg">{app.size.split(' ')[0]}</div><div className="text-[10px] text-ink-400">MB</div></div>
                  <div><div className="stat-num text-lg">{app.rating}</div><div className="text-[10px] text-ink-400">评分</div></div>
                  <div><div className="stat-num text-lg">{app.downloads}</div><div className="text-[10px] text-ink-400">下载</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="container-x">
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-white' : 'text-ink-400 hover:text-ink-100'}`}>
              {t.label}
              {tab === t.id && (
                <motion.span layoutId="tab-underline" className="absolute -bottom-px left-0 h-0.5 w-full bg-gradient-to-r from-accent-soft to-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'overview' && (
                <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">关于此应用</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-200">{app.description}</p>

                    {/* screenshots */}
                    <h3 className="mt-10 font-display text-lg font-semibold text-white">截图</h3>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06]">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeShot}
                          src={app.screenshots[activeShot]}
                          alt=""
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </AnimatePresence>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {app.screenshots.map((s, i) => (
                        <button key={i} onClick={() => setActiveShot(i)}
                          className={`h-14 w-24 overflow-hidden rounded-lg border transition-all ${activeShot === i ? 'border-accent ring-2 ring-accent/30' : 'border-white/[0.08] opacity-60 hover:opacity-100'}`}>
                          <img src={s} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* info panel */}
                  <aside className="space-y-6">
                    <div className="panel p-5">
                      <div className="label">信息</div>
                      <dl className="mt-4 space-y-3 text-sm">
                        {[
                          ['版本', app.version],
                          ['大小', app.size],
                          ['类别', app.category],
                          ['厂商', app.vendor],
                          ['发布日期', app.releasedAt],
                          ['最近更新', app.updatedAt],
                          ['授权模型', license.model === 'perpetual' ? '永久授权' : '按席位'],
                          ['试用', license.trial]
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4">
                            <dt className="text-ink-400">{k}</dt>
                            <dd className="font-medium text-ink-100">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="panel p-5">
                      <div className="label">信任与安全</div>
                      <ul className="mt-4 space-y-2.5 text-sm text-ink-200">
                        <li className="flex items-center gap-2"><Icon.Shield className="h-4 w-4 text-emerald-300" /> 已签名校验</li>
                        <li className="flex items-center gap-2"><Icon.Check className="h-4 w-4 text-emerald-300" /> 无恶意代码扫描通过</li>
                        <li className="flex items-center gap-2"><Icon.Key className="h-4 w-4 text-emerald-300" /> 端到端加密分发</li>
                      </ul>
                    </div>
                  </aside>
                </div>
              )}

              {tab === 'plans' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* subscription plans */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon.Refresh className="h-4 w-4 text-accent-soft" />
                      <h2 className="font-display text-xl font-semibold text-white">订阅计划</h2>
                    </div>
                    <p className="mt-1 text-sm text-ink-400">按月或按年付费，可随时取消。</p>
                    <div className="mt-5 space-y-3">
                      {app.plans.filter((p) => p.cycle !== 'once' && p.cycle !== 'contact').map((plan) => {
                        const active = sub?.planId === plan.planId
                        return (
                          <div key={plan.planId}
                            className={`panel p-5 transition-all ${selectedPlan?.type === 'sub' && selectedPlan?.id === plan.planId ? 'border-accent/40 shadow-glow' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
                                  {plan.price === 0 && <StatusBadge kind="free" withDot={false} />}
                                  {active && <StatusBadge kind="subscribed" />}
                                </div>
                                <p className="mt-1 text-xs text-ink-400">{plan.note}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-display text-2xl font-semibold text-white">¥{plan.price}</div>
                                <div className="text-[10px] text-ink-400">/ {plan.cycle === 'forever' ? '永久' : '月'}</div>
                              </div>
                            </div>
                            <div className="mt-4">
                              {active ? (
                                <button onClick={() => { lib.cancelSubscription(app.id); flash(`已取消 ${app.name} 订阅`) }}
                                  className="btn-ghost w-full"><Icon.Close /> 取消订阅</button>
                              ) : (
                                <button onClick={() => onSubscribe(plan.planId)}
                                  className="btn-primary w-full"><Icon.Refresh /> 订阅</button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* perpetual / license */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon.Key className="h-4 w-4 text-violet-300" />
                      <h2 className="font-display text-xl font-semibold text-white">永久授权</h2>
                    </div>
                    <p className="mt-1 text-sm text-ink-400">一次性购买，长期使用，含一年更新。</p>
                    <div className="mt-5 space-y-3">
                      {app.plans.filter((p) => p.cycle === 'once' || p.cycle === 'contact').length === 0 && (
                        <div className="panel p-5 text-sm text-ink-400">此应用暂不提供永久授权方案，请使用订阅。</div>
                      )}
                      {app.plans.filter((p) => p.cycle === 'once' || p.cycle === 'contact').map((plan) => {
                        const active = lic?.planId === plan.planId
                        return (
                          <div key={plan.planId} className="panel p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
                                  {active && <StatusBadge kind="licensed" />}
                                </div>
                                <p className="mt-1 text-xs text-ink-400">{plan.note}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-display text-2xl font-semibold text-white">
                                  {plan.price === 0 ? '联系销售' : `¥${plan.price}`}
                                </div>
                                {plan.price > 0 && <div className="text-[10px] text-ink-400">一次性</div>}
                              </div>
                            </div>
                            <div className="mt-4">
                              {active ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                                    <Icon.Key className="h-4 w-4 text-violet-300" />
                                    <code className="flex-1 font-mono text-xs text-ink-100">{lic.licenseKey}</code>
                                    <button onClick={() => { navigator.clipboard?.writeText(lic.licenseKey); flash('授权码已复制') }}
                                      className="text-xs text-accent-soft hover:text-white">复制</button>
                                  </div>
                                  <p className="text-[11px] text-ink-400">购买于 {lic.createdAt} · 1 席位</p>
                                </div>
                              ) : (
                                <button onClick={() => onBuyLicense(plan.planId)}
                                  className="btn-ghost w-full" style={{ borderColor: 'rgba(167,139,250,0.3)' }}>
                                  <Icon.Cart /> {plan.price === 0 ? '联系销售' : '购买授权'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'updates' && (
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white">更新历史</h2>
                      <p className="mt-1 text-sm text-ink-400">当前版本 v{app.version} · 发布于 {app.updatedAt}</p>
                    </div>
                    {update && (
                      <button onClick={onApplyUpdate} className="btn-primary"><Icon.Refresh /> 应用此更新</button>
                    )}
                  </div>

                  <ol className="mt-8 space-y-6 border-l border-white/[0.08] pl-6">
                    <li className="relative">
                      <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-accent ring-4 ring-ink-950">
                        <Icon.Dot width={6} height={6} className="text-white" />
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-white">v{updateInfo.to}</h3>
                        {update && <StatusBadge kind="pending" />}
                        {!update && installed && <StatusBadge kind="installed" />}
                      </div>
                      <p className="text-xs text-ink-400">从 v{updateInfo.from} 升级 · {updateInfo.size}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-ink-200">
                        {(updateInfo.notes || []).map((n, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Icon.Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> {n}
                          </li>
                        ))}
                      </ul>
                    </li>
                    {[1, 2].map((i) => (
                      <li key={i} className="relative opacity-60">
                        <span className="absolute -left-[27px] top-1 h-4 w-4 rounded-full border border-white/20 bg-ink-900 ring-4 ring-ink-950" />
                        <h3 className="font-display text-base font-semibold text-white">v{(parseFloat(updateInfo.from) - i * 0.1).toFixed(1)}.0</h3>
                        <p className="text-xs text-ink-400">历史版本</p>
                        <ul className="mt-3 space-y-1.5 text-sm text-ink-300">
                          <li className="flex items-start gap-2"><Icon.Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" /> 稳定性改进与错误修复</li>
                          <li className="flex items-start gap-2"><Icon.Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" /> 性能优化</li>
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="container-x pb-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-white">相关应用</h2>
            <Link to={`/apps?cat=${app.category}`} className="btn-quiet">更多同类 <Icon.ArrowRight /></Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => (
              <Link key={a.id} to={`/apps/${a.id}`}
                className="group panel flex items-center gap-4 p-4 hover:border-white/[0.14] transition-colors">
                <img src={a.icon} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{a.name}</div>
                  <div className="truncate text-xs text-ink-400">{a.tagline}</div>
                </div>
                <Icon.ArrowRight className="ml-auto h-4 w-4 text-ink-500 transition-all group-hover:text-white group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 自动发卡展示 — 购买后弹出，可复制卡密码 */}
      <AnimatePresence>
        {issuedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
            onClick={() => setIssuedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-accent/30 bg-ink-900 p-6 shadow-glow"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Icon.Check />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">卡密已自动发放</h3>
                  <p className="text-xs text-ink-400">订单完成，已从库存分配一张卡密给你。</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="label">兑换码</div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-950 px-4 py-3">
                  <Icon.Key className="h-4 w-4 shrink-0 text-accent-soft" />
                  <code className="flex-1 font-mono text-sm text-white">{issuedCard.code}</code>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(issuedCard.code); flash('卡密码已复制') }}
                    className="text-xs font-medium text-accent-soft hover:text-white"
                  >
                    复制
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="text-ink-400">类型</div>
                  <div className="mt-0.5 text-white">{issuedCard.type === 'perpetual' ? '永久授权码' : issuedCard.type === 'trial' ? '试用码' : '订阅码'}</div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="text-ink-400">订单</div>
                  <div className="mt-0.5 font-mono text-white">o{Date.now().toString().slice(-6)}</div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Link to="/vending" className="btn-ghost flex-1 justify-center" onClick={() => setIssuedCard(null)}>
                  查看发卡中心
                </Link>
                <button onClick={() => setIssuedCard(null)} className="btn-primary flex-1">完成</button>
              </div>
              <p className="mt-3 text-center text-[11px] text-ink-400">
                可在「资料库」页点击「兑换卡密」激活权益
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-xl border border-accent/30 bg-ink-900/95 px-4 py-3 text-sm text-white shadow-glow backdrop-blur-md"
          >
            <Icon.Check className="h-4 w-4 text-emerald-300" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
