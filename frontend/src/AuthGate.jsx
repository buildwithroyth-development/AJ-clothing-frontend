import { useEffect, useState } from 'react'
import App from './App'
import LoginPage from './pages/LoginPage'
import { onUserChange, signOut } from './api/firebase'

// Shows the login page until a staff member is signed in.
export default function AuthGate() {
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [devBypass, setDevBypass] = useState(
    () => localStorage.getItem('aj_dev_bypass') === 'true'
  )

  useEffect(() => onUserChange(setUser), [])

  const handleBypass = () => {
    localStorage.setItem('aj_dev_bypass', 'true')
    setDevBypass(true)
  }

  const handleSignOut = () => {
    localStorage.removeItem('aj_dev_bypass')
    setDevBypass(false)
    signOut()
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }
  if (!user && !devBypass) return <LoginPage onDevBypass={handleBypass} />
  return <App userEmail={user?.email || 'dev-staff@ajclothing.com'} onSignOut={handleSignOut} />
}
