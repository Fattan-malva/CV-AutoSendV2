import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

function initFirebase() {
  if (typeof window === 'undefined') return null
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return null
  const a = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  return a
}

const a = initFirebase()

export const app = a
export const auth = app ? getAuth(app) : null
