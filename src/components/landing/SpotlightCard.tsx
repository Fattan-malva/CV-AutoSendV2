'use client'

import { useRef, type ComponentProps, type PointerEvent } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SPOTLIGHT =
  'radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--foreground) 8%, transparent), transparent 70%)'

/**
 * shadcn Card with a soft light that follows the pointer.
 * The spotlight sits behind the content (isolate + -z-10), so text is never tinted.
 */
export default function SpotlightCard({ className, children, ...props }: ComponentProps<typeof Card>) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <Card
      ref={ref}
      onPointerMove={handleMove}
      className={cn(
        'group isolate relative overflow-hidden transition-[border-color,transform] duration-300 hover:border-foreground/20',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: SPOTLIGHT }}
      />
      {children}
    </Card>
  )
}
