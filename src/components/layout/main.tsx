import { cn } from '@/lib/utils'

export function Main({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className='@container/main flex flex-1 flex-col gap-2'>
      <div className={cn('flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6', className)}>
        {children}
      </div>
    </main>
  )
}
