'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import WindowFrame from '@/components/ui/WindowFrame'

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'var(--overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4 animate-pulse-glow rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <WindowFrame title="~/upgrade" accent="green" className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xs text-zinc-500">
            <span className="text-green-400">~</span>
            <span>$ ./upgrade --select-plan</span>
          </div>

          <div className="w-12 h-12 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-green-400" />
          </div>

          <h2 className="text-lg font-bold text-zinc-100">{t.dashboard.upgradeTitle}</h2>
          <p className="mt-2 text-sm text-zinc-400">{t.dashboard.upgradeDesc}</p>

          {/* Current plan */}
          <div className="mt-6 p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-400">{t.landing.pricingFree}</span>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">3 a · 3 s</span>
            </div>
            <span className="font-mono text-xs text-zinc-500">$0</span>
          </div>

          {/* Upgrade tiers */}
          <div className="mt-3 space-y-3">
            {tiers.map((tier) => (
              <button
                key={tier.key}
                onClick={() => handleUpgrade(tier.key)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 bg-green-400/10 rounded-xl border border-green-400/30 hover:bg-green-400/20 transition-colors text-left disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-zinc-300">
                    {tL(t.landing, tier.nameKey)}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400/60 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
                    {tL(t.landing, tier.descKey)}
                  </span>
                </div>
                <span className="font-mono text-sm font-medium text-zinc-300">
                  {tL(t.landing, tier.priceKey)}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 font-mono text-xs text-red-400">{error}</p>
          )}

          <p className="mt-6 font-mono text-[10px] text-zinc-600">
            Powered by LemonSqueezy
          </p>
        </WindowFrame>
      </div>
    </div>
  )
}
