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

  useEffect(() => onUserChange((u) => { setUser(u); setAccess(null); setAccessError('') }), [])

  const checkAccess = useCallback(async (forceRefresh = false) => {
    setChecking(true)
    setAccessError('')
    try {
      if (forceRefresh) {
        await refreshUser().catch(() => {})
      }
      const me = await api.get('/me/')
      setAccess(me)
      return me
    } catch (err) {
      // If the session has expired or is invalid, sign out cleanly to return to the sign in screen
      if (err.message && (err.message.toLowerCase().includes('expired') || err.message.toLowerCase().includes('sign in again'))) {
        await signOut().catch(() => {})
        return null
      }
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

  const handleSignOut = () => {
    setAccess(null)
    return signOut()
  }

  // "I have verified my email": refresh the account + token, then ask the API again.
  const handleVerifiedCheck = async () => {
    const fresh = await refreshUser()
    const me = await checkAccess(true)
    return Boolean(fresh?.emailVerified || me?.email_verified)
  }

  const loading = (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
      Loading…
    </div>
  )

  if (user === undefined) return loading
  if (!user) {
    return <LoginPage />
  }

  if (!access) {
    if (accessError) {
      return (
        <AccountErrorPage
          email={user.email}
          error={accessError}
          busy={checking}
          onRetry={() => checkAccess(true)}
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
