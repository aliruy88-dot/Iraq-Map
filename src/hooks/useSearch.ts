import { useEffect, useState } from 'react'
import type { LatLng, Place } from '../types/place'
import type { AsyncStatus } from '../types/async'
import { createGeocoder } from '../services/geocoding'
import { useDebouncedValue } from './useDebouncedValue'

export interface SearchState {
  status: AsyncStatus
  results: Place[]
  error: unknown
  provider: string
  retry: () => void
}

export function useSearch(query: string, near?: LatLng | null): SearchState {
  const debouncedQuery = useDebouncedValue(query.trim(), 420)
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<Omit<SearchState, 'retry'>>({
    status: 'idle',
    results: [],
    error: null,
    provider: createGeocoder().label,
  })

  const nearLat = near?.lat
  const nearLng = near?.lng

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setState((previous) => ({ ...previous, status: 'idle', results: [], error: null }))
      return
    }

    const controller = new AbortController()
    setState((previous) => ({ ...previous, status: 'loading', error: null }))

    createGeocoder()
      .search(debouncedQuery, {
        signal: controller.signal,
        limit: 8,
        countryCodes: 'iq',
        near: nearLat !== undefined && nearLng !== undefined ? { lat: nearLat, lng: nearLng } : undefined,
      })
      .then((results) => {
        if (controller.signal.aborted) return
        setState((previous) => ({
          ...previous,
          status: results.length > 0 ? 'success' : 'empty',
          results,
          error: null,
        }))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => ({ ...previous, status: 'error', results: [], error }))
      })

    return () => controller.abort()
  }, [debouncedQuery, nearLat, nearLng, reloadKey])

  return { ...state, retry: () => setReloadKey((key) => key + 1) }
}
