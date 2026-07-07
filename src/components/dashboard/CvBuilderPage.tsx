'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, FloppyDisk, Download, Translate, Sparkle } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import Skeleton from '@/components/ui/Skeleton'
import CvEditor from './CvEditor'
import CvPreview from './CvPreview'
import { loadCvData, saveCvData, defaultCvData, templateLabels } from '@/services/cv.service'
import type { CvData, CvTemplateId } from '@/types'

export default function CvBuilderPage() {
  const { user } = useAuth()
  const [cv, setCv] = useState<CvData>(defaultCvData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const previewRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const data = await loadCvData(user.uid)
        if (data) {
          setCv(data)
          setLanguage(data.language)
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    load()
  }, [user])

  useEffect(() => {
    setCv((prev) => ({ ...prev, language }))
  }, [language])

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)
    setSaveMsg('')
    try {
      await saveCvData(user.uid, cv)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [user, cv])

  useEffect(() => {
    if (!user || loading) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveCvData(user.uid, cv).catch(() => {})
    }, 2000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [cv, user, loading])

  const handleDownloadPdf = useCallback(async () => {
    const name = cv.personalInfo.fullName || 'CV'
    const win = window.open('', '_blank')
    if (!win) return

    const html = `<!DOCTYPE html>
<html>
<head><title>${name}</title>
<style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #111827;
    background: #fff;
    width: 210mm;
    padding: 15mm 20mm;
    line-height: 1.5;
    font-size: 11px;
  }
  h1 { font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 2px; }
  h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 4px; padding-bottom: 2px; border-bottom: 1px solid #d1d5db; }
  .contact { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
  .contact span { margin-right: 12px; }
  .section { margin-bottom: 10px; }
  .exp-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 12px; }
  .exp-company { font-size: 10px; color: #6b7280; }
  ul { list-style: disc; padding-left: 16px; margin-top: 2px; }
  li { font-size: 11px; color: #374151; margin-bottom: 1px; }
  .skill-line { font-size: 11px; margin-bottom: 1px; }
  .skill-line strong { font-weight: 600; }
  .cert-line { font-size: 11px; margin-bottom: 1px; }
  .cert-line strong { font-weight: 600; }
  .lang-line { font-size: 11px; }
  .summary { font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 10px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head>
<body>
  <h1>${escapeHtml(cv.personalInfo.fullName)}</h1>
  <div class="contact">
    ${cv.personalInfo.email ? `<span>${escapeHtml(cv.personalInfo.email)}</span>` : ''}
    ${cv.personalInfo.phone ? `<span>${escapeHtml(cv.personalInfo.phone)}</span>` : ''}
    ${cv.personalInfo.address ? `<span>${escapeHtml(cv.personalInfo.address)}</span>` : ''}
    ${cv.personalInfo.linkedin ? `<span>${escapeHtml(cv.personalInfo.linkedin)}</span>` : ''}
    ${cv.personalInfo.portfolio ? `<span>${escapeHtml(cv.personalInfo.portfolio)}</span>` : ''}
  </div>

  ${cv.summary ? `<div class="section"><h2>${language === 'en' ? 'Professional Summary' : 'Ringkasan Profesional'}</h2><p class="summary">${escapeHtml(cv.summary)}</p></div>` : ''}

  ${cv.experience.length > 0 ? `<div class="section"><h2>${language === 'en' ? 'Experience' : 'Pengalaman'}</h2>${cv.experience.map(e => `
    <div style="margin-bottom:6px">
      <div class="exp-header"><span>${escapeHtml(e.position)}</span><span style="font-weight:400;font-size:10px;color:#6b7280">${e.startDate} – ${e.current ? (language === 'en' ? 'Present' : 'Sekarang') : e.endDate}</span></div>
      <div class="exp-company">${escapeHtml(e.company)}</div>
      ${e.bulletPoints.filter(b => b.trim()).length > 0 ? `<ul>${e.bulletPoints.filter(b => b.trim()).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('')}</div>` : ''}

  ${cv.education.length > 0 ? `<div class="section"><h2>${language === 'en' ? 'Education' : 'Pendidikan'}</h2>${cv.education.map(e => `
    <div style="margin-bottom:3px;display:flex;justify-content:space-between">
      <span><strong>${escapeHtml(e.institution)}</strong> — ${escapeHtml(e.degree)}${e.field ? ' in ' + escapeHtml(e.field) : ''}${e.gpa ? ' (GPA: ' + e.gpa + ')' : ''}</span>
      <span style="font-size:10px;color:#6b7280">${e.startDate} – ${e.endDate}</span>
    </div>
  `).join('')}</div>` : ''}

  ${cv.skills.filter(s => s.items.filter(i => i).length > 0).length > 0 ? `<div class="section"><h2>${language === 'en' ? 'Skills' : 'Keahlian'}</h2>${cv.skills.filter(s => s.items.filter(i => i).length > 0).map(s => `
    <div class="skill-line">${s.category ? `<strong>${escapeHtml(s.category)}:</strong> ` : ''}${s.items.filter(i => i).map(i => escapeHtml(i)).join(', ')}</div>
  `).join('')}</div>` : ''}

  ${cv.certifications.length > 0 ? `<div class="section"><h2>${language === 'en' ? 'Certifications' : 'Sertifikasi'}</h2>${cv.certifications.map(c => `
    <div class="cert-line"><strong>${escapeHtml(c.name)}</strong>${c.issuer ? ' — ' + escapeHtml(c.issuer) : ''}${c.date ? ' (' + c.date + ')' : ''}</div>
  `).join('')}</div>` : ''}

  ${cv.languages.length > 0 ? `<div class="section"><h2>${language === 'en' ? 'Languages' : 'Bahasa'}</h2><div class="lang-line">${cv.languages.map(l => `${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})`).join(', ')}</div></div>` : ''}
</body></html>`

    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 500)
  }, [cv, language])

  function escapeHtml(text: string) {
    if (!text) return ''
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  const getAIContext = useCallback((section: string) => {
    switch (section) {
      case 'summary':
        return cv.experience.map((e) => `${e.position} at ${e.company} (${e.startDate}-${e.endDate}): ${e.bulletPoints.filter(b => b).join('; ')}`).join('\n')
      case 'bullet':
        if (cv.experience.length > 0) {
          const last = cv.experience[cv.experience.length - 1]
          return `Position: ${last.position}\nCompany: ${last.company}\nDescription: ${last.description}`
        }
        return ''
      case 'skills':
        return cv.experience.map((e) => `${e.position} at ${e.company}`).join('\n')
      default:
        return ''
    }
  }, [cv.experience])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <FileText size={18} className="text-accent" weight="duotone" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[600px] rounded-[2rem]" />
          <Skeleton className="h-[842px] rounded-[2rem]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <FileText size={18} className="text-accent" weight="duotone" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm text-foreground font-medium">CV Builder</h2>
          <p className="text-[10px] text-muted mt-0.5">Create and customize your ATS-friendly CV</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-0.5 bg-border/30 rounded-xl">
          {(Object.entries(templateLabels) as [CvTemplateId, { label: string; desc: string }][]).map(([id, cfg]) => (
            <button key={id} onClick={() => setCv((prev) => ({ ...prev, templateId: id }))}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 ${cv.templateId === id ? 'bg-accent text-background' : 'text-muted hover:text-foreground'}`}
              title={cfg.desc}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-0.5 bg-border/30 rounded-xl">
          <button onClick={() => setLanguage('id')}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 flex items-center gap-1 ${language === 'id' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'}`}>
            <Translate size={12} /> ID
          </button>
          <button onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 flex items-center gap-1 ${language === 'en' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'}`}>
            <Translate size={12} /> EN
          </button>
        </div>

        <div className="flex-1" />

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-background rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-all duration-300"
        >
          <FloppyDisk size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saveMsg && <span className="text-xs text-accent">{saveMsg}</span>}

        <button onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-subtle transition-all duration-300"
        >
          <Download size={14} />
          PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-1.5 rounded-[2rem] bg-border/30 max-h-[calc(100vh-220px)] overflow-y-auto">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <CvEditor cv={cv} onChange={setCv} language={language} getAIContext={getAIContext} />
          </div>
        </div>

        <div className="p-1.5 rounded-[2rem] bg-border/30 sticky top-4 self-start">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Preview</span>
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <Sparkle size={10} weight="fill" className="text-accent" />
                ATS-friendly
              </div>
            </div>
            <CvPreview cv={cv} lang={language} previewRef={previewRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
