'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { LayoutDashboard, History, Settings, ArrowUp, LogOut } from 'lucide-react'

const navLinks = [
  {
    id: 'dashboard',
    labelKey: 'dashboard.title',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'history',
    labelKey: 'dashboard.history',
    icon: History,
    href: '/dashboard/history',
  },
  {
    id: 'settings',
    labelKey: 'dashboard.settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
]

export default function Sidebar({ onUpgrade, onLogout }: { onUpgrade: () => void; onLogout: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useI18n()

  const active = pathname === '/dashboard/history' ? 'history' : pathname === '/dashboard/settings' ? 'settings' : 'dashboard'

  return (
    <aside className="w-56 shrink-0 bg-zinc-900/50 border-r border-zinc-800 flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 font-mono text-sm text-zinc-400">
          <span className="text-zinc-600">~</span>
          <span className="text-green-400">{t.dashboard.title.toLowerCase()}</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navLinks.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs text-left transition-colors ${
                active === link.id
                  ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>
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

      {/* Upgrade */}
      <div className="px-3 py-3 border-t border-zinc-800">
        <button
          onClick={onUpgrade}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs text-green-400 hover:text-green-300 hover:bg-green-400/5 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          <span>{t.dashboard.upgrade}</span>
        </button>
      </div>

      {/* User Info + Logout */}
      <div className="px-3 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[10px] font-medium flex items-center justify-center border border-zinc-700">
            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] text-zinc-300 truncate">{user?.displayName || user?.email}</p>
            <p className="font-mono text-[9px] text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.dashboard.logout}</span>
        </button>
      </div>
    </aside>
  )
}
