import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { sendEmail } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const { subjek, intro, alasan, penutup, fileUrl, fileName, email: targetEmail } = await req.json()

    await sendEmail(uid, { subjek, intro, alasan, penutup, fileUrl, fileName, targetEmail })

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
