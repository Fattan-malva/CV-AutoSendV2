import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CvData, CvTemplateId } from '@/types'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const LIMIT_SIZE = 900000

export function validateCvUpload(fileBase64: string, mimeType: string): void {
  if (!fileBase64) throw new Error('fileBase64 required')
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) throw new Error('Tipe file tidak didukung. Gunakan PDF/PNG/JPEG.')
  if (fileBase64.length > LIMIT_SIZE) throw new Error('CV terlalu besar. Maksimal ~700KB.')
}

export function buildDataUrl(fileBase64: string, mimeType: string, fileName?: string): { url: string; path: string } {
  return { url: `data:${mimeType || 'application/pdf'};base64,${fileBase64}`, path: fileName || 'CV.pdf' }
}

export const defaultCvData: CvData = {
  templateId: 'ats-classic',
  language: 'id',
  primaryColor: '#1a1a2e',
  personalInfo: {
    fullName: '', email: '', phone: '', address: '', linkedin: '', portfolio: '', photo: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'certifications', 'languages'],
}

export async function loadCvData(uid: string): Promise<CvData | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data().cvData
  if (!data) return null
  return { ...defaultCvData, ...data }
}

export async function saveCvData(uid: string, cvData: CvData): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), { cvData }, { merge: true })
}

export function defaultExperience(): import('@/types').CvExperience {
  return {
    id: crypto.randomUUID(),
    company: '', position: '', startDate: '', endDate: '',
    current: false, description: '', bulletPoints: [''],
  }
}

export function defaultEducation(): import('@/types').CvEducation {
  return {
    id: crypto.randomUUID(),
    institution: '', degree: '', field: '', gpa: '', startDate: '', endDate: '',
  }
}

export function defaultSkill(): import('@/types').CvSkill {
  return { category: '', items: [''] }
}

export function defaultCertification(): import('@/types').CvCertification {
  return { name: '', issuer: '', date: '' }
}

export function defaultLanguage(): import('@/types').CvLanguage {
  return { language: '', proficiency: 'Professional' }
}

export const templateLabels: Record<CvTemplateId, { label: string; desc: string }> = {
  'ats-classic': { label: 'Classic', desc: 'Clean traditional layout with horizontal dividers' },
  'ats-modern': { label: 'Modern', desc: 'Contemporary with accent sidebar' },
  'ats-minimal': { label: 'Minimal', desc: 'Sparse, elegant, maximum whitespace' },
}
