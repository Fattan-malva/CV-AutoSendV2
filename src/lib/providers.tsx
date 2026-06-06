'use client'

import { AuthProvider } from './auth-context'
import { I18nProvider } from './i18n-context'
import { ThemeProvider } from './theme-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
