import { config } from '../../config/env'
import { OverpassProvider } from './overpassProvider'

export type { CategoryDefinition } from './categories'
export { CATEGORIES, findCategory } from './categories'
export { OverpassProvider, buildCategoryQuery, mapOverpassElement } from './overpassProvider'

let cached: OverpassProvider | null = null

export function createOverpass(): OverpassProvider {
  if (!cached) cached = new OverpassProvider(config.overpassUrl)
  return cached
}
