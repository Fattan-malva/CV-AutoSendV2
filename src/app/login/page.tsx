'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import WindowFrame from '@/components/ui/WindowFrame'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [logging, setLogging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    if (!auth || !db) return
    setLogging(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const u = result.user

      const snap = await getDoc(doc(db, 'users', u.uid))
      if (!snap.exists()) {
        await setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: u.email || '',
          displayName: u.displayName || '',
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
          senderName: '',
          cvPath: '',
          plan: 'free',
          usageAnalyze: 0,
          usageSend: 0,
          lemonSqueezyCustomerId: null,
          lemonSqueezySubscriptionId: null,
          createdAt: new Date().toISOString(),
        })
      }

      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLogging(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <WindowFrame title="~/auth/login" accent="green" className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xs text-zinc-500">
            <span className="text-green-400">~</span>
            <span>$ ./login --provider google</span>
          </div>
          <h1 className="text-lg font-bold text-zinc-100">{t.login.title}</h1>
          <button
            onClick={handleGoogleLogin}
            disabled={logging}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-green-400 text-zinc-950 rounded-xl px-4 py-3 font-mono text-sm font-medium hover:bg-green-300 disabled:opacity-40 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {logging ? 'Loading...' : t.login.google}
          </button>
          {error && (
            <p className="mt-4 font-mono text-xs text-red-400">{error}</p>
          )}
        </WindowFrame>
      </div>
    </div>
  )
}
