import { useEffect, useState } from 'react'
import type { LatLng, Place } from '../types/place'
import type { AsyncStatus } from '../types/async'
import { createOverpass } from '../services/overpass'
import type { CategoryDefinition } from '../services/overpass'

export interface NearbyCategoryState {
  status: AsyncStatus
  results: Place[]
  error: unknown
  retry: () => void
}

export function useNearbyCategory(
  category: CategoryDefinition | null,
  center: LatLng | null,
  radiusMeters = 3000,
): NearbyCategoryState {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<Omit<NearbyCategoryState, 'retry'>>({
    status: 'idle',
    results: [],
    error: null,
  })

  const categoryId = category?.id
  const centerLat = center?.lat
  const centerLng = center?.lng

  useEffect(() => {
    if (!categoryId || centerLat === undefined || centerLng === undefined) {
      setState({ status: 'idle', results: [], error: null })
      return
    }
    const definition = category
    if (!definition) return

    const controller = new AbortController()
    setState({ status: 'loading', results: [], error: null })

    createOverpass()
      .searchCategory(
        definition,
        { lat: centerLat, lng: centerLng },
        { radiusMeters, signal: controller.signal },
      )
      .then((results) => {
        if (controller.signal.aborted) return
        setState({ status: results.length > 0 ? 'success' : 'empty', results, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', results: [], error })
      })

    return () => controller.abort()
  }, [category, categoryId, centerLat, centerLng, radiusMeters, reloadKey])

  return { ...state, retry: () => setReloadKey((key) => key + 1) }
}
