import type { Locale } from '../types/settings'

export type GeocoderId = 'nominatim' | 'photon'

export type ProviderStatusId = 'tiles' | 'geocoder' | 'categories' | 'routing'

export interface ProviderStatus {
  id: ProviderStatusId
  labelAr: string
  labelEn: string
  ready: boolean
  requiresKey: boolean
  detail: string
  docsUrl: string
}

const rawEnv = import.meta.env as unknown as Record<string, string | boolean | undefined>

export function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

export function readBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false
  return fallback
}

export function readLocale(value: unknown, fallback: Locale): Locale {
  if (value === 'en') return 'en'
  if (value === 'ar') return 'ar'
  return fallback
}

/** مركز عرض العراق الافتراضي على مستوى الدولة (لا يمثّل موقع المستخدم). */
export const IRAQ_CENTER = { lat: 33.2232, lng: 43.6793 }
export const IRAQ_VIEW_ZOOM = 6
export const IRAQ_BOUNDS = { south: 29.05, north: 37.38, west: 38.79, east: 48.58 }

const tileUrl = readString(
  rawEnv.VITE_TILE_URL,
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
)
const tileKey = readString(rawEnv.VITE_TILE_API_KEY, '')

export const config = {
  appName: readString(rawEnv.VITE_APP_NAME, 'Iraq Map'),
  appVersion: readString(rawEnv.VITE_APP_VERSION, '0.1.0'),
  contactEmail: readString(rawEnv.VITE_CONTACT_EMAIL, ''),
  defaultLocale: readLocale(rawEnv.VITE_DEFAULT_LOCALE, 'ar'),
  demoData: readBool(rawEnv.VITE_ENABLE_DEMO_DATA, false),
  geocoder: (readString(rawEnv.VITE_GEOCODER, 'nominatim') === 'photon'
    ? 'photon'
    : 'nominatim') as GeocoderId,
  tileUrl,
  tileKey,
  tileAttribution: readString(rawEnv.VITE_TILE_ATTRIBUTION, '© مساهمو OpenStreetMap'),
  nominatimUrl: readString(rawEnv.VITE_NOMINATIM_URL, 'https://nominatim.openstreetmap.org'),
  photonUrl: readString(rawEnv.VITE_PHOTON_URL, 'https://photon.komoot.io'),
  overpassUrl: readString(rawEnv.VITE_OVERPASS_URL, 'https://overpass-api.de/api/interpreter'),
  osrmUrl: readString(rawEnv.VITE_OSRM_URL, 'https://router.project-osrm.org'),
  osrmCarProfile: readString(rawEnv.VITE_OSRM_CAR_PROFILE, 'driving'),
  osrmWalkProfile: readString(rawEnv.VITE_OSRM_WALK_PROFILE, ''),
}

export function resolveTileUrl(): string {
  if (!config.tileKey) return config.tileUrl
  return config.tileUrl.replaceAll('{key}', config.tileKey).replaceAll('{apikey}', config.tileKey)
}

export function providerStatuses(): ProviderStatus[] {
  const usingPublicOsmTiles = config.tileUrl.includes('openstreetmap.org')
  const usingPublicNominatim = config.nominatimUrl.includes('nominatim.openstreetmap.org')
  const usingPublicOsrm = config.osrmUrl.includes('router.project-osrm.org')
  const usingPublicOverpass = config.overpassUrl.includes('overpass-api.de')

  return [
    {
      id: 'tiles',
      labelAr: 'طبقات الخريطة',
      labelEn: 'Map tiles',
      ready: config.tileUrl.length > 0,
      requiresKey: !usingPublicOsmTiles && !config.tileKey,
      detail: usingPublicOsmTiles
        ? 'OpenStreetMap العام (بلا مفتاح)'
        : config.tileKey
          ? 'مزوّد مخصّص مع مفتاح'
          : 'مزوّد مخصّص بلا مفتاح',
      docsUrl: 'https://operations.osmfoundation.org/policies/tiles/',
    },
    {
      id: 'geocoder',
      labelAr: 'البحث والعناوين',
      labelEn: 'Search & geocoding',
      ready: true,
      requiresKey: false,
      detail:
        config.geocoder === 'photon'
          ? 'Photon (komoot)'
          : usingPublicNominatim
            ? 'Nominatim العام (بلا مفتاح)'
            : 'Nominatim مخصّص',
      docsUrl: 'https://nominatim.org/release-docs/latest/api/Overview/',
    },
    {
      id: 'categories',
      labelAr: 'تصنيفات الأماكن القريبة',
      labelEn: 'Nearby categories',
      ready: true,
      requiresKey: false,
      detail: usingPublicOverpass ? 'Overpass API العام (بلا مفتاح)' : 'Overpass مخصّص',
      docsUrl: 'https://wiki.openstreetmap.org/wiki/Overpass_API',
    },
    {
      id: 'routing',
      labelAr: 'المسارات والاتجاهات',
      labelEn: 'Routing',
      ready: true,
      requiresKey: false,
      detail: usingPublicOsrm
        ? 'OSRM العام — سيارة فقط، والمشي تقديري'
        : 'OSRM مخصّص',
      docsUrl: 'http://project-osrm.org/docs/v5.24.0/api/',
    },
  ]
}
