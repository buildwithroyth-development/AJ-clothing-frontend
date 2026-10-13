import { useState } from 'react'
import { signIn } from '../api/firebase'
import logoImg from '../assets/AJ_logo.png'

const friendlyError = (err) => {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return err?.message || 'Could not sign in.'
  }
}

export default function LoginPage({ onDevBypass }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(friendlyError(err))
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'var(--bg)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <img src={logoImg} alt="AJ Clothing" style={{ height: 36 }} />
          <span className="eyebrow">AJ CLOTHING</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22 }}>Staff sign in</h1>
        <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: 13 }}>
          Sign in to manage stock and billing.
        </p>

        {error && (
          <div className="notice error" role="alert" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="login-password" style={{ marginTop: 10, display: 'block' }}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="btn primary full"
          disabled={busy}
          style={{ marginTop: 16 }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {onDevBypass && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
              — or local development —
            </div>
            <button
              type="button"
              className="btn full"
              onClick={onDevBypass}
              style={{ background: '#f5f0e6', borderColor: 'var(--line)', fontSize: 13, color: 'var(--ink)' }}
            >
              Continue without Sign In (Dev Mode)
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
