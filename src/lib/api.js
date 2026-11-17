// Thin fetch wrapper around the DeepWeed Express API.
// Hosted builds call the backend at VITE_API_URL (set at build time). Only `npm run dev` uses '' (Vite's dev proxy).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
if (import.meta.env.PROD && !BASE) console.error('VITE_API_URL was not set when this site was built - API calls will fail. See DEPLOY.md.')
const TOKEN_KEY = 'deepweed.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body, headers = {}, raw = false, auth = true } = {}) {
  const h = { ...headers }
  const token = tokenStore.get()
  if (auth && token) h.Authorization = `Bearer ${token}`
  let payload = body
  if (body && !raw) {
    h['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers: h, body: payload })
  } catch {
    throw Object.assign(new ApiError('Cannot reach the server. Is the backend running?', 0), { key: 'err.networkWeb' })
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) tokenStore.clear()
    const detail = data?.details?.fieldErrors
      ? Object.values(data.details.fieldErrors).flat().join(' ')
      : ''
    const apiErr = new ApiError([data?.error, detail].filter(Boolean).join(' — ') || `Request failed (${res.status})`, res.status, data?.details)
    if (res.status === 403) apiErr.key = 'err.forbidden'
    if (res.status === 409) apiErr.key = 'err.duplicate'
    throw apiErr
  }
  return data
}

export const api = {
  register: (b) => request('/api/auth/register', { method: 'POST', body: b, auth: false }),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b, auth: false }),
  me: () => request('/api/auth/me'),
  // raw image bytes -> top-3 species + herbicides (steps 3-11 of the flow)
  predict: (blob) =>
    request('/api/predict', { method: 'POST', body: blob, raw: true, headers: { 'Content-Type': blob.type || 'image/jpeg' }, auth: false }),
  // scans & feedback (steps 14-17)
  saveScan: (b) => request('/api/scans', { method: 'POST', body: b }),
  scans: (limit = 20, offset = 0) => request(`/api/scans?limit=${limit}&offset=${offset}`),
  deleteScan: (id) => request(`/api/scans/${id}`, { method: 'DELETE' }),
  sendFeedback: (b) => request('/api/feedback', { method: 'POST', body: b }),
  // fire-and-forget: wakes a sleeping free-tier backend, which in turn wakes the model service
  wake: () => fetch(`${BASE}/api/predict/status`).catch(() => {}),
  myFeedback: () => request('/api/feedback/my'),
  feedbackInbox: (status) => request(`/api/feedback?limit=200${status ? `&status=${status}` : ''}`),
  feedbackSummary: () => request('/api/feedback/summary'),
  updateFeedback: (id, b) => request(`/api/feedback/${id}`, { method: 'PATCH', body: b }),
  markReplySeen: (id) => request(`/api/feedback/${id}/seen`, { method: 'PATCH' }),
  herbicides: (q) => request(`/api/herbicide${q ? `?q=${encodeURIComponent(q)}` : ''}`, { auth: false }),
  herbicide: (id) => request(`/api/herbicide/${id}`, { auth: false }),
  createHerbicide: (b) => request('/api/herbicide', { method: 'POST', body: b }),
  updateHerbicide: (id, b) => request(`/api/herbicide/${id}`, { method: 'PUT', body: b }),
  deleteHerbicide: (id) => request(`/api/herbicide/${id}`, { method: 'DELETE' }),
}
