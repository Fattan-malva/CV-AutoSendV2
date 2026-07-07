'use client'

import { useState, useEffect } from 'react'
import { Upload, ArrowRight, Warning } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'
import { decrypt } from '@/lib/crypto'
import { useScrollReveal } from '@/lib/use-scroll-reveal'
import Skeleton from '@/components/ui/Skeleton'
import type { AnalysisResult } from '@/types'

interface FreeDemoProps {
  onOpenAuth: () => void
}

export default function FreeDemo({ onOpenAuth }: FreeDemoProps) {
  const { t } = useI18n()
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [used, setUsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ceefy-demo-used')
    if (saved === 'true') setUsed(true)
  }, [])

  useEffect(() => {
    if (used) localStorage.setItem('ceefy-demo-used', 'true')
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

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const toBase64 = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
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

  return (
    <section id="demo" className="relative py-32 md:py-48 px-4 sm:px-8 overflow-hidden">
      {/* Ethereal Glass background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/6 blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/5 blur-[140px] mix-blend-screen" />
      </div>
      <div ref={ref} className={`max-w-2xl mx-auto relative z-10 transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-md'
      }`}>
        <div className="mb-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-foreground leading-[1.02] tracking-tight text-start">
            {t.demo.title}
          </h2>
          <p className="mt-5 text-base text-muted leading-relaxed max-w-lg">
            {t.demo.upload}
          </p>
        </div>

        {used && !result ? (
          <div className="p-[1px] rounded-[2rem] bg-gradient-to-b from-border to-transparent">
            <div className="rounded-[calc(2rem-1px)] bg-card p-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <Warning size={28} className="text-accent mx-auto mb-4" />
              <p className="text-sm text-foreground">{t.demo.used}</p>
              <p className="mt-2 text-xs text-muted break-words whitespace-normal max-w-full">
                {t.demo.usedDesc}
              </p>
              <button
                onClick={onOpenAuth}
                className="group inline-flex items-center justify-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                <span>{t.demo.sendEmail}</span>
                <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <ArrowRight size={12} weight="bold" className="text-background" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {!result && (
              <div className="p-[1px] rounded-[2rem] bg-gradient-to-b from-border to-transparent">
                <div className="rounded-[calc(2rem-1px)] bg-card p-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                  <label className="flex flex-col items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Upload size={22} className="text-accent" />
                    </div>
                    <span className="text-sm text-muted">{file ? file.name : 'Upload brosur (PDF/JPG/PNG)'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </label>

                  {preview && (
                    <img src={preview} alt="preview" className="mt-6 rounded-xl max-h-40 w-auto mx-auto object-cover" />
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={!file || loading}
                      className="group inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-full px-6 py-3 font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] min-w-[180px]"
                    >
                      {loading ? (
                        <>
                          <Skeleton className="w-4 h-4 rounded-full" />
                          {t.demo.loading}
                        </>
                      ) : t.demo.analyze}
                      {!loading && (
                        <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <ArrowRight size={12} weight="bold" className="text-background" />
                        </span>
                      )}
                    </button>
                  </div>

                  {error && <p className="mt-4 text-xs text-red-400/80">{error}</p>}
                </div>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <div className="p-[1px] rounded-[2rem] bg-gradient-to-b from-border to-transparent">
                  <div className="rounded-[calc(2rem-1px)] bg-card p-7 space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                    {[
                      { label: 'Subjek', value: result.subjek },
                      { label: 'Email', value: result.email },
                      { label: 'Perusahaan', value: result.nama_perusahaan },
                      { label: 'Posisi', value: result.posisi },
                      { label: 'Intro', value: result.intro },
                      { label: 'Alasan', value: result.alasan },
                      { label: 'Penutup', value: result.penutup },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="text-[10px] uppercase tracking-wider text-muted">{f.label}</label>
                        <p className="text-xs text-foreground/80 mt-0.5">{f.value}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={onOpenAuth}
                        className="group w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-full px-5 py-3 font-medium text-sm hover:opacity-90 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                      >
                        <span>{t.demo.sendEmail}</span>
                        <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <ArrowRight size={12} weight="bold" className="text-background" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
