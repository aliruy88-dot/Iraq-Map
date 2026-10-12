import type { Locale } from '../types/settings'

export function formatDistance(meters: number, locale: Locale = 'ar'): string {
  if (!Number.isFinite(meters) || meters < 0) return '—'
  if (meters < 1000) {
    return locale === 'ar' ? `${Math.round(meters)} م` : `${Math.round(meters)} m`
  }
  const km = meters / 1000
  const value = km < 10 ? km.toFixed(1) : String(Math.round(km))
  return locale === 'ar' ? `${value} كم` : `${value} km`
}

export function formatDuration(seconds: number, locale: Locale = 'ar'): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const total = Math.round(seconds)
  const minutes = Math.floor(total / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (locale === 'en') {
    if (total < 60) return `${total} sec`
    if (hours === 0) return `${minutes} min`
    return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`
  }

  if (total < 60) return `${total} ثانية`
  if (hours === 0) return `${minutes} دقيقة`
  return remainingMinutes ? `${hours} س ${remainingMinutes} د` : `${hours} س`
}

export function formatCoordinates(lat: number, lng: number, digits = 5): string {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`
}
