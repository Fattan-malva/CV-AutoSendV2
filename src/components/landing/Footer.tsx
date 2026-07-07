'use client'

import { useI18n } from '@/lib/i18n-context'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/5 py-10 text-center">
      <p className="text-xs text-white/40">
        {t.landing.footer}
      </p>
    </footer>
  )
}
