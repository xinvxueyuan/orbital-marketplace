import { get } from './client.js'

// GET /api/v1/apps?q=&category=&sort= → AppRead[]
export const listApps = (params = {}) => get('/apps', params)

// GET /api/v1/apps/{id} → AppRead
export const getApp = (id) => get(`/apps/${id}`)
