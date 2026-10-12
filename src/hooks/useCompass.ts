import { useCallback, useEffect, useRef, useState } from 'react'

interface OrientationPermissionCapable {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export interface CompassState {
  available: boolean
  active: boolean
  heading: number | null
  error: 'unsupported' | 'denied' | null
  start: () => Promise<void>
  stop: () => void
}

export function useCompass(): CompassState {
  const [active, setActive] = useState(false)
  const [heading, setHeading] = useState<number | null>(null)
  const [error, setError] = useState<'unsupported' | 'denied' | null>(null)
  const handlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null)

  const available =
    typeof window !== 'undefined' &&
    typeof window.DeviceOrientationEvent !== 'undefined'

  const stop = useCallback(() => {
    const handler = handlerRef.current
    if (handler) {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener)
      window.removeEventListener('deviceorientation', handler as EventListener)
      handlerRef.current = null
    }
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    if (!available) {
      setError('unsupported')
      return
    }
    const constructor = window.DeviceOrientationEvent as unknown as OrientationPermissionCapable
    if (typeof constructor.requestPermission === 'function') {
      try {
        const result = await constructor.requestPermission()
        if (result !== 'granted') {
          setError('denied')
          return
        }
      } catch {
        setError('denied')
        return
      }
    }
    const handler = (event: DeviceOrientationEvent) => {
      const withWebkit = event as DeviceOrientationEvent & { webkitCompassHeading?: number }
      const value =
        typeof withWebkit.webkitCompassHeading === 'number'
          ? withWebkit.webkitCompassHeading
          : event.alpha
      if (typeof value === 'number') setHeading(value)
    }
    handlerRef.current = handler
    window.addEventListener('deviceorientationabsolute', handler as EventListener)
    window.addEventListener('deviceorientation', handler as EventListener)
    setError(null)
    setActive(true)
  }, [available])

  useEffect(() => () => stop(), [stop])

  return { available, active, heading, error, start, stop }
}
