'use client'

import { cn } from '@/lib/utils'

function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: React.ComponentProps<'div'> & {
  value?: number
  max?: number
  indicatorClassName?: string
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      data-slot='progress'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/15', className)}
      {...props}
    >
      <div
        data-slot='progress-indicator'
        className={cn('h-full w-full flex-1 rounded-full bg-primary transition-all duration-500', indicatorClassName)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}

export { Progress }
