import { useState } from 'react'
import Icon from './Icon.jsx'

// 代码块组件 — 带语言标签与复制按钮
export default function CodeBlock({ code, lang = 'text' }) {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950/80">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-400">{lang}</span>
        <button onClick={onCopy}
          className="flex items-center gap-1.5 text-[11px] text-ink-400 transition-colors hover:text-white">
          {copied ? <Icon.Check className="h-3 w-3 text-emerald-300" /> : <Icon.Tag className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-ink-100">{code}</code>
      </pre>
    </div>
  )
}
