'use client'

import type { CSSProperties } from 'react'
import {
  Brain,
  CircleCheck,
  FileText,
  Image as ImageIcon,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

const iconMap = [FileText, Zap, Brain, ShieldCheck, Send, ImageIcon, Sparkles, CircleCheck, Settings]

// Scoped keyframes so the strip works without any global CSS changes.
// Two identical groups; the track moves exactly one group width, so the loop is seamless.
const trackStyle: CSSProperties = {
  animation: 'ceefy-marquee 30s linear infinite',
}

export default function Marquee() {
  const { t } = useI18n()
  const items = t.landing.marqueeItems

  return (
    <section className="w-full overflow-hidden bg-muted/20 py-3.5">
      <style>{`@keyframes ceefy-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div className="flex w-max hover:[animation-play-state:paused] motion-reduce:[animation:none]" style={trackStyle}>
        {[0, 1].map((group) => (
          <ul
            key={group}
            aria-hidden={group === 1}
            className="flex shrink-0 items-center gap-10 pe-10"
          >
            {items.map((label, i) => {
              const Icon = iconMap[i % iconMap.length]
              return (
                <li
                  key={`${group}-${i}`}
                  className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground"
                >
                  <Icon className="size-4 text-brand" />
                  {label}
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </section>
  )
}
