import type { LatLng } from '../../types/place'
import type { RouteResult, TravelMode } from '../../types/route'

export interface RoutingProvider {
  readonly id: string
  readonly label: string
  route(from: LatLng, to: LatLng, mode: TravelMode, signal?: AbortSignal): Promise<RouteResult>
}
