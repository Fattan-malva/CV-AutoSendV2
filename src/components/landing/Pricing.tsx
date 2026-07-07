'use client'

import { useI18n } from '@/lib/i18n-context'
import { useScrollReveal } from '@/lib/use-scroll-reveal'
import { ArrowRight, Check } from 'phosphor-react'

interface PricingProps {
  onOpenAuth: () => void
}

function tL(l: Record<string, unknown>, key: string): string {
  const val = l[key]
  return typeof val === 'string' ? val : ''
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
    key: 'basic',
    nameKey: 'pricingBasic',
    descKey: 'pricingBasicDesc',
    priceKey: 'pricingBasicPrice',
    featured: false,
    features: ['20 analisis', '20 pengiriman'],
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
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 })

  return (
    <section id="pricing" className="py-28 px-4">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-md'
        }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-subtle/50 mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted">Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-foreground leading-[1.05] tracking-tight">
            Pilih Paket
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {tiers.map((tier, i) => (
            <div
              key={tier.key}
              className={`transition-all duration-900 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-sm'
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className={`p-1.5 rounded-[2rem] ${tier.featured ? 'bg-accent/30' : 'bg-border/30'}`}>
                <div className={`rounded-[calc(2rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex flex-col`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif text-foreground">
                      {tL(t.landing, tier.nameKey)}
                    </h3>
                    {tier.featured && (
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent px-2 py-0.5 rounded-full border border-accent/30">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-3xl font-serif text-foreground mb-1">
                    {'priceKey' in tier && tier.priceKey ? tL(t.landing, tier.priceKey) : tier.price}
                  </p>
                  <p className="text-xs text-muted mb-6">
                    {tL(t.landing, tier.descKey)}
                  </p>

                  <div className="flex-1 space-y-2.5 mb-8">
                    {tier.features.map((feat, fi) => (
                      <div key={fi} className="flex items-center gap-2.5">
                        <Check size={14} className="text-accent shrink-0" weight="bold" />
                        <span className="text-xs text-muted">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onOpenAuth}
                    className="group flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-accent text-background text-sm font-medium hover:opacity-90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <span>{t.landing.pricingCta}</span>
                    <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
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
