import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { createCheckout } from '@/services/payment.service'

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const { email, plan } = await req.json()

    const url = await createCheckout(email, uid, plan || 'pro')

    return NextResponse.json({ url })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
