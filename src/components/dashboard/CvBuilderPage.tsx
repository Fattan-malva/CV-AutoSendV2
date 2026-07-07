'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, FloppyDisk, Download, Translate, Sparkle } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import Skeleton from '@/components/ui/Skeleton'
import CvEditor from './CvEditor'
import CvPreview from './CvPreview'
import { loadCvData, saveCvData, defaultCvData, templateLabels } from '@/services/cv.service'
import type { CvData, CvTemplateId } from '@/types'

export default function CvBuilderPage() {
  const { user } = useAuth()
  const { t } = useI18n()
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
    if (!previewRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${cv.personalInfo.fullName || 'CV'}.pdf`)
  }, [cv.personalInfo.fullName])

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
