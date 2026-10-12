import type { LatLng, Place } from '../../types/place'

export interface SearchOptions {
  limit?: number
  near?: LatLng
  countryCodes?: string
  language?: string
  signal?: AbortSignal
}

export interface GeocodeProvider {
  readonly id: string
  readonly label: string
  search(query: string, options?: SearchOptions): Promise<Place[]>
  reverse(location: LatLng, options?: SearchOptions): Promise<Place | null>
}
