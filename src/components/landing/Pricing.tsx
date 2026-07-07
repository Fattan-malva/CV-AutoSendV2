'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Check, Sparkle } from 'phosphor-react'
import { useI18n } from '@/lib/i18n-context'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface PricingProps {
  onOpenAuth: () => void
}

const tiers = [
  {
    key: 'free',
    nameKey: 'pricingFree',
    descKey: 'pricingFreeDesc',
    price: '$0',
    featured: false,
    features: ['3 analisis', '3 pengiriman'],
  },
  {
    key: 'starter',
    nameKey: 'pricingStarter',
    descKey: 'pricingStarterDesc',
    priceKey: 'pricingStarterPrice',
    featured: true,
    features: ['80 analisis', '80 pengiriman', 'Prioritas'],
  },
  {
    key: 'pro',
    nameKey: 'pricingPro',
    descKey: 'pricingProDesc',
    priceKey: 'pricingProPrice',
    featured: false,
    features: ['Unlimited', 'Semua fitur'],
  },
] as const

export default function Pricing({ onOpenAuth }: PricingProps) {
  const { t } = useI18n()
  const L = t.landing as unknown as Record<string, string>
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.price-card')
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: { trigger: card, start: 'top 88%' },
          }
        )
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="pricing" className="relative py-32 md:py-48 px-4 sm:px-8 overflow-hidden">
      {/* Ethereal Glass background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-accent/5 blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-accent/6 blur-[160px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>
      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="mb-20 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-surface border border-border backdrop-blur-md w-fit">
            <Sparkle size={12} weight="fill" className="text-accent" />
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium mt-[1px]">
              {t.landing.pricingTitle}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-foreground leading-[0.95] tracking-tight">
            {t.landing.pricingTitle}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed font-light">
            {t.landing.pricingDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {tiers.map((tier) => (
            <div key={tier.key} className="price-card group">
              <div
                className={`p-[1px] rounded-[2rem] h-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-2 ${
                  tier.featured
                    ? 'bg-gradient-to-b from-accent/40 via-accent/20 to-white/5'
                    : 'bg-gradient-to-b from-white/10 to-white/[0.02]'
                }`}
              >
                <div className="rounded-[calc(2rem-1px)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-serif text-foreground">
                      {L[tier.nameKey]}
                    </h3>
                    {tier.featured && (
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent px-2.5 py-1 rounded-full border border-accent/30">
                        {t.landing.pricingPopular}
                      </span>
                    )}
                  </div>

                  <p className="text-4xl font-serif text-foreground mb-1">
                    {(tier as any).priceKey ? L[(tier as any).priceKey as string] : (tier as any).price}
                  </p>
                  <p className="text-xs text-muted mb-8">
                    {L[tier.descKey]}
                  </p>

                  <div className="flex-1 space-y-3 mb-8">
                    {tier.features.map((feat, fi) => (
                      <div key={fi} className="flex items-center gap-2.5">
                        <Check size={15} className="text-accent shrink-0" weight="bold" />
                        <span className="text-sm text-muted">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onOpenAuth}
                    className="group/btn flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <span>{t.landing.pricingCta}</span>
                    <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:-translate-y-[1px] group-hover/btn:scale-105 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <ArrowRight size={12} weight="bold" className="text-background" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
