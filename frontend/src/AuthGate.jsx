import { useCallback, useEffect, useState } from 'react'
import App from './App'
import LoginPage from './pages/LoginPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import AccountErrorPage from './pages/AccountErrorPage'
import { onUserChange, signOut, refreshUser } from './api/firebase'
import api from './api/client'

// Decides what to show:
//   signed out                         -> Sign in / Create account
//   signed in + approved by the owner  -> the app
//   signed in, e-mail not verified     -> "Verify your email"
//   signed in, verified, not approved  -> "Waiting for approval"
// "Approved" comes from the API (GET /me/), which is the single source of truth.
export default function AuthGate() {
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [access, setAccess] = useState(null) // { approved, email_verified } from the API
  const [checking, setChecking] = useState(false)
  const [accessError, setAccessError] = useState('')
  // Local development shortcut (never offered in a production build).
  const devBypassAllowed = import.meta.env.DEV
  const [devBypass, setDevBypass] = useState(
    () => devBypassAllowed && localStorage.getItem('aj_dev_bypass') === 'true'
  )

  useEffect(() => onUserChange((u) => { setUser(u); setAccess(null); setAccessError('') }), [])

  const checkAccess = useCallback(async () => {
    setChecking(true)
    setAccessError('')
    try {
      const me = await api.get('/me/')
      setAccess(me)
      return me
    } catch (err) {
      setAccessError(err.message || 'Could not check your account. Please try again.')
      return null
    } finally {
      setChecking(false)
    }
  }, [])

  // Ask the API about the signed-in user whenever the user changes.
  useEffect(() => {
    if (user) checkAccess()
  }, [user, checkAccess])

  const handleBypass = () => {
    localStorage.setItem('aj_dev_bypass', 'true')
    setDevBypass(true)
  }

  const handleSignOut = () => {
    localStorage.removeItem('aj_dev_bypass')
    setDevBypass(false)
    setAccess(null)
    return signOut()
  }

  // "I have verified my email": refresh the account + token, then ask the API again.
  const handleVerifiedCheck = async () => {
    const fresh = await refreshUser()
    const me = await checkAccess()
    return Boolean(fresh?.emailVerified || me?.email_verified)
  }

  const loading = (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
      Loading…
    </div>
  )

  if (user === undefined) return loading
  if (!user) {
    if (devBypass) return <App userEmail="dev-staff@ajclothing.com" onSignOut={handleSignOut} />
    return <LoginPage onDevBypass={devBypassAllowed ? handleBypass : undefined} />
  }

  if (!access) {
    if (accessError) {
      return (
        <AccountErrorPage
          email={user.email}
          error={accessError}
          busy={checking}
          onRetry={checkAccess}
          onSignOut={handleSignOut}
        />
      )
    }
    return loading
  }

  if (access.approved) return <App userEmail={user.email || ''} onSignOut={handleSignOut} />

  if (!user.emailVerified && !access.email_verified) {
    return <VerifyEmailPage email={user.email} onCheck={handleVerifiedCheck} onSignOut={handleSignOut} />
  }

  return (
    <PendingApprovalPage
      email={user.email}
      busy={checking}
      onCheck={() => handleVerifiedCheck()}
      onSignOut={handleSignOut}
    />
  )
}
