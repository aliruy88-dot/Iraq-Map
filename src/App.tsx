import { useCallback, useEffect, useState } from 'react'
import { AppSettingsProvider, useAppSettings } from './state/AppSettingsContext'
import { FavoritesProvider } from './state/FavoritesContext'
import { useI18n } from './i18n/I18nContext'
import type { MessageKey } from './i18n/messages'
import { useGeolocation } from './hooks/useGeolocation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { MapCanvas } from './components/map/MapCanvas'
import { AppHeader } from './components/layout/AppHeader'
import { BottomNav } from './components/layout/BottomNav'
import { Icon } from './components/common/Icon'
import { ExploreScreen } from './screens/ExploreScreen'
import { RoutesScreen } from './screens/RoutesScreen'
import { SavedScreen } from './screens/SavedScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { createGeocoder } from './services/geocoding'
import { config } from './config/env'
import type { AppScreen } from './types/navigation'
import type { Place } from './types/place'
import type { LocationFailureReason } from './services/location/locationService'

function locationReasonKey(reason: LocationFailureReason): MessageKey {
  switch (reason) {
    case 'denied':
      return 'location.denied'
    case 'timeout':
      return 'location.timeout'
    case 'unsupported':
      return 'location.unsupported'
    default:
      return 'location.unavailable'
  }
}

function AppShell() {
  const { t, dir, locale } = useI18n()
  const { settings } = useAppSettings()
  const online = useOnlineStatus()
  const geo = useGeolocation()
  const [screen, setScreen] = useState<AppScreen>('explore')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [routeDestination, setRouteDestination] = useState<Place | null>(null)
  const [regionName, setRegionName] = useState<string | null>(null)
  const [tileError, setTileError] = useState(false)
  const [locationDismissed, setLocationDismissed] = useState(false)

  const userLocation = geo.position

  useEffect(() => {
    if (!userLocation) {
      setRegionName(null)
      return
    }
    const controller = new AbortController()
    createGeocoder()
      .reverse(userLocation, {
        signal: controller.signal,
        language: locale === 'ar' ? 'ar,en' : 'en,ar',
      })
      .then((place) => {
        if (!controller.signal.aborted) setRegionName(place?.name ?? null)
      })
      .catch(() => {
        if (!controller.signal.aborted) setRegionName(null)
      })
    return () => controller.abort()
  }, [userLocation, locale])

  const handleSelectMarker = useCallback((place: Place) => {
    setSelectedPlace(place)
    setScreen('explore')
  }, [])

  const handleOpenRoutes = useCallback((place: Place) => {
    setRouteDestination(place)
    setSelectedPlace(null)
    setScreen('routes')
  }, [])

  const handleShowOnMap = useCallback((place: Place) => {
    setSelectedPlace(place)
    setScreen('explore')
  }, [])

  const handleDestinationConsumed = useCallback(() => setRouteDestination(null), [])

  const regionLabel = userLocation
    ? regionName ?? t('header.iraq')
    : t('header.locationUnknown')

  const showLocationAlert =
    !locationDismissed && (geo.status === 'denied' || geo.status === 'error') && geo.reason !== null

  return (
    <MapCanvas onSelectMarker={handleSelectMarker} onTileError={() => setTileError(true)}>
      <div className="app-shell" dir={dir} lang={locale}>
        <AppHeader regionLabel={regionLabel} online={online} />

        <div className="banners">
          {tileError && (
            <div className="banner" role="status">
              <Icon name="map" />
              <span>{t('common.tilesError')}</span>
              <button type="button" onClick={() => setTileError(false)} aria-label={t('common.close')}>
                <Icon name="close" />
              </button>
            </div>
          )}
          {showLocationAlert && geo.reason && (
            <div className="banner warn" role="alert">
              <Icon name="location_disabled" />
              <span>{t(locationReasonKey(geo.reason))}</span>
              <button
                type="button"
                onClick={() => setLocationDismissed(true)}
                aria-label={t('common.close')}
              >
                <Icon name="close" />
              </button>
            </div>
          )}
          {config.demoData && (
            <div className="banner demo" role="status">
              <Icon name="science" />
              <span>{t('demo.notice')}</span>
            </div>
          )}
        </div>

        <main className="app-main">
          {screen === 'explore' && (
            <ExploreScreen
              userLocation={userLocation}
              locating={geo.status === 'locating'}
              onLocate={geo.request}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onOpenRoutes={handleOpenRoutes}
            />
          )}
          {screen === 'routes' && (
            <RoutesScreen
              userLocation={userLocation}
              locating={geo.status === 'locating'}
              onLocate={geo.request}
              defaultMode={settings.defaultMode}
              destination={routeDestination}
              onDestinationConsumed={handleDestinationConsumed}
            />
          )}
          {screen === 'saved' && <SavedScreen onShowOnMap={handleShowOnMap} />}
          {screen === 'settings' && <SettingsScreen />}
        </main>

        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </MapCanvas>
  )
}

export default function App() {
  return (
    <AppSettingsProvider>
      <FavoritesProvider>
        <AppShell />
      </FavoritesProvider>
    </AppSettingsProvider>
  )
}
