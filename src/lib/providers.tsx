'use client'

import { AuthProvider } from './auth-context'
import { I18nProvider } from './i18n-context'
import { ThemeProvider } from './theme-context'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <Toaster richColors closeButton position='top-right' />
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
