import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import * as libraryApi from '../api/library.js'

const LibraryContext = createContext(null)

// state 形状（来自后端 LibraryEntryRead）：
//   installed / licenses / subscriptions 均为数组，元素形如
//   { id, userId, appId, kind, planId, licenseKey, createdAt }
export function LibraryProvider({ children }) {
  const [installed, setInstalled] = useState([])
  const [licenses, setLicenses] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  // updates 后端不跟踪，仅客户端本地状态（保留 Updates 页 UI）
  const [updates, setUpdates] = useState([])

  const refresh = useCallback(async () => {
    const data = await libraryApi.getLibrary()
    setInstalled(data.installed || [])
    setLicenses(data.licenses || [])
    setSubscriptions(data.subscriptions || [])
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const isInstalled = useCallback((appId) =>
    installed.some((e) => e.appId === appId), [installed])

  const hasLicense = useCallback((appId) =>
    licenses.some((e) => e.appId === appId), [licenses])

  const install = useCallback(async (appId) => {
    const entry = await libraryApi.install(appId)
    setInstalled((s) => (s.some((e) => e.appId === appId) ? s : [...s, entry]))
    return entry
  }, [])

  const uninstall = useCallback(async (appId) => {
    await libraryApi.uninstall(appId)
    setInstalled((s) => s.filter((e) => e.appId !== appId))
  }, [])

  const subscribe = useCallback(async (appId, planId) => {
    const entry = await libraryApi.subscribe(appId, planId)
    setSubscriptions((s) => [...s, entry])
    return entry
  }, [])

  // 后端无 cancel 端点，仅做客户端本地移除（reload 后会恢复）
  const cancelSubscription = useCallback((appId) => {
    setSubscriptions((s) => s.filter((e) => e.appId !== appId))
  }, [])

  const buyLicense = useCallback(async (appId, planId) => {
    const entry = await libraryApi.buyLicense(appId, planId)
    setLicenses((s) => [...s, entry])
    return entry
  }, [])

  const applyUpdate = useCallback((appId) => {
    setUpdates((s) => s.filter((id) => id !== appId))
  }, [])

  const subscriptionFor = useCallback((appId) =>
    subscriptions.find((e) => e.appId === appId), [subscriptions])

  const licenseFor = useCallback((appId) =>
    licenses.find((e) => e.appId === appId), [licenses])

  const hasUpdate = useCallback((appId) => updates.includes(appId), [updates])

  const value = useMemo(() => ({
    installed, licenses, subscriptions, updates,
    isInstalled, hasLicense, hasUpdate,
    install, uninstall, subscribe, cancelSubscription, buyLicense, applyUpdate,
    subscriptionFor, licenseFor, refresh
  }), [installed, licenses, subscriptions, updates,
    isInstalled, hasLicense, hasUpdate,
    install, uninstall, subscribe, cancelSubscription, buyLicense, applyUpdate,
    subscriptionFor, licenseFor, refresh])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider')
  return ctx
}
