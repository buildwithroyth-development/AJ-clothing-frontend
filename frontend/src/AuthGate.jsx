import { useEffect, useState } from 'react'
import App from './App'
import LoginPage from './pages/LoginPage'
import { onUserChange, signOut } from './api/firebase'

// Shows the login page until a staff member is signed in.
export default function AuthGate() {
  const [user, setUser] = useState(undefined) // undefined = still checking

  useEffect(() => onUserChange(setUser), [])

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }
  if (!user) return <LoginPage />
  return <App userEmail={user.email || ''} onSignOut={signOut} />
}
