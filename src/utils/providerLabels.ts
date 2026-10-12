import type { PlaceSource } from '../types/place'

export const PROVIDER_LABELS: Record<PlaceSource, string> = {
  nominatim: 'Nominatim / OSM',
  photon: 'Photon / OSM',
  overpass: 'Overpass / OSM',
  demo: 'بيانات تجريبية',
}
