// 发卡机制纯常量（卡密类型 / 状态映射 / 统计工具）
// 卡密与订单数据改由 API 提供

// 卡密类型
export const cardTypes = [
  { id: 'subscription', name: '订阅码',   note: '兑换后激活对应订阅计划' },
  { id: 'perpetual',    name: '永久授权码', note: '兑换后获得永久使用权' },
  { id: 'trial',        name: '试用码',    note: '兑换后激活限时试用' }
]

// 卡密状态
export const cardStatus = {
  available: { label: '可用',   cls: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10' },
  sold:      { label: '已发放', cls: 'text-accent-soft border-accent/30 bg-accent/10' },
  redeemed:  { label: '已兑换', cls: 'text-violet-300 border-violet-400/20 bg-violet-400/10' },
  void:      { label: '已作废', cls: 'text-red-300 border-red-400/20 bg-red-400/10' }
}

// 发卡统计（纯函数）
export const vendingStats = (cards) => {
  const total = cards.length
  const available = cards.filter((c) => c.status === 'available').length
  const redeemed = cards.filter((c) => c.status === 'redeemed').length
  const sold = cards.filter((c) => c.status === 'sold').length
  const voided = cards.filter((c) => c.status === 'void').length
  return { total, available, redeemed, sold, voided }
}
