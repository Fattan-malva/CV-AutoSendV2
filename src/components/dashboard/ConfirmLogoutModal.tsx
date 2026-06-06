'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import WindowFrame from '@/components/ui/WindowFrame'

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
    <>
      <style>{`
        @keyframes traffic-light {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-traffic-light {
          animation: traffic-light 1.8s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'var(--overlay)' }} onClick={onClose}>
        <div
          className="w-full max-w-sm mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <WindowFrame title={t.logout.title} accent="green" className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xs text-zinc-500">
              <span>~ $</span>
              <span className="text-green-400">{t.logout.cmd}</span>
            </div>

            <p className="text-sm text-zinc-300 mb-6">{t.logout.prompt}</p>

            {loading && (
              <div className="flex items-center justify-center gap-4 py-4 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-traffic-light" style={{ animationDelay: '0s' }} />
                </div>
                <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-traffic-light" style={{ animationDelay: '0.6s' }} />
                </div>
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-traffic-light" style={{ animationDelay: '1.2s' }} />
                </div>
              </div>
            )}

            {error && (
              <p className="mb-4 font-mono text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 font-mono text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                {t.logout.cancel}
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 bg-red-500 text-white rounded-xl px-4 py-2.5 font-mono text-sm font-medium hover:bg-red-400 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Loading...' : t.logout.confirm}
              </button>
            </div>
          </WindowFrame>
        </div>
      </div>
    </>
  )
}
