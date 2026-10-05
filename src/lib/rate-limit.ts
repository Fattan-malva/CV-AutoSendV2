import { getSupabaseAdmin, getUserData, upsertUserData } from './supabase-admin'

interface UsageResult {
  allowed: boolean
  reason?: string
  usageAnalyze: number
  usageSend: number
  limitAnalyze: number
  limitSend: number
}

export async function checkUsage(uid: string): Promise<UsageResult> {
  if (!getSupabaseAdmin()) {
    return { allowed: false, reason: 'Server config error', usageAnalyze: 0, usageSend: 0, limitAnalyze: 0, limitSend: 0 }
  }
  const data = await getUserData(uid)
  if (!data) {
    return { allowed: false, reason: 'User not found - complete signup first', usageAnalyze: 0, usageSend: 0, limitAnalyze: 0, limitSend: 0 }
  }

  const plan = String(data.plan || 'free')
  const usageAnalyze = Number(data.usageAnalyze || 0)
  const usageSend = Number(data.usageSend || 0)

  const limits: Record<string, { analyze: number; send: number }> = {
    free: { analyze: 3, send: 3 },
    pro: { analyze: Infinity, send: Infinity },
  }

  const limitsForPlan = limits[plan] || limits.free
  const limitAnalyze = limitsForPlan.analyze
  const limitSend = limitsForPlan.send

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
  if (!getSupabaseAdmin()) return
  const field = type === 'analyze' ? 'usageAnalyze' : 'usageSend'
  const data = await getUserData(uid)
  if (data) await upsertUserData(uid, { [field]: Number(data[field] || 0) + 1 })
}
