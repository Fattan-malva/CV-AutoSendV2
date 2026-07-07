'use client'

import { type ReactNode } from 'react'
import { Plus, Trash, CaretDown, CaretUp } from 'phosphor-react'
import CvAIButton from './CvAIButton'
import type { CvData, CvExperience, CvEducation, CvSkill, CvCertification, CvLanguage, CvSectionId } from '@/types'

const inputClass = "w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-200"
const labelClass = "text-[10px] uppercase tracking-wider text-muted mb-1 block"

function SectionCard({ title, aiSection, language, aiContext, onAiResult, children, defaultOpen }: { title: string; aiSection?: string; language?: 'id' | 'en'; aiContext?: string; onAiResult?: (text: string) => void; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group" defaultChecked={defaultOpen || true}>
      <summary className="flex items-center justify-between cursor-pointer list-none py-2.5 px-3 rounded-lg hover:bg-subtle transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {aiSection && language && aiContext !== undefined && onAiResult && (
            <CvAIButton section={aiSection} language={language} context={aiContext} onResult={onAiResult} />
          )}
        </div>
        <CaretDown size={14} className="text-muted group-open:rotate-180 transition-transform duration-200" />
      </summary>
      <div className="px-3 pb-3 space-y-3">
        {children}
      </div>
    </details>
  )
}

export default function CvEditor({
  cv, onChange, language, getAIContext,
}: {
  cv: CvData
  onChange: (cv: CvData) => void
  language: 'id' | 'en'
  getAIContext: (section: string) => string
}) {
  const t = language === 'en' ? enLabels : idLabels
  const update = (patch: Partial<CvData>) => onChange({ ...cv, ...patch })

  const setPersonalInfo = (patch: Partial<CvData['personalInfo']>) =>
    update({ personalInfo: { ...cv.personalInfo, ...patch } })

  const addExperience = () =>
    update({ experience: [...cv.experience, { id: crypto.randomUUID(), company: '', position: '', startDate: '', endDate: '', current: false, description: '', bulletPoints: [''] }] })

  const updateExperience = (id: string, patch: Partial<CvExperience>) =>
    update({ experience: cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) })

  const removeExperience = (id: string) =>
    update({ experience: cv.experience.filter((e) => e.id !== id) })

  const addEducation = () =>
    update({ education: [...cv.education, { id: crypto.randomUUID(), institution: '', degree: '', field: '', gpa: '', startDate: '', endDate: '' }] })

  const updateEducation = (id: string, patch: Partial<CvEducation>) =>
    update({ education: cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) })

  const removeEducation = (id: string) =>
    update({ education: cv.education.filter((e) => e.id !== id) })

  const addSkill = () =>
    update({ skills: [...cv.skills, { category: '', items: [''] }] })

  const updateSkill = (i: number, patch: Partial<CvSkill>) =>
    update({ skills: cv.skills.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) })

  const removeSkill = (i: number) =>
    update({ skills: cv.skills.filter((_, idx) => idx !== i) })

  const addCert = () =>
    update({ certifications: [...cv.certifications, { name: '', issuer: '', date: '' }] })

  const updateCert = (i: number, patch: Partial<CvCertification>) =>
    update({ certifications: cv.certifications.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) })

  const removeCert = (i: number) =>
    update({ certifications: cv.certifications.filter((_, idx) => idx !== i) })

  const addLang = () =>
    update({ languages: [...cv.languages, { language: '', proficiency: 'Professional' }] })

  const updateLang = (i: number, patch: Partial<CvLanguage>) =>
    update({ languages: cv.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) })

  const removeLang = (i: number) =>
    update({ languages: cv.languages.filter((_, idx) => idx !== i) })

  const moveSection = (from: number, to: number) => {
    const order = [...cv.sectionOrder]
    const [removed] = order.splice(from, 1)
    order.splice(to, 0, removed)
    update({ sectionOrder: order })
  }

  return (
    <div className="space-y-2">
      <SectionCard title={t.personalInfo}>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><label className={labelClass}>{t.fullName}</label><input value={cv.personalInfo.fullName} onChange={(e) => setPersonalInfo({ fullName: e.target.value })} className={inputClass} placeholder={t.fullNamePlaceholder} /></div>
          <div><label className={labelClass}>{t.email}</label><input value={cv.personalInfo.email} onChange={(e) => setPersonalInfo({ email: e.target.value })} className={inputClass} placeholder="email@example.com" type="email" /></div>
          <div><label className={labelClass}>{t.phone}</label><input value={cv.personalInfo.phone} onChange={(e) => setPersonalInfo({ phone: e.target.value })} className={inputClass} placeholder="+62 812..." /></div>
          <div className="col-span-2"><label className={labelClass}>{t.address}</label><input value={cv.personalInfo.address} onChange={(e) => setPersonalInfo({ address: e.target.value })} className={inputClass} placeholder={t.addressPlaceholder} /></div>
          <div><label className={labelClass}>LinkedIn</label><input value={cv.personalInfo.linkedin} onChange={(e) => setPersonalInfo({ linkedin: e.target.value })} className={inputClass} placeholder="linkedin.com/in/..." /></div>
          <div><label className={labelClass}>Portfolio</label><input value={cv.personalInfo.portfolio} onChange={(e) => setPersonalInfo({ portfolio: e.target.value })} className={inputClass} placeholder="github.com/..." /></div>
        </div>
      </SectionCard>

      <SectionCard title={t.summary} aiSection="summary" language={language} aiContext={getAIContext('summary')} onAiResult={(text) => update({ summary: text })}>
        <textarea value={cv.summary} onChange={(e) => update({ summary: e.target.value })} className={`${inputClass} min-h-[80px] resize-y`} placeholder={t.summaryPlaceholder} />
      </SectionCard>

      <SectionCard title={t.experience} aiSection="bullet" language={language} aiContext={getAIContext('bullet')} onAiResult={(text) => {
        if (cv.experience.length > 0) {
          const last = cv.experience[cv.experience.length - 1]
          updateExperience(last.id, { bulletPoints: text.split('\n').filter((l: string) => l.trim()) })
        }
      }}>
        {cv.experience.map((exp) => (
          <div key={exp.id} className="border border-border rounded-lg p-3 space-y-2 relative">
            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"><Trash size={14} /></button>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><label className={labelClass}>{t.position}</label><input value={exp.position} onChange={(e) => updateExperience(exp.id, { position: e.target.value })} className={inputClass} placeholder={t.positionPlaceholder} /></div>
              <div className="col-span-2"><label className={labelClass}>{t.company}</label><input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} className={inputClass} placeholder={t.companyPlaceholder} /></div>
              <div><label className={labelClass}>{t.startDate}</label><input value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} className={inputClass} placeholder="2020-01" /></div>
              <div><label className={labelClass}>{t.endDate}</label><input value={exp.endDate} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} className={inputClass} placeholder="2023-12" disabled={exp.current} /></div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} className="rounded border-border accent-[var(--accent)]" />
              {t.currentJob}
            </label>
            <div>
              <label className={labelClass}>{t.bulletPoints}</label>
              {exp.bulletPoints.map((bp, bi) => (
                <div key={bi} className="flex gap-1 mb-1">
                  <span className="text-muted text-xs leading-7">•</span>
                  <input value={bp} onChange={(e) => {
                    const updated = [...exp.bulletPoints]
                    updated[bi] = e.target.value
                    updateExperience(exp.id, { bulletPoints: updated })
                  }} className={`${inputClass} text-[11px]`} placeholder={t.bulletPlaceholder} />
                  <button onClick={() => {
                    const updated = exp.bulletPoints.filter((_, idx) => idx !== bi)
                    updateExperience(exp.id, { bulletPoints: updated.length ? updated : [''] })
                  }} className="text-muted hover:text-red-400 transition-colors shrink-0"><Trash size={12} /></button>
                </div>
              ))}
              <button onClick={() => updateExperience(exp.id, { bulletPoints: [...exp.bulletPoints, ''] })}
                className="text-[10px] text-accent hover:opacity-80 transition-colors mt-1">{t.addBullet}</button>
            </div>
          </div>
        ))}
        <button onClick={addExperience} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-colors"><Plus size={14} />{t.addExperience}</button>
      </SectionCard>

      <SectionCard title={t.education}>
        {cv.education.map((edu) => (
          <div key={edu.id} className="border border-border rounded-lg p-3 space-y-2 relative">
            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"><Trash size={14} /></button>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><label className={labelClass}>{t.institution}</label><input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} className={inputClass} placeholder={t.institutionPlaceholder} /></div>
              <div><label className={labelClass}>{t.degree}</label><input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} className={inputClass} placeholder="S1 / Bachelor's" /></div>
              <div><label className={labelClass}>{t.field}</label><input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} className={inputClass} placeholder="Computer Science" /></div>
              <div><label className={labelClass}>{t.startDate}</label><input value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} className={inputClass} placeholder="2016" /></div>
              <div><label className={labelClass}>{t.endDate}</label><input value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} className={inputClass} placeholder="2020" /></div>
              <div className="col-span-2"><label className={labelClass}>GPA</label><input value={edu.gpa} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} className={inputClass} placeholder="3.8 / 4.0" /></div>
            </div>
          </div>
        ))}
        <button onClick={addEducation} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-colors"><Plus size={14} />{t.addEducation}</button>
      </SectionCard>

      <SectionCard title={t.skills} aiSection="skills" language={language} aiContext={getAIContext('skills')} onAiResult={(text) => {
        const lines = text.split('\n').filter((l: string) => l.includes(':'))
        const skills: CvSkill[] = lines.map((line: string) => {
          const [category, ...items] = line.split(':')
          return { category: category.trim(), items: items.join(':').split(',').map((s: string) => s.trim()) }
        })
        if (skills.length) update({ skills })
      }}>
        {cv.skills.map((sk, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 relative">
            <button onClick={() => removeSkill(i)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"><Trash size={14} /></button>
            <div><label className={labelClass}>{t.category}</label><input value={sk.category} onChange={(e) => updateSkill(i, { category: e.target.value })} className={inputClass} placeholder="Programming Languages" /></div>
            <div><label className={labelClass}>{t.skills}</label>
              {sk.items.map((item, ii) => (
                <div key={ii} className="flex gap-1 mb-1">
                  <input value={item} onChange={(e) => {
                    const updated = [...sk.items]
                    updated[ii] = e.target.value
                    updateSkill(i, { items: updated })
                  }} className={`${inputClass} text-[11px]`} placeholder="JavaScript" />
                  <button onClick={() => {
                    const updated = sk.items.filter((_, idx) => idx !== ii)
                    updateSkill(i, { items: updated.length ? updated : [''] })
                  }} className="text-muted hover:text-red-400 transition-colors shrink-0"><Trash size={12} /></button>
                </div>
              ))}
              <button onClick={() => updateSkill(i, { items: [...sk.items, ''] })}
                className="text-[10px] text-accent hover:opacity-80 transition-colors mt-1">{t.addSkill}</button>
            </div>
          </div>
        ))}
        <button onClick={addSkill} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-colors"><Plus size={14} />{t.addCategory}</button>
      </SectionCard>

      <SectionCard title={t.certifications}>
        {cv.certifications.map((cert, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 relative">
            <button onClick={() => removeCert(i)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"><Trash size={14} /></button>
            <div><label className={labelClass}>{t.certName}</label><input value={cert.name} onChange={(e) => updateCert(i, { name: e.target.value })} className={inputClass} placeholder="AWS Certified" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelClass}>{t.issuer}</label><input value={cert.issuer} onChange={(e) => updateCert(i, { issuer: e.target.value })} className={inputClass} placeholder="Amazon" /></div>
              <div><label className={labelClass}>{t.date}</label><input value={cert.date} onChange={(e) => updateCert(i, { date: e.target.value })} className={inputClass} placeholder="2023" type="month" /></div>
            </div>
          </div>
        ))}
        <button onClick={addCert} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-colors"><Plus size={14} />{t.addCert}</button>
      </SectionCard>

      <SectionCard title={t.languages}>
        {cv.languages.map((l, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 relative">
            <button onClick={() => removeLang(i)} className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"><Trash size={14} /></button>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelClass}>{t.langName}</label><input value={l.language} onChange={(e) => updateLang(i, { language: e.target.value })} className={inputClass} placeholder="English" /></div>
              <div><label className={labelClass}>{t.proficiency}</label>
                <select value={l.proficiency} onChange={(e) => updateLang(i, { proficiency: e.target.value })} className={inputClass}>
                  <option value="Native">Native</option>
                  <option value="Near Native">Near Native</option>
                  <option value="Professional">Professional</option>
                  <option value="Working Knowledge">Working Knowledge</option>
                  <option value="Elementary">Elementary</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addLang} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-colors"><Plus size={14} />{t.addLang}</button>
      </SectionCard>

      <div className="pt-2">
        <label className={labelClass}>{t.sectionOrder}</label>
        <div className="space-y-1">
          {cv.sectionOrder.map((sec, i) => (
            <div key={sec} className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground">
              <span className="flex-1">{t[sec] || sec}</span>
              <button onClick={() => i > 0 && moveSection(i, i - 1)} disabled={i === 0}
                className="text-muted hover:text-foreground disabled:opacity-30 transition-colors"><CaretUp size={14} /></button>
              <button onClick={() => i < cv.sectionOrder.length - 1 && moveSection(i, i + 1)} disabled={i === cv.sectionOrder.length - 1}
                className="text-muted hover:text-foreground disabled:opacity-30 transition-colors"><CaretDown size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const enLabels = {
  personalInfo: 'Personal Info', fullName: 'Full Name', fullNamePlaceholder: 'John Doe',
  email: 'Email', phone: 'Phone', address: 'Address', addressPlaceholder: 'City, Country',
  summary: 'Professional Summary', summaryPlaceholder: 'Write a brief professional summary...',
  experience: 'Experience', position: 'Position', positionPlaceholder: 'Software Engineer',
  company: 'Company', companyPlaceholder: 'Company Name',
  startDate: 'Start Date', endDate: 'End Date', currentJob: 'I currently work here',
  bulletPoints: 'Bullet Points', bulletPlaceholder: 'Describe your achievement...',
  addBullet: '+ Add bullet point', addExperience: '+ Add Experience',
  education: 'Education', institution: 'Institution', institutionPlaceholder: 'University Name',
  degree: 'Degree', field: 'Field of Study',
  addEducation: '+ Add Education',
  skills: 'Skills', category: 'Category', addSkill: '+ Add skill', addCategory: '+ Add category',
  certifications: 'Certifications', certName: 'Name', issuer: 'Issuer', date: 'Date', addCert: '+ Add Certification',
  languages: 'Languages', langName: 'Language', proficiency: 'Proficiency', addLang: '+ Add Language',
  sectionOrder: 'Section Order',
}

const idLabels = {
  personalInfo: 'Data Pribadi', fullName: 'Nama Lengkap', fullNamePlaceholder: 'John Doe',
  email: 'Email', phone: 'Telepon', address: 'Alamat', addressPlaceholder: 'Kota, Negara',
  summary: 'Ringkasan Profesional', summaryPlaceholder: 'Tulis ringkasan profesional singkat...',
  experience: 'Pengalaman', position: 'Posisi', positionPlaceholder: 'Software Engineer',
  company: 'Perusahaan', companyPlaceholder: 'Nama Perusahaan',
  startDate: 'Tanggal Mulai', endDate: 'Tanggal Selesai', currentJob: 'Saya masih bekerja di sini',
  bulletPoints: 'Poin Penting', bulletPlaceholder: 'Jelaskan pencapaian Anda...',
  addBullet: '+ Tambah poin', addExperience: '+ Tambah Pengalaman',
  education: 'Pendidikan', institution: 'Institusi', institutionPlaceholder: 'Nama Universitas',
  degree: 'Gelar', field: 'Bidang Studi',
  addEducation: '+ Tambah Pendidikan',
  skills: 'Keahlian', category: 'Kategori', addSkill: '+ Tambah skill', addCategory: '+ Tambah kategori',
  certifications: 'Sertifikasi', certName: 'Nama', issuer: 'Penerbit', date: 'Tanggal', addCert: '+ Tambah Sertifikasi',
  languages: 'Bahasa', langName: 'Bahasa', proficiency: 'Tingkat', addLang: '+ Tambah Bahasa',
  sectionOrder: 'Urutan Section',
}
