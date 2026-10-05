import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { getUserData, upsertUserData } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const data = await getUserData(uid)
    return NextResponse.json(data || { uid, plan: 'free', usageAnalyze: 0, usageSend: 0 })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const body = await req.json()
    const existing = await getUserData(uid)
    if (!existing) await upsertUserData(uid, body)
    else await upsertUserData(uid, { email: body.email, displayName: body.displayName })
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
