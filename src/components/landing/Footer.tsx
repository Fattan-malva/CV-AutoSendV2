'use client'

import { useI18n } from '@/lib/i18n-context'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-zinc-800 py-6 text-center">
      <div className="font-mono text-xs text-zinc-600">
        <span className="text-green-400/60">~</span> {t.landing.footer}
      </div>
    </footer>
  )
}
