import type { LatLng } from '../../types/place'

export type LocationFailureReason = 'unsupported' | 'denied' | 'unavailable' | 'timeout'

export class LocationError extends Error {
  readonly reason: LocationFailureReason

  constructor(reason: LocationFailureReason, message: string) {
    super(message)
    this.name = 'LocationError'
    this.reason = reason
  }
}

export interface LocationOptions {
  timeoutMs?: number
  maximumAgeMs?: number
  enableHighAccuracy?: boolean
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

export function mapGeolocationError(error: GeolocationPositionError): LocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new LocationError('denied', 'تم رفض إذن الموقع')
    case error.POSITION_UNAVAILABLE:
      return new LocationError('unavailable', 'الموقع غير متاح حالياً')
    case error.TIMEOUT:
      return new LocationError('timeout', 'انتهت مهلة تحديد الموقع')
    default:
      return new LocationError('unavailable', 'تعذّر تحديد الموقع')
  }
}

/**
 * يطلب موقع المستخدم عند الحاجة فقط. يرفض بوضوح عند غياب الدعم أو الرفض.
 */
export function getCurrentPosition(options: LocationOptions = {}): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new LocationError('unsupported', 'خدمة الموقع غير مدعومة في هذا المتصفح'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      (error) => reject(mapGeolocationError(error)),
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeoutMs ?? 12000,
        maximumAge: options.maximumAgeMs ?? 30000,
      },
    )
  })
}
