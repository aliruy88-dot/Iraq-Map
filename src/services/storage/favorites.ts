import type { Place } from '../../types/place'
import { readJson, writeJson } from './storage'

export const FAVORITES_KEY = 'iraqmap.favorites.v1'

function isPlaceLike(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Place>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    !!candidate.location &&
    Number.isFinite(candidate.location.lat) &&
    Number.isFinite(candidate.location.lng)
  )
}

export function loadFavorites(): Place[] {
  const value = readJson<unknown>(FAVORITES_KEY, [])
  if (!Array.isArray(value)) return []
  return value.filter(isPlaceLike)
}

export function saveFavorites(list: Place[]): boolean {
  return writeJson(FAVORITES_KEY, list)
}

export function addFavorite(list: Place[], place: Place): Place[] {
  if (list.some((item) => item.id === place.id)) return list
  return [place, ...list]
}

export function removeFavorite(list: Place[], id: string): Place[] {
  return list.filter((item) => item.id !== id)
}

export function isFavorite(list: Place[], id: string): boolean {
  return list.some((item) => item.id === id)
}
