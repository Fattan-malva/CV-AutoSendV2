'use client'

import { useI18n } from '@/lib/i18n-context'

const WORDMARK = 'ceefy'.split('')

export default function Footer() {
  const { t } = useI18n()

  const links = [
    { label: t.landing.featuresTitle, href: '#features' },
    { label: t.landing.desireLabel, href: '#why-different' },
    { label: t.landing.pricingTitle, href: '#pricing' },
    { label: t.demo.label, href: '#demo' },
  ]

  return (
    <footer className="relative overflow-hidden border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <img src="/icons.png" alt="" aria-hidden="true" className="size-6 object-contain" />
            <span className="text-sm font-semibold tracking-tight">ceefy</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.landing.footer}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Full-width wordmark. Its bottom edge is cropped and faded into the page, with a soft glow beneath. */}
      <div aria-hidden="true" className="relative h-[29vw] select-none">
        <div className="pointer-events-none absolute inset-x-[8%] bottom-[-18%] h-[45%] rounded-full bg-foreground/10 blur-[70px]" />
        <p className="absolute inset-x-0 bottom-[-6%] flex justify-center whitespace-nowrap text-[38vw] font-bold leading-[0.8] tracking-[-0.06em]">
          {WORDMARK.map((letter, i) => (
            <span
              key={i}
              className="inline-block cursor-default bg-gradient-to-b from-foreground via-foreground/80 to-foreground/10 bg-clip-text text-transparent transition-transform duration-500 ease-out hover:-translate-y-[3%]"
            >
              {letter}
            </span>
          ))}
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </div>
    </footer>
  )
}
