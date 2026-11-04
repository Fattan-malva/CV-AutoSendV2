import { cn } from '@/lib/utils'

export function Main({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn('@container/main flex min-h-0 flex-1 flex-col gap-2 overflow-hidden', className)}>
      <div className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:gap-6 md:py-6 lg:px-6', className)}>
        {children}
      </div>
    </main>
  )
}
