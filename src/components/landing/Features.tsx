'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning, Sparkle } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const iconMap = [Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning]

export default function Features() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)

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
                  <p className="text-sm text-muted leading-relaxed flex-1">{f.desc}</p>

                  {i === 0 && (
                    <div className="mt-8 -mb-2 -mr-2 overflow-hidden rounded-2xl ring-1 ring-white/5">
                      <img
                        src="https://picsum.photos/seed/workspace/800/500"
                        alt=""
                        className="w-full h-56 object-cover opacity-80 mix-blend-luminosity grayscale contrast-125 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
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
