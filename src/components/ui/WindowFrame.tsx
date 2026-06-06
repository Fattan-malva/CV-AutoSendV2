'use client'

interface WindowFrameProps {
  title?: string
  children: React.ReactNode
  className?: string
  accent?: 'green' | 'zinc'
  trafficLight?: boolean
}

export default function WindowFrame({
  title,
  children,
  className = '',
  accent = 'zinc',
  trafficLight = true,
}: WindowFrameProps) {
  const borderColor =
    accent === 'green'
      ? 'border-zinc-400/30'
      : 'border-zinc-800'

  const headerBg =
    accent === 'green'
      ? 'bg-zinc-400/5'
      : 'bg-zinc-900/80'

  return (
    <div
      className={`
        border
        ${borderColor}
        rounded-2xl
        overflow-hidden
        backdrop-blur-sm
        bg-[var(--background)]/70
      `}
    >
      {(trafficLight || title) && (
        <div
          className={`
            flex items-center gap-1.5
            px-3 py-2.5
            rounded-t-2xl
            ${headerBg}
            border-b
            ${borderColor}
          `}
        >
          {trafficLight && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          )}

          {title && (
            <span className="ml-3 text-[11px] text-zinc-500 font-mono tracking-wide truncate select-none">
              {title}
            </span>
          )}
        </div>
      )}

      <div className={className}>
        {children}
      </div>
    </div>
  )
}