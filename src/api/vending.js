import { get, post } from './client.js'

// GET /api/v1/cards?appId=&status= → CardRead[]
export const listCards = (params = {}) => get('/cards', params)

// POST /api/v1/cards/batch {appId,planId,type,count} → CardRead[]
export const batchIssue = ({ appId, planId, type, count }) =>
  post('/cards/batch', { appId, planId, type, count })

// POST /api/v1/cards/auto-issue {appId,planId,type,price,buyer} → {order, card}
export const autoIssue = ({ appId, planId, type, price, buyer }) =>
  post('/cards/auto-issue', { appId, planId, type, price, buyer })

// POST /api/v1/cards/redeem {code} → CardRead
export const redeem = (code) => post('/cards/redeem', { code })

// POST /api/v1/cards/{id}/void → CardRead
export const voidCard = (id) => post(`/cards/${id}/void`)

// GET /api/v1/orders → OrderRead[]
export const listOrders = () => get('/orders')

// POST /api/v1/orders {appId,planId,type,price,buyer} → {order, card}
export const createOrder = ({ appId, planId, type, price, buyer }) =>
  post('/orders', { appId, planId, type, price, buyer })
