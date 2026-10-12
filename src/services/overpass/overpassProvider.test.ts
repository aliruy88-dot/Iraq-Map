import { describe, expect, it, vi } from 'vitest'
import { OverpassProvider, buildCategoryQuery } from './overpassProvider'
import { CATEGORIES } from './categories'

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('OverpassProvider', () => {
  it('builds a valid category query', () => {
    const query = buildCategoryQuery(CATEGORIES[0], { lat: 33.3, lng: 44.3 }, 3000, 60)
    expect(query).toContain('nwr(around:3000,33.3,44.3)')
    expect(query).toContain(CATEGORIES[0].filter)
    expect(query).toContain('out center tags 60')
  })

  it('maps elements and skips unnamed features', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          elements: [
            { type: 'node', id: 1, lat: 33.3, lon: 44.3, tags: { name: 'مقهى', amenity: 'cafe' } },
            { type: 'way', id: 2, center: { lat: 33.4, lon: 44.4 }, tags: { name: ' مطعم', amenity: 'restaurant' } },
            { type: 'node', id: 3, lat: 33.5, lon: 44.5, tags: {} },
          ],
        }),
      ),
    )
    const provider = new OverpassProvider('https://overpass.example.test/interpreter')
    const results = await provider.searchCategory(
      CATEGORIES[0],
      { lat: 33.3, lng: 44.3 },
      { radiusMeters: 3000 },
    )
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('overpass:node:1')
    expect(results[0].location).toEqual({ lat: 33.3, lng: 44.3 })
    expect(results[1].id).toBe('overpass:way:2')
  })

  it('converts muslim place of worship to a mosque category', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          elements: [
            {
              type: 'node',
              id: 7,
              lat: 33.3,
              lon: 44.3,
              tags: { name: 'جامع', amenity: 'place_of_worship', religion: 'muslim' },
            },
          ],
        }),
      ),
    )
    const provider = new OverpassProvider('https://overpass.example.test/interpreter')
    const results = await provider.searchCategory(
      CATEGORIES[2],
      { lat: 33.3, lng: 44.3 },
    )
    expect(results[0].rawCategory).toBe('amenity=mosque')
  })
})