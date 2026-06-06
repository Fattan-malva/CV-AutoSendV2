'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import id from '@/i18n/id'
import en from '@/i18n/en'
import type idType from '@/i18n/id'

type Locale = 'id' | 'en'
type Translations = typeof idType

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextType>({
  locale: 'id',
  t: id,
  setLocale: () => {},
})

const translations: Record<Locale, Translations> = { id, en }
const STORAGE_KEY = 'cv-autosend-locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'id' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
