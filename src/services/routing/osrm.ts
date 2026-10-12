import { fetchJson, RemoteError } from '../http'
import { distanceMeters } from '../../utils/geo'
import { RouteError } from '../../types/route'
import type { LatLng } from '../../types/place'
import type { RouteResult, TravelMode } from '../../types/route'
import type { RoutingProvider } from './types'

/** متوسط سرعة مشي تقريبي (متر/ثانية). */
export const WALKING_SPEED_MPS = 1.35
/** متوسط سرعة قيادة حضري تقريبي (متر/ثانية) للتقدير الاحتياطي فقط. */
export const DRIVING_SPEED_MPS = 11

interface OsrmRoute {
  distance?: number
  duration?: number
  geometry?: { coordinates?: number[][] }
}

interface OsrmResponse {
  code?: string
  routes?: OsrmRoute[]
  message?: string
}

/** تقدير محلي محسوب من المسافة المباشرة؛ موسوم دائماً بـ estimated. */
export function estimateRoute(from: LatLng, to: LatLng, mode: TravelMode): RouteResult {
  const meters = distanceMeters(from, to)
  const speed = mode === 'walk' ? WALKING_SPEED_MPS : DRIVING_SPEED_MPS
  return {
    from,
    to,
    mode,
    quality: 'estimated',
    distanceMeters: meters,
    durationSeconds: meters / speed,
    geometry: [from, to],
    profile: 'estimate',
    source: 'تقدير محلي',
  }
}

export class OsrmProvider implements RoutingProvider {
  readonly id = 'osrm'
  readonly label = 'OSRM'
  private readonly baseUrl: string
  private readonly carProfile: string
  private readonly walkProfile: string

  constructor(baseUrl: string, carProfile = 'driving', walkProfile = '') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.carProfile = carProfile
    this.walkProfile = walkProfile
  }

  async route(
    from: LatLng,
    to: LatLng,
    mode: TravelMode,
    signal?: AbortSignal,
  ): Promise<RouteResult> {
    if (mode === 'walk' && this.walkProfile.length === 0) {
      return estimateRoute(from, to, mode)
    }

    const profile = mode === 'walk' ? this.walkProfile : this.carProfile
    const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`
    const url =
      `${this.baseUrl}/route/v1/${profile}/${coordinates}` +
      '?overview=full&geometries=geojson&alternatives=false&steps=false&annotations=false'

    let data: OsrmResponse
    try {
      data = await fetchJson<OsrmResponse>(url, { signal, timeoutMs: 15000 })
    } catch (error) {
      if (error instanceof RemoteError && error.kind === 'aborted') throw error
      if (mode === 'walk') return estimateRoute(from, to, mode)
      throw new RouteError('network', 'تعذّر الاتصال بخدمة المسارات')
    }

    const route = data.code === 'Ok' ? data.routes?.[0] : undefined
    if (!route || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) {
      if (mode === 'walk') return estimateRoute(from, to, mode)
      throw new RouteError('no-route', 'لم يتم العثور على مسار بين النقطتين')
    }

    const geometry = (route.geometry?.coordinates ?? [])
      .map(([lng, lat]) => ({ lat, lng }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))

    if (geometry.length === 0) {
      if (mode === 'walk') return estimateRoute(from, to, mode)
      throw new RouteError('unknown', 'استجابة خدمة المسارات غير صالحة')
    }

    return {
      from,
      to,
      mode,
      quality: 'routed',
      distanceMeters: route.distance as number,
      durationSeconds: route.duration as number,
      geometry,
      profile,
      source: `OSRM (${profile})`,
    }
  }
}
