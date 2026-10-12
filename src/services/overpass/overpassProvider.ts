import { fetchJson } from '../http'
import type { LatLng, Place } from '../../types/place'
import type { CategoryDefinition } from './categories'

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements?: OverpassElement[]
}

const CATEGORY_KEYS = [
  'amenity',
  'shop',
  'tourism',
  'leisure',
  'historic',
  'office',
  'healthcare',
  'craft',
]

/** يبني استعلام Overpass QL حقيقي لتصنيف حول نقطة. */
export function buildCategoryQuery(
  category: CategoryDefinition,
  center: LatLng,
  radiusMeters: number,
  limit: number,
): string {
  return `[out:json][timeout:25];nwr(around:${radiusMeters},${center.lat},${center.lng})${category.filter};out center tags ${limit};`
}

function pickName(tags: Record<string, string>): string | undefined {
  const candidate = tags['name:ar'] || tags['name:en'] || tags.name
  return candidate?.trim() || undefined
}

function rawCategoryOf(tags: Record<string, string>): string | undefined {
  if (tags.religion === 'muslim') return 'amenity=mosque'
  if (tags.religion === 'christian') return 'amenity=church'
  for (const key of CATEGORY_KEYS) {
    if (tags[key]) return `${key}=${tags[key]}`
  }
  return undefined
}

function composeAddress(tags: Record<string, string>): string | undefined {
  if (tags['addr:full']) return tags['addr:full']
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'],
    tags['addr:state'],
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
  return parts.length > 0 ? parts.join('، ') : undefined
}

export function mapOverpassElement(element: OverpassElement): Place | null {
  const tags = element.tags ?? {}
  const name = pickName(tags)
  if (!name) return null
  const lat = element.lat ?? element.center?.lat
  const lng = element.lon ?? element.center?.lon
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return {
    id: `overpass:${element.type}:${element.id}`,
    name,
    address: composeAddress(tags),
    rawCategory: rawCategoryOf(tags),
    location: { lat: lat as number, lng: lng as number },
    openingHours: tags.opening_hours,
    phone: tags.phone || tags['contact:phone'],
    website: tags.website || tags['contact:website'],
    source: 'overpass',
  }
}

export interface CategorySearchOptions {
  radiusMeters?: number
  limit?: number
  signal?: AbortSignal
}

export class OverpassProvider {
  readonly id = 'overpass'
  readonly label = 'Overpass API'
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async searchCategory(
    category: CategoryDefinition,
    center: LatLng,
    options: CategorySearchOptions = {},
  ): Promise<Place[]> {
    const radiusMeters = options.radiusMeters ?? 3000
    const limit = options.limit ?? 60
    const query = buildCategoryQuery(category, center, radiusMeters, limit)
    const params = new URLSearchParams({ data: query })
    const url = `${this.baseUrl}?${params.toString()}`

    const data = await fetchJson<OverpassResponse>(url, {
      signal: options.signal,
      timeoutMs: 25000,
      headers: { Accept: 'application/json' },
    })
    if (!data?.elements) return []
    return data.elements
      .map(mapOverpassElement)
      .filter((place): place is Place => place !== null)
  }
}
