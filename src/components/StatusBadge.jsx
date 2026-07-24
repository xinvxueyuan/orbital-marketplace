import Icon from './Icon.jsx'

const map = {
  installed:  { label: '已安装',  cls: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10' },
  pending:    { label: '待更新',  cls: 'text-amber-300 border-amber-400/20 bg-amber-400/10' },
  subscribed: { label: '订阅中',  cls: 'text-accent-soft border-accent/30 bg-accent/10' },
  licensed:   { label: '已授权',  cls: 'text-violet-300 border-violet-400/20 bg-violet-400/10' },
  trial:      { label: '试用中',  cls: 'text-sky-300 border-sky-400/20 bg-sky-400/10' },
  free:       { label: '免费',    cls: 'text-ink-200 border-white/10 bg-white/[0.04]' }
}

export default function StatusBadge({ kind, withDot = true }) {
  const s = map[kind]
  if (!s) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${s.cls}`}>
      {withDot && <Icon.Dot width={6} height={6} />}
      {s.label}
    </span>
  )
}
