import { describe, expect, it, vi } from 'vitest'
import { NominatimProvider } from './nominatim'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('NominatimProvider', () => {
  it('maps a search response into places', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          {
            place_id: 1,
            osm_type: 'node',
            osm_id: 9,
            name: 'حديقة الأمة',
            display_name: 'حديقة الأمة، بغداد، العراق',
            lat: '33.3',
            lon: '44.3',
            category: 'leisure',
            type: 'park',
            boundingbox: ['33.29', '33.31', '44.29', '44.31'],
          },
        ]),
      ),
    )

    const provider = new NominatimProvider('https://nominatim.example.test')
    const results = await provider.search('حديقة')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('nominatim:node:9')
    expect(results[0].name).toBe('حديقة الأمة')
    expect(results[0].location).toEqual({ lat: 33.3, lng: 44.3 })
    expect(results[0].rawCategory).toBe('leisure=park')
    expect(results[0].bounds).toEqual({ south: 33.29, north: 33.31, west: 44.29, east: 44.31 })
    expect(results[0].source).toBe('nominatim')
  })

  it('does not call the network for short queries', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const provider = new NominatimProvider('https://nominatim.example.test')
    await expect(provider.search('a')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws a typed error on HTTP failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 503)))
    const provider = new NominatimProvider('https://nominatim.example.test')
    await expect(provider.search('بغداد')).rejects.toMatchObject({ kind: 'http', status: 503 })
  })

  it('returns null on a reverse response with an error field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Unable to geocode' })))
    const provider = new NominatimProvider('https://nominatim.example.test')
    const place = await provider.reverse({ lat: 33.3, lng: 44.3 })
    expect(place).toBeNull()
  })
})