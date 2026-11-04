import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis.
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5
  const rangeWithDots: (number | string)[] = []

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) rangeWithDots.push(i)
  } else {
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) rangeWithDots.push(i)
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) rangeWithDots.push(i)
    } else {
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) rangeWithDots.push(i)
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

export function getDisplayNameInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  const first = parts[0][0] ?? ''
  const last = parts[parts.length - 1]?.[0] ?? ''
  return (first + last).toUpperCase()
}

export function formatDate(value?: string | null, withTime = true) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
