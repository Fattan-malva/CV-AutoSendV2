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

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const { user } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('')

  const nextLocale = locale === 'id' ? 'en' : 'id'
  const nextLocaleLabel = nextLocale === 'en' ? 'English' : 'Bahasa Indonesia'

  const navLinks = [
    { label: t.landing.featuresTitle, href: '/#features', id: 'features' },
    { label: t.landing.desireLabel, href: '/#why-different', id: 'why-different' },
    { label: t.landing.pricingTitle, href: '/#pricing', id: 'pricing' },
    { label: t.demo.label, href: '/#demo', id: 'demo' },
  ]

  // Border and blur appear once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link for the section currently in the middle of the viewport.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null)
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
    // navLinks ids are static; labels are not needed for observation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-border bg-background/80 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60'
          : 'border-transparent bg-background'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <img
            src="/icons.png"
            alt="ceefy"
            className="size-7 object-contain transition-transform duration-500 group-hover:-rotate-6"
          />
          <span className="text-sm font-semibold tracking-tight">ceefy</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = activeId === link.id
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-foreground',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-muted-foreground md:inline-flex"
            onClick={() => setLocale(nextLocale)}
          >
            {nextLocale.toUpperCase()}
          </Button>

          <ThemeSwitch />

          {user ? (
            <Button asChild size="sm" className="ms-2 hidden md:inline-flex">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <Button size="sm" className="ms-2 hidden md:inline-flex" onClick={onOpenAuth}>
              {t.nav.login}
            </Button>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
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
      </div>
    </header>
  )
}
