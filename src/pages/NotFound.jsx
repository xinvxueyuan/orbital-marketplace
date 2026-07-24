import { Link } from 'react-router'
import PageTransition from '../components/PageTransition.jsx'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <PageTransition>
      <div className="container-x grid place-items-center py-32 text-center">
        <div className="font-display text-[120px] font-semibold leading-none text-white/10">404</div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white">页面未找到</h1>
        <p className="mt-2 text-sm text-ink-400">你访问的链接可能已失效，或应用已下架。</p>
        <Link to="/" className="mt-6 btn-primary"><Icon.ArrowLeft /> 返回首页</Link>
      </div>
    </PageTransition>
  )
}
