import { NextRequest, NextResponse } from 'next/server'
import { getAuthAdmin, getDbAdmin } from '@/lib/firebase-admin'

async function verifyRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.slice(7)
  const authAdmin = getAuthAdmin()
  if (!authAdmin) {
    throw { error: 'Server config error', status: 500 }
  }
  const decoded = await authAdmin.verifyIdToken(token)
  const db = getDbAdmin()
  if (!db) {
    throw { error: 'Server config error', status: 500 }
  }
  return { uid: decoded.uid, db }
}

export async function GET(req: NextRequest) {
  try {
    const { uid, db } = await verifyRequest(req)

    const snap = await db.collection('users').doc(uid).collection('applications')
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get()

    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

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

    await db.collection('users').doc(uid).collection('applications').doc(id).update({ status })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const err = e as { error?: string; status?: number }
    const msg = err.error || (e instanceof Error ? e.message : 'Unknown error')
    const status = err.status || 500
    return NextResponse.json({ error: msg }, { status })
  }
}
