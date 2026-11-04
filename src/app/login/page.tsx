'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { ArrowRight, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'

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
    if (!auth) return
    setLogging(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const u = result.user

      const token = await u.getIdToken()
      await fetch('/api/user-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
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
          analyzeLanguage: 'id',
          lemonSqueezyCustomerId: null,
          lemonSqueezySubscriptionId: null,
          createdAt: new Date().toISOString(),
        }),
      })

      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLogging(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-svh items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='relative flex min-h-svh items-center justify-center overflow-hidden px-4'>
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]' />
        <div className='absolute bottom-0 right-1/4 h-[280px] w-[420px] rounded-full bg-primary/5 blur-[100px]' />
      </div>

      <div className='w-full max-w-sm'>
        <div className='mb-8 flex flex-col items-center text-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src='/icons.png' alt='Ceefy' className='mb-3 size-12 object-contain' />
          <h1 className='font-serif text-2xl font-semibold tracking-tight'>{t.login.title}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Masuk dengan akun Google Anda</p>
        </div>

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <Button
            onClick={() => void handleGoogleLogin()}
            disabled={logging}
            className='h-11 w-full gap-3 rounded-lg text-sm'
          >
            {logging ? (
              <Loader2 className='size-5 animate-spin' />
            ) : (
              <svg className='size-5' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
            )}
            {logging ? 'Signing in…' : t.login.google}
            {!logging ? <ArrowRight className='ms-auto size-4' /> : null}
          </Button>

          {error ? <p className='mt-3 text-center text-xs text-destructive'>{error}</p> : null}

          <div className='mt-4 space-y-1 text-center text-xs text-muted-foreground'>
            <p>Free plan includes 3 AI analyses and 3 email sends.</p>
            <p>No credit card required.</p>
          </div>
        </div>

        <p className='mt-6 text-center text-[11px] text-muted-foreground'>
          By continuing you agree to Ceefy&apos;s usage terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
