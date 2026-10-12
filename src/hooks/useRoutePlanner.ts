import { useEffect, useState } from 'react'
import type { LatLng, Place } from '../types/place'
import type { RouteResult, TravelMode } from '../types/route'
import type { AsyncStatus } from '../types/async'
import { createRouter } from '../services/routing'

export interface RoutePoint {
  label: string
  location: LatLng
  place?: Place
}

export interface RoutePlanner {
  from: RoutePoint | null
  to: RoutePoint | null
  mode: TravelMode
  status: AsyncStatus
  result: RouteResult | null
  error: unknown
  setFrom: (point: RoutePoint | null) => void
  setTo: (point: RoutePoint | null) => void
  setMode: (mode: TravelMode) => void
  recompute: () => void
}

export function useRoutePlanner(initialMode: TravelMode): RoutePlanner {
  const [from, setFrom] = useState<RoutePoint | null>(null)
  const [to, setTo] = useState<RoutePoint | null>(null)
  const [mode, setMode] = useState<TravelMode>(initialMode)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [result, setResult] = useState<RouteResult | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!from || !to) {
      setResult(null)
      setStatus('idle')
      setError(null)
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    createRouter()
      .route(from.location, to.location, mode, controller.signal)
      .then((route) => {
        if (controller.signal.aborted) return
        setResult(route)
        setStatus('success')
      })
      .catch((routeError: unknown) => {
        if (controller.signal.aborted) return
        setResult(null)
        setError(routeError)
        setStatus('error')
      })

    return () => controller.abort()
  }, [from, to, mode, reloadKey])

  return {
    from,
    to,
    mode,
    status,
    result,
    error,
    setFrom,
    setTo,
    setMode,
    recompute: () => setReloadKey((key) => key + 1),
  }
}
