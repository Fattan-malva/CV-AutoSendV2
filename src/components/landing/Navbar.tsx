'use client'

import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'

interface NavbarProps {
  onOpenAuth: () => void
  onOpenLogout: () => void
}

export default function Navbar({ onOpenAuth, onOpenLogout }: NavbarProps) {
  const { user } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm text-zinc-300">
            <span className="text-zinc-500">~</span>
            <span className="text-green-400">cv-autosend</span>
            <span className="text-zinc-500">$</span>
            <span className="w-2 h-4 bg-zinc-300 animate-blink" />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
            <Link href="/#pricing" className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              {'>'} {t.nav.pricing}
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-mono text-xs bg-green-400 text-zinc-950 px-3 py-1.5 rounded-lg font-medium hover:bg-green-300 transition-colors"
                >
                  {'>_'} {t.nav.dashboard}
                </Link>
                <button
                  onClick={onOpenLogout}
                  className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {'>'} {t.nav.logout}
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="font-mono text-xs bg-green-400 text-zinc-950 px-3 py-1.5 rounded-lg font-medium hover:bg-green-300 transition-colors"
              >
                {'>_'} {t.nav.login}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
