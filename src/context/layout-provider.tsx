'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type SidebarVariant = 'sidebar' | 'floating' | 'inset'
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

type LayoutContextType = {
  defaultVariant: SidebarVariant
  variant: SidebarVariant
  setVariant: (variant: SidebarVariant) => void
  defaultCollapsible: SidebarCollapsible
  collapsible: SidebarCollapsible
  setCollapsible: (collapsible: SidebarCollapsible) => void
  resetLayout: () => void
}

const DEFAULT_VARIANT: SidebarVariant = 'sidebar'
const DEFAULT_COLLAPSIBLE: SidebarCollapsible = 'icon'
const STORAGE_KEY = 'ceefy-dashboard-layout'

const LayoutContext = createContext<LayoutContextType | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<SidebarVariant>(DEFAULT_VARIANT)
  const [collapsible, setCollapsibleState] =
    useState<SidebarCollapsible>(DEFAULT_COLLAPSIBLE)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as {
        variant?: SidebarVariant
        collapsible?: SidebarCollapsible
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved layout after hydration
      if (parsed.variant) setVariantState(parsed.variant)
      if (parsed.collapsible) setCollapsibleState(parsed.collapsible)
    } catch {
      // ignore malformed values
    }
  }, [])

  const persist = useCallback(
    (next: { variant?: SidebarVariant; collapsible?: SidebarCollapsible }) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ variant, collapsible, ...next })
      )
    },
    [variant, collapsible]
  )

  const setVariant = useCallback(
    (next: SidebarVariant) => {
      setVariantState(next)
      persist({ variant: next })
    },
    [persist]
  )

  const setCollapsible = useCallback(
    (next: SidebarCollapsible) => {
      setCollapsibleState(next)
      persist({ collapsible: next })
    },
    [persist]
  )

  const resetLayout = useCallback(() => {
    setVariantState(DEFAULT_VARIANT)
    setCollapsibleState(DEFAULT_COLLAPSIBLE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      defaultVariant: DEFAULT_VARIANT,
      variant,
      setVariant,
      defaultCollapsible: DEFAULT_COLLAPSIBLE,
      collapsible,
      setCollapsible,
      resetLayout,
    }),
    [variant, collapsible, setVariant, setCollapsible, resetLayout]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within LayoutProvider')
  return context
}
