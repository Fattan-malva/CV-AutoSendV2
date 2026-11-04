'use client'

import { useEffect, useState } from 'react'
import { Brain, Download, FileText, Send, Sparkles, Upload, type LucideIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import Reveal from './Reveal'

const iconMap: LucideIcon[] = [FileText, Upload, Brain, Send, Sparkles, Download]
const ROTATE_MS = 4500

const pad = (n: number) => String(n).padStart(2, '0')

/** Types its text out once; remount (via key) to play again. */
function TypedLine({ text }: { text: string }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (n >= text.length) return
    const id = window.setTimeout(() => setN((c) => c + 1), 30)
    return () => window.clearTimeout(id)
  }, [n, text])

  return (
    <>
      {text.slice(0, n)}
      <span className="ms-1 inline-block h-[0.85em] w-[0.08em] translate-y-[0.1em] animate-pulse bg-brand align-baseline" />
    </>
  )
}

/**
 * How It Works: numbered steps on the left, a live panel on the right.
 * Steps advance on their own, can be picked by click, and pause while hovered.
 */
export default function Features() {
  const { t } = useI18n()
  const steps = t.landing.features
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || steps.length < 2) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % steps.length), ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, steps.length])

  const current = steps[active]
  const Icon = iconMap[active % iconMap.length]

  return (
    <section id="features" className="w-full">
      <Reveal className="grid gap-6 p-6 md:grid-cols-12 md:items-end md:p-10">
        <h2 className="text-4xl font-bold tracking-tight md:col-span-7 md:text-6xl">How It Works</h2>
        <p className="text-base leading-relaxed text-muted-foreground md:col-span-5 md:text-lg">
          {t.landing.featuresDesc}
        </p>
      </Reveal>

      <div className="grid md:grid-cols-12">
        <ol
          className="flex flex-col gap-1 p-3 md:col-span-5 md:p-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {steps.map((step, i) => {
            const isActive = i === active
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? 'step' : undefined}
                  className="group relative flex w-full items-start gap-4 overflow-hidden rounded-xl p-4 text-start transition-colors hover:bg-muted/40 md:p-5"
                >
                  <span
                    className={cn(
                      'pt-1 font-mono text-xs tabular-nums transition-colors',
                      isActive ? 'text-brand' : 'text-muted-foreground'
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="flex-1">
                    <span
                      className={cn(
                        'block text-lg font-semibold transition-colors',
                        isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                    <span
                      className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-500 ease-out',
                        isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{step.desc}</span>
                      </span>
                    </span>
                  </span>

                  {/* Progress line: fills while the step is active, resets instantly when it isn't */}
                  <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px rounded-full">
                    <span
                      className={cn(
                        'block h-full origin-left bg-brand transition-transform ease-linear',
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      )}
                      style={{ transitionDuration: isActive ? `${ROTATE_MS}ms` : '0ms' }}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="relative flex min-h-[24rem] flex-col justify-between gap-10 overflow-hidden bg-muted/20 p-6 md:col-span-7 md:min-h-[32rem] md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-28 size-[26rem] rounded-full bg-brand/15 blur-[110px]"
          />

          <div className="relative flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>
              STEP {pad(active + 1)} / {pad(steps.length)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-brand" />
              LIVE
            </span>
          </div>

          <div key={active} className="relative space-y-6">
            <div className="flex size-14 items-center justify-center rounded-xl border bg-card">
              <Icon className="size-7 text-brand" />
            </div>
            <p className="font-mono text-2xl font-semibold tracking-tight md:text-4xl">
              <span className="text-brand">$ </span>
              <TypedLine text={current.title} />
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[0, 1, 2].map((k) => (
              <div key={k} className="space-y-2 rounded-lg border bg-card/70 p-3">
                <Skeleton className="h-2 w-2/3" />
                <Skeleton className="h-2 w-1/2" />
                <Skeleton className="h-2 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
