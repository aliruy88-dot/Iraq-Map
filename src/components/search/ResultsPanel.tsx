import { useI18n } from '../../i18n/I18nContext'
import { useMapController } from '../map/MapContext'
import { Icon } from '../common/Icon'
import { distanceMeters } from '../../utils/geo'
import { formatDistance } from '../../utils/format'
import { describeOsmCategory } from '../../utils/osmLabels'
import { categoryIcon } from '../../utils/mapIcons'
import type { LatLng, Place } from '../../types/place'
import type { AsyncStatus } from '../../types/async'
import { Spinner } from '../common/Spinner'
import { PROVIDER_LABELS } from '../../utils/providerLabels'

interface ResultsPanelProps {
  title: string
  status: AsyncStatus
  results: Place[]
  userLocation: LatLng | null
  onSelect: (place: Place) => void
  onRetry: () => void
  emptyMessage: string
  loadingMessage: string
  errorMessage: string
}

export function ResultsPanel({
  title,
  status,
  results,
  userLocation,
  onSelect,
  onRetry,
  emptyMessage,
  loadingMessage,
  errorMessage,
}: ResultsPanelProps) {
  const { t, locale } = useI18n()
  const map = useMapController()

  return (
    <section className="results-panel" aria-label={title}>
      <header className="results-header">
        <span className="results-title">{title}</span>
        {status === 'success' && (
          <span className="results-count">{t('search.resultsCount', { count: results.length })}</span>
        )}
      </header>

      {status === 'loading' && (
        <div className="results-state">
          <Spinner />
          <span>{loadingMessage}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="results-state is-error" role="alert">
          <Icon name="error" />
          <span>{errorMessage}</span>
          <button type="button" className="btn-ghost" onClick={onRetry}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {status === 'empty' && (
        <div className="results-state">
          <Icon name="search_off" />
          <span>{emptyMessage}</span>
        </div>
      )}

      {status === 'success' && (
        <ul className="results-list">
          {results.map((place) => {
            const categoryLabel = describeOsmCategory(place.rawCategory, locale)
            const distance =
              userLocation !== null
                ? formatDistance(distanceMeters(userLocation, place.location), locale)
                : null
            return (
              <li key={place.id}>
                <button type="button" className="result-row" onClick={() => onSelect(place)}>
                  <span className="result-icon">
                    <Icon name={categoryIcon(place.rawCategory)} />
                  </span>
                  <span className="result-body">
                    <span className="result-name">
                      {place.name}
                      {place.demo && <em className="badge-demo">{t('place.demoBadge')}</em>}
                    </span>
                    {place.address && <span className="result-address">{place.address}</span>}
                    <span className="result-meta">
                      {categoryLabel && <span>{categoryLabel}</span>}
                      {distance && <span>· {distance}</span>}
                      <span>· {PROVIDER_LABELS[place.source]}</span>
                    </span>
                  </span>
                  <Icon name="chevron_left" className="result-chevron" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {status === 'success' && results.length > 0 && (
        <button type="button" className="btn-ghost results-fit" onClick={() => {
          const first = results[0]
          if (first) map.flyTo(first.location)
        }}>
          <Icon name="my_location" />
          {t('saved.showOnMap')}
        </button>
      )}
    </section>
  )
}
