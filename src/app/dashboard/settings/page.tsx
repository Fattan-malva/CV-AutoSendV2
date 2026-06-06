'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import SettingsPage from '@/components/dashboard/SettingsPage'
import Skeleton from '@/components/ui/Skeleton'
import type { UserConfig } from '@/types'

export default function SettingsRoute() {
  const { user } = useAuth()
  const [config, setConfig] = useState<UserConfig | null>(null)

  useEffect(() => {
    if (!user || !db) return
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setConfig(snap.data() as UserConfig)
    })
  }, [user])

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="border border-zinc-800 rounded-2xl p-6 space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return <SettingsPage config={config} onConfigUpdate={setConfig} />
}
