'use client'

import { useEffect, useMemo, useState } from 'react'
import { Brain, Download, FileText, Send, Sparkles, Upload } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import Reveal from './Reveal'
import SpotlightCard from './SpotlightCard'

const iconMap = [FileText, Upload, Brain, Send, Sparkles, Download]

function useTypewriter(phrases: string[], typeSpeed = 45, deleteSpeed = 22, pause = 1500) {
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const current = phrases[phraseIndex]
    if (!current) return
    let timeout: ReturnType<typeof setTimeout>
    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), typeSpeed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), deleteSpeed)
    } else if (deleting && charIndex === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- typewriter timer finishes inside effect
      setDeleting(false)
      setPhraseIndex((p) => (p + 1) % phrases.length)
    }
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pause])

  return phrases[phraseIndex]?.substring(0, charIndex) ?? ''
}

export default function Features() {
  const { t } = useI18n()
  const steps = useMemo(() => t.landing.features.map((f) => f.title), [t])
  const typed = useTypewriter(steps)

  return (
    <section id="features" className="border-b py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.featuresTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.landing.featuresDesc}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {t.landing.features.map((f, i) => {
            const Icon = iconMap[i % iconMap.length]
            const isLead = i === 0

            return (
              <Reveal
                key={i}
                delay={i * 90}
                className={`h-full ${isLead ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2'}`}
              >
                <SpotlightCard className="h-full gap-0 py-0">
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="mb-5 flex size-10 items-center justify-center rounded-md border bg-muted transition-transform duration-500 group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>

                    {isLead && (
                      <div className="mt-8 flex-1 overflow-hidden rounded-lg border bg-muted/40 font-mono text-sm">
                        <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
                          <span className="size-2 rounded-full bg-muted-foreground/30" />
                          <span className="size-2 rounded-full bg-muted-foreground/30" />
                          <span className="size-2 rounded-full bg-muted-foreground/30" />
                        </div>
                        <div className="flex min-h-24 items-center gap-2 px-4 py-5">
                          <span className="text-muted-foreground">$</span>
                          <span className="text-foreground/90">{typed}</span>
                          <span className="inline-block h-4 w-[2px] animate-pulse bg-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
