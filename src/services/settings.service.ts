import { upsertUserData } from '@/lib/supabase-admin'
import { encryptSmtp } from '@/lib/smtp-encrypt'

export async function saveSettings(uid: string, body: {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass?: string
  senderName?: string
  cvPath?: string
  analyzeLanguage?: 'id' | 'en'
}) {
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

  if (body.analyzeLanguage) {
    updateData.analyzeLanguage = body.analyzeLanguage
  }

  await upsertUserData(uid, updateData)
}
