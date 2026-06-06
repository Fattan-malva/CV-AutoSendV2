'use client'

import { useI18n } from '@/lib/i18n-context'
import WindowFrame from '@/components/ui/WindowFrame'

interface HeroProps {
  onOpenAuth: () => void
}

export default function Hero({ onOpenAuth }: HeroProps) {
  const { t } = useI18n()

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="pt-32 pb-20 px-4 text-center relative">
      <div className="max-w-3xl mx-auto">
        <WindowFrame title="~/cv-autosend" accent="green" className="p-10">
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-2 pl-6 pt-2 font-mono text-xs text-zinc-500">
              <span>$</span>
              <span className="text-green-400">./auto-send.sh</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
              {t.landing.heroTitle}
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              {t.landing.heroSub}
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={scrollToDemo}
                className="font-mono text-sm bg-green-400 text-zinc-950 px-6 py-2.5 rounded-xl font-medium hover:bg-green-300 transition-colors"
              >
                {'>_'} {t.landing.cta}
              </button>
              <button
                onClick={onOpenAuth}
                className="font-mono text-sm border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                {'>'} {t.landing.login}
              </button>
            </div>
          </div>
        </WindowFrame>
      </div>
    </section>
  )
}
