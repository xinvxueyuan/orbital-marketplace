import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'
import CardBadge from '../components/CardBadge.jsx'
import { useVending } from '../context/VendingContext.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'
import { listApps } from '../api/apps.js'
import { cardTypes, vendingStats } from '../data/vending.js'

const tabs = [
  { id: 'stock',   label: '库存概览', icon: Icon.Box    },
  { id: 'cards',   label: '卡密列表', icon: Icon.Key    },
  { id: 'orders',  label: '订单记录', icon: Icon.Cart   },
  { id: 'issue',   label: '生成卡密', icon: Icon.Sparkle }
]

export default function Vending() {
  const { cards, orders, issue, voidCard, stockFor } = useVending()
  const [tab, setTab] = useState('stock')
  const [toast, setToast] = useState(null)
  const [filterApp, setFilterApp] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // 应用列表：从 API 拉取一次，构建 appMap / appsList 供本页查找
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

  // 生成表单状态
  const [form, setForm] = useState({
    appId: 'nova-studio',
    planId: 'pro',
    type: 'subscription',
    count: 5
  })

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600) }

  const stats = vendingStats(cards)

  // 按应用×计划聚合库存（基于已加载应用列表与 plans）
  const stockMatrix = useMemo(() => {
    const map = {}
    for (const app of appsList) {
      for (const plan of app.plans || []) {
        const key = `${app.id}:${plan.planId}`
        map[key] = {
          app, plan,
          available: cards.filter((c) => c.appId === app.id && c.planId === plan.planId && c.status === 'available').length,
          total: cards.filter((c) => c.appId === app.id && c.planId === plan.planId).length
        }
      }
    }
    return Object.values(map)
  }, [cards, appsList])

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (filterApp !== 'all' && c.appId !== filterApp) return false
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      return true
    })
  }, [cards, filterApp, filterStatus])

  const onIssue = async (e) => {
    e.preventDefault()
    try {
      const newCards = await issue(form.appId, form.planId, form.type, form.count)
      const app = appMap[form.appId]
      flash(`已生成 ${newCards?.length || 0} 张卡密 · ${app?.name || ''}`)
      setTab('cards')
    } catch (err) {
      flash(`生成失败 · ${err?.message || ''}`)
    }
  }

  const onVoid = async (card) => {
    try {
      await voidCard(card.id)
      flash(`已作废卡密 ${card.code}`)
    } catch (err) {
      flash(`作废失败 · ${err?.message || ''}`)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code)
    flash(`已复制 ${code}`)
  }

  // 当前选中应用的可选计划
  const formApp = appMap[form.appId]
  const formPlans = formApp?.plans || []

  return (
    <PageTransition>
      <div className="container-x py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="label">发卡机制</div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">发卡中心</h1>
            <p className="mt-2 text-sm text-ink-400">批量生成卡密、自动发放、库存预警与订单管理。</p>
          </div>
          <button onClick={() => setTab('issue')} className="btn-primary shrink-0">
            <Icon.Sparkle /> 生成卡密
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: '总卡密',   value: stats.total,     icon: Icon.Box,    color: 'text-ink-100' },
            { label: '可用',     value: stats.available, icon: Icon.Check,  color: 'text-emerald-300' },
            { label: '已发放',   value: stats.sold,      icon: Icon.Cart,   color: 'text-accent-soft' },
            { label: '已兑换',   value: stats.redeemed,  icon: Icon.Key,    color: 'text-violet-300' },
            { label: '已作废',   value: stats.voided,    icon: Icon.Trash,  color: 'text-red-300' }
          ].map((s) => (
            <div key={s.label} className="panel p-5">
              <div className="flex items-center justify-between">
                <div className="label">{s.label}</div>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="stat-num mt-2">{s.value}</div>
            </div>
          ))}
        </div>

        {/* 自动发卡说明条 */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.06] px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent-soft">
            <Icon.Sparkle />
          </span>
          <p className="text-sm text-ink-200">
            <span className="font-medium text-white">自动发卡已启用。</span>
            当用户在应用详情页完成支付时，系统会自动从对应计划库存中分配一张卡密并发放给买家。库存不足时订单会进入待补货状态。
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-white/[0.06]">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-white' : 'text-ink-400 hover:text-ink-100'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
              {tab === t.id && (
                <motion.span layoutId="vend-tab" className="absolute -bottom-px left-0 h-0.5 w-full bg-gradient-to-r from-accent-soft to-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {/* 库存概览 */}
              {tab === 'stock' && (
                <div className="panel overflow-hidden">
                  <div className="border-b border-white/[0.06] px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-white">按应用 × 计划的库存</h2>
                    <p className="mt-1 text-xs text-ink-400">可用 / 总数 · 低于 3 张将触发预警。</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-ink-400">
                          <th className="px-5 py-3 font-medium">应用 / 计划</th>
                          <th className="px-5 py-3 font-medium">类型</th>
                          <th className="px-5 py-3 font-medium text-right">可用</th>
                          <th className="px-5 py-3 font-medium text-right">总数</th>
                          <th className="px-5 py-3 font-medium">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockMatrix.map((row) => (
                          <tr key={`${row.app.id}:${row.plan.planId}`} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={row.app.icon} alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" />
                                <div>
                                  <div className="font-medium text-white">{row.app.name}</div>
                                  <div className="text-xs text-ink-400">{row.plan.name} · ¥{row.plan.price}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-ink-300">
                              {row.plan.cycle === 'once' ? '永久' : row.plan.cycle === 'forever' ? '免费' : '订阅'}
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-white">{row.available}</td>
                            <td className="px-5 py-3 text-right font-mono text-ink-400">{row.total}</td>
                            <td className="px-5 py-3">
                              {row.available === 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[11px] font-medium text-red-300">
                                  <Icon.Dot width={6} height={6} /> 缺货
                                </span>
                              ) : row.available < 3 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                  <Icon.Dot width={6} height={6} /> 偏低
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                  <Icon.Dot width={6} height={6} /> 充足
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 卡密列表 */}
              {tab === 'cards' && (
                <div>
                  {/* 筛选条 */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)}
                      className="rounded-lg border border-white/[0.08] bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-accent/40 focus:outline-none">
                      <option value="all">全部应用</option>
                      {appsList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-lg border border-white/[0.08] bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-accent/40 focus:outline-none">
                      <option value="all">全部状态</option>
                      <option value="available">可用</option>
                      <option value="sold">已发放</option>
                      <option value="redeemed">已兑换</option>
                      <option value="void">已作废</option>
                    </select>
                    <span className="text-xs text-ink-400">共 {filteredCards.length} 张</span>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredCards.map((card, i) => {
                        const app = appMap[card.appId]
                        const plan = app?.plans.find((p) => p.planId === card.planId)
                        return (
                          <motion.div
                            key={card.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ delay: Math.min(i * 0.02, 0.15) }}
                            className="panel group p-4 hover:border-white/[0.14] transition-colors"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <img src={app?.icon} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-white">{app?.name}</span>
                                    <span className="text-xs text-ink-400">· {plan?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <code className="font-mono text-xs text-ink-200">{card.code}</code>
                                    <button onClick={() => copyCode(card.code)} className="text-ink-400 hover:text-accent-soft" title="复制">
                                      <Icon.Tag className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-xs text-ink-400">
                                  {cardTypes.find((t) => t.id === card.type)?.name}
                                </div>
                                <div className="text-xs text-ink-400 hidden sm:block">
                                  {card.createdAt}
                                </div>
                                <CardBadge status={card.status} />
                                {(card.status === 'available' || card.status === 'sold') && (
                                  <button onClick={() => onVoid(card)}
                                    className="btn-quiet text-red-300 hover:bg-red-500/10 px-2 py-1.5 text-xs">
                                    <Icon.Trash className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    {filteredCards.length === 0 && (
                      <div className="panel p-12 text-center text-sm text-ink-400">没有匹配的卡密。</div>
                    )}
                  </div>
                </div>
              )}

              {/* 订单记录 */}
              {tab === 'orders' && (
                <div className="panel overflow-hidden">
                  <div className="border-b border-white/[0.06] px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-white">订单记录</h2>
                    <p className="mt-1 text-xs text-ink-400">每笔订单自动关联一张发放的卡密。</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-ink-400">
                          <th className="px-5 py-3 font-medium">订单号</th>
                          <th className="px-5 py-3 font-medium">应用 / 计划</th>
                          <th className="px-5 py-3 font-medium">类型</th>
                          <th className="px-5 py-3 font-medium text-right">金额</th>
                          <th className="px-5 py-3 font-medium">卡密</th>
                          <th className="px-5 py-3 font-medium">状态</th>
                          <th className="px-5 py-3 font-medium">日期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => {
                          const app = appMap[o.appId]
                          const plan = app?.plans.find((p) => p.planId === o.planId)
                          const card = cards.find((c) => c.id === o.cardId)
                          return (
                            <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="px-5 py-3 font-mono text-xs text-ink-200">{o.id}</td>
                              <td className="px-5 py-3">
                                <Link to={`/apps/${o.appId}`} className="flex items-center gap-2 hover:text-accent-soft">
                                  <img src={app?.icon} alt="" className="h-7 w-7 rounded-md object-cover ring-1 ring-white/10" />
                                  <div>
                                    <div className="text-white">{app?.name}</div>
                                    <div className="text-xs text-ink-400">{plan?.name}</div>
                                  </div>
                                </Link>
                              </td>
                              <td className="px-5 py-3 text-ink-300">
                                {cardTypes.find((t) => t.id === o.type)?.name}
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-white">¥{o.price}</td>
                              <td className="px-5 py-3">
                                {card ? (
                                  <button onClick={() => copyCode(card.code)} className="font-mono text-xs text-accent-soft hover:underline" title="复制卡密">
                                    {card.code.slice(0, 13)}…
                                  </button>
                                ) : '—'}
                              </td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                  <Icon.Dot width={6} height={6} /> 已完成
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-ink-400">{o.createdAt}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 生成卡密 */}
              {tab === 'issue' && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <form onSubmit={onIssue} className="panel p-6">
                    <h2 className="font-display text-lg font-semibold text-white">批量生成卡密</h2>
                    <p className="mt-1 text-xs text-ink-400">选择应用与计划，系统会立即生成对应数量的可用卡密。</p>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="label">应用</label>
                        <select value={form.appId} onChange={(e) => {
                          const appId = e.target.value
                          const a = appMap[appId]
                          const firstPlan = a?.plans?.[0]?.planId || 'pro'
                          setForm({ ...form, appId, planId: firstPlan })
                        }}
                          className="mt-2 w-full rounded-lg border border-white/[0.08] bg-ink-900 px-3 py-2.5 text-sm text-ink-100 focus:border-accent/40 focus:outline-none">
                          {appsList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="label">计划</label>
                        <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}
                          className="mt-2 w-full rounded-lg border border-white/[0.08] bg-ink-900 px-3 py-2.5 text-sm text-ink-100 focus:border-accent/40 focus:outline-none">
                          {formPlans.map((p) => <option key={p.planId} value={p.planId}>{p.name} · ¥{p.price} ({p.cycle})</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="label">卡密类型</label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {cardTypes.map((t) => (
                            <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })}
                              className={`rounded-lg border px-3 py-2.5 text-left transition-all ${form.type === t.id ? 'border-accent/40 bg-accent/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'}`}>
                              <div className="text-sm font-medium text-white">{t.name}</div>
                              <div className="mt-0.5 text-[10px] text-ink-400 leading-tight">{t.note}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="label">数量</label>
                        <div className="mt-2 flex items-center gap-3">
                          <input type="range" min="1" max="50" step="1" value={form.count}
                            onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) })}
                            className="flex-1" />
                          <span className="font-mono text-sm text-white w-10 text-right">{form.count}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          {[5, 10, 25, 50].map((n) => (
                            <button key={n} type="button" onClick={() => setForm({ ...form, count: n })}
                              className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-ink-300 hover:text-white hover:border-white/[0.16]">
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary mt-6 w-full">
                      <Icon.Sparkle /> 生成 {form.count} 张卡密
                    </button>
                  </form>

                  {/* 预览与说明 */}
                  <div className="space-y-4">
                    <div className="panel p-6">
                      <div className="label">当前库存</div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="stat-num">{stockFor(form.appId, form.planId)}</span>
                        <span className="text-sm text-ink-400">张可用</span>
                      </div>
                      <p className="mt-2 text-xs text-ink-400">
                        生成后将增加到 <span className="text-ink-200">{appMap[form.appId]?.name} · {formApp?.plans.find((p) => p.planId === form.planId)?.name}</span> 的库存中。
                      </p>
                    </div>

                    <div className="panel p-6">
                      <div className="label">卡密码格式</div>
                      <code className="mt-3 block rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-sm text-accent-soft">
                        ORB-XXXX-XXXX-XXXX
                      </code>
                      <p className="mt-3 text-xs text-ink-400 leading-relaxed">
                        32 位字母表去除易混淆字符（0/O、1/I），每张卡密全局唯一。生成后状态为「可用」，购买时自动转为「已发放」，兑换后转为「已兑换」。
                      </p>
                    </div>

                    <div className="panel p-6">
                      <div className="label">参考：状态机</div>
                      <pre className="mt-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-300">
{`available ──购买──▶ sold ──兑换──▶ redeemed
    │                 │
    └─── 作废 ──▶ void ◀┘`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
