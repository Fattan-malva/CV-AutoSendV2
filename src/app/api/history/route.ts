import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/services/auth.service'

async function verifyRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw { error: 'Unauthorized', status: 401 }
  }

  const uid = await verifyToken(authHeader)
  const db = getSupabaseAdmin()
  if (!db) {
    throw { error: 'Server config error', status: 500 }
  }
  return { uid, db }
}

export async function GET(req: NextRequest) {
  try {
    const { uid, db } = await verifyRequest(req)

    const { data, error } = await db.from('applications').select('*').eq('uid', uid).order('sent_at', { ascending: false }).limit(100)
    if (error) throw error
    const logs = (data || []).map((d) => ({ ...d, sentAt: d.sent_at, cvPath: d.cv_path }))

    return NextResponse.json({ logs })
  } catch (e: unknown) {
    const err = e as { error?: string; status?: number }
    const msg = err.error || (e instanceof Error ? e.message : 'Unknown error')
    const status = err.status || 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { uid, db } = await verifyRequest(req)
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const validStatuses = ['sent', 'failed', 'waiting', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await db.from('applications').update({ status }).eq('id', id).eq('uid', uid)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const err = e as { error?: string; status?: number }
    const msg = err.error || (e instanceof Error ? e.message : 'Unknown error')
    const status = err.status || 500
    return NextResponse.json({ error: msg }, { status })
  }
}
