import firebaseApi from './firebase'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://aj-clothing-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1')

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

// Delegated to Firebase Realtime Database adapter
export const api = {
  get:    (path)        => firebaseApi.get(path),
  post:   (path, body)  => firebaseApi.post(path, body),
  patch:  (path, body)  => firebaseApi.patch(path, body),
  delete: (path)        => firebaseApi.delete(path),
}

export default api
