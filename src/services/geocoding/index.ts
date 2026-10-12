import { config } from '../../config/env'
import { NominatimProvider } from './nominatim'
import { PhotonProvider } from './photon'
import type { GeocodeProvider } from './types'

export type { GeocodeProvider, SearchOptions } from './types'

let cached: GeocodeProvider | null = null

/** ينشئ مزوّد البحث وفق متغيرات البيئة (nominatim افتراضياً). */
export function createGeocoder(): GeocodeProvider {
  if (cached) return cached
  cached =
    config.geocoder === 'photon'
      ? new PhotonProvider(config.photonUrl)
      : new NominatimProvider(config.nominatimUrl)
  return cached
}
