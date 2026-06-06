import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { saveSettings } from '@/services/settings.service'

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const body = await req.json()

    await saveSettings(uid, body)

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
