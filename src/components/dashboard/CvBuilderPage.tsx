'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Save,
  Languages,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import CvEditor from './CvEditor'
import CvPreview from './CvPreview'
import { cvHTML, defaultCvData, templateLabels } from '@/services/cv.service'
import type { CvData, CvTemplateId } from '@/types'

export default function CvBuilderPage() {
  const { user } = useAuth()
  const [cv, setCv] = useState<CvData>(defaultCvData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [translating, setTranslating] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/cv-data', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { cvData: data } = await response.json()
        if (data) {
          setCv(data)
          setLanguage(data.language)
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user])

  const translatingRef = useRef(false)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 3) => {
      for (let attempt = 0; attempt < retries; attempt++) {
        const res = await fetch(url, options)
        if (res.ok) return res
        if (res.status >= 500 && attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, attempt)))
          continue
        }
        throw new Error((await res.json()).error || `HTTP ${res.status}`)
      }
      throw new Error('Service unavailable')
    },
    []
  )

  const handleLanguageChange = useCallback(
    async (newLang: 'id' | 'en') => {
      if (newLang === language || translatingRef.current || !user) return
      translatingRef.current = true
      setTranslating(true)

      const currentCv = cv
      const hasContent =
        currentCv.summary ||
        currentCv.experience.length ||
        currentCv.education.length ||
        currentCv.skills.some((skill) => skill.items.filter((item) => item).length) ||
        currentCv.certifications.length ||
        currentCv.languages.length

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
        const res = await fetchWithRetry('/api/cv-assist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            section: 'translate-all',
            language: newLang,
            context: JSON.stringify(currentCv),
          }),
        })

        const data = await res.json()
        const translated = { ...currentCv, ...data.translated, language: newLang }

        await fetch('/api/cv-data', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cvData: translated }),
        })

        if (mountedRef.current) {
          setCv(translated)
          setLanguage(newLang)
          setDirty(false)
          toast.success(`CV translated to ${newLang === 'id' ? 'Indonesian' : 'English'}`)
        }
      } catch (error) {
        if (mountedRef.current) {
          setLanguage(language)
          setCv(currentCv)
          toast.error(error instanceof Error ? error.message : 'Translation failed')
        }
      } finally {
        translatingRef.current = false
        if (mountedRef.current) setTranslating(false)
      }
    },
    [cv, language, user, fetchWithRetry]
  )

  const handleChange = useCallback((next: CvData) => {
    setCv(next)
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/cv-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvData: { ...cv, language } }),
      })
      if (!res.ok) throw new Error('Failed to save CV')
      setDirty(false)
      toast.success('CV saved to your workspace')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save CV')
    } finally {
      setSaving(false)
    }
  }, [cv, language, user])

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

  const getAIContext = useCallback(
    (section: string) => {
      switch (section) {
        case 'summary':
          return cv.experience
            .map(
              (exp) =>
                `${exp.position} at ${exp.company} (${exp.startDate}-${exp.endDate}): ${exp.bulletPoints
                  .filter(Boolean)
                  .join('; ')}`
            )
            .join('\n')
        case 'bullet':
          if (cv.experience.length > 0) {
            const last = cv.experience[cv.experience.length - 1]
            return `Position: ${last.position}\nCompany: ${last.company}\nDescription: ${last.description}`
          }
          return ''
        case 'skills':
          return cv.experience.map((exp) => `${exp.position} at ${exp.company}`).join('\n')
        default:
          return ''
      }
    },
    [cv.experience]
  )

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-10 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-3 w-56' />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <Skeleton className='h-[600px] rounded-xl' />
          <Skeleton className='h-[842px] rounded-xl' />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-semibold tracking-tight'>CV Builder</h2>
            <Badge variant='outline' className='gap-1 text-[10px]'>
              <Sparkles className='size-3 text-primary' /> AI assisted
            </Badge>
            {dirty ? (
              <Badge variant='secondary' className='text-[10px]'>
                Unsaved changes
              </Badge>
            ) : (
              <Badge
                variant='secondary'
                className='gap-1 border-transparent bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'
              >
                <CheckCircle2 className='size-3' /> Saved
              </Badge>
            )}
          </div>
          <p className='text-sm text-muted-foreground'>
            Create and customize your ATS-friendly CV with AI writing help.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleDownloadPdf}>
            <Download className='size-4' /> Download PDF
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving || !dirty}>
            {saving ? <Loader2 className='size-4 animate-spin' /> : <Save className='size-4' />}
            {saving ? 'Saving…' : 'Save CV'}
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Tabs
          value={cv.templateId}
          onValueChange={(value) => handleChange({ ...cv, templateId: value as CvTemplateId })}
        >
          <TabsList className='h-9'>
            {(Object.entries(templateLabels) as [CvTemplateId, { label: string; desc: string }][]).map(
              ([id, config]) => (
                <TabsTrigger key={id} value={id} className='text-xs' title={config.desc}>
                  {config.label}
                </TabsTrigger>
              )
            )}
          </TabsList>
        </Tabs>

        <div className='flex items-center gap-1 rounded-lg border bg-card p-0.5'>
          <Button
            variant={language === 'id' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 gap-1.5 px-2.5 text-xs'
            onClick={() => void handleLanguageChange('id')}
            disabled={translating}
          >
            <Languages className='size-3.5' /> ID
          </Button>
          <Button
            variant={language === 'en' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 gap-1.5 px-2.5 text-xs'
            onClick={() => void handleLanguageChange('en')}
            disabled={translating}
          >
            <Languages className='size-3.5' /> EN
          </Button>
        </div>

        {translating ? (
          <div className='flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1.5 text-xs text-primary'>
            <Loader2 className='size-3 animate-spin' />
            Translating CV…
          </div>
        ) : null}

        <div className='ms-auto flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Sparkles className='size-3.5 text-primary' />
          ATS-friendly templates
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card className='max-h-[calc(100vh-16rem)] gap-0 overflow-hidden py-0'>
          <CardHeader className='border-b px-4 py-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <FileText className='size-4 text-primary' />
              Editor
            </CardTitle>
            <CardDescription className='text-xs'>
              Fill in your details — changes stay local until you save.
            </CardDescription>
          </CardHeader>
          <CardContent className='overflow-y-auto p-3'>
            <CvEditor
              cv={cv}
              onChange={handleChange}
              language={language}
              getAIContext={getAIContext}
            />
          </CardContent>
        </Card>

        <Card className='sticky top-20 max-h-[calc(100vh-7rem)] gap-0 self-start overflow-hidden py-0'>
          <CardHeader className='border-b px-4 py-3'>
            <CardTitle className='text-sm'>Live preview</CardTitle>
            <CardDescription className='text-xs'>
              This is how your CV looks when exported.
            </CardDescription>
            <CardAction>
              <Badge variant='outline' className='gap-1 text-[10px]'>
                <Sparkles className='size-3 text-primary' /> A4
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className='overflow-y-auto bg-muted/30 p-4'>
            <div className='mx-auto w-full max-w-[595px] shadow-xl'>
              <CvPreview cv={cv} lang={language} previewRef={previewRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
