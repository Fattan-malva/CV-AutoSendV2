'use client'

import { Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/context/search-provider'
import { cn } from '@/lib/utils'

export function Search({ className }: { className?: string }) {
  const { setOpen } = useSearch()

  return (
    <Button
      variant='outline'
      className={cn(
        'relative h-8 w-full flex-1 justify-start gap-2 rounded-md bg-muted/40 px-3 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent md:w-40 md:flex-none lg:w-56 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <SearchIcon className='size-4' />
      <span className='hidden lg:inline-flex'>Search</span>
      <span className='ms-auto hidden items-center gap-0.5 sm:flex'>
        <kbd className='pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </span>
    </Button>
  )
}
