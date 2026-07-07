'use client'

import { useState, useEffect, useRef } from 'react'
import { ClockCounterClockwise, CheckCircle, XCircle, MagnifyingGlass, CaretDown, Spinner } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import Skeleton from '@/components/ui/Skeleton'
import type { ApplicationLog, AppStatus } from '@/types'

const statusConfig: Record<AppStatus, { label: string; color: string; bg: string; icon: 'check' | 'x' | 'clock' | 'approve' | 'reject' }> = {
  sent: { label: 'Sent', color: 'text-accent', bg: 'bg-accent/10', icon: 'check' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'x' },
  waiting: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'clock' },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'approve' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'reject' },
}

const statusIcons: Record<string, React.ReactNode> = {
  check: <CheckCircle size={12} weight="fill" />,
  x: <XCircle size={12} weight="fill" />,
  clock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  approve: <CheckCircle size={12} weight="fill" />,
  reject: <XCircle size={12} weight="fill" />,
}

function StatusDropdown({ log, getToken, onUpdate }: { log: ApplicationLog; getToken: () => Promise<string>; onUpdate: (id: string, status: AppStatus) => void }) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = statusConfig[log.status] || statusConfig.sent

  const handleSelect = async (status: AppStatus) => {
    setUpdating(true)
    setOpen(false)
    try {
      const token = await getToken()
      const res = await fetch('/api/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: log.id, status }),
      })
      if (res.ok) onUpdate(log.id, status)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className={`text-[10px] ${current.bg} ${current.color} px-2.5 py-1 rounded-full inline-flex items-center gap-1 hover:opacity-80 transition-all duration-300 cursor-pointer`}
      >
        {updating ? <Spinner size={12} className="animate-spin" /> : statusIcons[current.icon]}
        {current.label}
        <CaretDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[130px] bg-card border border-border rounded-xl p-1 shadow-xl shadow-black/20">
          {(Object.entries(statusConfig) as [AppStatus, typeof statusConfig[AppStatus]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${log.status === key ? `${cfg.bg} ${cfg.color}` : 'text-muted hover:text-foreground hover:bg-subtle'}`}
            >
              {statusIcons[cfg.icon]}
              {cfg.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [logs, setLogs] = useState<ApplicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const handleStatusUpdate = (id: string, status: AppStatus) => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const filtered = logs.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.perusahaan.toLowerCase().includes(q) ||
      l.posisi.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.subjek.toLowerCase().includes(q)
    )
  })

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <ClockCounterClockwise size={18} className="text-accent" />
        </div>
        <div>
          <h2 className="text-sm text-foreground font-medium">{t.dashboard.history}</h2>
          <p className="text-[10px] text-muted mt-0.5">Applications sent so far</p>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="relative mb-4">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, position, email..."
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-300"
          />
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-subtle flex items-center justify-center mb-4">
            <ClockCounterClockwise size={28} className="text-muted" />
          </div>
          <p className="text-sm text-muted">No applications yet</p>
          <p className="text-[11px] text-muted/70 mt-1">Upload a brochure and send your first application</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted">No results for &ldquo;{search}&rdquo;</p>
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
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-subtle/30 transition-colors duration-300">
                      <td className="px-5 py-4 text-xs text-muted">
                        {new Date(log.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 text-xs text-foreground">{log.perusahaan}</td>
                      <td className="px-5 py-4 text-xs text-foreground">{log.posisi}</td>
                      <td className="px-5 py-4 text-xs text-muted">{log.email}</td>
                      <td className="px-5 py-4">
                        <StatusDropdown log={log} getToken={() => user!.getIdToken()} onUpdate={handleStatusUpdate} />
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
