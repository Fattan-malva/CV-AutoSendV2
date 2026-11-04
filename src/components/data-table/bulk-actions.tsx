'use client'

import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  entityName: string
  children: React.ReactNode
}

export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  if (selectedCount === 0) return null

  return (
    <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2'>
      <div className='flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur-lg supports-backdrop-filter:bg-background/70'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => table.resetRowSelection()}
          className='size-6 rounded-full'
          aria-label='Clear selection'
          title='Clear selection'
        >
          <X className='size-3.5' />
        </Button>
        <Separator orientation='vertical' className='h-5' />
        <div className='flex items-center gap-1 text-sm'>
          <Badge className='min-w-8 justify-center rounded-lg'>{selectedCount}</Badge>
          <span className='hidden sm:inline'>
            {entityName}
            {selectedCount > 1 ? 's' : ''}
          </span>
          <span className='text-muted-foreground'>selected</span>
        </div>
        <Separator orientation='vertical' className='h-5' />
        {children}
      </div>
    </div>
  )
}
