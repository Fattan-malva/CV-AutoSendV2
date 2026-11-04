import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AppTitle({ className }: { className?: string }) {
  return (
    <Link
      href='/dashboard'
      className={cn('flex items-center gap-2.5 px-2 py-1.5', className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/icons.png' alt='Ceefy' className='size-7 object-contain' />
      <div className='grid leading-none'>
        <span className='font-serif text-sm font-semibold tracking-tight'>ceefy</span>
        <span className='mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground'>
          workspace
        </span>
      </div>
    </Link>
  )
}
