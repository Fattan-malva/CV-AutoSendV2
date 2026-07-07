'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChatCircleText, ShieldCheck, Lightning, Target } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

const iconMap = [Target, Lightning, ShieldCheck]

export default function DesireSection() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Cards: gentle continuous float, never disappear (no hard cut)
      gsap.set('.desire-card', { y: 0, opacity: 1 })
      gsap.to('.desire-card', {
        y: -10,
        duration: 2.4,
        ease: 'sine.inOut',
        stagger: { each: 0.4, yoyo: true, repeat: -1 },
      })

      // Words: seamless breathing shimmer, per-word phase offset, no dead pause
      gsap.set('.scrub-word', { opacity: 0.22 })
      gsap.to('.scrub-word', {
        opacity: 1,
        duration: 1.6,
        ease: 'sine.inOut',
        stagger: { each: 0.12, yoyo: true, repeat: -1 },
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="why-different" className="relative py-32 md:py-48 px-4 sm:px-8 overflow-hidden">
      {/* Ethereal Glass ambient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/6 blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-0 right-[-5%] w-[35vw] h-[35vw] rounded-full bg-accent/5 blur-[140px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>
      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          <div className="w-full md:w-1/2">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-surface border border-border backdrop-blur-md w-fit">
                <ChatCircleText size={12} weight="fill" className="text-accent" />
                <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium mt-[1px]">
                  {t.landing.desireLabel}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-foreground leading-[0.95] tracking-tight">
                {t.landing.desireTitle}
              </h2>
              <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed max-w-md font-light">
                {t.landing.desireParagraph.split(' ').map((w, i) => (
                  <span key={i} className="scrub-word">
                    {w}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-6 md:pt-0">
            {t.landing.desireCards.map((g, i) => {
              const Icon = iconMap[i % iconMap.length]
              return (
                <div key={i} className="desire-card p-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-white/[0.02]">
                  <div className="rounded-[calc(2rem-1px)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon size={24} className="text-accent" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-foreground mb-2">{g.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
