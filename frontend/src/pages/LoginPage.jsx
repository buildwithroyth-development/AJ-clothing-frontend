import { useState } from 'react'
import { signIn, registerUser, sendPasswordReset, authErrorMessage } from '../api/firebase'
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
  const [mode, setMode] = useState('signin') // 'signin' | 'register' | 'forgot'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setFormError('')
    setPassword('')
    setConfirm('')
    setResetSent(false)
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !name.trim()) e.name = 'Please enter your full name.'
    if (!email.trim()) e.email = 'Email address is required.'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.'

    if (mode !== 'forgot') {
      if (!password) e.password = 'Password is required.'
      else if (mode === 'register' && password.length < 6) e.password = 'Password must be at least 6 characters.'
      if (mode === 'register' && confirm !== password) e.confirm = 'Passwords do not match.'
    }
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (mode === 'forgot' && resetSent) {
      switchMode('signin')
      return
    }

    const e = validate()
    setErrors(e)
    setFormError('')
    if (Object.keys(e).length > 0) return

    setBusy(true)
    try {
      if (mode === 'register') {
        await registerUser({ name, email, password })
      } else if (mode === 'forgot') {
        await sendPasswordReset(email)
        setResetSent(true)
      } else {
        await signIn(email, password)
      }
      // On success the app notices the new session and shows the next screen.
    } catch (err) {
      if (mode === 'forgot') {
        if (err?.code === 'auth/user-not-found') {
          setErrors({ email: 'No account was found with this email address.' })
        } else {
          setFormError(authErrorMessage(err, 'Could not send password reset email.'))
        }
      } else {
        const msg = authErrorMessage(err, 'Could not complete the request.')
        if (err?.code === 'auth/email-already-in-use') setErrors({ email: msg })
        else setFormError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  let title = 'Sign in'
  let subtitle = 'Sign in to manage stock and billing.'

  if (isRegister) {
    title = 'Create your account'
    subtitle = 'We will email you a link to verify your address before you can sign in.'
  } else if (isForgot) {
    title = 'Reset your password'
    subtitle = resetSent
      ? 'Check your inbox for password reset instructions.'
      : 'Enter your email address and we will send you a password reset link.'
  }

  return (
    <AuthShell
      title={title}
      subtitle={subtitle}
      onSubmit={handleSubmit}
    >
      {!isForgot ? (
        <div style={{ display: 'flex', marginBottom: 16 }} role="tablist">
          <button type="button" role="tab" aria-selected={!isRegister} style={tabStyle(!isRegister)} onClick={() => switchMode('signin')}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={isRegister} style={tabStyle(isRegister)} onClick={() => switchMode('register')}>
            Create account
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => switchMode('signin')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ← Back to Sign in
          </button>
        </div>
      )}

      {formError && (
        <div className="notice error" role="alert" style={{ marginBottom: 12 }}>
          {formError}
        </div>
      )}

      {isForgot && resetSent ? (
        <div>
          <div className="notice success" role="status" style={{ marginBottom: 16 }}>
            Password reset email sent to <strong>{email}</strong>. Please check your inbox and spam folder, click the link to reset your password, and then sign in.
          </div>
          <button
            type="button"
            className="btn primary full"
            onClick={() => switchMode('signin')}
          >
            Back to Sign in
          </button>
        </div>
      ) : (
        <>
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

          {!isForgot && (
            <>
              <label htmlFor="auth-password" style={{ marginTop: 10, display: 'block' }}>Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div style={fieldError}>{errors.password}</div>}

              {!isRegister && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

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
            {busy
              ? (isRegister ? 'Creating account…' : isForgot ? 'Sending reset link…' : 'Signing in…')
              : (isRegister ? 'Create account' : isForgot ? 'Send reset link' : 'Sign in')}
          </button>

          {isForgot && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 13,
                  textDecoration: 'underline',
                }}
              >
                Cancel and return to Sign in
              </button>
            </div>
          )}
        </>
      )}
    </AuthShell>
  )
}
