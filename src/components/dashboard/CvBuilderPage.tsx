'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, FloppyDisk, Download, Translate, Sparkle } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import Skeleton from '@/components/ui/Skeleton'
import CvEditor from './CvEditor'
import CvPreview from './CvPreview'
import { loadCvData, saveCvData, defaultCvData, templateLabels, cvHTML } from '@/services/cv.service'
import type { CvData, CvTemplateId } from '@/types'

export default function CvBuilderPage() {
  const { user } = useAuth()
  const [cv, setCv] = useState<CvData>(defaultCvData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [translating, setTranslating] = useState(false)
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

  const translatingRef = useRef(false)
  const mountedRef = useRef(true)
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false } }, [])

  const fetchWithRetry = useCallback(async (url: string, options: RequestInit, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      const res = await fetch(url, options)
      if (res.ok) return res
      if (res.status >= 500 && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)))
        continue
      }
      throw new Error((await res.json()).error || `HTTP ${res.status}`)
    }
    throw new Error('Service unavailable')
  }, [])

  const handleLanguageChange = useCallback(async (newLang: 'id' | 'en') => {
    if (newLang === language || translatingRef.current || !user) return
    translatingRef.current = true
    setTranslating(true)

    const currentCv = cv
    const hasContent = currentCv.summary || currentCv.experience.length || currentCv.education.length || currentCv.skills.some(s => s.items.filter(i => i).length) || currentCv.certifications.length || currentCv.languages.length

    if (!hasContent) {
      if (mountedRef.current) {
        setLanguage(newLang)
        setCv((prev) => ({ ...prev, language: newLang }))
      }
      translatingRef.current = false
      if (mountedRef.current) setTranslating(false)
      return
    }

    try {
      const token = await user.getIdToken()
      const payload = JSON.stringify(currentCv)

      const res = await fetchWithRetry('/api/cv-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ section: 'translate-all', language: newLang, context: payload }),
      })

      const data = await res.json()
      const translated = { ...currentCv, ...data.translated, language: newLang }

      await saveCvData(user.uid, translated)

      if (mountedRef.current) {
        setCv(translated)
        setLanguage(newLang)
      }
    } catch {
      if (mountedRef.current) {
        setLanguage(language)
        setCv(currentCv)
      }
    } finally {
      translatingRef.current = false
      if (mountedRef.current) setTranslating(false)
    }
  }, [cv, language, user, fetchWithRetry])

  // CV Builder: do NOT write to Firestore.
  // Firestore update happens only on CV upload (Settings) or when user updates Settings.
  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      // no-op: keep local changes only
      setSaveMsg('Saved locally!')
      setTimeout(() => setSaveMsg(''), 2000)
    } finally {
      setSaving(false)
    }
  }, [])

  // Disable debounce auto-save to Firestore.
  useEffect(() => {
    // no-op
  }, [])

  const handleDownloadPdf = useCallback(() => {
    const el = document.createElement('style')
    el.id = '__cv_print_style'
    el.textContent = `
      @page { margin: 0; size: A4; }
      body > * { display: none !important; }
      #__cv_print_area { display: block !important; position: fixed !important; top: 0; left: 0; width: 210mm; padding: 15mm 20mm; background: #fff; color: #111827; font-family: 'Inter','Segoe UI',sans-serif; font-size: 11px; line-height: 1.5; z-index: 99999; }
      #__cv_print_area h1 { font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 2px; }
      #__cv_print_area h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 4px; padding-bottom: 2px; border-bottom: 1px solid #d1d5db; }
      #__cv_print_area .contact { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
      #__cv_print_area .contact span { margin-right: 12px; }
      #__cv_print_area .section { margin-bottom: 10px; }
      #__cv_print_area .exp-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 12px; }
      #__cv_print_area .exp-company { font-size: 10px; color: #6b7280; }
      #__cv_print_area ul { list-style: disc; padding-left: 16px; margin-top: 2px; }
      #__cv_print_area li { font-size: 11px; color: #374151; margin-bottom: 1px; }
      #__cv_print_area .summary { font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 10px; }
      #__cv_print_area .skill-line { font-size: 11px; margin-bottom: 1px; }
      #__cv_print_area .cert-line { font-size: 11px; margin-bottom: 1px; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `
    document.head.appendChild(el)

    const printDiv = document.createElement('div')
    printDiv.id = '__cv_print_area'
    printDiv.innerHTML = cvHTML(cv, language)
    document.body.appendChild(printDiv)

    setTimeout(() => {
      window.print()
      document.head.removeChild(el)
      document.body.removeChild(printDiv)
    }, 100)
  }, [cv, language])

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
          <button onClick={() => handleLanguageChange('id')} disabled={translating}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 flex items-center gap-1 ${language === 'id' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'} disabled:opacity-50`}>
            <Translate size={12} /> ID
          </button>
          <button onClick={() => handleLanguageChange('en')} disabled={translating}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 flex items-center gap-1 ${language === 'en' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'} disabled:opacity-50`}>
            <Translate size={12} /> EN
          </button>
          {translating && (
            <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-accent font-medium">Translating CV...</span>
            </div>
          )}
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
