// Inline minimal icon set — single source of truth, no extra dependency.
import React from 'react'

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export const Icon = {
  Download: (p) => (
    <svg {...base} {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
  ),
  Check: (p) => (
    <svg {...base} {...p}><path d="m20 6-11 11-5-5" /></svg>
  ),
  Refresh: (p) => (
    <svg {...base} {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
  ),
  Key: (p) => (
    <svg {...base} {...p}><circle cx="7.5" cy="15.5" r="3.5" /><path d="m10 13 9-9" /><path d="m16 7 3 3" /><path d="m19 4 2 2" /></svg>
  ),
  Cart: (p) => (
    <svg {...base} {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h2.2l2.3 12.4a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.2L21 7H5" /></svg>
  ),
  Star: (p) => (
    <svg {...base} fill="currentColor" stroke="none" {...p}><path d="m12 2 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20l1.2-6.5L2.5 8.9 9 8z" /></svg>
  ),
  Search: (p) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  ArrowRight: (p) => (
    <svg {...base} {...p}><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>
  ),
  ArrowLeft: (p) => (
    <svg {...base} {...p}><path d="M19 12H5" /><path d="m11 19-7-7 7-7" /></svg>
  ),
  Sparkle: (p) => (
    <svg {...base} {...p}><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m6 6 2.5 2.5" /><path d="m15.5 15.5 2.5 2.5" /><path d="m18 6-2.5 2.5" /><path d="m8.5 15.5-2.5 2.5" /></svg>
  ),
  Grid: (p) => (
    <svg {...base} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  Box: (p) => (
    <svg {...base} {...p}><path d="M21 8 12 3 3 8l9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
  ),
  Clock: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  Shield: (p) => (
    <svg {...base} {...p}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  Tag: (p) => (
    <svg {...base} {...p}><path d="M3 11V4h7l11 11-7 7L3 11z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" /></svg>
  ),
  Trash: (p) => (
    <svg {...base} {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="m6 7 1 13h10l1-13" /></svg>
  ),
  Dot: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></svg>
  ),
  Close: (p) => (
    <svg {...base} {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></svg>
  )
}

export default Icon
