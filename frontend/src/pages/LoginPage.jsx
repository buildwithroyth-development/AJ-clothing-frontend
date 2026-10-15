import { useState } from 'react'
import { signIn, registerUser, authErrorMessage } from '../api/firebase'
import AuthShell from '../components/auth/AuthShell'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

const tabStyle = (active) => ({
  flex: 1,
  padding: '9px 0',
  border: 0,
  borderBottom: `2px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
  background: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  color: active ? 'var(--accent)' : 'var(--muted)',
})

const fieldError = { color: '#9f3c31', fontSize: 11, marginTop: 4 }

export default function LoginPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setFormError('')
    setPassword('')
    setConfirm('')
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !name.trim()) e.name = 'Please enter your full name.'
    if (!email.trim()) e.email = 'Email address is required.'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    else if (mode === 'register' && password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (mode === 'register' && confirm !== password) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setFormError('')
    if (Object.keys(e).length > 0) return

    setBusy(true)
    try {
      if (mode === 'register') await registerUser({ name, email, password })
      else await signIn(email, password)
      // On success the app notices the new session and shows the next screen.
    } catch (err) {
      const msg = authErrorMessage(err, 'Could not complete the request.')
      if (err?.code === 'auth/email-already-in-use') setErrors({ email: msg })
      else setFormError(msg)
      setBusy(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <AuthShell
      title={isRegister ? 'Create your account' : 'Sign in'}
      subtitle={
        isRegister
          ? 'We will email you a link to verify your address before you can sign in.'
          : 'Sign in to manage stock and billing.'
      }
      onSubmit={handleSubmit}
    >
      <div style={{ display: 'flex', marginBottom: 16 }} role="tablist">
        <button type="button" role="tab" aria-selected={!isRegister} style={tabStyle(!isRegister)} onClick={() => switchMode('signin')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={isRegister} style={tabStyle(isRegister)} onClick={() => switchMode('register')}>
          Create account
        </button>
      </div>

      {formError && (
        <div className="notice error" role="alert" style={{ marginBottom: 12 }}>
          {formError}
        </div>
      )}

      {isRegister && (
        <>
          <label htmlFor="auth-name">Full name</label>
          <input id="auth-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <div style={fieldError}>{errors.name}</div>}
        </>
      )}

      <label htmlFor="auth-email" style={{ marginTop: isRegister ? 10 : 0, display: 'block' }}>Email</label>
      <input
        id="auth-email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <div style={fieldError}>{errors.email}</div>}

      <label htmlFor="auth-password" style={{ marginTop: 10, display: 'block' }}>Password</label>
      <input
        id="auth-password"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <div style={fieldError}>{errors.password}</div>}

      {isRegister && (
        <>
          <label htmlFor="auth-confirm" style={{ marginTop: 10, display: 'block' }}>Confirm password</label>
          <input
            id="auth-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm && <div style={fieldError}>{errors.confirm}</div>}
        </>
      )}

      <button type="submit" className="btn primary full" disabled={busy} style={{ marginTop: 16 }}>
        {busy ? (isRegister ? 'Creating account…' : 'Signing in…') : isRegister ? 'Create account' : 'Sign in'}
      </button>
    </AuthShell>
  )
}
