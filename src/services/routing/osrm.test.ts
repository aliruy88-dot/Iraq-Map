import { describe, expect, it, vi } from 'vitest'
import { OsrmProvider, estimateRoute } from './osrm'

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('OsrmProvider', () => {
  it('maps a driving route', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          code: 'Ok',
          routes: [
            {
              distance: 5000,
              duration: 300,
              geometry: { coordinates: [[44.3, 33.3], [44.32, 33.31]] },
            },
          ],
        }),
      ),
    )
    const provider = new OsrmProvider('https://osrm.example.test')
    const route = await provider.route(
      { lat: 33.3, lng: 44.3 },
      { lat: 33.31, lng: 44.32 },
      'car',
    )
    expect(route.quality).toBe('routed')
    expect(route.distanceMeters).toBe(5000)
    expect(route.durationSeconds).toBe(300)
    expect(route.profile).toBe('driving')
    expect(route.geometry[0]).toEqual({ lat: 33.3, lng: 44.3 })
  })

  it('returns a straight-line estimate for walk when no walk profile is set', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const provider = new OsrmProvider('https://osrm.example.test', 'driving', '')
    const route = await provider.route({ lat: 0, lng: 0 }, { lat: 0, lng: 0.009 }, 'walk')
    expect(route.quality).toBe('estimated')
    expect(route.distanceMeters).toBeGreaterThan(900)
    expect(route.source).toBe('تقدير محلي')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses the configured walk profile when set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          code: 'Ok',
          routes: [{ distance: 610, duration: 430, geometry: { coordinates: [[44.3, 33.3], [44.31, 33.31]] } }],
        }),
      ),
    )
    const provider = new OsrmProvider('https://osrm.example.test', 'driving', 'foot')
    const route = await provider.route({ lat: 33.3, lng: 44.3 }, { lat: 33.31, lng: 44.31 }, 'walk')
    expect(route.quality).toBe('routed')
    expect(route.profile).toBe('foot')
  })

  it('fails with a typed error when the server returns no route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ code: 'NoRoute' })))
    const provider = new OsrmProvider('https://osrm.example.test')
    await expect(
      provider.route({ lat: 33.3, lng: 44.3 }, { lat: 33.4, lng: 44.4 }, 'car'),
    ).rejects.toMatchObject({ name: 'RouteError', reason: 'no-route' })
  })
})

describe('estimateRoute', () => {
  it('computes duration from walking speed', () => {
    const route = estimateRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 0.01 }, 'walk')
    expect(route.quality).toBe('estimated')
    expect(route.durationSeconds).toBeCloseTo(route.distanceMeters / 1.35, 1)
  })
})