import type { TravelMode } from './route'

export type Locale = 'ar' | 'en'

export interface AppSettings {
  locale: Locale
  defaultMode: TravelMode
}

export const DEFAULT_SETTINGS: AppSettings = {
  locale: 'ar',
  defaultMode: 'car',
}
