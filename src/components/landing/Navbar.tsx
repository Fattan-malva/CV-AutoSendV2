'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, Moon } from 'phosphor-react'
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4">
        <div className="flex items-center justify-between w-max min-w-[320px] px-5 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <Link href="/" className="flex items-center gap-3 mr-6">
            <img
              src="/icons.png"
              alt="ceefy"
              className="w-8 h-8 object-contain"
            />

            <span className="text-sm font-serif font-semibold text-white/95 tracking-tight">
              ceefy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/#features" className="text-xs text-white/50 hover:text-white transition-colors duration-300">
              {t.landing.featuresTitle}
            </Link>
            <Link href="/#why-different" className="text-xs text-white/50 hover:text-white transition-colors duration-300">
              {t.landing.desireLabel}
            </Link>
            <Link href="/#pricing" className="text-xs text-white/50 hover:text-white transition-colors duration-300">
              {t.landing.pricingTitle}
            </Link>
            <Link href="/#demo" className="text-xs text-white/50 hover:text-white transition-colors duration-300">
              {t.demo.label}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="hidden md:inline-flex text-xs text-white/50 hover:text-white transition-colors duration-300 w-8 h-8 items-center justify-center rounded-full hover:bg-white/[0.06]"
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>

            {user ? (
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#030303] text-xs font-medium hover:opacity-90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                <span>{t.nav.dashboard}</span>
              </Link>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#030303] text-xs font-medium hover:opacity-90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                <span>{t.nav.login}</span>
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden relative w-8 h-8 flex items-center justify-center text-foreground"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 top-[2px] w-5 h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? 'rotate-45 top-[9px]' : ''
                    }`}
                />
                <span
                  className={`absolute left-0 top-[9px] w-5 h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? 'opacity-0 translate-x-2' : ''
                    }`}
                />
                <span
                  className={`absolute left-0 top-[16px] w-5 h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? '-rotate-45 top-[9px]' : ''
                    }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-[#030303]/80 backdrop-blur-3xl"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: t.landing.featuresTitle, href: '/#features' },
              { label: t.landing.desireLabel, href: '/#why-different' },
              { label: t.landing.pricingTitle, href: '/#pricing' },
              { label: t.demo.label, href: '/#demo' },
              ...(user
                ? [{ label: t.nav.dashboard, href: '/dashboard' }]
                : [{ label: t.nav.login, onClick: () => { onOpenAuth(); setMenuOpen(false) } }]
              ),
            ].map((item, i) => (
              <div
                key={i}
                className="animate-stagger"
                style={{
                  animation: `stagger-fade 0.6s cubic-bezier(0.32,0.72,0,1) ${i * 0.1}s forwards`,
                  opacity: 0,
                  transform: 'translateY(24px)',
                }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-3xl font-serif text-white/95 hover:text-indigo-400 transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="text-3xl font-serif text-white/95 hover:text-indigo-400 transition-colors duration-300"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
            <div
              className="flex items-center gap-4 mt-8"
              style={{
                animation: `stagger-fade 0.6s cubic-bezier(0.32,0.72,0,1) 0.4s forwards`,
                opacity: 0,
                transform: 'translateY(24px)',
              }}
            >
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false) }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => { setLocale(locale === 'id' ? 'en' : 'id'); setMenuOpen(false) }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs font-medium"
              >
                {locale === 'id' ? 'EN' : 'ID'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
