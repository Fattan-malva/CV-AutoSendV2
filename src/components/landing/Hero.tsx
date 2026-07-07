'use client'

import { useI18n } from '@/lib/i18n-context'
import { useScrollReveal } from '@/lib/use-scroll-reveal'
import { ArrowRight, Sparkle } from 'phosphor-react'

interface HeroProps {
  onOpenAuth: () => void
}

const staggerCards = [
  { label: 'Upload Brosur', desc: 'PDF / JPG / PNG' },
  { label: 'AI Analisis', desc: 'Gemini ekstrak data' },
  { label: 'Kirim Otomatis', desc: 'CV + email via SMTP' },
]

export default function Hero({ onOpenAuth }: HeroProps) {
  const { t } = useI18n()
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 })
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal({ threshold: 0.1 })

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-[100dvh] px-4 pt-40 pb-24 flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div
          ref={ref}
          className={`transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-md'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-subtle/50 mb-8">
            <Sparkle size={12} className="text-accent" weight="fill" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted">
              AI-Powered
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif text-foreground leading-[0.95] tracking-tight">
            {t.landing.heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted max-w-md leading-relaxed">
            {t.landing.heroSub}
          </p>

          <div ref={ctaRef} className={`flex items-center gap-4 mt-10 transition-all duration-700 delay-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <button
              onClick={scrollToDemo}
              className="group flex items-center gap-3 px-6 py-3 rounded-full bg-accent text-background text-sm font-medium hover:opacity-90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <span>{t.landing.cta}</span>
              <span className="w-7 h-7 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform duration-300">
                <ArrowRight size={14} weight="bold" className="text-background" />
              </span>
            </button>
            <button
              onClick={onOpenAuth}
              className="group flex items-center gap-2 px-5 py-3 rounded-full border border-border text-foreground text-sm hover:bg-subtle transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <span>{t.landing.login}</span>
              <span className="w-7 h-7 rounded-full bg-subtle flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                <ArrowRight size={14} className="text-muted" />
              </span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-4">
          {staggerCards.map((card, i) => (
            <div
              key={i}
              className={`p-1.5 rounded-[2rem] bg-border/40 transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isVisible ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-16 blur-md'
              }`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-card px-6 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-serif font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.label}</p>
                    <p className="text-xs text-muted mt-0.5">{card.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
