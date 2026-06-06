export type PlanTier = 'free' | 'basic' | 'starter' | 'pro'

export interface UserConfig {
  uid: string
  email: string
  displayName: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  senderName: string
  cvPath: string
  plan: PlanTier
  usageAnalyze: number
  usageSend: number
  lemonSqueezyCustomerId: string | null
  lemonSqueezySubscriptionId: string | null
  createdAt: string
}

export interface AnalysisResult {
  subjek: string
  nama_perusahaan: string
  posisi: string
  intro: string
  alasan: string
  penutup: string
  email: string
}

export interface LandingUsage {
  ipHash: string
  timestamp: string
}

export interface ApplicationLog {
  id: string
  uid: string
  perusahaan: string
  posisi: string
  email: string
  subjek: string
  status: 'sent' | 'failed'
  sentAt: string
  cvPath: string
  error?: string
}

export type NavItem = 'dashboard' | 'history' | 'settings'
