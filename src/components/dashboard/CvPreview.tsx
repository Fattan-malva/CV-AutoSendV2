'use client'

import { useRef } from 'react'
import type { CvData, CvTemplateId } from '@/types'

const sectionLabels: Record<string, { en: string; id: string }> = {
  summary: { en: 'Professional Summary', id: 'Ringkasan Profesional' },
  experience: { en: 'Experience', id: 'Pengalaman' },
  education: { en: 'Education', id: 'Pendidikan' },
  skills: { en: 'Skills', id: 'Keahlian' },
  certifications: { en: 'Certifications', id: 'Sertifikasi' },
  languages: { en: 'Languages', id: 'Bahasa' },
}

const proficiencyLabels: Record<string, string> = {
  Native: 'Native', 'Near Native': 'Near Native', Professional: 'Professional',
  'Working Knowledge': 'Working Knowledge', Elementary: 'Elementary',
  'Bahasa Ibu': 'Bahasa Ibu', 'Mendekati Ibu': 'Mendekati Ibu',
  Profesional: 'Profesional', 'Pengetahuan Kerja': 'Pengetahuan Kerja', Dasar: 'Dasar',
}

function ClassicTemplate({ cv, lang }: { cv: CvData; lang: 'id' | 'en' }) {
  const t = (key: string) => sectionLabels[key]?.[lang] || key
  const { personalInfo: p } = cv

  return (
    <div className="font-sans text-[11px] leading-relaxed text-gray-900">
      <div className="text-center mb-4 pb-3 border-b border-gray-300">
        <h1 className="text-xl font-bold tracking-tight uppercase">{p.fullName || 'Your Name'}</h1>
        <div className="text-[10px] text-gray-600 mt-1 space-x-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
        </div>
        <div className="text-[10px] text-gray-600 mt-0.5 space-x-2">
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.portfolio && <span>{p.portfolio}</span>}
        </div>
      </div>

      {cv.sectionOrder.map((sec) => {
        if (sec === 'personalInfo') return null
        if (sec === 'summary' && cv.summary) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">{t(sec)}</h2>
              <p className="text-[11px] text-gray-700 leading-relaxed">{cv.summary}</p>
            </div>
          )
        }
        if (sec === 'experience' && cv.experience.length > 0) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1 pb-0.5 border-b border-gray-200">{t(sec)}</h2>
              {cv.experience.map((exp) => (
                <div key={exp.id} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">{exp.position}</span>
                    <span className="text-[10px] text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">{exp.company}</div>
                  <ul className="list-disc list-inside mt-0.5 text-gray-700 space-y-0.5">
                    {exp.bulletPoints.filter(b => b.trim()).map((b, i) => <li key={i} className="text-[11px]">{b}</li>)}
                  </ul>
                  {exp.description && <p className="text-[11px] text-gray-700 mt-0.5 italic">{exp.description}</p>}
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'education' && cv.education.length > 0) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1 pb-0.5 border-b border-gray-200">{t(sec)}</h2>
              {cv.education.map((edu) => (
                <div key={edu.id} className="mb-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">{edu.institution}</span>
                    <span className="text-[10px] text-gray-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'skills' && cv.skills.length > 0) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1 pb-0.5 border-b border-gray-200">{t(sec)}</h2>
              {cv.skills.map((sk, i) => (
                <div key={i} className="mb-0.5">
                  {sk.category && <span className="font-semibold text-gray-800 text-[11px]">{sk.category}: </span>}
                  <span className="text-[11px] text-gray-700">{sk.items.filter(s => s.trim()).join(', ')}</span>
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'certifications' && cv.certifications.length > 0) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1 pb-0.5 border-b border-gray-200">{t(sec)}</h2>
              {cv.certifications.map((cert, i) => (
                <div key={i} className="text-[11px] text-gray-700">
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  {cert.issuer && <span> — {cert.issuer}</span>}
                  {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'languages' && cv.languages.length > 0) {
          return (
            <div key={sec} className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1 pb-0.5 border-b border-gray-200">{t(sec)}</h2>
              <div className="text-[11px] text-gray-700">
                {cv.languages.map((l, i) => (
                  <span key={i}>{l.language} ({proficiencyLabels[l.proficiency] || l.proficiency}){i < cv.languages.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

function ModernTemplate({ cv, lang }: { cv: CvData; lang: 'id' | 'en' }) {
  const t = (key: string) => sectionLabels[key]?.[lang] || key
  const { personalInfo: p } = cv
  const accent = cv.primaryColor || '#1a1a2e'

  return (
    <div className="font-sans text-[11px] leading-relaxed text-gray-900 flex">
      <div className="w-[3px] shrink-0" style={{ backgroundColor: accent }} />
      <div className="flex-1 pl-3">
        <div className="mb-3">
          <h1 className="text-lg font-bold tracking-tight" style={{ color: accent }}>{p.fullName || 'Your Name'}</h1>
          <div className="text-[10px] text-gray-600 mt-0.5 space-x-2">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.address && <span>{p.address}</span>}
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5 space-x-2">
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.portfolio && <span>{p.portfolio}</span>}
          </div>
        </div>

        {cv.sectionOrder.map((sec) => {
          if (sec === 'personalInfo') return null
          if (sec === 'summary' && cv.summary) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                <p className="text-[11px] text-gray-700 leading-relaxed">{cv.summary}</p>
              </div>
            )
          }
          if (sec === 'experience' && cv.experience.length > 0) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                {cv.experience.map((exp) => (
                  <div key={exp.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">{exp.position}</span>
                      <span className="text-[10px] text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="text-[10px] text-gray-600">{exp.company}</div>
                    <ul className="list-disc list-inside mt-0.5 text-gray-700 space-y-0.5">
                      {exp.bulletPoints.filter(b => b.trim()).map((b, i) => <li key={i} className="text-[11px]">{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )
          }
          if (sec === 'education' && cv.education.length > 0) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                {cv.education.map((edu) => (
                  <div key={edu.id} className="mb-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">{edu.institution}</span>
                      <span className="text-[10px] text-gray-500">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="text-[10px] text-gray-600">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
                  </div>
                ))}
              </div>
            )
          }
          if (sec === 'skills' && cv.skills.length > 0) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                {cv.skills.map((sk, i) => (
                  <div key={i} className="mb-0.5">
                    {sk.category && <span className="font-semibold text-gray-800 text-[11px]">{sk.category}: </span>}
                    <span className="text-[11px] text-gray-700">{sk.items.filter(s => s.trim()).join(', ')}</span>
                  </div>
                ))}
              </div>
            )
          }
          if (sec === 'certifications' && cv.certifications.length > 0) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                {cv.certifications.map((cert, i) => (
                  <div key={i} className="text-[11px] text-gray-700">
                    <span className="font-semibold text-gray-900">{cert.name}</span>
                    {cert.issuer && <span> — {cert.issuer}</span>}
                    {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
                  </div>
                ))}
              </div>
            )
          }
          if (sec === 'languages' && cv.languages.length > 0) {
            return (
              <div key={sec} className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>{t(sec)}</h2>
                <div className="text-[11px] text-gray-700">
                  {cv.languages.map((l, i) => (
                    <span key={i}>{l.language} ({proficiencyLabels[l.proficiency] || l.proficiency}){i < cv.languages.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

function MinimalTemplate({ cv, lang }: { cv: CvData; lang: 'id' | 'en' }) {
  const t = (key: string) => sectionLabels[key]?.[lang] || key
  const { personalInfo: p } = cv

  return (
    <div className="font-sans text-[11px] leading-relaxed text-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-wide text-gray-800">{p.fullName || 'Your Name'}</h1>
        <div className="h-px w-12 bg-gray-400 mt-2 mb-2" />
        <div className="text-[10px] text-gray-500 space-x-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 space-x-2">
          {p.address && <span>{p.address}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.portfolio && <span>{p.portfolio}</span>}
        </div>
      </div>

      {cv.sectionOrder.map((sec) => {
        if (sec === 'personalInfo') return null
        if (sec === 'summary' && cv.summary) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              <p className="text-[11px] text-gray-700 leading-relaxed">{cv.summary}</p>
            </div>
          )
        }
        if (sec === 'experience' && cv.experience.length > 0) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              {cv.experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-800 text-[12px]">{exp.position}</span>
                    <span className="text-[10px] text-gray-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">{exp.company}</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {exp.bulletPoints.filter(b => b.trim()).map((b, i) => <li key={i} className="text-[11px]">{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'education' && cv.education.length > 0) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              {cv.education.map((edu) => (
                <div key={edu.id} className="mb-2 flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold text-gray-800 text-[11px]">{edu.institution}</span>
                    <span className="text-[11px] text-gray-600"> — {edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'skills' && cv.skills.length > 0) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              {cv.skills.map((sk, i) => (
                <div key={i} className="mb-1">
                  {sk.category && <span className="font-semibold text-gray-700 text-[11px]">{sk.category}: </span>}
                  <span className="text-[11px] text-gray-600">{sk.items.filter(s => s.trim()).join('  ·  ')}</span>
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'certifications' && cv.certifications.length > 0) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              {cv.certifications.map((cert, i) => (
                <div key={i} className="text-[11px] text-gray-600 mb-0.5">
                  <span className="font-semibold text-gray-800">{cert.name}</span>
                  {cert.issuer && <span> — {cert.issuer}</span>}
                  {cert.date && <span className="text-gray-400"> ({cert.date})</span>}
                </div>
              ))}
            </div>
          )
        }
        if (sec === 'languages' && cv.languages.length > 0) {
          return (
            <div key={sec} className="mb-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">{t(sec)}</h2>
              <div className="text-[11px] text-gray-600">
                {cv.languages.map((l, i) => (
                  <span key={i}>{l.language} ({proficiencyLabels[l.proficiency] || l.proficiency}){i < cv.languages.length - 1 ? '  ·  ' : ''}</span>
                ))}
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

const templateComponents: Record<CvTemplateId, typeof ClassicTemplate> = {
  'ats-classic': ClassicTemplate,
  'ats-modern': ModernTemplate,
  'ats-minimal': MinimalTemplate,
}

export default function CvPreview({ cv, lang, previewRef }: { cv: CvData; lang: 'id' | 'en'; previewRef?: React.RefObject<HTMLDivElement | null> }) {
  const Template = templateComponents[cv.templateId] || ClassicTemplate

  return (
    <div ref={previewRef} className="bg-white shadow-lg min-h-[842px] w-full max-w-[595px] mx-auto p-8 print:p-0" style={{ aspectRatio: '210 / 297' }}>
      <Template cv={cv} lang={lang} />
    </div>
  )
}
