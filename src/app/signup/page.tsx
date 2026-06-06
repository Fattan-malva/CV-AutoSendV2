'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function SignupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-xs text-zinc-600 animate-pulse">Redirecting...</p>
    </div>
  )
}
