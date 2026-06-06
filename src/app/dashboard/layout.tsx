'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { Sun, Moon, Menu } from 'lucide-react'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'
import Sidebar from '@/components/dashboard/Sidebar'
import UpgradeModal from '@/components/dashboard/UpgradeModal'
import ConfirmLogoutModal from '@/components/dashboard/ConfirmLogoutModal'
import Skeleton from '@/components/ui/Skeleton'
import type { UserConfig } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const pageTitle = pathname === '/dashboard/history'
    ? t.dashboard.history
    : pathname === '/dashboard/settings'
    ? t.dashboard.settings
    : t.dashboard.title

  const [config, setConfig_] = useState<UserConfig | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/'); return }
    if (!db) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db!, 'users', user.uid))
        if (snap.exists()) setConfig_(snap.data() as UserConfig)
      } catch { /* ignore */ }
    }
    load()
  }, [user, authLoading, router])

  if (authLoading) {
    return (
    <div className="h-screen overflow-hidden flex">
        <aside className="w-56 shrink-0 bg-zinc-900/50 border-r border-zinc-800 p-4 space-y-4 overflow-y-auto">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
          </div>
          <div className="pt-4 space-y-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </aside>
        <main className="flex-1 p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <Skeleton className="h-32 rounded-2xl" />
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-56 overflow-y-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200`}>
        <Sidebar onUpgrade={() => setUpgradeOpen(true)} onLogout={() => setLogoutOpen(true)} />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 shrink-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-zinc-400 hover:text-zinc-200 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 font-mono text-sm text-zinc-400">
              <span className="text-zinc-600">~</span>
              <span className="text-green-400">{pageTitle.toLowerCase()}</span>
              <span className="text-zinc-600">$</span>
              <div className="w-2 h-4 bg-green-400 animate-blink" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[10px] text-zinc-500">
                {isPro ? t.dashboard.proMode : `${usageAnalyze}/${analyzeLimit} ${t.dashboard.usageAnalyze.toLowerCase()}`}
              </span>
            </div>
            <button onClick={toggleTheme}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  )
}
