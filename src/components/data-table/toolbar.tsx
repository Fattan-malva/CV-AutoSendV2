'use client'

import { Search, X } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Search…',
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter)

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <div className='relative'>
          <Search className='pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={(table.getState().globalFilter as string) ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            className='h-8 w-[150px] ps-8 lg:w-[260px]'
          />
        </div>
        {filters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
          />
        ))}
        {isFiltered ? (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 lg:px-3'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
          >
            Reset
            <X className='size-4' />
          </Button>
        ) : null}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
