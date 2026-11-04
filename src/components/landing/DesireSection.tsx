'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { FileText, MessageSquareText, ShieldCheck, Target, Zap } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Reveal from './Reveal'

const iconMap = [FileText, Target, Zap, ShieldCheck]

// Pure CSS loop: the track moves up by exactly one copy of the list, then restarts seamlessly.
// Every item carries the same bottom padding, so both copies have identical height.
const TRACK_STYLE: CSSProperties = {
  animation: 'ceefy-desire-loop 24s linear infinite',
}

/**
 * Vertical looping stack of cards that scrolls upward continuously.
 * The card nearest the centre is emphasised by a small JS pass; hover pauses the loop.
 */
export default function DesireSection() {
  const { t } = useI18n()
  const cards = t.landing.desireCards
  const viewportRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const loop = [...cards, ...cards]

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || cards.length < 2) return

    let raf = 0
    const tick = () => {
      const vpRect = vp.getBoundingClientRect()
      const mid = vpRect.top + vpRect.height / 2
      itemRefs.current.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.min(Math.abs(r.top + r.height / 2 - mid) / (r.height + 24), 1)
        el.style.transform = `scale(${1 - d * 0.06})`
        el.style.opacity = String(1 - d * 0.6)
      })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cards.length])

  return (
    <section id="why-different" className="w-full">
      <style>{`@keyframes ceefy-desire-loop { from { transform: translateY(0); } to { transform: translateY(-50%); } }`}</style>

      <div className="grid lg:grid-cols-2">
        <Reveal className="flex flex-col justify-center gap-5 p-6 md:p-10 lg:p-14">
          <Badge variant="outline" className="w-fit gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide">
            <MessageSquareText />
            {t.landing.desireLabel}
          </Badge>
          <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl">{t.landing.desireTitle}</h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {t.landing.desireParagraph}
          </p>
        </Reveal>

        <div className="relative p-6 md:p-10 lg:p-14">
          <div ref={viewportRef} className="group relative h-[26rem] overflow-hidden md:h-[30rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />

            <div
              className="flex flex-col will-change-transform group-hover:[animation-play-state:paused]"
              style={TRACK_STYLE}
            >
              {loop.map((g, i) => {
                const Icon = iconMap[i % iconMap.length]
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      itemRefs.current[i] = el
                    }}
                    className="origin-center pb-3 will-change-transform"
                  >
                    <Card className="flex-row items-start gap-4 border-0 bg-muted/40 p-5 shadow-none">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background">
                        <Icon className="size-5 text-brand" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{g.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
