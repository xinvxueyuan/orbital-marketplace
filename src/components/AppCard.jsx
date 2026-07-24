import { Link } from 'react-router'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'
import StatusBadge from './StatusBadge.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'
import { categories } from '../data/apps.js'

export default function AppCard({ app, index = 0, compact = false }) {
  const { isInstalled, hasUpdate, subscriptionFor, licenseFor } = useLibrary()
  const cat = categories.find((c) => c.id === app.category)

  const installed = isInstalled(app.id)
  const update = hasUpdate(app.id)
  const sub = subscriptionFor(app.id)
  const lic = licenseFor(app.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/apps/${app.id}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-900/60 transition-all duration-300 hover:border-white/[0.14] hover:bg-ink-800/60 hover:shadow-panel"
      >
        {/* cover */}
        <div className={`relative overflow-hidden ${compact ? 'aspect-[16/7]' : 'aspect-[16/9]'}`}>
          <img
            src={app.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {cat && <span className="chip backdrop-blur-md">{cat.icon} {cat.name}</span>}
            {update && <StatusBadge kind="pending" />}
            {sub && <StatusBadge kind="subscribed" />}
            {lic && <StatusBadge kind="licensed" />}
            {installed && !update && !sub && !lic && <StatusBadge kind="installed" />}
          </div>
        </div>

        {/* body */}
        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <img
              src={app.icon}
              alt=""
              loading="lazy"
              className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate font-display text-base font-semibold text-white">{app.name}</h3>
                <div className="flex items-center gap-1 text-xs text-ink-300">
                  <Icon.Star className="h-3.5 w-3.5 text-amber-300" />
                  <span className="font-medium text-ink-100">{app.rating}</span>
                </div>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-400">{app.vendor}</p>
              <p className="mt-2 line-clamp-2 text-sm text-ink-300 leading-relaxed">{app.tagline}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3.5">
            <div className="flex items-center gap-3 text-[11px] text-ink-400">
              <span className="flex items-center gap-1"><Icon.Download className="h-3.5 w-3.5" /> {app.downloads}</span>
              <span className="flex items-center gap-1"><Icon.Box className="h-3.5 w-3.5" /> v{app.version}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-soft transition-all group-hover:gap-1.5">
              查看 <Icon.ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
