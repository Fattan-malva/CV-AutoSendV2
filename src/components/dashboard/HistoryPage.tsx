'use client'

import { useState, useEffect } from 'react'
import { ClockCounterClockwise, CheckCircle, XCircle } from 'phosphor-react'
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <ClockCounterClockwise size={18} className="text-accent" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="p-1.5 rounded-[2rem] bg-border/30">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-4">
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <ClockCounterClockwise size={18} className="text-accent" />
        </div>
        <div>
          <h2 className="text-sm text-foreground font-medium">{t.dashboard.history}</h2>
          <p className="text-[10px] text-muted mt-0.5">Applications sent so far</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-subtle flex items-center justify-center mb-4">
            <ClockCounterClockwise size={28} className="text-muted" />
          </div>
          <p className="text-sm text-muted">No applications yet</p>
          <p className="text-[11px] text-muted/70 mt-1">Upload a brochure and send your first application</p>
        </div>
      ) : (
        <div className="p-1.5 rounded-[2rem] bg-border/30">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-subtle/50">
                    <th className="text-[10px] uppercase tracking-wider text-muted text-left px-5 py-4">Date</th>
                    <th className="text-[10px] uppercase tracking-wider text-muted text-left px-5 py-4">Company</th>
                    <th className="text-[10px] uppercase tracking-wider text-muted text-left px-5 py-4">Position</th>
                    <th className="text-[10px] uppercase tracking-wider text-muted text-left px-5 py-4">Email</th>
                    <th className="text-[10px] uppercase tracking-wider text-muted text-left px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-subtle/30 transition-colors duration-300">
                      <td className="px-5 py-4 text-xs text-muted">
                        {new Date(log.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 text-xs text-foreground">{log.perusahaan}</td>
                      <td className="px-5 py-4 text-xs text-foreground">{log.posisi}</td>
                      <td className="px-5 py-4 text-xs text-muted">{log.email}</td>
                      <td className="px-5 py-4">
                        {log.status === 'sent' ? (
                          <span className="text-[10px] text-accent bg-accent/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            <CheckCircle size={12} weight="fill" /> Sent
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1" title={log.error}>
                            <XCircle size={12} weight="fill" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
