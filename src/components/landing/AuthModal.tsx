'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { LoaderCircle } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import GoogleIcon from './GoogleIcon'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError('Authentication not configured')
      return
    }
    setLoading(true)
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

      setLoading(false)
      setTransitioning(true)
      setTimeout(() => {
        onClose()
        router.push('/dashboard')
      }, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl">{t.login.title}</DialogTitle>
          <DialogDescription>Masuk dengan akun Google Anda</DialogDescription>
        </DialogHeader>

        {transitioning ? (
          <div className="flex flex-col items-center gap-3 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Authenticated
            </div>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : user ? (
          <Card className="gap-0 bg-muted/40 py-0 shadow-none">
            <CardContent className="p-4">
              <p className="text-sm font-medium">{user.displayName || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Button size="lg" variant="outline" className="w-full" disabled={loading} onClick={handleGoogleLogin}>
              {loading ? <LoaderCircle className="animate-spin" /> : <GoogleIcon />}
              {loading ? 'Loading...' : t.login.google}
            </Button>
          </div>
        )}

        {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
