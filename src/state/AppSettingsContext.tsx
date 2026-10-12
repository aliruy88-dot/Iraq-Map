import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { config } from '../config/env'
import { I18nProvider } from '../i18n/I18nContext'
import { clearLocalData, loadSettings, saveSettings } from '../services/storage/settings'
import type { AppSettings, Locale } from '../types/settings'
import type { TravelMode } from '../types/route'

interface AppSettingsValue {
  settings: AppSettings
  setLocale: (locale: Locale) => void
  setDefaultMode: (mode: TravelMode) => void
  resetLocalData: () => void
}

const AppSettingsContext = createContext<AppSettingsValue | null>(null)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettings({ locale: config.defaultLocale, defaultMode: 'car' }),
  )

  const setLocale = useCallback((locale: Locale) => {
    setSettings((previous) => {
      const next = { ...previous, locale }
      saveSettings(next)
      return next
    })
  }, [])

  const setDefaultMode = useCallback((defaultMode: TravelMode) => {
    setSettings((previous) => {
      const next = { ...previous, defaultMode }
      saveSettings(next)
      return next
    })
  }, [])

  const resetLocalData = useCallback(() => {
    clearLocalData()
    setSettings(loadSettings({ locale: config.defaultLocale, defaultMode: 'car' }))
  }, [])

  const value = useMemo<AppSettingsValue>(
    () => ({ settings, setLocale, setDefaultMode, resetLocalData }),
    [settings, setLocale, setDefaultMode, resetLocalData],
  )

  return (
    <AppSettingsContext.Provider value={value}>
      <I18nProvider locale={settings.locale}>{children}</I18nProvider>
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings(): AppSettingsValue {
  const value = useContext(AppSettingsContext)
  if (!value) throw new Error('useAppSettings must be used within AppSettingsProvider')
  return value
}
