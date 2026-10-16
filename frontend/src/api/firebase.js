import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth'

// Firebase Web Configuration. These are public identifiers, not secrets.
// The app only uses Firebase for signing staff in; all data goes through the AJ Clothing API,
// which verifies the ID token and talks to the database with the Admin SDK.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBtxKPU9eunb5rLaEH-anSPzpZZysWqBKI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aj-clothing-e8477.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aj-clothing-e8477',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aj-clothing-e8477.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '220735033224',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:220735033224:web:068d0c9199bf1dbe64743d',
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email.trim(), password)
export const signOut = () => fbSignOut(auth)
export const onUserChange = (cb) => onAuthStateChanged(auth, cb)

// Create an account, store the person's name, and e-mail them a verification link.
// The new user stays signed in so the app can show the "verify your e-mail" screen.
export const registerUser = async ({ name, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  try {
    await updateProfile(cred.user, { displayName: name.trim() })
  } catch {
    /* the name is cosmetic; the account itself was created */
  }
  await sendEmailVerification(cred.user)
  return cred.user
}

export const resendVerification = () => {
  if (!auth.currentUser) throw new Error('Please sign in again.')
  return sendEmailVerification(auth.currentUser)
}

export const sendPasswordReset = (email) =>
  sendPasswordResetEmail(auth, email.trim())

// Re-read the account from Firebase (picks up a freshly verified e-mail) and refresh the ID token,
// so the API sees email_verified = true.
export const refreshUser = async () => {
  if (!auth.currentUser) return null
  await auth.currentUser.reload()
  await auth.currentUser.getIdToken(true)
  return auth.currentUser
}

// Current user's ID token (with optional force refresh).
export const getIdToken = async (forceRefresh = false) => {
  if (!auth.currentUser) throw new Error('Please sign in to continue.')
  return auth.currentUser.getIdToken(forceRefresh)
}

// Plain-language messages for Firebase Authentication errors.
export const authErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the store owner.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this app yet.'
    case 'auth/expired-action-code':
      return 'The link has expired. Please request a new one.'
    case 'auth/invalid-action-code':
      return 'The link is invalid or has already been used.'
    default:
      return err?.message || fallback
  }
}

