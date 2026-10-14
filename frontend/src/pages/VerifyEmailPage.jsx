import { useState } from 'react'
import { resendVerification, authErrorMessage } from '../api/firebase'
import AuthShell from '../components/auth/AuthShell'

export default function VerifyEmailPage({ email, onCheck, onSignOut }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const run = async (fn, okMsg) => {
    setBusy(true)
    setMsg('')
    setErr('')
    try {
      const result = await fn()
      setMsg(okMsg(result))
    } catch (e) {
      setErr(authErrorMessage(e))
    }
    setBusy(false)
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a verification link to ${email || 'your email address'}. Open it, then come back here. Check your spam folder if you cannot find it.`}
    >
      {err && <div className="notice error" role="alert" style={{ marginBottom: 12 }}>{err}</div>}
      {msg && <div className="notice" role="status" style={{ marginBottom: 12 }}>{msg}</div>}

      <button
        type="button"
        className="btn primary full"
        disabled={busy}
        onClick={() => run(onCheck, (verified) => (verified ? '' : 'Your email is not verified yet. Please open the link we sent you, then try again.'))}
      >
        {busy ? 'Checking…' : 'I have verified my email'}
      </button>
      <button
        type="button"
        className="btn full"
        disabled={busy}
        style={{ marginTop: 8 }}
        onClick={() => run(resendVerification, () => 'A new verification email has been sent.')}
      >
        Resend verification email
      </button>
      <button
        type="button"
        className="btn tiny"
        style={{ marginTop: 14, display: 'block', marginInline: 'auto' }}
        onClick={onSignOut}
      >
        Sign out
      </button>
    </AuthShell>
  )
}
