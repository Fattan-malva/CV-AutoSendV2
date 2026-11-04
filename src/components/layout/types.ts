import type { LucideIcon } from 'lucide-react'

export type NavBadge = string | number

export type NavLink = {
  title: string
  url: string
  icon?: LucideIcon
  badge?: NavBadge
  external?: boolean
  disabled?: boolean
  description?: string
}

export type NavCollapsible = {
  title: string
  icon?: LucideIcon
  badge?: NavBadge
  items: NavLink[]
}

export type NavItem = NavLink | NavCollapsible

export type NavGroup = {
  title: string
  items: NavItem[]
}

export function isNavLink(item: NavItem): item is NavLink {
  return 'url' in item
}
