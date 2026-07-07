interface WindowFrameProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function WindowFrame({
  title,
  children,
  className = '',
}: WindowFrameProps) {
  return (
    <div className="border border-border rounded-[2rem] overflow-hidden bg-surface transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
      {title && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-subtle/50">
          <span className="text-[11px] text-muted font-serif tracking-wide truncate select-none">
            {title}
          </span>
        </div>
      )}
      <div className={className}>
        {children}
      </div>
    </div>
  )
}
