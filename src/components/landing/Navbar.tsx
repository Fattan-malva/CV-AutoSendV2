'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onOpenAuth: () => void
}

const SECTION_IDS = ['features', 'why-different', 'pricing', 'demo']

/** Floating pill navbar, fixed to the top of the viewport. */
export default function Navbar({ onOpenAuth }: NavbarProps) {
  const { user } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('')

  const nextLocale = locale === 'id' ? 'en' : 'id'
  const nextLocaleLabel = nextLocale === 'en' ? 'English' : 'Bahasa Indonesia'

  const navLinks = [
    { label: 'How It Works', href: '/#features', id: 'features' },
    { label: t.landing.desireLabel, href: '/#why-different', id: 'why-different' },
    { label: t.landing.pricingTitle, href: '/#pricing', id: 'pricing' },
    { label: t.demo.label, href: '/#demo', id: 'demo' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the link of the section currently crossing the middle of the viewport.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (sections.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <nav
        className={cn(
          'flex w-full max-w-4xl items-center justify-between gap-2 rounded-full border bg-background/75 py-1.5 ps-4 pe-1.5 backdrop-blur-xl transition-shadow duration-300',
          scrolled ? 'shadow-lg' : 'shadow-sm'
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/icons.png" alt="ceefy" className="size-6 object-contain" />
          <span className="text-sm font-semibold tracking-tight">ceefy</span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = activeId === link.id
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-foreground',
                  isActive ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-full text-muted-foreground md:inline-flex"
            onClick={() => setLocale(nextLocale)}
          >
            {nextLocale.toUpperCase()}
          </Button>

          <ThemeSwitch />

          {user ? (
            <Button asChild size="sm" className="ms-1 hidden rounded-full md:inline-flex">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <Button size="sm" className="ms-1 hidden rounded-full md:inline-flex" onClick={onOpenAuth}>
              {t.nav.login}
            </Button>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left">ceefy</SheetTitle>
                <SheetDescription className="sr-only">Navigasi utama</SheetDescription>
              </SheetHeader>

              <nav className="flex flex-col p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <Button variant="outline" onClick={() => setLocale(nextLocale)}>
                  {nextLocaleLabel}
                </Button>
                {user ? (
                  <Button asChild>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                      {t.nav.dashboard}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenAuth()
                    }}
                  >
                    {t.nav.login}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
