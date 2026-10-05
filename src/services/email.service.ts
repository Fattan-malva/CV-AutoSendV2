import nodemailer from 'nodemailer'
import { getSupabaseAdmin, getUserData } from '@/lib/supabase-admin'
import { decryptSmtp } from '@/lib/smtp-encrypt'
import { checkUsage, incrementUsage } from '@/lib/rate-limit'

interface StoredUser {
  email: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  senderName: string
  cvPath?: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, '<br>')
}

export async function sendEmail(uid: string, mailData: {
  subjek: string
  intro: string
  alasan: string
  penutup: string
  fileUrl?: string
  fileName?: string
  targetEmail?: string
}) {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Server config error')
  const userData = await getUserData(uid) as StoredUser | null
  if (!userData) throw new Error('User not found')

  const usage = await checkUsage(uid)
  if (!usage.allowed) {
    const err = new Error('Limit reached') as Error & { usage: unknown }
    err.usage = usage
    throw err
  }

  const to = mailData.targetEmail || userData.email
  const smtpPass = decryptSmtp(userData.smtpPass)

  const transporter = nodemailer.createTransport({
    host: userData.smtpHost,
    port: userData.smtpPort,
    secure: userData.smtpPort === 465,
    auth: { user: userData.smtpUser, pass: smtpPass },
  })

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${userData.senderName}" <${userData.smtpUser}>`,
    to,
    subject: mailData.subjek || 'Application',
    html: `
      <p>${nl2br(mailData.intro || '')}</p>
      <p>${nl2br(mailData.alasan || '')}</p>
      <p>${nl2br(mailData.penutup || '')}</p>
    `,
  }

  // Always use the latest CV stored in Supabase (saved via Settings/upload).
  const cvPathFromSupabase: string | undefined = userData.cvPath
  if (cvPathFromSupabase) {
    const cvRes = await fetch(cvPathFromSupabase)
    if (!cvRes.ok) throw new Error(`Failed to fetch cvPath: ${cvPathFromSupabase}`)
    const cvBuffer = await cvRes.arrayBuffer()
    mailOptions.attachments = [
      {
        filename: mailData.fileName || 'CV.pdf',
        content: Buffer.from(cvBuffer),
      },
    ]
  }

  // Log: which cvPath is used for this email
  const cvPathToLog = cvPathFromSupabase || ''

  await transporter.sendMail(mailOptions)
  await incrementUsage(uid, 'send')

  // Log to the Supabase applications table.
  try {
    await db.from('applications').insert({
      uid,
      perusahaan: mailData.subjek?.match(/di\s+(.+)/)?.[1] || '',
      posisi: mailData.subjek || '',
      email: to,
      subjek: mailData.subjek || '',
      status: 'sent',
      sent_at: new Date().toISOString(),
      cv_path: cvPathToLog,
    })
  } catch { /* non-critical */ }
}

export async function sendTestEmail(config: {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  senderName: string
  to: string
}) {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  })

  await transporter.sendMail({
    from: `"${config.senderName}" <${config.smtpUser}>`,
    to: config.to,
    subject: 'ceefy - Test Email',
    text: 'Email settings are working correctly!',
  })
}
