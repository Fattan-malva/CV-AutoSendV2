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
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'
import type { AppStatus } from '@/types'

const STATUS_BASE: Record<
  AppStatus,
  {
    labelKey: string
    icon: React.ComponentType<{ className?: string }>
    className: string
    dot: string
  }
> = {
  sent: {
    labelKey: 'statusSent',
    icon: Send,
    className: 'border-transparent bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  failed: {
    labelKey: 'statusFailedLabel',
    icon: XCircle,
    className: 'border-transparent bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  waiting: {
    labelKey: 'statusWaiting',
    icon: Clock,
    className: 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  approved: {
    labelKey: 'statusApprovedLabel',
    icon: ShieldCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  rejected: {
    labelKey: 'statusRejected',
    icon: ShieldX,
    className: 'border-transparent bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
}

export function useStatusConfig() {
  const { t } = useI18n()
  return Object.entries(STATUS_BASE).reduce(
    (acc, [key, val]) => ({
      ...acc,
      [key]: { ...val, label: t.dashboard[val.labelKey as keyof typeof t.dashboard] },
    }),
    {} as Record<AppStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; dot: string }>
  )
}

export function getStatusOptions(t: Record<string, unknown>) {
  return (Object.keys(STATUS_BASE) as AppStatus[]).map((value) => {
    const config = STATUS_BASE[value]
    const Icon = config.icon
    return {
      value,
      label: String((t.dashboard as Record<string, unknown>)[config.labelKey] || value),
      icon: ({ className }: { className?: string }) => <Icon className={className} />,
    }
  })
}

export function StatusBadge({
  status,
  className,
}: {
  status: AppStatus
  className?: string
}) {
  const statusConfig = useStatusConfig()
  const config = statusConfig[status] || statusConfig.sent
  const Icon = config.icon
  return (
    <Badge variant='outline' className={cn('gap-1.5 font-medium', config.className, className)}>
      <Icon className='size-3' />
      {config.label}
    </Badge>
  )
}

export function StatusDot({ status }: { status: AppStatus }) {
  const statusConfig = useStatusConfig()
  return <span className={cn('size-1.5 rounded-full', statusConfig[status]?.dot || 'bg-primary')} />
}

export function StatusIcon({ status, className }: { status: AppStatus; className?: string }) {
  const statusConfig = useStatusConfig()
  const config = statusConfig[status] || statusConfig.sent
  const Icon = config.icon
  return <Icon className={cn('size-4', className)} />
}

export const STATUS_CHECK_ICON = CheckCircle2
