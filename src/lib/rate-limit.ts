import { getDbAdmin } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

interface UsageResult {
  allowed: boolean
  reason?: string
  usageAnalyze: number
  usageSend: number
  limitAnalyze: number
  limitSend: number
}

export async function checkUsage(uid: string): Promise<UsageResult> {
  const db = getDbAdmin()
  if (!db) {
    return { allowed: false, reason: 'Server config error', usageAnalyze: 0, usageSend: 0, limitAnalyze: 0, limitSend: 0 }
  }
  const doc = await db.collection('users').doc(uid).get()
  if (!doc.exists) {
    return { allowed: false, reason: 'User not found - complete signup first', usageAnalyze: 0, usageSend: 0, limitAnalyze: 0, limitSend: 0 }
  }

  const data = doc.data()!
  const plan = data.plan || 'free'
  const usageAnalyze = data.usageAnalyze || 0
  const usageSend = data.usageSend || 0

  const limits: Record<string, { analyze: number; send: number }> = {
    free: { analyze: 3, send: 3 },
    pro: { analyze: Infinity, send: Infinity },
  }

  const limitAnalyze = limits[plan].analyze
  const limitSend = limits[plan].send

  if (plan === 'free') {
    if (usageAnalyze >= limitAnalyze) {
      return { allowed: false, reason: 'Analyze limit reached', usageAnalyze, usageSend, limitAnalyze, limitSend }
    }
    if (usageSend >= limitSend) {
      return { allowed: false, reason: 'Send limit reached', usageAnalyze, usageSend, limitAnalyze, limitSend }
    }
  }

  return { allowed: true, usageAnalyze, usageSend, limitAnalyze, limitSend }
}

export async function incrementUsage(uid: string, type: 'analyze' | 'send') {
  const db = getDbAdmin()
  if (!db) return
  const field = type === 'analyze' ? 'usageAnalyze' : 'usageSend'
  await db.collection('users').doc(uid).update({
    [field]: FieldValue.increment(1),
  })
}
