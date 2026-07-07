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

const labelsEN = { summary: 'Professional Summary', experience: 'Experience', present: 'Present', education: 'Education', skills: 'Skills', certifications: 'Certifications', languages: 'Languages' }
const labelsID = { summary: 'Ringkasan Profesional', experience: 'Pengalaman', present: 'Sekarang', education: 'Pendidikan', skills: 'Keahlian', certifications: 'Sertifikasi', languages: 'Bahasa' }

export function cvHTML(cv: CvData, lang: 'id' | 'en') {
  const h = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const label = lang === 'en' ? labelsEN : labelsID
  return `
    <h1>${h(cv.personalInfo.fullName)}</h1>
    <div class="contact">${[cv.personalInfo.email, cv.personalInfo.phone, cv.personalInfo.address, cv.personalInfo.linkedin, cv.personalInfo.portfolio].filter(Boolean).map(s => `<span>${h(s)}</span>`).join('')}</div>
    ${cv.summary ? `<div class="section"><h2>${label.summary}</h2><div class="summary">${h(cv.summary)}</div></div>` : ''}
    ${cv.experience.length ? `<div class="section"><h2>${label.experience}</h2>${cv.experience.map(e => `<div style="margin-bottom:6px"><div class="exp-header"><span>${h(e.position)}</span><span style="font-weight:400;font-size:10px;color:#6b7280">${e.startDate} – ${e.current ? label.present : e.endDate}</span></div><div class="exp-company">${h(e.company)}</div>${e.bulletPoints.filter(b => b.trim()).length ? `<ul>${e.bulletPoints.filter(b => b.trim()).map(b => `<li>${h(b)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${cv.education.length ? `<div class="section"><h2>${label.education}</h2>${cv.education.map(e => `<div style="margin-bottom:3px;display:flex;justify-content:space-between"><span><strong>${h(e.institution)}</strong> — ${h(e.degree)}${e.field ? ' in ' + h(e.field) : ''}${e.gpa ? ' (GPA: ' + e.gpa + ')' : ''}</span><span style="font-size:10px;color:#6b7280">${e.startDate} – ${e.endDate}</span></div>`).join('')}</div>` : ''}
    ${cv.skills.filter(s => s.items.filter(i => i).length).length ? `<div class="section"><h2>${label.skills}</h2>${cv.skills.filter(s => s.items.filter(i => i).length).map(s => `<div class="skill-line">${s.category ? `<strong>${h(s.category)}:</strong> ` : ''}${s.items.filter(i => i).map(i => h(i)).join(', ')}</div>`).join('')}</div>` : ''}
    ${cv.certifications.length ? `<div class="section"><h2>${label.certifications}</h2>${cv.certifications.map(c => `<div class="cert-line"><strong>${h(c.name)}</strong>${c.issuer ? ' — ' + h(c.issuer) : ''}${c.date ? ' (' + c.date + ')' : ''}</div>`).join('')}</div>` : ''}
    ${cv.languages.length ? `<div class="section"><h2>${label.languages}</h2><div class="lang-line">${cv.languages.map(l => `${h(l.language)} (${h(l.proficiency)})`).join(', ')}</div></div>` : ''}
  `
}
