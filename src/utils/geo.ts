import type { Bounds, LatLng } from '../types/place'

export type { Bounds, LatLng }

const EARTH_RADIUS_M = 6371008.8

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/** المسافة الجغرافية الحقيقية بين نقطتين بالمتر (صيغة هافرساين). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** مجموع أطوال خط متعدد بالنقاط بالمتر. */
export function pathLengthMeters(points: LatLng[]): number {
  let total = 0
  for (let i = 1; i < points.length; i += 1) {
    total += distanceMeters(points[i - 1], points[i])
  }
  return total
}

export function boundsOf(points: LatLng[]): Bounds | null {
  if (points.length === 0) return null
  let south = points[0].lat
  let north = points[0].lat
  let west = points[0].lng
  let east = points[0].lng
  for (const point of points) {
    south = Math.min(south, point.lat)
    north = Math.max(north, point.lat)
    west = Math.min(west, point.lng)
    east = Math.max(east, point.lng)
  }
  return { south, north, west, east }
}

export function boundsCenter(bounds: Bounds): LatLng {
  return {
    lat: (bounds.south + bounds.north) / 2,
    lng: (bounds.west + bounds.east) / 2,
  }
}

export function isInsideBounds(point: LatLng, bounds: Bounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  )
}
