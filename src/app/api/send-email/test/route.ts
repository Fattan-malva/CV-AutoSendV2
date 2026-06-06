import { NextRequest, NextResponse } from 'next/server'
import { getAuthAdmin } from '@/lib/firebase-admin'
import { sendTestEmail } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const authAdmin = getAuthAdmin()
    if (!authAdmin) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }
    const decoded = await authAdmin.verifyIdToken(token)
    const { smtpHost, smtpPort, smtpUser, smtpPass, senderName, to } = await req.json()

    if (decoded.email !== to) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    await sendTestEmail({ smtpHost, smtpPort: Number(smtpPort), smtpUser, smtpPass, senderName, to })

    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
