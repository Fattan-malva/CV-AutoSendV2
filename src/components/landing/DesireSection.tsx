'use client'

import { useEffect, useState } from 'react'
import { FileText, MessageSquareText, ShieldCheck, Target, Zap } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Reveal from './Reveal'

const iconMap = [FileText, Target, Zap, ShieldCheck]
const ROTATE_MS = 3500

export default function DesireSection() {
  const { t } = useI18n()
  const cards = t.landing.desireCards
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Highlight cycles through the cards. Hovering or focusing the stack pauses it, and clicking pins a card.
  useEffect(() => {
    if (paused || cards.length < 2) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % cards.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, cards.length])

  return (
    <section id="why-different" className="border-b py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 md:grid-cols-2 md:gap-20">
        <Reveal>
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
          >
            <MessageSquareText />
            {t.landing.desireLabel}
          </Badge>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.desireTitle}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.landing.desireParagraph}
          </p>
        </Reveal>

        <div
          className="flex flex-col gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {cards.map((g, i) => {
            const Icon = iconMap[i % iconMap.length]
            const isActive = i === active

            return (
              <Reveal key={i} delay={i * 80}>
                <Card
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActive(i)
                    }
                  }}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  className={`cursor-pointer flex-row items-start gap-4 p-6 outline-none transition-all duration-500 focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                    isActive ? 'border-primary/40 shadow-md' : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors duration-500 ${
                      isActive ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{g.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
