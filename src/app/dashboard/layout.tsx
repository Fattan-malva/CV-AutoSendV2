'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { ProcessingProvider, useProcessing } from '@/lib/processing-context'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Main } from '@/components/layout/main'
import { CommandMenu } from '@/components/command-menu'
import UpgradeModal from '@/components/dashboard/UpgradeModal'
import ConfirmLogoutModal from '@/components/dashboard/ConfirmLogoutModal'
import type { UserConfig } from '@/types'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { t } = useI18n()
  const pathname = usePathname()
  const { upgradeOpen, setUpgradeOpen } = useProcessing()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const pageTitle =
    pathname === '/dashboard/history'
      ? t.dashboard.history
      : pathname === '/dashboard/settings'
        ? t.dashboard.settings
        : pathname === '/dashboard/cv-builder'
          ? t.cvBuilder.title
          : t.dashboard.title

  if (authLoading) {
    return <DashboardSkeleton />
  }

  if (!user) return null

  return (
    <SidebarProvider defaultOpen className='h-dvh overflow-hidden'>
      <AppSidebar onLogout={() => setLogoutOpen(true)} onUpgrade={() => setUpgradeOpen(true)} />
      <SidebarInset className='min-w-0 overflow-x-hidden'>
        <Header
          title={pageTitle}
          onLogout={() => setLogoutOpen(true)}
          onUpgrade={() => setUpgradeOpen(true)}
        />
        <Main>{children}</Main>
      </SidebarInset>
      <CommandMenu />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </SidebarProvider>
  )
}

function DashboardSkeleton() {
  return (
    <div className='flex min-h-svh w-full'>
      <div className='hidden w-64 shrink-0 border-e bg-sidebar p-4 md:block'>
        <Skeleton className='mb-4 h-10 w-full rounded-lg' />
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-8 w-full rounded-md' />
          ))}
        </div>
        <div className='mt-10 space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-8 w-full rounded-md' />
          ))}
        </div>
      </div>
      <div className='flex-1'>
        <div className='flex h-16 items-center gap-3 border-b px-4'>
          <Skeleton className='size-8 rounded-md' />
          <Skeleton className='h-5 w-32' />
          <div className='ms-auto flex gap-2'>
            <Skeleton className='size-8 rounded-md' />
            <Skeleton className='size-8 rounded-md' />
            <Skeleton className='size-8 rounded-full' />
          </div>
        </div>
        <div className='space-y-6 p-6'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-28 rounded-xl' />
            ))}
          </div>
          <Skeleton className='h-80 rounded-xl' />
          <Skeleton className='h-64 rounded-xl' />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [config, setConfig] = useState<UserConfig | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    user
      .getIdToken()
      .then((token) => fetch('/api/user-config', { headers: { Authorization: `Bearer ${token}` } }))
      .then((res) => res.json())
      .then((data) => setConfig(data as UserConfig))
      .catch(() => {})
  }, [user, authLoading, router])

  if (authLoading) return <DashboardSkeleton />
  if (!user) return null

  return (
    <LayoutProvider>
      <SearchProvider>
        <ProcessingProvider user={user} config={config} onConfigUpdate={setConfig}>
          <DashboardShell>{children}</DashboardShell>
        </ProcessingProvider>
      </SearchProvider>
    </LayoutProvider>
  )
}
