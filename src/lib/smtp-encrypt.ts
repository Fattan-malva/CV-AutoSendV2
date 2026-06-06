import CryptoJS from 'crypto-js'

function getSmtpKey(): string {
  const key = process.env.ENCRYPTION_SECRET
  if (!key) {
    throw new Error('ENCRYPTION_SECRET is not set')
  }
  return key
}

export function encryptSmtp(text: string): string {
  return CryptoJS.AES.encrypt(text, getSmtpKey()).toString()
}

export function decryptSmtp(ciphertext: string): string {
  if (!ciphertext) return ''
  const bytes = CryptoJS.AES.decrypt(ciphertext, getSmtpKey())
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return decrypted || ciphertext
}
