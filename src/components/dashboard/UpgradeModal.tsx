'use client'

import { useState } from 'react'
import { Lightning, ArrowRight } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'

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
  },
  {
    key: 'starter',
    nameKey: 'pricingStarter',
    priceKey: 'pricingStarterPrice',
    descKey: 'pricingStarterDesc',
  },
  {
    key: 'pro',
    nameKey: 'pricingPro',
    priceKey: 'pricingProPrice',
    descKey: 'pricingProDesc',
  },
] as const

function tL(landing: Record<string, unknown>, key: string): string {
  const val = landing[key]
  return typeof val === 'string' ? val : ''
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleUpgrade = async (plan: string) => {
    if (!user) return
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl" style={{ backgroundColor: 'var(--overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1.5 rounded-[2.5rem] bg-border/40">
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-card p-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
              <Lightning size={22} className="text-accent" weight="fill" />
            </div>

            <h2 className="text-2xl font-serif text-foreground">{t.dashboard.upgradeTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.dashboard.upgradeDesc}</p>

            <div className="mt-6 p-3 bg-subtle rounded-2xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{t.landing.pricingFree}</span>
                <span className="text-[10px] text-muted bg-card px-1.5 py-0.5 rounded border border-border">3 a · 3 s</span>
              </div>
              <span className="text-sm text-muted">$0</span>
            </div>

            <div className="mt-3 space-y-3">
              {tiers.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={loading}
                  className="group w-full flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-accent/20 hover:bg-accent/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-left disabled:opacity-40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {tL(t.landing, tier.nameKey)}
                    </span>
                    <span className="text-[10px] text-muted bg-card px-1.5 py-0.5 rounded border border-border">
                      {tL(t.landing, tier.descKey)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {tL(t.landing, tier.priceKey)}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                      <ArrowRight size={12} weight="bold" className="text-accent" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-400">{error}</p>
            )}

            <p className="mt-6 text-[10px] text-muted">
              Powered by LemonSqueezy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
