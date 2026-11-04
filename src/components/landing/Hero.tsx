'use client'

import { useRef, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import GoogleIcon from './GoogleIcon'

interface HeroProps {
  onOpenAuth: () => void
}

const ENTER = 'animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both motion-reduce:animate-none'

export default function Hero({ onOpenAuth }: HeroProps) {
  const { t } = useI18n()

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden border-b">
      {/* Soft ambient glow behind the hero */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-0 mx-auto h-96 max-w-3xl rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start">
          <Badge
            variant="outline"
            className={`mb-6 gap-2 rounded-full px-3 py-1 text-xs font-medium ${ENTER}`}
          >
            <img src="/icons.png" alt="" aria-hidden="true" className="size-3.5 object-contain" />
            AI CV Builder &amp; Auto-Send
          </Badge>

          <h1 className={`text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${ENTER} delay-100`}>
            {t.landing.heroTitle}
          </h1>

          <p className={`mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg ${ENTER} delay-200`}>
            {t.landing.heroSub}
          </p>

          <div className={`mt-8 flex flex-wrap gap-3 ${ENTER} delay-300`}>
            <Button size="lg" className="group" onClick={scrollToDemo}>
              {t.landing.cta}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onOpenAuth}>
              <GoogleIcon />
              {t.landing.login}
            </Button>
          </div>
        </div>

        <div className={ENTER + ' delay-300'}>
          <HeroPreview />
        </div>
      </div>
    </section>
  )
}

/** Static CV-builder preview. The card tilts toward the pointer and shows a light spot. */
function HeroPreview() {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.transform = `perspective(1200px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div className="group" onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <div ref={ref} className="transition-transform duration-300 ease-out will-change-transform">
        <Card className="relative isolate gap-0 overflow-hidden py-0 shadow-lg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--foreground) 7%, transparent), transparent 70%)',
            }}
          />

          <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-3">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="ms-3 text-xs text-muted-foreground">CV Builder</span>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    98% Match
                  </Badge>
                </div>
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Experience</p>
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-[85%]" />
              <Skeleton className="h-2.5 w-[90%]" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Education</p>
              <Skeleton className="h-2.5 w-[95%]" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t bg-muted/30 px-6 py-4">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
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
