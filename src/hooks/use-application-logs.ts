'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { ApplicationLog, AppStatus } from '@/types'

export function useApplicationLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ApplicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load applications')
      const data = (await res.json()) as { logs?: ApplicationLog[] }
      setLogs(data.logs || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    void load()
  }, [load])

  const updateStatus = useCallback(
    async (id: string, status: AppStatus) => {
      if (!user) throw new Error('Not authenticated')
      const token = await user.getIdToken()
      const res = await fetch('/api/history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setLogs((prev) => prev.map((log) => (log.id === id ? { ...log, status } : log)))
    },
    [user]
  )

  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: AppStatus) => {
      if (!user) throw new Error('Not authenticated')
      const token = await user.getIdToken()
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch('/api/history', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id, status }),
          })
          if (!res.ok) throw new Error('Failed to update status')
          return id
        })
      )
      const updated = new Set(
        results
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map((result) => result.value)
      )
      setLogs((prev) => prev.map((log) => (updated.has(log.id) ? { ...log, status } : log)))
      return updated.size
    },
    [user]
  )

  return {
    logs,
    setLogs,
    loading,
    error,
    reload: load,
    updateStatus,
    bulkUpdateStatus,
  }
}
