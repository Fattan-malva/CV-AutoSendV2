import nodemailer from 'nodemailer'
import { getDbAdmin } from '@/lib/firebase-admin'
import { decryptSmtp } from '@/lib/smtp-encrypt'
import { checkUsage, incrementUsage } from '@/lib/rate-limit'

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
  const db = getDbAdmin()
  if (!db) throw new Error('Server config error')

  const userDoc = await db.collection('users').doc(uid).get()
  if (!userDoc.exists) throw new Error('User not found')

  const usage = await checkUsage(uid)
  if (!usage.allowed) {
    const err = new Error('Limit reached') as Error & { usage: unknown }
    err.usage = usage
    throw err
  }

  const userData = userDoc.data()!
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

  if (mailData.fileUrl) {
    const cvRes = await fetch(mailData.fileUrl)
    const cvBuffer = await cvRes.arrayBuffer()
    mailOptions.attachments = [
      {
        filename: mailData.fileName || 'CV.pdf',
        content: Buffer.from(cvBuffer),
      },
    ]
  }

  await transporter.sendMail(mailOptions)
  await incrementUsage(uid, 'send')

  // Log to applications subcollection
  try {
    await db.collection('users').doc(uid).collection('applications').add({
      uid,
      perusahaan: mailData.subjek?.match(/di\s+(.+)/)?.[1] || '',
      posisi: mailData.subjek || '',
      email: to,
      subjek: mailData.subjek || '',
      status: 'sent',
      sentAt: new Date().toISOString(),
      cvPath: mailData.fileUrl || '',
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
