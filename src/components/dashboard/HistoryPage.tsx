'use client'

import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import Skeleton from '@/components/ui/Skeleton'
import type { ApplicationLog } from '@/types'

export default function HistoryPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [logs, setLogs] = useState<ApplicationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setLogs(data.logs || [])
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center">
          <History className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h2 className="font-mono text-sm text-zinc-300">{t.dashboard.history}</h2>
          <p className="font-mono text-[10px] text-zinc-600 mt-0.5">Applications sent so far</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="font-mono text-sm text-zinc-500">No applications yet</p>
          <p className="font-mono text-[11px] text-zinc-600 mt-1">Upload a brochure and send your first application</p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="font-mono text-[10px] text-zinc-500 uppercase text-left px-4 py-3">Date</th>
                <th className="font-mono text-[10px] text-zinc-500 uppercase text-left px-4 py-3">Company</th>
                <th className="font-mono text-[10px] text-zinc-500 uppercase text-left px-4 py-3">Position</th>
                <th className="font-mono text-[10px] text-zinc-500 uppercase text-left px-4 py-3">Email</th>
                <th className="font-mono text-[10px] text-zinc-500 uppercase text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {new Date(log.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{log.perusahaan}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{log.posisi}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{log.email}</td>
                  <td className="px-4 py-3">
                    {log.status === 'sent' ? (
                      <span className="font-mono text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Sent</span>
                    ) : (
                      <span className="font-mono text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full" title={log.error}>Failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
