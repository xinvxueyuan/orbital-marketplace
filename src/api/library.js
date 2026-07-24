import { get, post } from './client.js'

// GET /api/v1/library → {installed[], licenses[], subscriptions[]}
export const getLibrary = () => get('/library')

// POST /api/v1/library/install {appId} → LibraryEntryRead
export const install = (appId) => post('/library/install', { appId })

// POST /api/v1/library/uninstall {appId} → 200
export const uninstall = (appId) => post('/library/uninstall', { appId })

// POST /api/v1/library/subscribe {appId,planId} → LibraryEntryRead(kind=subscription)
export const subscribe = (appId, planId) => post('/library/subscribe', { appId, planId })

// POST /api/v1/library/buy-license {appId,planId} → LibraryEntryRead(kind=license)
export const buyLicense = (appId, planId) => post('/library/buy-license', { appId, planId })
