import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import * as vendingApi from '../api/vending.js'

const VendingContext = createContext(null)

// 后端 redeem 错误码 → 友好提示（保持原返回形状 { ok, card?, error? }）
const REDEEM_ERRORS = {
  voided: '该卡密已作废',
  redeemed: '该卡密已兑换',
  not_found: '卡密码不存在',
  not_issued: '该卡密尚未发放，无法兑换'
}

export function VendingProvider({ children }) {
  const [cards, setCards] = useState([])
  const [orders, setOrders] = useState([])

  const refreshCards = useCallback(async () => {
    const data = await vendingApi.listCards()
    setCards(data || [])
  }, [])

  const refreshOrders = useCallback(async () => {
    const data = await vendingApi.listOrders()
    setOrders(data || [])
  }, [])

  useEffect(() => {
    refreshCards()
    refreshOrders()
  }, [refreshCards, refreshOrders])

  // 查询某应用某计划的可用库存数量
  const stockFor = useCallback((appId, planId) =>
    cards.filter((c) => c.appId === appId && c.planId === planId && c.status === 'available').length,
    [cards])

  // 批量生成卡密
  const issue = useCallback(async (appId, planId, type, count = 1) => {
    const newCards = await vendingApi.batchIssue({ appId, planId, type, count })
    await refreshCards()
    return newCards
  }, [refreshCards])

  // 自动发卡：从库存分配一张可用卡并创建订单，返回 { order, card }
  // 库存不足（409 out_of_stock）抛错，让页面 catch
  const autoIssue = useCallback(async (appId, planId, type, price, buyer) => {
    const result = await vendingApi.autoIssue({ appId, planId, type, price, buyer })
    await refreshCards()
    await refreshOrders()
    return result
  }, [refreshCards, refreshOrders])

  // 作废卡密
  const voidCard = useCallback(async (cardId) => {
    const card = await vendingApi.voidCard(cardId)
    await refreshCards()
    return card
  }, [refreshCards])

  // 兑换卡密：返回 { ok, card?, error? }（保持原形状以便 Library.jsx 兼容）
  const redeem = useCallback(async (code) => {
    try {
      const card = await vendingApi.redeem(code)
      return { ok: true, card }
    } catch (e) {
      return { ok: false, error: REDEEM_ERRORS[e.code] || e.message || '兑换失败' }
    }
  }, [])

  const value = useMemo(() => ({
    cards, orders,
    stockFor, issue, autoIssue, voidCard, redeem,
    refreshCards, refreshOrders
  }), [cards, orders, stockFor, issue, autoIssue, voidCard, redeem, refreshCards, refreshOrders])

  return <VendingContext.Provider value={value}>{children}</VendingContext.Provider>
}

export function useVending() {
  const ctx = useContext(VendingContext)
  if (!ctx) throw new Error('useVending must be used inside VendingProvider')
  return ctx
}
