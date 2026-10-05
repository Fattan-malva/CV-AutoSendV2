import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { getUserData, upsertUserData } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    return NextResponse.json({ cvData: (await getUserData(uid))?.cvData || null })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const uid = await verifyToken(req.headers.get('authorization'))
    const { cvData } = await req.json()
    await upsertUserData(uid, { cvData })
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
