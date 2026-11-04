'use client'

import { useRef, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import GoogleIcon from './GoogleIcon'

interface HeroProps {
  onOpenAuth: () => void
}

const ENTER = 'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 motion-reduce:animate-none'

export default function Hero({ onOpenAuth }: HeroProps) {
  const { t } = useI18n()

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative w-full overflow-hidden pt-24 md:pt-28">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col items-start justify-center gap-5 p-6 md:p-10 lg:p-14">
          <Badge variant="outline" className={cn('gap-2 rounded-full px-3 py-1 text-xs font-medium', ENTER)}>
            <img src="/icons.png" alt="" aria-hidden="true" className="size-3.5 object-contain" />
            AI CV Builder &amp; Auto-Send
          </Badge>

          <h1
            className={cn(
              'text-balance text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl',
              ENTER,
              'delay-100'
            )}
          >
            {t.landing.heroTitle}
          </h1>

          <p className={cn('max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg', ENTER, 'delay-200')}>
            {t.landing.heroSub}
          </p>

          <div className={cn('flex flex-wrap gap-2', ENTER, 'delay-300')}>
            <Button size="lg" className="group rounded-full" onClick={scrollToDemo}>
              {t.landing.cta}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={onOpenAuth}>
              <GoogleIcon />
              {t.landing.login}
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-muted/20 p-6 md:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[110px]"
          />
          <div className={cn('relative w-full max-w-md', ENTER, 'delay-300')}>
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Static CV-builder preview. Pointer position sets --rx / --ry on the card,
 * which tilts it in 3D; the spotlight follows the pointer as well.
 */
function HeroPreview() {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--rx', `${(0.5 - py) * 16}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 20}deg`)
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="[perspective:1200px]" onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <div
        ref={ref}
        className="transition-transform duration-300 ease-out will-change-transform [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        <Card className="group relative isolate gap-0 overflow-hidden py-0 shadow-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--foreground) 8%, transparent), transparent 70%)',
            }}
          />

          <div className="flex items-center gap-1.5 bg-muted/50 px-4 py-3">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="ms-3 text-xs text-muted-foreground">CV Builder</span>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                    98% Match
                  </span>
                </div>
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Experience</p>
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-[85%]" />
              <Skeleton className="h-2.5 w-[90%]" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Education</p>
              <Skeleton className="h-2.5 w-[95%]" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted/30 px-5 py-3.5">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
            </span>
            <div>
              <p className="text-sm font-medium">CV Builder Active</p>
              <p className="font-mono text-xs text-muted-foreground">Generating ATS-friendly layout...</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
