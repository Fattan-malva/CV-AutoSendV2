'use client'

import { useI18n } from '@/lib/i18n-context'
import { useScrollReveal } from '@/lib/use-scroll-reveal'
import { Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning } from 'phosphor-react'

const iconMap = [Upload, Brain, PaperPlaneTilt, Folder, Lock, Lightning]

export default function Features() {
  const { t } = useI18n()
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 })

  return (
    <section id="features" className="py-28 px-4">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-md'
        }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-subtle/50 mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted">Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-foreground leading-[1.05] tracking-tight">
            Cara Kerja
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {t.landing.features.map((f, i) => {
            const Icon = iconMap[i % iconMap.length]
            const spans = [
              'md:col-span-7 md:row-span-1',
              'md:col-span-5 md:row-span-2',
              'md:col-span-5 md:row-span-1',
              'md:col-span-4 md:row-span-1',
              'md:col-span-4 md:row-span-1',
              'md:col-span-4 md:row-span-1',
            ]

            return (
              <div
                key={i}
                className={`p-1.5 rounded-[2rem] bg-border/30 transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${spans[i]} ${
                  isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-sm'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-serif text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
