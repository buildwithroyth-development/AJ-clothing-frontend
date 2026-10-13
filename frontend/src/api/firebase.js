import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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

// Current user's ID token (Firebase refreshes it automatically when it is about to expire).
export const getIdToken = async () => {
  if (!auth.currentUser) throw new Error('Please sign in to continue.')
  return auth.currentUser.getIdToken()
}
