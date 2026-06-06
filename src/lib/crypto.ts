import CryptoJS from 'crypto-js'

const KEY = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cv-autosend-default-key'

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
