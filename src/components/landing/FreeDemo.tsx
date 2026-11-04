'use client'

import { useEffect, useState, type DragEvent } from 'react'
import { ArrowRight, LoaderCircle, TriangleAlert, Upload } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Reveal from './Reveal'
import type { AnalysisResult } from '@/types'

interface FreeDemoProps {
  onOpenAuth: () => void
}

const DEMO_KEY = 'ceefy-demo-used'
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export default function FreeDemo({ onOpenAuth }: FreeDemoProps) {
  const { t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [used, setUsed] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DEMO_KEY) === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading persisted demo flag on mount
        setUsed(true)
      }
    } catch {
      // Storage can be blocked (private mode); the demo then simply isn't limited.
    }
  }, [])

  useEffect(() => {
    if (!used) return
    try {
      localStorage.setItem(DEMO_KEY, 'true')
    } catch {
      // ignore
    }
  }, [used])

  const handleFile = (f: File) => {
    setFile(f)
    setError('')
    setResult(null)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview('')
    }
  }

  const pickFile = (f: File | undefined) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Format tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.')
      return
    }
    handleFile(f)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const toBase64 = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            resolve(dataUrl.split(',')[1])
          }
          reader.onerror = reject
          reader.readAsDataURL(f)
        })

      const imageData = await toBase64(file)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
      setUsed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const resultFields = result
    ? [
        { label: 'Subjek', value: result.subjek, wide: false },
        { label: 'Email', value: result.email, wide: false },
        { label: 'Perusahaan', value: result.nama_perusahaan, wide: false },
        { label: 'Posisi', value: result.posisi, wide: false },
        { label: 'Intro', value: result.intro, wide: true },
        { label: 'Alasan', value: result.alasan, wide: true },
        { label: 'Penutup', value: result.penutup, wide: true },
      ]
    : []

  return (
    <section id="demo" className="w-full">
      <div className="grid md:grid-cols-2">
        <Reveal className="flex flex-col justify-center gap-5 p-6 md:p-10 lg:p-14">
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t.demo.label}
          </Badge>
          <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl">{t.demo.title}</h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">{t.demo.upload}</p>
        </Reveal>

        <Reveal delay={120} className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
          {used && !result ? (
            <Alert>
              <TriangleAlert />
              <AlertTitle>{t.demo.used}</AlertTitle>
              <AlertDescription>
                <p>{t.demo.usedDesc}</p>
                <Button className="group mt-3 rounded-full" onClick={onOpenAuth}>
                  {t.demo.sendEmail}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </AlertDescription>
            </Alert>
          ) : result ? (
            <Card className="gap-0 py-0 shadow-none">
              <CardContent className="p-5 md:p-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  {resultFields.map((f) => (
                    <div key={f.label} className={f.wide ? 'sm:col-span-2' : undefined}>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="h-2" />
                <Button className="group w-full rounded-full" onClick={onOpenAuth}>
                  {t.demo.sendEmail}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="gap-0 py-0 shadow-none">
              <CardContent className="space-y-5 p-5 md:p-6">
                <label
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed p-7 text-center transition-colors duration-300 hover:bg-muted/50',
                    dragging && 'border-brand bg-brand/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-11 items-center justify-center rounded-full bg-muted transition-transform duration-300',
                      dragging && 'scale-110'
                    )}
                  >
                    <Upload className="size-5 text-brand" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : dragging ? 'Lepaskan brosur di sini' : 'Upload brosur (PDF/JPG/PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </label>

                {preview && (
                  <img src={preview} alt="Preview brosur" className="mx-auto max-h-36 rounded-md border object-contain" />
                )}

                {error && <p className="text-center text-sm text-destructive">{error}</p>}

                <Button
                  size="lg"
                  className="w-full rounded-full"
                  disabled={!file || loading}
                  onClick={handleAnalyze}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      {t.demo.loading}
                    </>
                  ) : (
                    t.demo.analyze
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </Reveal>
      </div>
    </section>
  )
}
