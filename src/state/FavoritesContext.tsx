import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Place } from '../types/place'
import {
  addFavorite,
  isFavorite,
  loadFavorites,
  removeFavorite,
  saveFavorites,
} from '../services/storage/favorites'

interface FavoritesValue {
  favorites: Place[]
  isSaved: (id: string) => boolean
  toggle: (place: Place) => void
  remove: (id: string) => void
  clear: () => void
}

const FavoritesContext = createContext<FavoritesValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Place[]>(() => loadFavorites())

  const toggle = useCallback((place: Place) => {
    setFavorites((previous) => {
      const next = isFavorite(previous, place.id)
        ? removeFavorite(previous, place.id)
        : addFavorite(previous, place)
      saveFavorites(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setFavorites((previous) => {
      const next = removeFavorite(previous, id)
      saveFavorites(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setFavorites([])
    saveFavorites([])
  }, [])

  const isSaved = useCallback((id: string) => isFavorite(favorites, id), [favorites])

  const value = useMemo<FavoritesValue>(
    () => ({ favorites, isSaved, toggle, remove, clear }),
    [favorites, isSaved, toggle, remove, clear],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used within FavoritesProvider')
  return value
}
