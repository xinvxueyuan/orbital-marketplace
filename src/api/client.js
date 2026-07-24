// Orbital API 客户端 — 薄封装 fetch
// baseURL 默认 /api/v1（开发期走 vite 代理，生产同源）

const BASE_URL = '/api/v1'

// 构建 query string，跳过 null/undefined/空字符串
function buildQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== null && v !== undefined && v !== '') params.set(k, v)
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

// request(method, path, { query, body }) → 解析后的 JSON
// 失败抛 Error，附带 status / code / message
export async function request(method, path, { query, body } = {}) {
  const url = BASE_URL + path + buildQuery(query)
  const opts = { method, headers: {} }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, opts)
  } catch (e) {
    const err = new Error(e?.message || 'network error')
    err.status = 0
    err.code = 'network'
    throw err
  }

  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = null }
  }

  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.code = data?.error || 'error'
    err.message = data?.message || err.message
    throw err
  }

  return data
}

export const get = (path, query) => request('GET', path, { query })
export const post = (path, body) => request('POST', path, { body })
