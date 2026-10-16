import { getIdToken, signOut } from './firebase'

// The AJ Clothing API (Django). It verifies the Firebase ID token we send and
// reads/writes Firebase Realtime Database on our behalf.
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://aj-clothing-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1')

const errorMessage = (data, status) => {
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') return data.error
    if (typeof data.detail === 'string') return data.detail
    const parts = Object.entries(data).map(
      ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
    )
    if (parts.length) return parts.join(' | ')
  }
  if (typeof data === 'string' && data) return data
  return status === 401 ? 'Your session has expired. Please sign in again.' : 'Request failed'
}

const request = async (method, path, body, isRetry = false) => {
  let token
  try {
    token = await getIdToken(isRetry)
  } catch (err) {
    // Only while developing locally (no sign-in, backend running with DEBUG=True) a placeholder token is used.
    // In production a missing sign-in is an error.
    if (!import.meta.env.DEV) throw err
    token = 'dev-token'
  }
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }

  // If 401 Unauthorized occurs and we have not retried yet, force-refresh the ID token and retry
  if (res.status === 401 && !isRetry && token !== 'dev-token') {
    try {
      return await request(method, path, body, true)
    } catch {
      // If retry still fails, sign out to clear stale credentials
      signOut().catch(() => {})
    }
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(errorMessage(data, res.status))
  return data
}


// Dashboard shows a short clock time for each stock movement.
const withTime = (rows) =>
  Array.isArray(rows)
    ? rows.map((m) => ({
        ...m,
        time: m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Today',
      }))
    : rows

export const api = {
  get: async (path) => {
    const data = await request('GET', path)
    return /^\/?(stock_movements|movements)\/?(\?.*)?$/.test(path) ? withTime(data) : data
  },
  post:   (path, body) => request('POST', path, body ?? {}),
  patch:  (path, body) => request('PATCH', path, body ?? {}),
  delete: (path)       => request('DELETE', path),
}

export default api
