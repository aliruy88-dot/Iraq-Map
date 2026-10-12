import { DEFAULT_SETTINGS } from '../../types/settings'
import type { AppSettings } from '../../types/settings'
import { readJson, removeKey, writeJson } from './storage'
import { FAVORITES_KEY } from './favorites'

export const SETTINGS_KEY = 'iraqmap.settings.v1'

export function loadSettings(defaults: AppSettings = DEFAULT_SETTINGS): AppSettings {
  const stored = readJson<Partial<AppSettings>>(SETTINGS_KEY, {})
  return {
    locale: stored.locale === 'en' ? 'en' : stored.locale === 'ar' ? 'ar' : defaults.locale,
    defaultMode: stored.defaultMode === 'walk' ? 'walk' : defaults.defaultMode,
  }
}

export function saveSettings(settings: AppSettings): boolean {
  return writeJson(SETTINGS_KEY, settings)
}

export function clearLocalData(): void {
  removeKey(FAVORITES_KEY)
  removeKey(SETTINGS_KEY)
}
