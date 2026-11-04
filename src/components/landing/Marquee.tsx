'use client'

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

/**
 * Infinite logo-style strip. Needs the `animate-marquee` utility from the
 * landing theme snippet (see landing-theme-additions.css).
 */
export default function Marquee() {
  const { t } = useI18n()
  const items = t.landing.marqueeItems

  return (
    <section className="overflow-hidden border-b bg-muted/30 py-5">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((group) => (
          <ul
            key={group}
            aria-hidden={group === 1}
            className="flex shrink-0 items-center gap-12 pe-12"
          >
            {items.map((label, i) => {
              const Icon = iconMap[i % iconMap.length]
              return (
                <li
                  key={`${group}-${i}`}
                  className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-muted-foreground"
                >
                  <Icon className="size-4" />
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
