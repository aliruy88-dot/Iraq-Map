import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { config } from '../config/env'
import { useMapController } from '../components/map/MapContext'
import type { MapMarker } from '../components/map/MapContext'
import { Icon } from '../components/common/Icon'
import { Spinner } from '../components/common/Spinner'
import { useRoutePlanner } from '../hooks/useRoutePlanner'
import { boundsOf } from '../utils/geo'
import { formatDistance, formatDuration } from '../utils/format'
import { RouteError } from '../types/route'
import type { LatLng, Place } from '../types/place'
import type { TravelMode } from '../types/route'

interface RoutesScreenProps {
  userLocation: LatLng | null
  locating: boolean
  onLocate: () => Promise<LatLng | null>
  defaultMode: TravelMode
  destination: Place | null
  onDestinationConsumed: () => void
}

export function RoutesScreen({
  userLocation,
  locating,
  onLocate,
  defaultMode,
  destination,
  onDestinationConsumed,
}: RoutesScreenProps) {
  const { t, locale } = useI18n()
  const map = useMapController()
  const planner = useRoutePlanner(defaultMode)
  const { setFrom, setTo, setMode } = planner
  const [pickTarget, setPickTarget] = useState<'from' | 'to' | null>(null)
  const consumedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!destination || consumedRef.current === destination.id) return
    consumedRef.current = destination.id
    setTo({ label: destination.name, location: destination.location, place: destination })
    if (userLocation) setFrom({ label: t('routes.useMyLocation'), location: userLocation })
    onDestinationConsumed()
  }, [destination, userLocation, onDestinationConsumed, setFrom, setTo, t])

  useEffect(() => {
    if (!pickTarget) return
    const unsubscribe = map.onMapClick((point) => {
      const label = `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
      if (pickTarget === 'from') setFrom({ label, location: point })
      else setTo({ label, location: point })
      setPickTarget(null)
    })
    return unsubscribe
  }, [pickTarget, map, setFrom, setTo])

  useEffect(() => {
    if (!planner.result) {
      map.clearRoute()
      return
    }
    map.setRoute(planner.result.geometry, {
      estimated: planner.result.quality === 'estimated',
    })
    const bounds = boundsOf(planner.result.geometry)
    if (bounds) map.fitBounds(bounds, 72)
  }, [planner.result, map])

  useEffect(() => {
    const markers: MapMarker[] = []
    if (planner.from?.place) markers.push({ id: planner.from.place.id, place: planner.from.place })
    if (planner.to?.place) markers.push({ id: planner.to.place.id, place: planner.to.place })
    map.setMarkers(markers)
  }, [planner.from, planner.to, map])

  async function applyMyLocation() {
    if (userLocation) {
      setFrom({ label: t('routes.useMyLocation'), location: userLocation })
      return
    }
    const position = await onLocate()
    if (position) setFrom({ label: t('routes.useMyLocation'), location: position })
  }

  function clearRoute() {
    setFrom(null)
    setTo(null)
    setPickTarget(null)
    map.clearRoute()
  }

  const walkUnavailable = config.osrmWalkProfile.length === 0
  const errorText =
    planner.error instanceof RouteError && planner.error.reason === 'no-route'
      ? `${t('routes.error')} (لا مسار متاح)`
      : t('routes.error')

  return (
    <div className="screen routes-screen">
      <div className="routes-panel">
        <header className="routes-header">
          <h2>{t('routes.title')}</h2>
          <p>{t('routes.subtitle')}</p>
        </header>

        <div className="route-points">
          <label className="route-point">
            <span className="route-point-label">
              <span className="dot dot-from" />
              {t('routes.from')}
            </span>
            <span className="route-point-value">
              {planner.from?.label ?? t('routes.pickOnMap')}
            </span>
            <span className="route-point-actions">
              <button
                type="button"
                className="mini-btn"
                onClick={() => void applyMyLocation()}
                disabled={locating}
                title={t('routes.useMyLocation')}
              >
                <Icon name={locating ? 'progress_activity' : 'my_location'} />
              </button>
              <button
                type="button"
                className={`mini-btn${pickTarget === 'from' ? ' is-active' : ''}`}
                onClick={() => setPickTarget(pickTarget === 'from' ? null : 'from')}
                title={t('routes.pickOnMap')}
              >
                <Icon name="pin_drop" />
              </button>
            </span>
          </label>

          <label className="route-point">
            <span className="route-point-label">
              <span className="dot dot-to" />
              {t('routes.to')}
            </span>
            <span className="route-point-value">{planner.to?.label ?? t('routes.pickOnMap')}</span>
            <span className="route-point-actions">
              <button
                type="button"
                className={`mini-btn${pickTarget === 'to' ? ' is-active' : ''}`}
                onClick={() => setPickTarget(pickTarget === 'to' ? null : 'to')}
                title={t('routes.pickOnMap')}
              >
                <Icon name="pin_drop" />
              </button>
            </span>
          </label>
        </div>

        <div className="mode-toggle" role="group" aria-label={t('settings.defaultMode')}>
          <button
            type="button"
            className={planner.mode === 'car' ? 'is-active' : ''}
            onClick={() => setMode('car')}
            aria-pressed={planner.mode === 'car'}
          >
            <Icon name="directions_car" filled={planner.mode === 'car'} />
            {t('routes.car')}
          </button>
          <button
            type="button"
            className={planner.mode === 'walk' ? 'is-active' : ''}
            onClick={() => setMode('walk')}
            aria-pressed={planner.mode === 'walk'}
          >
            <Icon name="directions_walk" filled={planner.mode === 'walk'} />
            {t('routes.walk')}
          </button>
        </div>

        {pickTarget && (
          <p className="route-hint" role="status">
            <Icon name="touch_app" />
            {t('routes.picking')}
          </p>
        )}

        {!planner.from || !planner.to ? (
          <p className="route-note">{t('routes.needBoth')}</p>
        ) : (
          <>
            {planner.status === 'loading' && (
              <div className="route-state">
                <Spinner />
                <span>{t('routes.computing')}</span>
              </div>
            )}
            {planner.status === 'error' && (
              <div className="route-state is-error" role="alert">
                <Icon name="error" />
                <span>{errorText}</span>
                <button type="button" className="btn-ghost" onClick={planner.recompute}>
                  {t('common.retry')}
                </button>
              </div>
            )}
            {planner.status === 'success' && planner.result && (
              <div className="route-result">
                <div className="route-metrics">
                  <div>
                    <span>{t('routes.distance')}</span>
                    <strong>{formatDistance(planner.result.distanceMeters, locale)}</strong>
                  </div>
                  <div>
                    <span>{t('routes.duration')}</span>
                    <strong>{formatDuration(planner.result.durationSeconds, locale)}</strong>
                  </div>
                  <div>
                    <span>{t('routes.source')}</span>
                    <strong>{planner.result.source}</strong>
                  </div>
                </div>
                <span className={`quality-badge is-${planner.result.quality}`}>
                  {planner.result.quality === 'routed'
                    ? t('routes.quality.routed')
                    : t('routes.quality.estimated')}
                </span>
                {planner.result.quality === 'estimated' ? (
                  <p className="route-note">
                    {planner.mode === 'walk' && walkUnavailable
                      ? `${t('routes.walkUnavailable')} `
                      : ''}
                    {t('routes.estimatedNote')}
                  </p>
                ) : (
                  <p className="route-note">{t('routes.routedNote')}</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="routes-actions">
          <button type="button" className="btn-ghost" onClick={clearRoute}>
            <Icon name="delete" />
            {t('routes.clear')}
          </button>
        </div>
      </div>
    </div>
  )
}
