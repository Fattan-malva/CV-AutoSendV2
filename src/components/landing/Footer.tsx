'use client'

import { useI18n } from '@/lib/i18n-context'

const WORDMARK = 'ceefy'.split('')

export default function Footer() {
  const { t } = useI18n()

  const links = [
    { label: 'How It Works', href: '#features' },
    { label: t.landing.desireLabel, href: '#why-different' },
    { label: t.landing.pricingTitle, href: '#pricing' },
    { label: t.demo.label, href: '#demo' },
  ]

  return (
    <footer className="w-full overflow-hidden">
      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src="/icons.png" alt="" aria-hidden="true" className="size-5 object-contain" />
            <span className="text-sm font-semibold tracking-tight">ceefy</span>
          </div>
          <p className="text-sm text-muted-foreground">{t.landing.footer}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm md:justify-self-end">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Full-width wordmark. The gradient is applied once to the whole word, so no letter is clipped.
          The bottom fades into the page; a soft glow sits beneath it. */}
      <div aria-hidden="true" className="relative h-[27vw] select-none">
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[-20%] h-[45%] rounded-full bg-brand/20 blur-[80px]" />
        <p className="absolute inset-x-0 bottom-[-5%] flex justify-center whitespace-nowrap bg-gradient-to-b from-foreground via-foreground/75 to-transparent bg-clip-text text-[37vw] font-bold leading-[0.8] tracking-[-0.05em] text-transparent">
          {WORDMARK.map((letter, i) => (
            <span
              key={i}
              className="inline-block cursor-default transition-transform duration-500 ease-out hover:-translate-y-[4%]"
            >
              {letter}
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}
