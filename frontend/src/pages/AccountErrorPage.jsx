import AuthShell from '../components/auth/AuthShell'

// Shown when the app could not check the signed-in account with the API
// (server down, server not set up, or the sign-in is no longer valid).
export default function AccountErrorPage({ email, error, busy, onRetry, onSignOut }) {
  return (
    <AuthShell
      title="We couldn't check your account"
      subtitle={email ? `Signed in as ${email}.` : undefined}
    >
      <div className="notice error" role="alert" style={{ marginBottom: 12 }}>
        {error || 'Something went wrong. Please try again.'}
      </div>
      <button type="button" className="btn primary full" disabled={busy} onClick={onRetry}>
        {busy ? 'Trying…' : 'Try again'}
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
