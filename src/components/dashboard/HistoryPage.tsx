'use client'

import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  AlertCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldX,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableBulkActions, DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { useApplicationLogs } from '@/hooks/use-application-logs'
import { useI18n } from '@/lib/i18n-context'
import { formatDate } from '@/lib/utils'
import { StatusBadge, getStatusOptions } from './application-status'
import type { ApplicationLog, AppStatus } from '@/types'

const globalFilterFn: FilterFn<ApplicationLog> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '').toLowerCase().trim()
  if (!query) return true
  return [row.original.perusahaan, row.original.posisi, row.original.email, row.original.subjek]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))
}

function StatusCell({
  log,
  onUpdate,
}: {
  log: ApplicationLog
  onUpdate: (id: string, status: AppStatus) => Promise<void>
}) {
  const { t } = useI18n()
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async (status: AppStatus) => {
    if (status === log.status) return
    setUpdating(true)
    try {
      await onUpdate(log.id, status)
      const label = getStatusOptions(t).find((o) => o.value === status)?.label || status
      toast.success(
        String(t.dashboard.statusUpdated || 'Status updated').replace('{status}', label)
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(t.dashboard.failedToUpdate || 'Failed to update'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          disabled={updating}
        >
          <StatusBadge status={log.status} />
          {updating ? (
            <Loader2 className='size-3 animate-spin text-muted-foreground' />
          ) : (
            <ChevronDown className='size-3 text-muted-foreground' />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-44'>
        {getStatusOptions(t).map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => void handleUpdate(option.value)}
            className='gap-2'
          >
            <option.icon className='size-3.5' />
            {option.label}
            {log.status === option.value ? (
              <span className='ms-auto text-xs text-muted-foreground'>✓</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function HistoryPage() {
  const { t } = useI18n()
  const { logs, loading, error, reload, updateStatus, bulkUpdateStatus } = useApplicationLogs()
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailsLog, setDetailsLog] = useState<ApplicationLog | null>(null)
  const [bulkLoading, setBulkLoading] = useState<AppStatus | null>(null)

  const columns = useMemo<ColumnDef<ApplicationLog>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t.dashboard.selectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t.dashboard.selectRow}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'perusahaan',
        header: ({ column }) => <DataTableColumnHeader column={column} title={String(t.dashboard.fieldCompany || 'Company')} />,
        cell: ({ row }) => (
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-[10px] font-semibold uppercase'>
              {row.original.perusahaan?.slice(0, 2) || '—'}
            </div>
            <div className='min-w-0'>
              <p className='max-w-[180px] truncate font-medium'>
                {row.original.perusahaan || t.dashboard.unknownCompany}
              </p>
              <p className='max-w-[180px] truncate text-xs text-muted-foreground'>
                {row.original.posisi || t.dashboard.unknownPosition}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'posisi',
        header: ({ column }) => <DataTableColumnHeader column={column} title={String(t.dashboard.fieldPosition || 'Position')} />,
        cell: ({ row }) => (
          <span className='max-w-[180px] truncate text-sm'>{row.original.posisi || '—'}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title={String(t.dashboard.fieldRecipient || 'Recipient')} />,
        cell: ({ row }) => (
          <span className='max-w-[220px] truncate text-sm text-muted-foreground'>
            {row.original.email || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'sentAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title={String(t.dashboard.fieldDate || 'Date')} />,
        cell: ({ row }) => (
          <span className='text-xs text-muted-foreground'>{formatDate(row.original.sentAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
        cell: ({ row }) => <StatusCell log={row.original} onUpdate={updateStatus} />,
      },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const log = row.original
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='size-8'>
                  <MoreHorizontal className='size-4' />
                  <span className='sr-only'>{t.dashboard.openMenu}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onSelect={() => setDetailsLog(log)}>
                  <Eye /> {String(t.dashboard.viewDetails || 'View details')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard.writeText(log.email)
                    toast.success(String(t.dashboard.copyEmail || 'Recipient email copied'))
                  }}
                >
                  <Copy /> {String(t.dashboard.copyEmail || 'Copy email')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard.writeText(log.subjek)
                    toast.success(String(t.dashboard.copySubject || 'Subject copied'))
                  }}
                >
                  <Copy /> {String(t.dashboard.copySubject || 'Copy subject')}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`mailto:${log.email}?subject=${encodeURIComponent(log.subjek)}`}>
                    <ExternalLink /> {String(t.dashboard.openMailApp || 'Open in mail app')}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Send /> {String(t.dashboard.changeStatus || 'Change status')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {getStatusOptions(t).map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onSelect={async () => {
                          try {
                            await updateStatus(log.id, option.value)
                            toast.success(
                              t.dashboard.statusUpdated.replace('{status}', option.label)
                            )
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : String(t.dashboard.failedToUpdate || 'Failed to update'))
                          }
                        }}
                      >
                        <option.icon className='size-3.5' />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [updateStatus, t]
  )

  const table = useReactTable({
    data: logs,
    columns,
    state: { rowSelection, globalFilter },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id)

  const handleBulkUpdate = async (status: AppStatus) => {
    setBulkLoading(status)
    try {
      const count = await bulkUpdateStatus(selectedIds, status)
      toast.success(
        t.dashboard.appsUpdated
          .replace('{count}', String(count))
          .replace('{plural}', count === 1 ? '' : 's')
      )
      table.resetRowSelection()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(t.dashboard.failedToUpdateApps || 'Failed to update applications'))
    } finally {
      setBulkLoading(null)
    }
  }

  const totalSent = logs.filter((log) => log.status === 'sent').length
  const totalApproved = logs.filter((log) => log.status === 'approved').length
  const totalFailed = logs.filter((log) => log.status === 'failed').length

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>{t.dashboard.history}</h2>
          <p className='text-sm text-muted-foreground'>
            {String(t.dashboard.historyDesc || 'Track every application, update statuses, and follow up with recruiters.')}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            {String(t.dashboard.refresh || 'Refresh')}
          </Button>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Card className='py-4'>
          <CardContent className='flex items-center gap-3 px-4'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
              <Send className='size-4 text-primary' />
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>{String(t.dashboard.statSentLabel || 'Sent')}</p>
              <p className='text-lg font-semibold'>{totalSent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className='py-4'>
          <CardContent className='flex items-center gap-3 px-4'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-emerald-500/10'>
              <ShieldCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>{String(t.dashboard.statApprovedLabel || 'Approved')}</p>
              <p className='text-lg font-semibold'>{totalApproved}</p>
            </div>
          </CardContent>
        </Card>
        <Card className='py-4'>
          <CardContent className='flex items-center gap-3 px-4'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-destructive/10'>
              <XCircle className='size-4 text-destructive' />
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>{String(t.dashboard.statFailedLabel || 'Failed')}</p>
              <p className='text-lg font-semibold'>{totalFailed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <div className='flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive'>
          <AlertCircle className='size-4' />
          {error}
          <Button variant='ghost' size='sm' className='ms-auto' onClick={() => void reload()}>
            {String(t.dashboard.retry || 'Retry')}
          </Button>
        </div>
      ) : null}

      <Card className='py-0'>
        <CardContent className='space-y-4 p-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder={String(t.dashboard.searchPlaceholder || 'Search company, role, email…')}
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: getStatusOptions(t),
              },
            ]}
          />

          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className='bg-muted/40 hover:bg-muted/40'>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className='h-10 text-xs'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex} className='h-14'>
                          <div className='h-4 w-full max-w-32 animate-pulse rounded bg-muted' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className='h-14'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-48 text-center'>
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                          <Inbox className='size-5 text-muted-foreground' />
                        </div>
                        <p className='text-sm font-medium'>
                          {logs.length === 0
                            ? String(t.dashboard.noAppsYetTable || 'No applications yet')
                            : String(t.dashboard.noMatchingApps || 'No matching applications')}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {logs.length === 0
                            ? String(t.dashboard.noAppsTableDesc || 'Analyze a brochure and send your first application.')
                            : String(t.dashboard.noMatchingDesc || 'Try a different search or clear the filters.')}
                        </p>
                        {logs.length > 0 ? (
                          <Button
                            variant='outline'
                            size='sm'
                            className='mt-1'
                            onClick={() => {
                              table.resetColumnFilters()
                              table.setGlobalFilter('')
                            }}
                          >
                            {String(t.dashboard.clearFilters || 'Clear filters')}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <DataTableBulkActions table={table} entityName='application'>
        <Button
          size='sm'
          variant='secondary'
          disabled={Boolean(bulkLoading)}
          onClick={() => void handleBulkUpdate('sent')}
        >
          {bulkLoading === 'sent' ? <Loader2 className='size-3.5 animate-spin' /> : <Send className='size-3.5' />}
          {String(t.dashboard.markSent || 'Mark sent')}
        </Button>
        <Button
          size='sm'
          variant='secondary'
          disabled={Boolean(bulkLoading)}
          onClick={() => void handleBulkUpdate('approved')}
        >
          {bulkLoading === 'approved' ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <ShieldCheck className='size-3.5' />
          )}
          {String(t.dashboard.approve || 'Approve')}
        </Button>
        <Button
          size='sm'
          variant='secondary'
          disabled={Boolean(bulkLoading)}
          onClick={() => void handleBulkUpdate('rejected')}
        >
          {bulkLoading === 'rejected' ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <ShieldX className='size-3.5' />
          )}
          {String(t.dashboard.reject || 'Reject')}
        </Button>
      </DataTableBulkActions>

      <Dialog open={Boolean(detailsLog)} onOpenChange={(open) => !open && setDetailsLog(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Mail className='size-4' />
              {String(t.dashboard.applicationDetails || 'Application details')}
            </DialogTitle>
            <DialogDescription>
              {detailsLog?.perusahaan || t.dashboard.unknownCompany} · {detailsLog?.posisi || t.dashboard.unknownPosition}
            </DialogDescription>
          </DialogHeader>
          {detailsLog ? (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <StatusBadge status={detailsLog.status} />
                <Badge variant='outline'>{formatDate(detailsLog.sentAt)}</Badge>
              </div>
              <Separator />
              <div className='grid gap-3 text-sm'>
                <div>
                  <Label className='text-xs text-muted-foreground'>{String(t.dashboard.fieldCompany || 'Company')}</Label>
                  <p className='font-medium'>{detailsLog.perusahaan || '—'}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>{String(t.dashboard.fieldPosition || 'Position')}</Label>
                  <p className='font-medium'>{detailsLog.posisi || '—'}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>{String(t.dashboard.fieldRecipient || 'Recipient')}</Label>
                  <p className='font-medium'>{detailsLog.email || '—'}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>{String(t.dashboard.fieldSubject || 'Subject')}</Label>
                  <p className='font-medium'>{detailsLog.subjek || '—'}</p>
                </div>
                {detailsLog.error ? (
                  <div>
                    <Label className='text-xs text-muted-foreground'>{String(t.dashboard.fieldError || 'Error')}</Label>
                    <p className='text-destructive'>{detailsLog.error}</p>
                  </div>
                ) : null}
              </div>
              <div className='flex flex-wrap gap-2 border-t pt-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    void navigator.clipboard.writeText(detailsLog.email)
                    toast.success(String(t.dashboard.copyEmail || 'Recipient email copied'))
                  }}
                >
                  <Copy className='size-3.5' /> {String(t.dashboard.copyEmail || 'Copy email')}
                </Button>
                <Button variant='outline' size='sm' asChild>
                  <a
                    href={`mailto:${detailsLog.email}?subject=${encodeURIComponent(detailsLog.subjek)}`}
                  >
                    <ExternalLink className='size-3.5' /> {String(t.dashboard.openMailApp || 'Open mail app')}
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
