'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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
    <div className='flex min-h-svh items-center justify-center'>
      <Loader2 className='size-5 animate-spin text-muted-foreground' />
    </div>
  )
}
