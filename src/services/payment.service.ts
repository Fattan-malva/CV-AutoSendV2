import crypto from 'crypto'

interface CheckoutResponse {
  url: string
}

interface LemonSqueezyError {
  error?: string
  errors?: Array<{ detail: string }>
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string): void {
  if (!signature) {
    throw new Error('Missing signature')
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('hex')

  if (digest !== signature) {
    throw new Error('Invalid signature')
  }
}

function getVariantId(plan: string): string {
  const key = `LEMONSQUEEZY_VARIANT_${plan.toUpperCase()}_ID` as keyof NodeJS.ProcessEnv
  const id = process.env[key]
  if (!id) {
    throw new Error(`Variant ID not configured for plan: ${plan}`)
  }
  return id
}

const variantPlanMap: Record<string, string> = {
  [process.env.LEMONSQUEEZY_VARIANT_BASIC_ID || '']: 'basic',
  [process.env.LEMONSQUEEZY_VARIANT_STARTER_ID || '']: 'starter',
  [process.env.LEMONSQUEEZY_VARIANT_PRO_ID || '']: 'pro',
}

export function getPlanFromVariantId(variantId: string): string {
  return variantPlanMap[variantId] || 'pro'
}

export async function createCheckout(email: string, uid: string, plan: string = 'pro'): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = getVariantId(plan)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!apiKey || !storeId) {
    throw new Error('Payment not configured')
  }

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            custom: { uid, plan },
          },
          product_options: {
            redirect_url: `${appUrl}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(storeId) } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LemonSqueezy error: ${text}`)
  }

  const json = await res.json()
  return json.data.attributes.url as string
}
