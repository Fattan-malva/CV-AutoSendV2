import type { auth, firestore, storage } from 'firebase-admin'

function getAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const admin = require('firebase-admin')

  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined

    if (!process.env.FIREBASE_PROJECT_ID) {
      return null
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  }

  return admin
}

export function getAuthAdmin(): auth.Auth | null {
  const admin = getAdmin()
  return admin ? admin.auth() : null
}

export function getDbAdmin(): firestore.Firestore | null {
  const admin = getAdmin()
  return admin ? admin.firestore() : null
}

export function getStorageAdmin(): storage.Storage | null {
  const admin = getAdmin()
  return admin ? admin.storage() : null
}
