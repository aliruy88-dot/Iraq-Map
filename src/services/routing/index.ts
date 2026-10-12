import { config } from '../../config/env'
import { OsrmProvider } from './osrm'
import type { RoutingProvider } from './types'

export type { RoutingProvider } from './types'
export { estimateRoute, OsrmProvider } from './osrm'

let cached: RoutingProvider | null = null

export function createRouter(): RoutingProvider {
  if (!cached) {
    cached = new OsrmProvider(config.osrmUrl, config.osrmCarProfile, config.osrmWalkProfile)
  }
  return cached
}
