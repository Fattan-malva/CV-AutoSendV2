'use client'

import { useI18n } from '@/lib/i18n-context'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border py-8 text-center">
      <p className="text-xs text-muted">
        {t.landing.footer}
      </p>
    </footer>
  )
}
