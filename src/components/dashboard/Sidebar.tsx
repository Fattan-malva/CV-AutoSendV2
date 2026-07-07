'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { SquaresFour, ClockCounterClockwise, Gear, ArrowUp, SignOut, X } from 'phosphor-react'

const navLinks = [
  {
    id: 'dashboard',
    labelKey: 'dashboard.title',
    icon: SquaresFour,
    href: '/dashboard',
  },
  {
    id: 'history',
    labelKey: 'dashboard.history',
    icon: ClockCounterClockwise,
    href: '/dashboard/history',
  },
  {
    id: 'settings',
    labelKey: 'dashboard.settings',
    icon: Gear,
    href: '/dashboard/settings',
  },
]

export default function Sidebar({ onUpgrade, onLogout, onClose }: { onUpgrade: () => void; onLogout: () => void; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useI18n()

  const active = pathname === '/dashboard/history' ? 'history' : pathname === '/dashboard/settings' ? 'settings' : 'dashboard'

  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-serif font-semibold text-foreground tracking-tight">ceefy</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = active === link.id
          return (
            <button
              key={link.id}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isActive
                  ? 'bg-accent/10 border border-accent/20 text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-subtle border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-accent' : ''} weight="duotone" />
              <span className="text-sm font-medium">
                {link.id === 'dashboard'
                  ? t.dashboard.title
                  : link.id === 'history'
                  ? t.dashboard.history
                  : t.dashboard.settings}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={onUpgrade}
          className="group w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-background bg-accent text-sm font-medium hover:opacity-90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
        >
          <span>{t.dashboard.upgrade}</span>
          <ArrowUp size={16} weight="bold" className="group-hover:translate-y-[-1px] transition-transform duration-300" />
        </button>
      </div>

      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-subtle text-foreground text-xs font-medium flex items-center justify-center border border-border">
            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground truncate">{user?.displayName || user?.email}</p>
            <p className="text-[10px] text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 border border-transparent hover:border-red-400/20"
        >
          <SignOut size={18} />
          <span>{t.dashboard.logout}</span>
        </button>
      </div>
    </aside>
  )
}
