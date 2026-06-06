export default function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 animate-pulse rounded ${className ?? ''}`} />
}
