export default function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-subtle animate-pulse rounded ${className ?? ''}`} />
}
