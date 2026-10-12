import { fetchJson } from '../http'
import { IRAQ_BOUNDS } from '../../config/env'
import type { Bounds, LatLng, Place } from '../../types/place'
import type { GeocodeProvider, SearchOptions } from './types'

interface PhotonFeature {
  geometry?: { coordinates?: number[] }
  properties?: {
    osm_id?: number
    osm_type?: string
    osm_key?: string
    osm_value?: string
    name?: string
    street?: string
    housenumber?: string
    city?: string
    county?: string
    state?: string
    country?: string
    extent?: number[]
  }
}

interface PhotonResponse {
  features?: PhotonFeature[]
}

function toBounds(extent: number[] | undefined): Bounds | undefined {
  if (!extent || extent.length !== 4) return undefined
  const [west, south, east, north] = extent
  if ([west, south, east, north].some((value) => !Number.isFinite(value))) return undefined
  return { south, north, west, east }
}

function photonLanguage(language: string | undefined): string {
  return language && language.toLowerCase().startsWith('en') ? 'en' : 'ar'
}

export function mapPhotonFeature(feature: PhotonFeature): Place | null {
  const coordinates = feature.geometry?.coordinates
  const properties = feature.properties
  if (!coordinates || coordinates.length < 2 || !properties) return null
  const [lng, lat] = coordinates
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const addressParts = [
    properties.housenumber,
    properties.street,
    properties.city ?? properties.county,
    properties.state,
    properties.country,
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

  return {
    id: `photon:${properties.osm_type ?? 'x'}:${properties.osm_id ?? `${lat},${lng}`}`,
    name: properties.name?.trim() || properties.street?.trim() || 'مكان بدون اسم',
    address: addressParts.length > 0 ? addressParts.join('، ') : undefined,
    rawCategory:
      properties.osm_key && properties.osm_value
        ? `${properties.osm_key}=${properties.osm_value}`
        : properties.osm_value,
    location: { lat, lng },
    bounds: toBounds(properties.extent),
    source: 'photon',
  }
}

export class PhotonProvider implements GeocodeProvider {
  readonly id = 'photon'
  readonly label = 'Photon'
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  async search(query: string, options: SearchOptions = {}): Promise<Place[]> {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []

    const params = new URLSearchParams({
      q: trimmed,
      limit: String(options.limit ?? 8),
      lang: photonLanguage(options.language),
    })
    if (options.near) {
      params.set('lat', String(options.near.lat))
      params.set('lon', String(options.near.lng))
    } else {
      params.set(
        'bbox',
        `${IRAQ_BOUNDS.west},${IRAQ_BOUNDS.south},${IRAQ_BOUNDS.east},${IRAQ_BOUNDS.north}`,
      )
    }

    const url = `${this.baseUrl}/api/?${params.toString()}`
    const data = await fetchJson<PhotonResponse>(url, { signal: options.signal })
    if (!data?.features) return []
    return data.features
      .map(mapPhotonFeature)
      .filter((place): place is Place => place !== null)
  }

  async reverse(location: LatLng, options: SearchOptions = {}): Promise<Place | null> {
    const params = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lng),
      lang: photonLanguage(options.language),
    })
    const url = `${this.baseUrl}/reverse?${params.toString()}`
    const data = await fetchJson<PhotonResponse>(url, { signal: options.signal })
    const feature = data?.features?.[0]
    return feature ? mapPhotonFeature(feature) : null
  }
}
