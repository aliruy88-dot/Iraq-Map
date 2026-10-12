import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Locale } from '../types/settings'
import { messages } from './messages'
import type { MessageKey } from './messages'

export interface I18nValue {
  locale: Locale
  dir: 'rtl' | 'ltr'
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const value = useMemo<I18nValue>(() => {
    return {
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (key, vars) => {
        let text: string = messages[key][locale]
        if (vars) {
          for (const [name, replacement] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, String(replacement))
          }
        }
        return text
      },
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used within an I18nProvider')
  return value
}
