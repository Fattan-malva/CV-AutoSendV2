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
  analyzeLanguage: 'id' | 'en'
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

export type AppStatus = 'sent' | 'failed' | 'waiting' | 'approved' | 'rejected'

export interface ApplicationLog {
  id: string
  uid: string
  perusahaan: string
  posisi: string
  email: string
  subjek: string
  status: AppStatus
  sentAt: string
  cvPath: string
  error?: string
}

export type NavItem = 'dashboard' | 'history' | 'settings' | 'cv-builder'

export type CvTemplateId = 'ats-classic' | 'ats-modern' | 'ats-minimal'

export interface CvPersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  linkedin: string
  portfolio: string
  photo: string
}

export interface CvExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  bulletPoints: string[]
}

export interface CvEducation {
  id: string
  institution: string
  degree: string
  field: string
  gpa: string
  startDate: string
  endDate: string
}

export interface CvSkill {
  category: string
  items: string[]
}

export interface CvCertification {
  name: string
  issuer: string
  date: string
}

export interface CvLanguage {
  language: string
  proficiency: string
}

export type CvSectionId = 'personalInfo' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages'

export interface CvData {
  templateId: CvTemplateId
  language: 'id' | 'en'
  primaryColor: string
  personalInfo: CvPersonalInfo
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  skills: CvSkill[]
  certifications: CvCertification[]
  languages: CvLanguage[]
  sectionOrder: CvSectionId[]
}
