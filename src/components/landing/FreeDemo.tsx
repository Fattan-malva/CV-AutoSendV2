'use client'

import { useEffect, useState, type DragEvent } from 'react'
import { ArrowRight, LoaderCircle, TriangleAlert, Upload } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
    <section id="demo" className="border-b py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-8">
        <Reveal>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t.demo.label}
          </Badge>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{t.demo.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.demo.upload}</p>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          {used && !result ? (
            <Alert>
              <TriangleAlert />
              <AlertTitle>{t.demo.used}</AlertTitle>
              <AlertDescription>
                <p>{t.demo.usedDesc}</p>
                <Button className="group mt-4" onClick={onOpenAuth}>
                  {t.demo.sendEmail}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </AlertDescription>
            </Alert>
          ) : result ? (
            <Card className="gap-0 py-0">
              <CardContent className="p-6 sm:p-8">
                <dl className="grid gap-5 sm:grid-cols-2">
                  {resultFields.map((f) => (
                    <div key={f.label} className={f.wide ? 'sm:col-span-2' : undefined}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <Separator className="my-6" />
                <Button className="group w-full" onClick={onOpenAuth}>
                  {t.demo.sendEmail}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="gap-0 py-0">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <label
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center transition-colors duration-300 hover:bg-muted/50',
                    dragging && 'border-primary bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-full bg-muted transition-transform duration-300',
                      dragging && 'scale-110'
                    )}
                  >
                    <Upload className="size-5" />
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
                  <img
                    src={preview}
                    alt="Preview brosur"
                    className="mx-auto max-h-40 rounded-md border object-contain"
                  />
                )}

                {error && <p className="text-center text-sm text-destructive">{error}</p>}

                <div className="flex justify-center">
                  <Button size="lg" className="min-w-44" disabled={!file || loading} onClick={handleAnalyze}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        {t.demo.loading}
                      </>
                    ) : (
                      t.demo.analyze
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </Reveal>
      </div>
    </section>
  )
}
