import { useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { useFavorites } from '../../state/FavoritesContext'
import { Icon } from '../common/Icon'
import { categoryIcon } from '../../utils/mapIcons'
import { describeOsmCategory } from '../../utils/osmLabels'
import { distanceMeters } from '../../utils/geo'
import { formatCoordinates, formatDistance } from '../../utils/format'
import { PROVIDER_LABELS } from '../../utils/providerLabels'
import type { LatLng, Place } from '../../types/place'

interface PlaceCardProps {
  place: Place
  userLocation: LatLng | null
  onClose: () => void
  onDirections: (place: Place) => void
}

export function PlaceCard({ place, userLocation, onClose, onDirections }: PlaceCardProps) {
  const { t, locale } = useI18n()
  const { isSaved, toggle } = useFavorites()
  const [message, setMessage] = useState<string | null>(null)

  const saved = isSaved(place.id)
  const categoryLabel = describeOsmCategory(place.rawCategory, locale)
  const categoryBadge = place.rawCategory
    ? describeOsmCategory(place.rawCategory, locale)
    : undefined
  const distance = userLocation
    ? formatDistance(distanceMeters(userLocation, place.location), locale)
    : null

  function flash(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2600)
  }

  function openStreetMapUrl(): string {
    const { lat, lng } = place.location
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
  }

  async function share(): Promise<void> {
    const url = openStreetMapUrl()
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: place.name, text: place.address ?? '', url })
        return
      }
      await navigator.clipboard.writeText(`${place.name} — ${url}`)
      flash(t('place.shareCopied'))
    } catch {
      flash(t('place.shareFailed'))
    }
  }

  return (
    <section className="place-card" aria-label={t('place.details')}>
      <div className="place-card-handle" />
      <div className="place-card-head">
        <span className="place-card-icon">
          <Icon name={categoryIcon(place.rawCategory)} />
        </span>
        <div className="place-card-title">
          <h2>{place.name}</h2>
          <p className="place-address">
            {place.address ? (
              <>
                <Icon name="location_on" />
                {place.address}
              </>
            ) : (
              t('place.noDetails')
            )}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('place.close')}>
          <Icon name="close" />
        </button>
      </div>

      <div className="place-badges">
        {place.demo && <span className="badge-demo">{t('place.demoBadge')}</span>}
        {categoryBadge && (
          <span className="badge-soft">
            <Icon name={categoryIcon(place.rawCategory)} />
            {categoryBadge}
          </span>
        )}
        <span className="badge-soft">
          <Icon name="database" />
          {PROVIDER_LABELS[place.source]}
        </span>
      </div>

      <dl className="place-meta">
        {distance && (
          <div>
            <dt>
              <Icon name="near_me" />
              {t('place.distance')}
            </dt>
            <dd>{distance}</dd>
          </div>
        )}
        {categoryLabel && (
          <div>
            <dt>
              <Icon name="category" />
              {t('place.category')}
            </dt>
            <dd>{categoryLabel}</dd>
          </div>
        )}
        {place.openingHours && (
          <div>
            <dt>
              <Icon name="schedule" />
              {t('place.openingHours')}
            </dt>
            <dd dir="ltr">{place.openingHours}</dd>
          </div>
        )}
        {place.phone && (
          <div>
            <dt>
              <Icon name="call" />
              {t('place.phone')}
            </dt>
            <dd dir="ltr">{place.phone}</dd>
          </div>
        )}
        {place.website && (
          <div>
            <dt>
              <Icon name="link" />
              {t('place.website')}
            </dt>
            <dd dir="ltr">
              <a href={place.website} target="_blank" rel="noreferrer">
                {place.website}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt>
            <Icon name="pin_drop" />
            {t('place.coordinates')}
          </dt>
          <dd dir="ltr">{formatCoordinates(place.location.lat, place.location.lng)}</dd>
        </div>
      </dl>

      <div className="place-actions">
        <button type="button" className="btn-primary" onClick={() => onDirections(place)}>
          <Icon name="directions" />
          {t('place.directions')}
        </button>
        <button
          type="button"
          className={`btn-icon${saved ? ' is-active' : ''}`}
          onClick={() => toggle(place)}
          aria-pressed={saved}
          aria-label={saved ? t('place.saved') : t('place.save')}
          title={saved ? t('place.saved') : t('place.save')}
        >
          <Icon name={saved ? 'bookmark' : 'bookmark_border'} filled={saved} />
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={() => void share()}
          aria-label={t('place.share')}
          title={t('place.share')}
        >
          <Icon name="share" />
        </button>
      </div>

      {message && (
        <p className="place-toast" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
