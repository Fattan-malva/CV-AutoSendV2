import { getDbAdmin } from '@/lib/firebase-admin'
import { encryptSmtp } from '@/lib/smtp-encrypt'

export async function saveSettings(uid: string, body: {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass?: string
  senderName?: string
  cvPath?: string
}) {
  const db = getDbAdmin()
  if (!db) throw new Error('Server config error')

  if (!body.smtpHost || !body.smtpUser) {
    throw new Error('SMTP host and user are required')
  }

  const updateData: Record<string, unknown> = {
    smtpHost: body.smtpHost,
    smtpPort: Number(body.smtpPort),
    smtpUser: body.smtpUser,
    senderName: body.senderName || body.smtpUser.split('@')[0] || '',
  }

  if (body.smtpPass) {
    updateData.smtpPass = encryptSmtp(body.smtpPass)
  }

  if (body.cvPath) {
    updateData.cvPath = body.cvPath
  }

  await db.collection('users').doc(uid).set(updateData, { merge: true })
}
