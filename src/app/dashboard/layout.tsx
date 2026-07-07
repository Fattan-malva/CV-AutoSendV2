'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { Sun, Moon, List, Spinner } from 'phosphor-react'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'
import { ProcessingProvider, useProcessing } from '@/lib/processing-context'
import Sidebar from '@/components/dashboard/Sidebar'
import UpgradeModal from '@/components/dashboard/UpgradeModal'
import ConfirmLogoutModal from '@/components/dashboard/ConfirmLogoutModal'
import Skeleton from '@/components/ui/Skeleton'
import type { UserConfig } from '@/types'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const { bulkRunning, sendingBulk, upgradeOpen, setUpgradeOpen, config } = useProcessing()

  const pageTitle = pathname === '/dashboard/history'
    ? t.dashboard.history
    : pathname === '/dashboard/settings'
    ? t.dashboard.settings
    : t.dashboard.title

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (authLoading) {
    return (
      <div className="h-screen overflow-hidden flex">
        <aside className="w-56 shrink-0 bg-surface border-r border-border p-4 space-y-4 overflow-y-auto">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
          </div>
          <div className="pt-4 space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </aside>
        <main className="flex-1 p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-[2rem]" />
            <Skeleton className="h-48 rounded-[2rem]" />
          </div>
          <Skeleton className="h-32 rounded-[2rem]" />
        </main>
      </div>
    )
  }

  if (!user) return null

  const planLimits: Record<string, number> = { free: 3, basic: 20, starter: 80, pro: Infinity }
  const usageAnalyze = config?.usageAnalyze || 0
  const isPro = config?.plan === 'pro'
  const analyzeLimit = planLimits[config?.plan || 'free']

  return (
    <div className="h-screen overflow-hidden flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-2xl lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-56 overflow-y-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}>
        <Sidebar onUpgrade={() => setUpgradeOpen(true)} onLogout={() => setLogoutOpen(true)} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-surface/80 backdrop-blur-2xl border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted hover:text-foreground transition-colors">
              <List size={20} />
            </button>
            <h1 className="text-lg font-serif text-foreground capitalize">{pageTitle}</h1>
            {(bulkRunning || sendingBulk) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                <Spinner size={14} className="text-accent animate-spin" />
                <span className="text-[10px] text-accent uppercase tracking-wider">
                  {bulkRunning ? t.dashboard.analyzing : t.dashboard.sending}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-subtle rounded-full border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-muted">
                {isPro ? t.dashboard.proMode : `${usageAnalyze}/${analyzeLimit} ${t.dashboard.usageAnalyze.toLowerCase()}`}
              </span>
            </div>
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-subtle transition-all duration-300 border border-border"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-subtle transition-all duration-300 border border-border text-xs font-medium">
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [config, setConfig_] = useState<UserConfig | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/'); return }
    if (!db) return
    getDoc(doc(db!, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setConfig_(snap.data() as UserConfig)
    }).catch(() => {})
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center">
        <Spinner size={28} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <ProcessingProvider user={user} config={config} onConfigUpdate={setConfig_}>
      <DashboardShell>{children}</DashboardShell>
    </ProcessingProvider>
  )
}
