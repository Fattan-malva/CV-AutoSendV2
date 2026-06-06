'use client'

import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { decrypt } from '@/lib/crypto'
import WindowFrame from '@/components/ui/WindowFrame'
import Skeleton from '@/components/ui/Skeleton'
import type { AnalysisResult } from '@/types'

interface FreeDemoProps {
  onOpenAuth: () => void
}

export default function FreeDemo({ onOpenAuth }: FreeDemoProps) {
  const { t, locale } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [used, setUsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cv-autosend-demo-used')
    if (saved === 'true') setUsed(true)
  }, [])

  useEffect(() => {
    if (used) localStorage.setItem('cv-autosend-demo-used', 'true')
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
    <section id="demo" className="py-20 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6 font-mono text-xs text-zinc-500">
          <span className="text-green-400">~/demo</span>
          <span className="text-zinc-600"> $ ./try --free</span>
        </div>

        {used && !result ? (
          <WindowFrame title="~/demo/used" className="p-8 text-center">
            <p className="font-mono text-sm text-zinc-400 pt-9">{t.demo.used}</p>
            <p className="mt-2 font-mono text-xs text-zinc-500 pb-6 break-words whitespace-normal max-w-full">
              {t.demo.usedDesc}
            </p>
          </WindowFrame>
        ) : (
          <>
            {!result && (
              <WindowFrame title="~/demo/upload">
                <label className="flex flex-col items-center gap-3 cursor-pointer pt-10">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-mono text-xs text-zinc-400">{file ? file.name : 'Upload brosur (PDF/JPG/PNG)'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>

                {preview && (
                  <img src={preview} alt="preview" className="mt-4 rounded-lg max-h-40 w-auto mx-auto object-cover" />
                )}

                <div className="mt-4 mb-6 flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="font-mono text-xs bg-green-400 text-zinc-950 rounded-xl px-6 py-2.5 font-medium hover:bg-green-300 disabled:opacity-40 transition-colors min-w-[160px] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Skeleton className="w-4 h-4 rounded-full" />
                        {t.demo.loading}
                      </>
                    ) : t.demo.analyze}
                  </button>
                </div>

                {error && <p className="mt-3 font-mono text-xs text-red-400">{error}</p>}
              </WindowFrame>
            )}

            {result && (
              <div className="mt-6">
                <WindowFrame title="~/demo/result" className="p-6 space-y-3">
                  <div className="pl-3 flex items-center gap-2 mb-3">
                    <span className="text-green-400 font-mono text-xs">$</span>
                    <span className="text-green-400 font-mono text-xs">./result.json</span>
                  </div>
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
                      <label className="font-mono text-[10px] text-zinc-500">{f.label}</label>
                      <p className="font-mono text-xs text-zinc-300 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-zinc-800">
                    <button
                      onClick={onOpenAuth}
                      className="w-full font-mono text-xs bg-green-400 text-zinc-950 rounded-xl px-4 py-2.5 font-medium hover:bg-green-300 transition-colors"
                    >
                      {'>_'} {t.demo.sendEmail}
                    </button>
                  </div>
                </WindowFrame>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
