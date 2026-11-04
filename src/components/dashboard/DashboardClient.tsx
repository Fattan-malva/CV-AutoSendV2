'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Inbox,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useApplicationLogs } from '@/hooks/use-application-logs'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { getPlanLimit, getPlanLabel, isUnlimited } from '@/lib/plans'
import { useProcessing } from '@/lib/processing-context'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type id from '@/i18n/id'
import type { BulkItem } from '@/lib/processing-context'
import { StatusBadge } from './application-status'

type Translations = typeof id

function GrowableTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
        const el = event.currentTarget
        el.style.height = 'auto'
        el.style.height = `${Math.max(el.scrollHeight, 72)}px`
      }}
      placeholder={placeholder}
      className={cn('min-h-[72px] resize-y', className)}
      style={{ fieldSizing: 'content' } as React.CSSProperties}
    />
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string | null
  accent?: boolean
}) {
  const positive = trend?.startsWith('+')
  return (
    <Card className={cn('gap-0 py-0', accent && 'border-primary/25 bg-primary/[0.03]')}>
      <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-5 pb-2 pt-5'>
        <CardDescription className='text-xs font-medium uppercase tracking-wide'>
          {label}
        </CardDescription>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg border bg-background',
            accent && 'border-primary/30 text-primary'
          )}
        >
          <Icon className='size-4' />
        </div>
      </CardHeader>
      <CardContent className='px-5 pb-5'>
        <div className='flex items-end justify-between gap-2'>
          <div>
            <p className='text-2xl font-semibold tracking-tight'>{value}</p>
            <p className='mt-1 text-xs text-muted-foreground'>{hint}</p>
          </div>
          {trend ? (
            <Badge
              variant='secondary'
              className={cn(
                'gap-0.5 text-[10px]',
                positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              )}
            >
              {positive ? <ArrowUpRight className='size-3' /> : null}
              {trend}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function UsageCard({
  analyzeUsed,
  sendUsed,
  plan,
  onUpgrade,
  t,
}: {
  analyzeUsed: number
  sendUsed: number
  plan: Parameters<typeof getPlanLimit>[0]
  onUpgrade: () => void
  t: Translations
}) {
  const unlimited = isUnlimited(plan)
  const limit = getPlanLimit(plan)
  const analyzePercent = unlimited ? 100 : Math.min(100, (analyzeUsed / limit) * 100)
  const sendPercent = unlimited ? 100 : Math.min(100, (sendUsed / limit) * 100)
  const remaining = unlimited ? Infinity : Math.max(0, limit - analyzeUsed)

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Zap className='size-4 text-primary' />
          {String(t.dashboard?.usageTitle || 'Usage & plan')}
        </CardTitle>
        <CardDescription>
          {String(t.dashboard?.usageDesc || 'Your monthly AI analyses and email sends.')}
        </CardDescription>
        <CardAction>
          <Badge variant={unlimited ? 'default' : 'secondary'} className='uppercase'>
            {getPlanLabel(plan)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='flex items-center gap-1.5 font-medium'>
              <Sparkles className='size-3.5 text-primary' /> {String(t.dashboard?.aiAnalyses || 'AI analyses')}
            </span>
            <span className='text-muted-foreground'>
              {unlimited
                ? `${analyzeUsed} ${String(t.dashboard?.usageUsed || 'used').replace('{count}', '')} · ${String(t.dashboard?.unlimitedAccess || 'unlimited')}`
                : `${analyzeUsed} ${String(t.dashboard?.of || 'of')} ${limit}`}
            </span>
          </div>
          <Progress value={analyzePercent} />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='flex items-center gap-1.5 font-medium'>
              <Send className='size-3.5 text-primary' /> {String(t.dashboard?.emailSends || 'Email sends')}
            </span>
            <span className='text-muted-foreground'>
              {unlimited
                ? `${sendUsed} ${String(t.dashboard?.usageUsed || 'used').replace('{count}', '')} · ${String(t.dashboard?.unlimitedAccess || 'unlimited')}`
                : `${sendUsed} ${String(t.dashboard?.of || 'of')} ${limit}`}
            </span>
          </div>
          <Progress
            value={sendPercent}
            indicatorClassName={cn(sendPercent >= 100 && 'bg-destructive')}
          />
        </div>

        <Separator />

        {unlimited ? (
          <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs'>
            <div className='flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400'>
              <CheckCircle2 className='size-4' /> {String(t.dashboard?.unlimitedAccessActive || 'Unlimited access active')}
            </div>
            <p className='mt-1 text-muted-foreground'>
              {String(t.dashboard?.unlimitedDesc || 'Enjoy unlimited analyses and sends for your job search.')}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs'>
              <span className='text-muted-foreground'>{String(t.dashboard?.analysesRemainingLabel || 'Analyses remaining')}</span>
              <span className='font-semibold'>{formatNumber(remaining)}</span>
            </div>
            <Button onClick={onUpgrade} className='w-full'>
              <Sparkles className='size-4' />
              {String(t.dashboard?.upgradePlan || 'Upgrade plan')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type ChartTooltipPayload = {
  dataKey?: string | number
  name?: string | number
  value?: number | string
  color?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg'>
      <p className='mb-1 font-medium'>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className='flex items-center gap-1.5 text-muted-foreground'>
          <span
            className='size-1.5 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className='font-medium text-foreground'>{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function ActivityChart({ data, t }: { data: { day: string; applications: number; approved: number }[]; t: Translations }) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-base'>{String(t.dashboard?.activityTitle || 'Application activity')}</CardTitle>
        <CardDescription>{String(t.dashboard?.activityDesc || 'Applications sent over the last 7 days.')}</CardDescription>
        <CardAction>
          <Badge variant='outline' className='gap-1.5'>
            <Activity className='size-3' /> {String(t.dashboard?.live || 'Live')}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='h-[240px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id='fillApplications' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--chart-1)' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='var(--chart-1)' stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id='fillApproved' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--chart-2)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--chart-2)' stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' vertical={false} />
              <XAxis
                dataKey='day'
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                dy={6}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type='monotone'
                dataKey='applications'
                name={String(t.dashboard?.chartSent || 'Sent')}
                stroke='var(--chart-1)'
                strokeWidth={2}
                fill='url(#fillApplications)'
              />
              <Area
                type='monotone'
                dataKey='approved'
                name={String(t.dashboard?.chartApproved || 'Approved')}
                stroke='var(--chart-2)'
                strokeWidth={2}
                fill='url(#fillApproved)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function UploadStatusBadge({ item, t }: { item: BulkItem; t: Translations }) {
  if (item.sending) {
    return (
      <Badge variant='secondary' className='gap-1 text-[10px]'>
        <Loader2 className='size-3 animate-spin' /> {String(t.dashboard?.statusSending || 'Sending')}
      </Badge>
    )
  }
  switch (item.status) {
    case 'analyzing':
      return (
        <Badge variant='secondary' className='gap-1 text-[10px]'>
          <Loader2 className='size-3 animate-spin' /> {String(t.dashboard?.statusAnalyzing || 'Analyzing')}
        </Badge>
      )
    case 'done':
      return (
        <Badge className='gap-1 border-transparent bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'>
          <CheckCircle2 className='size-3' /> {String(t.dashboard?.statusReady || 'Ready')}
        </Badge>
      )
    case 'sent':
      return (
        <Badge className='gap-1 border-transparent bg-primary/10 text-[10px] text-primary'>
          <Send className='size-3' /> {String(t.dashboard?.statusSent || 'Sent')}
        </Badge>
      )
    case 'error':
      return (
        <Badge variant='destructive' className='gap-1 text-[10px]'>
          <AlertCircle className='size-3' /> {String(t.dashboard?.statusFailed || 'Failed')}
        </Badge>
      )
    default:
      return (
        <Badge variant='outline' className='gap-1 text-[10px]'>
          <Paperclip className='size-3' /> {String(t.dashboard?.statusPending || 'Pending')}
        </Badge>
      )
  }
}

export default function DashboardClient() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { logs } = useApplicationLogs()
  const [isDragging, setIsDragging] = useState(false)
  const {
    config,
    items,
    bulkRunning,
    bulkProgress,
    sendingBulk,
    addFiles,
    removeItem,
    toggleSelect,
    toggleExpanded,
    updateItem,
    analyzeAllPending,
    analyzeSingle,
    sendAllDone,
    sendSingleItem,
    clearAll,
    setUpgradeOpen,
  } = useProcessing()

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file.type.startsWith('image/') || file.type === 'application/pdf'
      )
      if (files.length > 0) addFiles(files)
    },
    [addFiles]
  )

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      if (files.length > 0) addFiles(files)
      event.target.value = ''
    },
    [addFiles]
  )

  const chartData = useMemo(() => {
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' })
    return Array.from({ length: 7 }, (_, index) => {
      const start = new Date()
      start.setDate(start.getDate() - (6 - index))
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 1)
      const inRange = logs.filter((log) => {
        const time = new Date(log.sentAt).getTime()
        return time >= start.getTime() && time < end.getTime()
      })
      return {
        day: weekday.format(start),
        applications: inRange.length,
        approved: inRange.filter((log) => log.status === 'approved').length,
      }
    })
  }, [logs])

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = logs.filter((log) => new Date(log.sentAt) >= monthStart).length
    const lastMonth = logs.filter((log) => {
      const date = new Date(log.sentAt)
      return date >= lastMonthStart && date < monthStart
    }).length
    const successful = logs.filter(
      (log) => log.status === 'sent' || log.status === 'approved'
    ).length
    const successRate = logs.length ? Math.round((successful / logs.length) * 100) : 0
    const trend =
      lastMonth > 0
        ? `${thisMonth >= lastMonth ? '+' : ''}${Math.round(((thisMonth - lastMonth) / lastMonth) * 100)}%`
        : null
    return { thisMonth, successRate, trend }
  }, [logs])

  if (!config) return <DashboardSkeleton />

  const plan = config.plan
  const pendingCount = items.filter((item) => item.status === 'pending').length
  const doneCount = items.filter((item) => item.status === 'done' && item.selected).length
  const firstName =
    config.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there'

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>
            {t.dashboard.welcome.replace('{name}', firstName)}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {items.length > 0
              ? t.dashboard.welcomeSubtitleQueue
                  .replace('{count}', String(items.length))
                  .replace('{plural}', items.length > 1 ? 's' : '')
              : t.dashboard.welcomeSubtitleEmpty}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild>
            <Link href='/dashboard/history'>
              <Activity className='size-4' /> {t.dashboard.history}
            </Link>
          </Button>
          <Button asChild>
            <Link href='/dashboard/cv-builder'>
              <FileText className='size-4' /> {t.cvBuilder.title}
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label={String(t.dashboard.statTotalApplications || 'Total applications')}
          value={formatNumber(logs.length)}
          hint={String(t.dashboard.statTotalHint || 'All applications sent so far')}
          icon={Send}
          accent
        />
        <StatCard
          label={String(t.dashboard.statThisMonth || 'This month')}
          value={formatNumber(stats.thisMonth)}
          hint={String(t.dashboard.statThisMonthHint || 'Applications sent this month')}
          icon={Activity}
          trend={stats.trend}
        />
        <StatCard
          label={String(t.dashboard.statSuccessRate || 'Success rate')}
          value={`${stats.successRate}%`}
          hint={String(t.dashboard.statSuccessRateHint || 'Sent or approved applications')}
          icon={CheckCircle2}
        />
        <StatCard
          label={String(t.dashboard.statInQueue || 'In queue')}
          value={formatNumber(items.length)}
          hint={t.dashboard.statInQueueHint
            .replace('{pending}', String(pendingCount))
            .replace('{done}', String(doneCount))}
          icon={Inbox}
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-7'>
        <div className='lg:col-span-4'>
          <ActivityChart data={chartData} t={t} />
        </div>
        <div className='lg:col-span-3'>
          <UsageCard
            analyzeUsed={config.usageAnalyze || 0}
            sendUsed={config.usageSend || 0}
            plan={plan}
            onUpgrade={() => setUpgradeOpen(true)}
            t={t}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Upload className='size-4 text-primary' />
            {String(t.dashboard.uploadTitle || 'Upload brochures')}
          </CardTitle>
          <CardDescription>
            {String(t.dashboard.uploadDesc || 'Drop job brochure images or PDFs. AI extracts the company, role, and writes your email.')}
          </CardDescription>
          <CardAction>
            <Badge variant='outline'>{items.length} file{items.length === 1 ? '' : 's'}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div
            role='button'
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => document.getElementById('brochure-input')?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                document.getElementById('brochure-input')?.click()
              }
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-muted/40'
            )}
          >
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full border bg-background',
                isDragging && 'border-primary text-primary'
              )}
            >
              <Upload className={cn('size-5', isDragging && 'text-primary')} />
            </div>
            <div>
              <p className='text-sm font-medium'>
                {isDragging ? t.dashboard.dropzoneActive : t.dashboard.dropzone}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>{t.dashboard.dropzoneMulti}</p>
            </div>
            <input
              id='brochure-input'
              type='file'
              multiple
              accept='.pdf,image/*'
              className='hidden'
              onChange={handleFileInput}
            />
          </div>

          {items.length > 0 ? (
            <>
              <div className='flex flex-wrap items-center gap-2'>
                <Button onClick={analyzeAllPending} disabled={bulkRunning || pendingCount === 0}>
                  {bulkRunning ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      {t.dashboard.analyzeProgress
                        .replace('{done}', String(bulkProgress.done))
                        .replace('{total}', String(bulkProgress.total))}
                    </>
                  ) : (
                    <>
                      <Sparkles className='size-4' />
                      {t.dashboard.analyzeFiles.replace('{count}', String(pendingCount))}
                      <ArrowRight className='size-4' />
                    </>
                  )}
                </Button>
                <Button
                  variant='outline'
                  onClick={sendAllDone}
                  disabled={sendingBulk || doneCount === 0}
                >
                  {sendingBulk ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      {t.dashboard.sending}
                    </>
                  ) : (
                    <>
                      <Send className='size-4' />
                      {t.dashboard.sendSelected.replace('{count}', String(doneCount))}
                    </>
                  )}
                </Button>
                <Button variant='ghost' onClick={clearAll} className='text-muted-foreground'>
                  {t.dashboard.clearAll}
                </Button>
                <span className='ms-auto text-xs text-muted-foreground'>
                  {t.dashboard.fileCount.replace('{count}', String(items.length))}
                </span>
              </div>

              <div className='space-y-2'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl border bg-card transition-colors',
                      item.selected && 'border-primary/30'
                    )}
                  >
                    <div className='flex items-center gap-3 p-3'>
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        aria-label={`Select ${item.file.name}`}
                        onClick={(event) => event.stopPropagation()}
                      />
                      <button
                        type='button'
                        onClick={() => toggleExpanded(item.id)}
                        className='flex min-w-0 flex-1 items-center gap-3 text-start'
                      >
                        <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50'>
                          <FileText className='size-4 text-muted-foreground' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='max-w-[220px] truncate text-sm font-medium sm:max-w-md'>
                              {item.file.name}
                            </span>
                            <UploadStatusBadge item={item} t={t} />
                          </div>
                          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                            {item.error ||
                              (item.status === 'done' || item.status === 'sent'
                                ? `${item.editable.nama_perusahaan || t.dashboard.unknownCompany} · ${item.editable.posisi || t.dashboard.unknownPosition}`
                                : `${(item.file.size / 1024 / 1024).toFixed(2)} MB · ${
                                    item.file.type || 'document'
                                  }`)}
                          </p>
                        </div>
                        <ChevronDown
                          className={cn(
                            'size-4 shrink-0 text-muted-foreground transition-transform',
                            item.expanded && 'rotate-180'
                          )}
                        />
                      </button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-8 shrink-0 text-muted-foreground hover:text-destructive'
                        onClick={() => removeItem(item.id)}
                      >
                        <X className='size-4' />
                        <span className='sr-only'>{t.dashboard.removeFile}</span>
                      </Button>
                    </div>

                    <Collapsible open={item.expanded}>
                      <CollapsibleContent className='CollapsibleContent'>
                        {item.expanded && item.status === 'done' ? (
                          <div className='space-y-4 border-t bg-muted/20 p-4'>
                            <div className='grid gap-3'>
                              <div className='space-y-1.5'>
                                <Label htmlFor={`subject-${item.id}`} className='text-xs'>
                                  {t.dashboard.subjek}
                                </Label>
                                <GrowableTextarea
                                  value={item.editable.subjek}
                                  onChange={(value) =>
                                    updateItem(item.id, {
                                      editable: { ...item.editable, subjek: value },
                                    })
                                  }
                                  placeholder={t.dashboard.placeholderSubject}
                                />
                              </div>
                              <div className='grid gap-3 sm:grid-cols-2'>
                                <div className='space-y-1.5'>
                                  <Label htmlFor={`company-${item.id}`} className='text-xs'>
                                    {t.dashboard.perusahaan}
                                  </Label>
                                  <Input
                                    id={`company-${item.id}`}
                                    value={item.editable.nama_perusahaan}
                                    onChange={(event) =>
                                      updateItem(item.id, {
                                        editable: {
                                          ...item.editable,
                                          nama_perusahaan: event.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className='space-y-1.5'>
                                  <Label htmlFor={`position-${item.id}`} className='text-xs'>
                                    {t.dashboard.posisi}
                                  </Label>
                                  <Input
                                    id={`position-${item.id}`}
                                    value={item.editable.posisi}
                                    onChange={(event) =>
                                      updateItem(item.id, {
                                        editable: {
                                          ...item.editable,
                                          posisi: event.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className='space-y-1.5'>
                                <Label htmlFor={`email-${item.id}`} className='text-xs'>
                                  {t.dashboard.email}
                                </Label>
                                <Input
                                  id={`email-${item.id}`}
                                  type='email'
                                  value={item.editable.email}
                                  onChange={(event) =>
                                    updateItem(item.id, {
                                      editable: { ...item.editable, email: event.target.value },
                                    })
                                  }
                                  placeholder={t.dashboard.placeholderEmail}
                                />
                              </div>
                              <div className='space-y-1.5'>
                                <Label className='text-xs'>{t.dashboard.intro}</Label>
                                <GrowableTextarea
                                  value={item.editable.intro}
                                  onChange={(value) =>
                                    updateItem(item.id, {
                                      editable: { ...item.editable, intro: value },
                                    })
                                  }
                                  placeholder={t.dashboard.placeholderIntro}
                                />
                              </div>
                              <div className='space-y-1.5'>
                                <Label className='text-xs'>{t.dashboard.alasan}</Label>
                                <GrowableTextarea
                                  value={item.editable.alasan}
                                  onChange={(value) =>
                                    updateItem(item.id, {
                                      editable: { ...item.editable, alasan: value },
                                    })
                                  }
                                  placeholder={t.dashboard.placeholderAlasan}
                                />
                              </div>
                              <div className='space-y-1.5'>
                                <Label className='text-xs'>{t.dashboard.penutup}</Label>
                                <GrowableTextarea
                                  value={item.editable.penutup}
                                  onChange={(value) =>
                                    updateItem(item.id, {
                                      editable: { ...item.editable, penutup: value },
                                    })
                                  }
                                  placeholder={t.dashboard.placeholderPenutup}
                                />
                              </div>
                            </div>

                            <div className='flex flex-wrap items-center justify-between gap-2 border-t pt-3'>
                              {!config.smtpPass || !config.cvPath ? (
                                <p className='text-xs text-amber-600 dark:text-amber-400'>
                                  {t.dashboard.completeSetup
                                    .replace('{settings}', t.dashboard.settings)}
                                </p>
                              ) : (
                                <span />
                              )}
                              <Button
                                size='sm'
                                onClick={() => void sendSingleItem(item)}
                                disabled={
                                  item.sending ||
                                  !config.smtpPass ||
                                  !config.cvPath ||
                                  !item.editable.email
                                }
                              >
                                {item.sending ? (
                                  <Loader2 className='size-4 animate-spin' />
                                ) : (
                                  <Send className='size-4' />
                                )}
                                {t.dashboard.sendEmail}
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {item.expanded && item.status === 'error' ? (
                          <div className='space-y-3 border-t bg-destructive/5 p-4'>
                            <div className='flex items-start gap-2 text-sm text-destructive'>
                              <AlertCircle className='mt-0.5 size-4 shrink-0' />
                              <p>{item.error || t.dashboard.analysisFailed}</p>
                            </div>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => void analyzeSingle(item)}
                            >
                              {t.dashboard.retryAnalysis}
                            </Button>
                          </div>
                        ) : null}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 py-10 text-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                <Inbox className='size-5 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium'>{t.dashboard.noFiles}</p>
              <p className='text-xs text-muted-foreground'>{t.dashboard.uploadPrompt}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{String(t.dashboard.recentApps || 'Recent applications')}</CardTitle>
          <CardDescription>{String(t.dashboard.recentAppsDesc || 'Your latest sent applications and their status.')}</CardDescription>
          <CardAction>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/history'>
                {String(t.dashboard.viewAll || 'View all')} <ArrowRight className='size-3.5' />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
              <div className='flex size-10 items-center justify-center rounded-full bg-muted'>
                <Send className='size-4 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium'>{String(t.dashboard.noAppsYet || 'No applications yet')}</p>
              <p className='text-xs text-muted-foreground'>
                {String(t.dashboard.noAppsDesc || 'Analyze a brochure and send your first application.')}
              </p>
            </div>
          ) : (
            <div className='divide-y'>
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className='flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0'
                >
                  <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-xs font-semibold uppercase'>
                    {log.perusahaan?.slice(0, 2) || '—'}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{log.perusahaan || t.dashboard.unknownCompany}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {log.posisi || t.dashboard.unknownPosition} · {log.email || t.dashboard.noRecipient}
                    </p>
                  </div>
                  <StatusBadge status={log.status} />
                  <span className='w-full text-xs text-muted-foreground sm:w-auto'>
                    {formatDate(log.sentAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='space-y-2'>
          <div className='h-8 w-64 animate-pulse rounded-md bg-muted' />
          <div className='h-4 w-80 animate-pulse rounded-md bg-muted' />
        </div>
        <div className='h-9 w-40 animate-pulse rounded-md bg-muted' />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='h-32 animate-pulse rounded-xl bg-muted' />
        ))}
      </div>
      <div className='grid gap-4 lg:grid-cols-7'>
        <div className='h-80 animate-pulse rounded-xl bg-muted lg:col-span-4' />
        <div className='h-80 animate-pulse rounded-xl bg-muted lg:col-span-3' />
      </div>
      <div className='h-64 animate-pulse rounded-xl bg-muted' />
    </div>
  )
}
