'use client'

import { ArrowRight, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Reveal from './Reveal'
import SpotlightCard from './SpotlightCard'

interface PricingProps {
  onOpenAuth: () => void
}

const tiers = [
  { key: 'free', nameKey: 'pricingFree', descKey: 'pricingFreeDesc', price: '$0', featured: false },
  { key: 'basic', nameKey: 'pricingBasic', descKey: 'pricingBasicDesc', priceKey: 'pricingBasicPrice', featured: false },
  { key: 'starter', nameKey: 'pricingStarter', descKey: 'pricingStarterDesc', priceKey: 'pricingStarterPrice', featured: false },
  { key: 'pro', nameKey: 'pricingPro', descKey: 'pricingProDesc', priceKey: 'pricingProPrice', featured: true },
] as const

export default function Pricing({ onOpenAuth }: PricingProps) {
  const { t } = useI18n()
  const L = t.landing as unknown as Record<string, string>
  const featureMap = t.landing.pricingFeatures as Record<string, string[]>

  return (
    <section id="pricing" className="w-full">
      <Reveal className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{t.landing.pricingTitle}</h2>
        <p className="max-w-md text-base text-muted-foreground">{t.landing.pricingDesc}</p>
      </Reveal>

      {/* Tier cards in a spaced grid */}
      <div className="grid gap-3 p-3 sm:grid-cols-2 md:p-4 lg:grid-cols-4">
        {tiers.map((tier, i) => {
          const price = 'priceKey' in tier ? L[tier.priceKey] : tier.price
          const features = featureMap[tier.key] ?? []

          return (
            <Reveal key={tier.key} delay={i * 80} className="h-full">
              <SpotlightCard
                className={cn(
                  'h-full gap-5 rounded-2xl border-0 py-6 shadow-none',
                  tier.featured && 'bg-brand/[0.07]'
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{L[tier.nameKey]}</CardTitle>
                    {tier.featured && <Badge className="bg-brand text-brand-foreground">{t.landing.pricingPopular}</Badge>}
                  </div>
                  <CardDescription>{L[tier.descKey]}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="text-4xl font-bold tracking-tight">{price}</p>
                  <ul className="flex-1 space-y-2.5">
                    {features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="group w-full rounded-full"
                    variant={tier.featured ? 'default' : 'outline'}
                    onClick={onOpenAuth}
                  >
                    {t.landing.pricingCta}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Button>
                </CardFooter>
              </SpotlightCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
