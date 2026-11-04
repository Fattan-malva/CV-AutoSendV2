'use client'

import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('relative size-8', className)}
          title='Change language'
        >
          <Languages className='size-4' />
          <span className='sr-only'>Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setLocale('id')}>
          <span className='text-xs font-semibold'>ID</span> Bahasa Indonesia
          {locale === 'id' ? <span className='ms-auto text-xs text-muted-foreground'>✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className='text-xs font-semibold'>EN</span> English
          {locale === 'en' ? <span className='ms-auto text-xs text-muted-foreground'>✓</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
