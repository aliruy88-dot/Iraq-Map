import { describe, expect, it } from 'vitest'
import { boundsOf, distanceMeters } from './geo'

describe('distanceMeters', () => {
  it('is about zero for identical points', () => {
    expect(distanceMeters({ lat: 33.3, lng: 44.3 }, { lat: 33.3, lng: 44.3 })).toBeLessThan(0.01)
  })

  it('approximates 1 degree of latitude near the equator to ~111 km', () => {
    const meters = distanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })
    expect(meters).toBeGreaterThan(110000)
    expect(meters).toBeLessThan(112000)
  })
})

describe('boundsOf', () => {
  it('computes bounding box', () => {
    const bounds = boundsOf([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 0 },
      { lat: 0, lng: 4 },
    ])
    expect(bounds).toEqual({ south: 0, north: 3, west: 0, east: 4 })
  })

  it('returns null for empty input', () => {
    expect(boundsOf([])).toBeNull()
  })
})