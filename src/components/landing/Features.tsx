'use client'

import { useI18n } from '@/lib/i18n-context'

export default function Features() {
  const { t } = useI18n()

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 font-mono text-xs text-zinc-500">
          <span className="text-green-400">~/features</span>
          <span className="text-zinc-600"> $ ls -la</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.landing.features.map((f, i) => (
            <div
              key={i}
              className="border border-zinc-800 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-green-400 font-mono text-xs font-bold border border-zinc-700">
                  {i + 1}
                </div>
                <span className="font-mono text-[10px] text-zinc-600">exec</span>
              </div>
              <h3 className="font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
