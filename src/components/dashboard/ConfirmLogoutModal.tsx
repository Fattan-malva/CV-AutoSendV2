'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { Spinner, X, SignOut } from 'phosphor-react'

interface ConfirmLogoutModalProps {
  open: boolean
  onClose: () => void
}

export default function ConfirmLogoutModal({ open, onClose }: ConfirmLogoutModalProps) {
  const { logout } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleLogout = async () => {
    setLoading(true)
    setError('')
    try {
      await logout()
      onClose()
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logout failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl" style={{ backgroundColor: 'var(--overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1.5 rounded-[2.5rem] bg-border/40">
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-card p-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <p className="text-base font-serif text-foreground mb-6">{t.logout.prompt}</p>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 mb-4">
                <Spinner size={18} className="text-accent animate-spin" />
              </div>
            )}

            {error && (
              <p className="mb-4 text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 border border-border text-foreground rounded-full px-4 py-3 text-sm font-medium hover:bg-subtle disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <X size={14} />
                {t.logout.cancel}
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white rounded-full px-4 py-3 text-sm font-medium hover:bg-red-400 disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                <SignOut size={14} weight="bold" />
                {loading ? 'Loading...' : t.logout.confirm}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
