'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  /** The resolved theme that is currently applied. */
  theme: ResolvedTheme
  /** The user preference (light, dark or system). */
  themeMode: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
})

const STORAGE_KEY = 'ceefy-theme'

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const nextMode: ThemeMode =
      saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing persisted preference after hydration
    setThemeMode(nextMode)
    const next = resolveTheme(nextMode)
    setResolvedTheme(next)
    applyTheme(next)
  }, [])

  useEffect(() => {
    if (themeMode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const next = resolveTheme('system')
      setResolvedTheme(next)
      applyTheme(next)
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [themeMode])

  const setTheme = useCallback((nextMode: ThemeMode) => {
    setThemeMode(nextMode)
    localStorage.setItem(STORAGE_KEY, nextMode)
    const next = resolveTheme(nextMode)
    setResolvedTheme(next)
    applyTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const value = useMemo(
    () => ({ theme: resolvedTheme, themeMode, setTheme, toggleTheme }),
    [resolvedTheme, themeMode, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
