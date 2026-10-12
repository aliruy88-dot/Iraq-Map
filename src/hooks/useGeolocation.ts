import { useCallback, useState } from 'react'
import type { LatLng } from '../types/place'
import {
  getCurrentPosition,
  LocationError,
} from '../services/location/locationService'
import type { LocationFailureReason } from '../services/location/locationService'

export type LocationStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'error'

export interface UseGeolocationResult {
  status: LocationStatus
  position: LatLng | null
  reason: LocationFailureReason | null
  request: () => Promise<LatLng | null>
  setPosition: (position: LatLng | null) => void
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [position, setPosition] = useState<LatLng | null>(null)
  const [reason, setReason] = useState<LocationFailureReason | null>(null)

  const request = useCallback(async (): Promise<LatLng | null> => {
    setStatus('locating')
    setReason(null)
    try {
      const location = await getCurrentPosition()
      setPosition(location)
      setStatus('granted')
      return location
    } catch (error) {
      const locationError =
        error instanceof LocationError
          ? error
          : new LocationError('unavailable', 'تعذّر تحديد الموقع')
      setReason(locationError.reason)
      setStatus(locationError.reason === 'denied' ? 'denied' : 'error')
      return null
    }
  }, [])

  return { status, position, reason, request, setPosition }
}
