import type { LatLng } from './place'

export type TravelMode = 'car' | 'walk'

/**
 * «routed» مسار حقيقي من خدمة توجيه.
 * «estimated» تقدير محلي محسوب (مسافة مباشرة) وموسوم بوضوح في الواجهة.
 */
export type RouteQuality = 'routed' | 'estimated'

export interface RouteResult {
  from: LatLng
  to: LatLng
  mode: TravelMode
  quality: RouteQuality
  distanceMeters: number
  durationSeconds: number
  geometry: LatLng[]
  /** ملف تعريف التوجيه المستخدم (مثل driving أو estimate). */
  profile: string
  /** اسم المصدر المعروض للمستخدم. */
  source: string
}

export type RouteFailureReason = 'unsupported' | 'network' | 'no-route' | 'unknown'

export class RouteError extends Error {
  readonly reason: RouteFailureReason

  constructor(reason: RouteFailureReason, message: string) {
    super(message)
    this.name = 'RouteError'
    this.reason = reason
  }
}
