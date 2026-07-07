'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning, Sparkle } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const iconMap = [Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning]

function useTypewriter(phrases: string[], typeSpeed = 45, deleteSpeed = 22, pause = 1500) {
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const current = phrases[phraseIndex]
    let timeout: ReturnType<typeof setTimeout>
    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), typeSpeed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), deleteSpeed)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setPhraseIndex((p) => (p + 1) % phrases.length)
    }
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pause])

  return phrases[phraseIndex].substring(0, charIndex)
}

export default function Features() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  const steps = useMemo(() => t.landing.features.map((f) => f.title), [t])
  const typed = useTypewriter(steps)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.feat-card')
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, rotateX: 8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            ease: 'expo.out',
            delay: i * 0.15,
            scrollTrigger: { trigger: card, start: 'top 85%' },
          }
        )
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="features" className="relative py-32 md:py-48 px-4 sm:px-8 overflow-hidden">
      {/* Ethereal Glass background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/8 blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[140px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="mb-20 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-surface border border-border backdrop-blur-md w-fit">
            <Sparkle size={12} weight="fill" className="text-accent" />
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium mt-[1px]">
              {t.landing.featuresTitle}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-foreground leading-[0.95] tracking-tight">
            {t.landing.featuresTitle}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed font-light">
            {t.landing.featuresDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(0,1fr)] gap-4 md:gap-6 grid-flow-dense">
          {t.landing.features.map((f, i) => {
            const Icon = iconMap[i % iconMap.length]
            const spans =
              i === 0
                ? 'md:col-span-7 md:row-span-2'
                : i === 1
                ? 'md:col-span-5 md:row-span-1'
                : 'md:col-span-5 md:row-span-1'

            return (
              <div key={i} className={`feat-card p-[1px] rounded-[2rem] bg-gradient-to-b from-border to-transparent ${spans}`}>
                <div
                  className={`rounded-[calc(2rem-1px)] bg-card h-full flex flex-col group overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${
                    i === 0 ? 'p-10' : 'p-7'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <Icon size={24} className="text-accent" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>

                  {i === 0 && (
                    <div className="mt-8 -mb-2 -mr-2 flex-1 min-h-[200px] rounded-2xl ring-1 ring-white/5 overflow-hidden relative bg-gradient-to-br from-accent/10 via-transparent to-transparent flex flex-col">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                      </div>
                      <div className="flex-1 flex items-center px-5">
                        <span className="text-accent mr-2 font-mono text-sm">$</span>
                        <span className="font-mono text-sm text-foreground/90">
                          {typed}
                          <span className="inline-block w-[2px] h-4 bg-accent ml-0.5 animate-blink align-middle" />
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-transparent via-accent/10 to-accent/25 blur-xl animate-[scan_3s_ease-in-out_infinite_alternate] pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
