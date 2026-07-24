import { get } from './client.js'

// GET /api/v1/docs → {categories[], docs[]}
export const listDocs = () => get('/docs')

// GET /api/v1/docs/{slug} → DocRead
export const getDoc = (slug) => get(`/docs/${slug}`)
