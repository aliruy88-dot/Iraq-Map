import * as L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IRAQ_CENTER, IRAQ_VIEW_ZOOM } from '../../config/env'
import { BASE_LAYERS, DEFAULT_BASE_LAYER_ID } from '../../config/mapLayers'
import { categoryIcon } from '../../utils/mapIcons'
import type { LatLng, Place } from '../../types/place'
import { MapContext } from './MapContext'
import type { MapController, MapMarker } from './MapContext'

interface MapCanvasProps {
  children: ReactNode
  onSelectMarker?: (place: Place) => void
  onTileError?: () => void
}

function placeIcon(place: Place, highlighted: boolean): L.DivIcon {
  const classes = ['map-pin']
  if (place.demo) classes.push('is-demo')
  if (highlighted) classes.push('is-active')
  return L.divIcon({
    className: 'map-pin-icon',
    html: `<div class="${classes.join(' ')}"><span class="material-symbols-outlined">${categoryIcon(
      place.rawCategory,
    )}</span></div>`,
    iconSize: highlighted ? [40, 40] : [34, 34],
    iconAnchor: highlighted ? [20, 40] : [17, 34],
  })
}

function userIconHtml(heading: number | null | undefined): string {
  const cone =
    typeof heading === 'number'
      ? `<span class="user-heading" style="transform: rotate(${heading}deg)"></span>`
      : ''
  return `<div class="user-location">${cone}<span class="user-beacon"></span><span class="user-puck"></span></div>`
}

export function MapCanvas({ children, onSelectMarker, onTileError }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const userLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const clickHandlersRef = useRef(new Set<(point: LatLng) => void>())
  const onSelectRef = useRef(onSelectMarker)
  const onTileErrorRef = useRef(onTileError)
  const baseLayerIdRef = useRef(DEFAULT_BASE_LAYER_ID)
  const [baseLayerId, setBaseLayerId] = useState(DEFAULT_BASE_LAYER_ID)

  useEffect(() => {
    onSelectRef.current = onSelectMarker
  }, [onSelectMarker])

  useEffect(() => {
    onTileErrorRef.current = onTileError
  }, [onTileError])

  const controller = useMemo<MapController>(
    () => ({
      flyTo(target, zoom) {
        const map = mapRef.current
        if (!map) return
        map.flyTo([target.lat, target.lng], zoom ?? Math.max(map.getZoom(), 14), {
          duration: 0.6,
        })
      },
      fitBounds(bounds, paddingPx = 56) {
        const map = mapRef.current
        if (!map) return
        const leafletBounds = L.latLngBounds(
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        )
        map.fitBounds(leafletBounds, { padding: [paddingPx, paddingPx], maxZoom: 16 })
      },
      getCenter() {
        const center = mapRef.current?.getCenter()
        return center ? { lat: center.lat, lng: center.lng } : { ...IRAQ_CENTER }
      },
      zoomBy(delta) {
        const map = mapRef.current
        if (!map) return
        map.setZoom(map.getZoom() + delta)
      },
      setMarkers(markers: MapMarker[]) {
        const layer = markersLayerRef.current
        if (!layer) return
        layer.clearLayers()
        for (const marker of markers) {
          const leafletMarker = L.marker(
            [marker.place.location.lat, marker.place.location.lng],
            { icon: placeIcon(marker.place, marker.highlighted ?? false), title: marker.place.name },
          )
          leafletMarker.on('click', () => onSelectRef.current?.(marker.place))
          leafletMarker.addTo(layer)
        }
      },
      setUserLocation(location, headingDeg) {
        const layer = userLayerRef.current
        if (!layer) return
        if (!location) {
          layer.clearLayers()
          userMarkerRef.current = null
          return
        }
        const icon = L.divIcon({
          className: 'user-location-icon',
          html: userIconHtml(headingDeg),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker([location.lat, location.lng], {
            icon,
            interactive: false,
            zIndexOffset: 1000,
          }).addTo(layer)
        } else {
          userMarkerRef.current.setLatLng([location.lat, location.lng])
          userMarkerRef.current.setIcon(icon)
        }
      },
      setRoute(points, options) {
        const layer = routeLayerRef.current
        if (!layer) return
        layer.clearLayers()
        if (points.length < 2) return
        const latlngs = points.map((point) => [point.lat, point.lng] as [number, number])
        L.polyline(latlngs, {
          color: options?.estimated ? '#7c3aed' : '#0066ff',
          weight: options?.estimated ? 4 : 6,
          opacity: 0.92,
          dashArray: options?.estimated ? '2 10' : undefined,
          lineCap: 'round',
        }).addTo(layer)
      },
      clearRoute() {
        routeLayerRef.current?.clearLayers()
      },
      setBaseLayer(id) {
        baseLayerIdRef.current = id
        setBaseLayerId(id)
      },
      getBaseLayer() {
        return baseLayerIdRef.current
      },
      invalidateSize() {
        mapRef.current?.invalidateSize()
      },
      onMapClick(handler) {
        clickHandlersRef.current.add(handler)
        return () => clickHandlersRef.current.delete(handler)
      },
    }),
    [],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [IRAQ_CENTER.lat, IRAQ_CENTER.lng],
      zoom: IRAQ_VIEW_ZOOM,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 19,
      worldCopyJump: false,
    })
    mapRef.current = map
    markersLayerRef.current = L.layerGroup().addTo(map)
    routeLayerRef.current = L.layerGroup().addTo(map)
    userLayerRef.current = L.layerGroup().addTo(map)

    map.on('click', (event: L.LeafletMouseEvent) => {
      const point: LatLng = { lat: event.latlng.lat, lng: event.latlng.lng }
      for (const handler of clickHandlersRef.current) handler(point)
    })

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
      routeLayerRef.current = null
      userLayerRef.current = null
      userMarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const layerConfig =
      BASE_LAYERS.find((layer) => layer.id === baseLayerId) ?? BASE_LAYERS[0]
    if (tileRef.current) {
      map.removeLayer(tileRef.current)
      tileRef.current = null
    }
    const tiles = L.tileLayer(layerConfig.url, {
      attribution:
        `${layerConfig.attribution} | Iraq Map — <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
      maxZoom: layerConfig.maxZoom,
    })
    tiles.on('tileerror', () => onTileErrorRef.current?.())
    tiles.addTo(map)
    tileRef.current = tiles
  }, [baseLayerId])

  return (
    <div className="map-root">
      <div ref={containerRef} className="map-canvas" role="application" aria-label="خريطة العراق" />
      <MapContext.Provider value={controller}>{children}</MapContext.Provider>
    </div>
  )
}
