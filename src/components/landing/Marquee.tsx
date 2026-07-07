'use client'

import { Lightning, Brain, ShieldCheck, PaperPlaneTilt, Image, Sparkle } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

const iconMap = [Lightning, Brain, ShieldCheck, PaperPlaneTilt, Image, Sparkle]

export default function Marquee() {
  const { t } = useI18n()
  const row = [...t.landing.marqueeItems, ...t.landing.marqueeItems]

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Ethereal Glass background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] rounded-full bg-accent/4 blur-[120px] mix-blend-screen" />
      </div>
      <div className="relative flex overflow-hidden select-none gap-16">
        {[0, 1].map((group) => (
          <div
            key={group}
            aria-hidden={group === 1}
            className="animate-marquee flex shrink-0 items-center gap-16 whitespace-nowrap"
          >
            {row.map((label, i) => {
              const Icon = iconMap[i % iconMap.length]
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon size={22} className="text-accent/60" weight="duotone" />
                  <span className="text-lg font-serif text-foreground/80">{label}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
