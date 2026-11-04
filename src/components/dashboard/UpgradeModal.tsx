'use client'

import { useState } from 'react'
import { ArrowRight, Check, Crown, Loader2, Sparkles, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { getPlanLabel, getPlanLimit, isUnlimited } from '@/lib/plans'
import { useProcessing } from '@/lib/processing-context'
import { cn } from '@/lib/utils'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const tiers = [
  {
    key: 'basic',
    nameKey: 'pricingBasic',
    priceKey: 'pricingBasicPrice',
    descKey: 'pricingBasicDesc',
    icon: Zap,
    highlight: false,
    features: ['20 AI analyses / month', '20 email sends / month', 'SMTP + CV upload', 'Application history'],
  },
  {
    key: 'starter',
    nameKey: 'pricingStarter',
    priceKey: 'pricingStarterPrice',
    descKey: 'pricingStarterDesc',
    icon: Sparkles,
    highlight: true,
    features: ['80 AI analyses / month', '80 email sends / month', 'CV builder + AI assist', 'Priority processing'],
  },
  {
    key: 'pro',
    nameKey: 'pricingPro',
    priceKey: 'pricingProPrice',
    descKey: 'pricingProDesc',
    icon: Crown,
    highlight: false,
    features: ['Unlimited AI analyses', 'Unlimited email sends', 'All templates & AI tools', 'Priority support'],
  },
] as const

function tL(landing: Record<string, unknown>, key: string): string {
  const val = landing[key]
  return typeof val === 'string' ? val : ''
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  const { config } = useProcessing()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const currentPlan = config?.plan || 'free'
  const currentLimit = getPlanLimit(currentPlan)
  const unlimited = isUnlimited(currentPlan)

  const handleUpgrade = async (plan: string) => {
    if (!user) return
    setLoadingPlan(plan)
    setError('')
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, plan }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      window.open(data.url, '_blank')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-4xl'>
        <div className='border-b bg-muted/30 px-6 py-6'>
          <DialogHeader>
            <div className='mb-2 flex size-10 items-center justify-center rounded-xl border bg-primary/10'>
              <Sparkles className='size-5 text-primary' />
            </div>
            <DialogTitle className='text-xl'>{t.dashboard.upgradeTitle}</DialogTitle>
            <DialogDescription>{t.dashboard.upgradeDesc}</DialogDescription>
          </DialogHeader>
          <div className='mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            <Badge variant='outline' className='gap-1.5'>
              <span className='size-1.5 rounded-full bg-primary' /> Current plan:{' '}
              {getPlanLabel(currentPlan)}
            </Badge>
            <span>
              {unlimited ? 'Unlimited analyses · Unlimited sends' : `${currentLimit} analyses · ${currentLimit} sends`}
            </span>
            <span className='text-muted-foreground/50'>·</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        <div className='grid gap-3 p-4 md:grid-cols-3 md:p-6'>
          {tiers.map((tier) => {
            const Icon = tier.icon
            const loading = loadingPlan === tier.key
            return (
              <div
                key={tier.key}
                className={cn(
                  'relative flex flex-col rounded-xl border bg-card p-4 transition-colors',
                  tier.highlight ? 'border-primary/50 ring-1 ring-primary/20' : 'hover:bg-accent/40'
                )}
              >
                {tier.highlight ? (
                  <Badge className='absolute -top-2.5 left-4 px-2 text-[10px]'>Most popular</Badge>
                ) : null}
                <div className='flex items-center gap-2'>
                  <div className='flex size-8 items-center justify-center rounded-lg border bg-background'>
                    <Icon className='size-4' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>{tL(t.landing, tier.nameKey)}</p>
                    <p className='text-[11px] text-muted-foreground'>
                      {tL(t.landing, tier.descKey)}
                    </p>
                  </div>
                </div>

                <div className='mt-4'>
                  <span className='text-2xl font-semibold tracking-tight'>
                    {tL(t.landing, tier.priceKey)}
                  </span>
                  <span className='text-xs text-muted-foreground'> / month</span>
                </div>

                <ul className='mt-4 flex-1 space-y-2'>
                  {tier.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2 text-xs text-muted-foreground'>
                      <Check className='mt-0.5 size-3.5 shrink-0 text-emerald-500' />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className='mt-5 w-full'
                  variant={tier.highlight ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={Boolean(loadingPlan) || tier.key === currentPlan}
                >
                  {loading ? <Loader2 className='size-4 animate-spin' /> : null}
                  {tier.key === currentPlan
                    ? 'Current plan'
                    : loading
                      ? 'Opening checkout…'
                      : 'Choose plan'}
                  {!loading && tier.key !== currentPlan ? <ArrowRight className='size-4' /> : null}
                </Button>
              </div>
            )
          })}
        </div>

        <div className='flex flex-col gap-2 border-t px-6 py-4'>
          {error ? <p className='text-xs text-destructive'>{error}</p> : null}
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-[10px] text-muted-foreground'>
              Secure checkout powered by LemonSqueezy. Taxes may apply.
            </p>
            <Button variant='ghost' size='sm' onClick={onClose}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
