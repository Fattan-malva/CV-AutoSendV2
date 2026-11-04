'use client'

import SettingsPage from '@/components/dashboard/SettingsPage'
import { useProcessing } from '@/lib/processing-context'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsRoute() {
  const { config, updateConfig } = useProcessing()

  if (!config) {
    return (
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-4 w-80' />
        </div>
        <div className='grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]'>
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className='h-12 w-full rounded-lg' />
            ))}
          </div>
          <div className='space-y-4 rounded-xl border p-6'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className='h-12 w-full rounded-lg' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <SettingsPage config={config} onConfigUpdate={updateConfig} />
}
