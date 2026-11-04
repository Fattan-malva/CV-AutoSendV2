'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface ConfirmLogoutModalProps {
  open: boolean
  onClose: () => void
}

export default function ConfirmLogoutModal({ open, onClose }: ConfirmLogoutModalProps) {
  const { logout } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      onClose()
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
      title={t.logout.prompt}
      desc='You will be signed out of your Ceefy workspace on this device. You can sign back in at any time.'
      cancelBtnText={t.logout.cancel}
      confirmText={t.logout.confirm}
      loading={loading}
      destructive
      onConfirm={handleLogout}
    />
  )
}
