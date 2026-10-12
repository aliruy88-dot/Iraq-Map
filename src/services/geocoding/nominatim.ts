import { fetchJson } from '../http'
import type { Bounds, LatLng, Place } from '../../types/place'
import type { GeocodeProvider, SearchOptions } from './types'

interface NominatimItem {
  place_id?: number
  osm_type?: string
  osm_id?: number
  lat?: string
  lon?: string
  display_name?: string
  name?: string
  category?: string
  type?: string
  boundingbox?: string[]
  extratags?: Record<string, string>
}

function parseBoundingBox(value: unknown): Bounds | undefined {
  if (!Array.isArray(value) || value.length !== 4) return undefined
  const [south, north, west, east] = value.map((entry) => Number.parseFloat(String(entry)))
  if ([south, north, west, east].some((entry) => !Number.isFinite(entry))) return undefined
  return { south, north, west, east }
}

function firstSegment(value: string | undefined): string | undefined {
  if (!value) return undefined
  const segment = value.split(',')[0]?.trim()
  return segment && segment.length > 0 ? segment : undefined
}

export function mapNominatimItem(item: NominatimItem): Place {
  const lat = Number.parseFloat(String(item.lat))
  const lng = Number.parseFloat(String(item.lon))
  const rawCategory =
    item.category && item.type ? `${item.category}=${item.type}` : item.category ?? item.type
  return {
    id: `nominatim:${item.osm_type ?? 'x'}:${item.osm_id ?? item.place_id ?? `${lat},${lng}`}`,
    name: item.name?.trim() || firstSegment(item.display_name) || 'مكان بدون اسم',
    address: item.display_name,
    rawCategory,
    location: { lat, lng },
    bounds: parseBoundingBox(item.boundingbox),
    openingHours: item.extratags?.opening_hours,
    phone: item.extratags?.phone,
    website: item.extratags?.website,
    source: 'nominatim',
  }
}

export class NominatimProvider implements GeocodeProvider {
  readonly id = 'nominatim'
  readonly label = 'Nominatim'
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  async search(query: string, options: SearchOptions = {}): Promise<Place[]> {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []

    const params = new URLSearchParams({
      q: trimmed,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(options.limit ?? 8),
      'accept-language': options.language ?? 'ar,en',
    })
    if (options.countryCodes) params.set('countrycodes', options.countryCodes)

    const url = `${this.baseUrl}/search?${params.toString()}`
    const data = await fetchJson<NominatimItem[]>(url, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    })
    if (!Array.isArray(data)) return []
    return data
      .filter((item) => Number.isFinite(Number.parseFloat(String(item.lat))))
      .map(mapNominatimItem)
  }

  async reverse(location: LatLng, options: SearchOptions = {}): Promise<Place | null> {
    const params = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lng),
      format: 'jsonv2',
      addressdetails: '1',
      'accept-language': options.language ?? 'ar,en',
    })
    const url = `${this.baseUrl}/reverse?${params.toString()}`
    const data = await fetchJson<NominatimItem & { error?: string }>(url, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    })
    if (!data || data.error || data.lat === undefined) return null
    return mapNominatimItem(data)
  }
}
