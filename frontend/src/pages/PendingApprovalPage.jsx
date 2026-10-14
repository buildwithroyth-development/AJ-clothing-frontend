import AuthShell from '../components/auth/AuthShell'

export default function PendingApprovalPage({ email, busy, error, onCheck, onSignOut }) {
  return (
    <AuthShell
      title="Waiting for approval"
      subtitle={`${email || 'Your account'} is verified. The store owner needs to approve your account before you can use AJ Clothing. Ask them to approve it, then check again.`}
    >
      {error && <div className="notice error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}
      <button type="button" className="btn primary full" disabled={busy} onClick={onCheck}>
        {busy ? 'Checking…' : 'Check again'}
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
