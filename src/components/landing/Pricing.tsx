'use client'

import { ArrowRight, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
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
    <section id="pricing" className="border-b bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.pricingTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.landing.pricingDesc}
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => {
            const price = 'priceKey' in tier ? L[tier.priceKey] : tier.price
            const features = featureMap[tier.key] ?? []

            return (
              <Reveal key={tier.key} delay={i * 90} className="h-full">
                <SpotlightCard
                  className={`h-full gap-6 py-6 hover:-translate-y-1 ${
                    tier.featured ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{L[tier.nameKey]}</CardTitle>
                      {tier.featured && <Badge>{t.landing.pricingPopular}</Badge>}
                    </div>
                    <CardDescription>{L[tier.descKey]}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-6">
                    <p className="text-4xl font-bold tracking-tight">{price}</p>
                    <ul className="flex-1 space-y-3">
                      {features.map((feat, fi) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="group w-full"
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
      </div>
    </section>
  )
}
