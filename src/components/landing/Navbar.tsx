'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="hidden md:inline-flex font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
            <Link href="/#pricing" className="hidden md:inline-flex font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
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
                  className="hidden md:inline-flex font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
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
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-14 right-0 w-56 bg-zinc-950 border-l border-b border-zinc-800 rounded-bl-2xl p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              onClick={() => { setLocale(locale === 'id' ? 'en' : 'id'); setMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
            <Link
              href="/#pricing"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              {'>'} {t.nav.pricing}
            </Link>
            {user && (
              <button
                onClick={() => { onOpenLogout(); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors"
              >
                {'>'} {t.nav.logout}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
