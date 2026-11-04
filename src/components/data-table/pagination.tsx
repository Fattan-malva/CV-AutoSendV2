'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
}

export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, Math.max(totalPages, 1))
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='text-xs text-muted-foreground'>
        {selectedCount > 0
          ? `${selectedCount} of ${totalCount} row(s) selected`
          : `${totalCount} row(s) total`}
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='hidden text-xs font-medium text-muted-foreground sm:block'>
            Rows per page
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className='h-8 w-16'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            className='hidden size-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to first page</span>
            <ChevronsLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeft className='size-4' />
          </Button>

          <div className='flex items-center gap-1'>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === '...' ? (
                <span key={`dots-${index}`} className='px-1 text-sm text-muted-foreground'>
                  ...
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  className='size-8 p-0'
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                >
                  {pageNumber}
                </Button>
              )
            )}
          </div>

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden size-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to last page</span>
            <ChevronsRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
