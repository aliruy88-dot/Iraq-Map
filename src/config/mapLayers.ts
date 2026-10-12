import { config, resolveTileUrl } from './env'

export interface TileLayerConfig {
  id: string
  labelAr: string
  labelEn: string
  url: string
  attribution: string
  maxZoom: number
}

/**
 * طبقات مجانية بلا مفاتيح. «osm» يتبع متغيرات البيئة (VITE_TILE_URL).
 * الباقي أنماط نظيفة من CARTO (مجانية بنسبها) مع خيارات فاتحة/داكنة.
 */
export const BASE_LAYERS: TileLayerConfig[] = [
  {
    id: 'voyager',
    labelAr: 'أنيقة فاتحة',
    labelEn: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 20,
  },
  {
    id: 'light',
    labelAr: 'بسيطة فاتحة',
    labelEn: 'Positron',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 20,
  },
  {
    id: 'dark',
    labelAr: 'داكنة',
    labelEn: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 20,
  },
  {
    id: 'osm',
    labelAr: 'شوارع OSM (إعداداتك)',
    labelEn: 'OSM streets',
    url: resolveTileUrl(),
    attribution: config.tileAttribution,
    maxZoom: 19,
  },
  {
    id: 'topo',
    labelAr: 'التضاريس',
    labelEn: 'Terrain',
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
]

export const DEFAULT_BASE_LAYER_ID = 'voyager'