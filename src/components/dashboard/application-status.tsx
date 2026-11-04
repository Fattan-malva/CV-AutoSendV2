'use client'

import {
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  ShieldX,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AppStatus } from '@/types'

export const STATUS_CONFIG: Record<
  AppStatus,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    className: string
    dot: string
  }
> = {
  sent: {
    label: 'Sent',
    icon: Send,
    className: 'border-transparent bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'border-transparent bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  waiting: {
    label: 'Waiting',
    icon: Clock,
    className: 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    icon: ShieldCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    icon: ShieldX,
    className: 'border-transparent bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
}

export const STATUS_OPTIONS = (Object.keys(STATUS_CONFIG) as AppStatus[]).map((value) => {
  const config = STATUS_CONFIG[value]
  const Icon = config.icon
  return {
    value,
    label: config.label,
    icon: ({ className }: { className?: string }) => <Icon className={className} />,
  }
})

export function StatusBadge({
  status,
  className,
}: {
  status: AppStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sent
  const Icon = config.icon
  return (
    <Badge variant='outline' className={cn('gap-1.5 font-medium', config.className, className)}>
      <Icon className='size-3' />
      {config.label}
    </Badge>
  )
}

export function StatusDot({ status }: { status: AppStatus }) {
  return <span className={cn('size-1.5 rounded-full', STATUS_CONFIG[status]?.dot || 'bg-primary')} />
}

export function StatusIcon({ status, className }: { status: AppStatus; className?: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sent
  const Icon = config.icon
  return <Icon className={cn('size-4', className)} />
}

export const STATUS_CHECK_ICON = CheckCircle2
