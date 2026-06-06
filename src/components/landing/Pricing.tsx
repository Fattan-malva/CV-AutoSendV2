'use client'

import { useI18n } from '@/lib/i18n-context'

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
    border: 'border-zinc-800',
    textColor: 'text-zinc-100',
    priceColor: 'text-zinc-100',
    descColor: 'text-zinc-500',
    bg: '',
    cta: false,
  },
  {
    key: 'basic',
    nameKey: 'pricingBasic',
    descKey: 'pricingBasicDesc',
    priceKey: 'pricingBasicPrice',
    border: 'border-zinc-800',
    textColor: 'text-zinc-100',
    priceColor: 'text-green-400',
    descColor: 'text-zinc-400',
    bg: 'bg-green-400/[0.03]',
    cta: true,
  },
  {
    key: 'starter',
    nameKey: 'pricingStarter',
    descKey: 'pricingStarterDesc',
    priceKey: 'pricingStarterPrice',
    border: 'border-zinc-800',
    textColor: 'text-zinc-100',
    priceColor: 'text-green-400',
    descColor: 'text-zinc-400',
    bg: 'bg-green-400/[0.03]',
    cta: true,
  },
  {
    key: 'pro',
    nameKey: 'pricingPro',
    descKey: 'pricingProDesc',
    priceKey: 'pricingProPrice',
    border: 'border-green-400/30',
    textColor: 'text-green-300',
    priceColor: 'text-green-400',
    descColor: 'text-zinc-400',
    bg: 'bg-green-400/[0.03]',
    cta: true,
  },
] as const

export default function Pricing({ onOpenAuth }: PricingProps) {
  const { t } = useI18n()

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 font-mono text-xs text-zinc-500">
          <span className="text-green-400">~/pricing</span>
          <span className="text-zinc-600"> $ ./plans</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.key} className={`border ${tier.border} rounded-xl p-6 text-center backdrop-blur-sm ${tier.bg}`}>
              <h3 className={`font-semibold font-mono text-sm ${tier.textColor}`}>
                {tL(t.landing, tier.nameKey)}
              </h3>
              <p className={`mt-1 text-3xl font-bold font-mono ${tier.priceColor}`}>
                {'priceKey' in tier && tier.priceKey ? tL(t.landing, tier.priceKey) : tier.price}
              </p>
              <p className={`mt-2 text-xs font-mono ${tier.descColor}`}>
                {tL(t.landing, tier.descKey)}
              </p>
              {tier.cta && (
                <button
                  onClick={onOpenAuth}
                  className="mt-4 font-mono text-xs bg-green-400 text-zinc-950 px-4 py-2 rounded-xl font-medium hover:bg-green-300 transition-colors w-full"
                >
                  {'>_'} {t.landing.pricingCta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
