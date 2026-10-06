const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    let msg = 'Request failed'
    if (data && typeof data === 'object') {
      msg = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ')
    } else if (typeof data === 'string') {
      msg = data
    }
    throw new Error(msg)
  }
  return data
}

export const api = {
  get:    (path)        => apiFetch(path),
  post:   (path, body)  => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body)  => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)        => apiFetch(path, { method: 'DELETE' }),
}

export default api
