import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useMapController } from '../components/map/MapContext'
import type { MapMarker } from '../components/map/MapContext'
import { MapControls } from '../components/map/MapControls'
import { SearchBar } from '../components/search/SearchBar'
import { ResultsPanel } from '../components/search/ResultsPanel'
import { CategoryChips } from '../components/categories/CategoryChips'
import { PlaceCard } from '../components/place/PlaceCard'
import { Icon } from '../components/common/Icon'
import { useSearch } from '../hooks/useSearch'
import { useNearbyCategory } from '../hooks/useNearbyCategory'
import { findCategory } from '../services/overpass'
import { boundsOf } from '../utils/geo'
import type { LatLng, Place } from '../types/place'

const EMPTY_RESULTS: Place[] = []

interface ExploreScreenProps {
  userLocation: LatLng | null
  locating: boolean
  onLocate: () => Promise<LatLng | null>
  selectedPlace: Place | null
  onSelectPlace: (place: Place | null) => void
  onOpenRoutes: (place: Place) => void
}

export function ExploreScreen({
  userLocation,
  locating,
  onLocate,
  selectedPlace,
  onSelectPlace,
  onOpenRoutes,
}: ExploreScreenProps) {
  const { t, locale } = useI18n()
  const map = useMapController()
  const [query, setQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [categoryCenter, setCategoryCenter] = useState<LatLng | null>(null)

  const search = useSearch(query, userLocation)
  const category = activeCategoryId ? findCategory(activeCategoryId) ?? null : null
  const nearby = useNearbyCategory(category, categoryCenter)

  const mode: 'search' | 'category' | 'none' =
    query.trim().length >= 2 ? 'search' : activeCategoryId ? 'category' : 'none'

  const activeResults =
    mode === 'search' ? search.results : mode === 'category' ? nearby.results : EMPTY_RESULTS
  const resultsStatus =
    mode === 'search' ? search.status : mode === 'category' ? nearby.status : 'idle'
  const resultsRetry = mode === 'search' ? search.retry : nearby.retry

  useEffect(() => {
    map.setUserLocation(userLocation)
  }, [userLocation, map])

  useEffect(() => {
    map.clearRoute()
  }, [map])

  useEffect(() => {
    const markers: MapMarker[] = activeResults.slice(0, 60).map((place) => ({
      id: place.id,
      place,
      highlighted: selectedPlace?.id === place.id,
    }))
    if (selectedPlace && !markers.some((marker) => marker.id === selectedPlace.id)) {
      markers.push({ id: selectedPlace.id, place: selectedPlace, highlighted: true })
    }
    map.setMarkers(markers)
  }, [activeResults, selectedPlace, map])

  useEffect(() => {
    if (activeResults.length === 0) return
    const bounds = boundsOf(activeResults.map((place) => place.location))
    if (bounds) map.fitBounds(bounds)
  }, [activeResults, map])

  useEffect(() => {
    if (!selectedPlace) return
    if (selectedPlace.bounds) map.fitBounds(selectedPlace.bounds)
    else map.flyTo(selectedPlace.location, 16)
  }, [selectedPlace, map])

  function handleCategory(id: string) {
    if (id === activeCategoryId) {
      setActiveCategoryId(null)
      setCategoryCenter(null)
      return
    }
    setQuery('')
    setActiveCategoryId(id)
    setCategoryCenter(userLocation ?? map.getCenter())
  }

  async function handleLocate() {
    const position = await onLocate()
    if (position) map.flyTo(position, 15)
  }

  const panelTitle =
    mode === 'category' && category
      ? locale === 'ar'
        ? category.labelAr
        : category.labelEn
      : t('search.action')

  return (
    <div className={`screen explore-screen${selectedPlace ? ' has-card' : ''}`}>
      <div className="search-cluster">
        <SearchBar
          value={query}
          loading={search.status === 'loading'}
          onChange={setQuery}
          onSubmit={() => undefined}
          onClear={() => setQuery('')}
        />
        <CategoryChips activeId={activeCategoryId} onSelect={handleCategory} />
      </div>

      {!selectedPlace && mode !== 'none' && (
        <ResultsPanel
          title={panelTitle}
          status={resultsStatus}
          results={activeResults}
          userLocation={userLocation}
          onSelect={onSelectPlace}
          onRetry={resultsRetry}
          emptyMessage={mode === 'category' ? t('categories.empty') : t('search.empty')}
          loadingMessage={mode === 'category' ? t('categories.loading') : t('search.searching')}
          errorMessage={mode === 'category' ? t('categories.error') : t('search.error')}
        />
      )}

      {!selectedPlace && mode === 'none' && (
        <div className="explore-hint">
          <Icon name="travel_explore" />
          <p>{t('search.hint')}</p>
        </div>
      )}

      <MapControls locating={locating} onLocate={() => void handleLocate()} />

      {selectedPlace && (
        <PlaceCard
          place={selectedPlace}
          userLocation={userLocation}
          onClose={() => onSelectPlace(null)}
          onDirections={onOpenRoutes}
        />
      )}
    </div>
  )
}
