'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitch } from '@/components/language-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { isUnlimited } from '@/lib/plans'
import { useProcessing } from '@/lib/processing-context'
import { cn } from '@/lib/utils'
import type { UserConfig } from '@/types'

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  basic: 20,
  starter: 80,
  pro: Infinity,
}

export function Header({
  title,
  onLogout,
  onUpgrade,
  className,
}: {
  title: string
  onLogout: () => void
  onUpgrade: () => void
  className?: string
}) {
  const { user } = useAuth()
  const { t } = useI18n()
  const { config, bulkRunning, sendingBulk } = useProcessing()
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const plan = (config?.plan || 'free') as keyof typeof PLAN_LIMITS
  const limit = PLAN_LIMITS[plan] ?? 3
  const used = config?.usageAnalyze ?? 0
  const isPro = isUnlimited(config?.plan)
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)
  const usageLabel = isPro
    ? t.dashboard.proUnlimited
    : t.dashboard.analysesLeftShort
        .replace('{remaining}', String(remaining))
        .replace('{limit}', String(limit))

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-xl transition-shadow',
        offset > 8 && 'shadow-sm',
        className
      )}
    >
      <SidebarTrigger className='-ms-1' />
      <Separator orientation='vertical' className='me-1 data-[orientation=vertical]:h-4' />
      <div className='flex min-w-0 items-center gap-2'>
        <h1 className='truncate text-sm font-semibold'>{title}</h1>
        {bulkRunning || sendingBulk ? (
          <Badge variant='secondary' className='gap-1.5 text-[10px]'>
            <Loader2 className='size-3 animate-spin' />
            {bulkRunning ? t.dashboard.analyzing : t.dashboard.sending}
          </Badge>
        ) : null}
      </div>

      <div className='ms-auto flex items-center gap-0.5'>
        <button
          type='button'
          onClick={onUpgrade}
          className='me-1 hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex'
          title={usageLabel}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              isPro ? 'bg-emerald-500' : remaining === 0 ? 'bg-destructive' : 'bg-primary'
            )}
          />
          {usageLabel}
        </button>
        <Search className='me-1 hidden sm:flex' />
        <LanguageSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <Separator orientation='vertical' className='mx-1 data-[orientation=vertical]:h-4' />
        <ProfileDropdown
          user={{
            name: config?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User',
            email: user?.email || config?.email || '',
            avatar: user?.photoURL || undefined,
          }}
          plan={plan.toUpperCase()}
          onLogout={onLogout}
          onUpgrade={onUpgrade}
        />
      </div>
    </header>
  )
}

export function usePlanLimits(config: UserConfig | null) {
  const plan = (config?.plan || 'free') as keyof typeof PLAN_LIMITS
  const limit = PLAN_LIMITS[plan] ?? 3
  return {
    plan,
    limit,
    isPro: plan === 'pro',
    analyzeLimit: limit,
    sendLimit: limit,
  }
}
