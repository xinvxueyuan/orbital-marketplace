import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06]">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent-soft to-accent-deep">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="font-display text-sm font-semibold text-white">Orbital</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink-400 leading-relaxed">
              面向开发者团队的本地优先应用商城。下载、订阅、授权与更新，统一在一处管理。
            </p>
          </div>
          {[
            { title: '产品', items: [['浏览', '/apps'], ['订阅', '/subscriptions'], ['更新', '/updates'], ['资料库', '/library']] },
            { title: '资源', items: [['文档', '/apps'], ['更新日志', '/updates'], ['许可证条款', '/library'], ['状态', '/apps']] },
            { title: '公司', items: [['关于', '/'], ['厂商入驻', '/'], ['联系', '/'], ['隐私', '/']] }
          ].map((col) => (
            <div key={col.title}>
              <div className="label">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.items.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-ink-300 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
          <p className="text-xs text-ink-400">© 2025 Orbital Marketplace · 仅为演示用途</p>
          <p className="text-xs text-ink-400">所有应用数据均为虚构</p>
        </div>
      </div>
    </footer>
  )
}
