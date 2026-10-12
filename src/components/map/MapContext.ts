import { createContext, useContext } from 'react'
import type { Bounds, LatLng, Place } from '../../types/place'

export interface MapMarker {
  id: string
  place: Place
  highlighted?: boolean
}

export interface MapController {
  flyTo(target: LatLng, zoom?: number): void
  fitBounds(bounds: Bounds, paddingPx?: number): void
  getCenter(): LatLng
  zoomBy(delta: number): void
  setMarkers(markers: MapMarker[]): void
  setUserLocation(location: LatLng | null, headingDeg?: number | null): void
  setRoute(points: LatLng[], options?: { estimated?: boolean }): void
  clearRoute(): void
  setBaseLayer(id: string): void
  getBaseLayer(): string
  invalidateSize(): void
  onMapClick(handler: (point: LatLng) => void): () => void
}

export const MapContext = createContext<MapController | null>(null)

export function useMapController(): MapController {
  const controller = useContext(MapContext)
  if (!controller) throw new Error('useMapController must be used within MapCanvas')
  return controller
}
