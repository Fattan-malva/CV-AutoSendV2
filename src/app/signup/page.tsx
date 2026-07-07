'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from 'phosphor-react'

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
      <Spinner size={24} className="text-accent animate-spin" />
    </div>
  )
}
