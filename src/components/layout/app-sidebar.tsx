'use client'

import {
  Activity,
  BookOpen,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useLayout } from '@/context/layout-provider'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { getPlanLabel, getPlanLimit, isUnlimited } from '@/lib/plans'
import { useProcessing } from '@/lib/processing-context'
import { NavGroup } from './nav-group'
import type { NavGroup as NavGroupType } from './types'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar({ onLogout, onUpgrade }: { onLogout: () => void; onUpgrade: () => void }) {
  const { variant, collapsible } = useLayout()
  const { config } = useProcessing()
  const { user } = useAuth()
  const { t } = useI18n()
  const { state } = useSidebar()

  const plan = config?.plan || 'free'
  const limit = getPlanLimit(plan)
  const used = config?.usageAnalyze ?? 0
  const isPro = isUnlimited(plan)
  const progress = isPro ? 100 : Math.min(100, (used / limit) * 100)

  const navGroups: NavGroupType[] = [
    {
      title: t.dashboard.title,
      items: [
        { title: t.dashboard.title, url: '/dashboard', icon: LayoutDashboard },
        { title: t.dashboard.history, url: '/dashboard/history', icon: Activity },
        { title: t.cvBuilder.title, url: '/dashboard/cv-builder', icon: FileText, badge: 'AI' },
      ],
    },
    {
      title: t.dashboard.workspace,
      items: [
        { title: t.dashboard.settings, url: '/dashboard/settings', icon: Settings },
        {
          title: t.dashboard.resources,
          icon: BookOpen,
          items: [
            { title: t.nav.home, url: '/', icon: Home },
            { title: t.nav.pricing, url: '/#pricing', icon: Sparkles, external: false },
            { title: t.landing.featuresTitle, url: '/#features', icon: LifeBuoy, external: false },
          ],
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher
          workspace={{
            name: 'ceefy',
            plan: getPlanLabel(plan),
            logo: '/icons.png',
          }}
          onUpgrade={onUpgrade}
        />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} title={group.title} items={group.items} />
        ))}

        {state === 'expanded' ? (
          <SidebarGroup className='mt-auto'>
            <SidebarGroupLabel>{t.dashboard.usage}</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className='mx-2 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium'>{getPlanLabel(plan)}</span>
                  <span className='text-muted-foreground'>
                    {isPro ? '∞' : `${used}/${limit}`}
                  </span>
                </div>
                <Progress value={progress} className='mt-2 h-1.5' />
                <p className='mt-2 text-[11px] leading-snug text-muted-foreground'>
                  {isPro
                    ? t.dashboard.unlimitedAccess
                    : t.dashboard.analysesLeftCycle.replace(
                        '{count}',
                        String(Math.max(0, limit - used))
                      )}
                </p>
                {!isPro ? (
                  <Button size='sm' className='mt-3 w-full' onClick={onUpgrade}>
                    <Sparkles className='size-3.5' />
                    {t.dashboard.upgrade}
                  </Button>
                ) : null}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/#pricing'>
                <Sparkles />
                <span>{t.nav.pricing}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className='my-1' />
        <NavUser
          user={{
            name: config?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User',
            email: user?.email || config?.email || '',
            avatar: user?.photoURL || undefined,
          }}
          plan={plan.toUpperCase()}
          onLogout={onLogout}
          onUpgrade={onUpgrade}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
