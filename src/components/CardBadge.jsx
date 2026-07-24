import { cardStatus } from '../data/vending.js'
import Icon from './Icon.jsx'

// 卡密状态徽章 — 使用 vending.js 中的 cardStatus 映射
export default function CardBadge({ status, withDot = true }) {
  const s = cardStatus[status]
  if (!s) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${s.cls}`}>
      {withDot && <Icon.Dot width={6} height={6} />}
      {s.label}
    </span>
  )
}
