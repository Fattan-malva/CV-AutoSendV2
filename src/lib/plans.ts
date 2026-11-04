import type { PlanTier } from '@/types'

export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  basic: 20,
  starter: 80,
  pro: Infinity,
}

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  basic: 'Basic',
  starter: 'Starter',
  pro: 'Pro',
}

export function getPlanLimit(plan?: PlanTier | null) {
  return PLAN_LIMITS[plan || 'free']
}

export function getPlanLabel(plan?: PlanTier | null) {
  return PLAN_LABELS[plan || 'free']
}

export function isUnlimited(plan?: PlanTier | null) {
  return plan === 'pro'
}
