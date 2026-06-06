import { NextRequest, NextResponse } from 'next/server'
import { getAuthAdmin, getDbAdmin } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
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
    const uid = decoded.uid

    const db = getDbAdmin()
    if (!db) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    const snap = await db.collection('users').doc(uid).collection('applications')
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get()

    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({ logs })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
