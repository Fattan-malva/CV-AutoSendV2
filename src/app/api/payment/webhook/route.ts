import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getPlanFromVariantId } from '@/services/payment.service'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-signature')
    verifyWebhookSignature(rawBody, signature, secret)

    const event = JSON.parse(rawBody)
    const eventName = event.meta?.event_name

    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const uid = event.data?.attributes?.custom_data?.uid
      const status = event.data?.attributes?.status

      if (!uid) {
        return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
      }

      if (status !== 'paid' && status !== 'active') {
        return NextResponse.json({ ok: true, message: 'Ignored unpaid' })
      }

      const variantId = eventName === 'subscription_created'
        ? event.data?.attributes?.variant_id
        : event.data?.attributes?.first_order_item?.variant_id

      const plan = getPlanFromVariantId(String(variantId))

      const { getDbAdmin } = await import('@/lib/firebase-admin')
      const db = getDbAdmin()
      if (!db) {
        return NextResponse.json({ error: 'DB not available' }, { status: 500 })
      }

      await db.collection('users').doc(uid).update({
        plan,
        lemonSqueezyCustomerId: event.data?.attributes?.customer_id?.toString() || null,
        lemonSqueezySubscriptionId: event.data?.id || null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
