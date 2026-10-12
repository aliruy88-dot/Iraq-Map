import { useI18n } from '../i18n/I18nContext'
import { useFavorites } from '../state/FavoritesContext'
import { Icon } from '../components/common/Icon'
import { categoryIcon } from '../utils/mapIcons'
import { describeOsmCategory } from '../utils/osmLabels'
import type { Place } from '../types/place'

interface SavedScreenProps {
  onShowOnMap: (place: Place) => void
}

export function SavedScreen({ onShowOnMap }: SavedScreenProps) {
  const { t, locale } = useI18n()
  const { favorites, remove } = useFavorites()

  return (
    <div className="screen saved-screen">
      <div className="saved-panel">
        <header className="panel-header">
          <h2>{t('saved.title')}</h2>
          <p>
            {favorites.length > 0 ? t('saved.count', { count: favorites.length }) : t('saved.subtitle')}
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <Icon name="bookmark_border" />
            <p>{t('saved.empty')}</p>
            <small>{t('saved.emptyHint')}</small>
          </div>
        ) : (
          <ul className="saved-list">
            {favorites.map((place) => (
              <li key={place.id} className="saved-item">
                <span className="saved-icon">
                  <Icon name={categoryIcon(place.rawCategory)} />
                </span>
                <div className="saved-body">
                  <span className="saved-name">
                    {place.name}
                    {place.demo && <em className="badge-demo">{t('place.demoBadge')}</em>}
                  </span>
                  {place.address && <span className="saved-address">{place.address}</span>}
                  {place.rawCategory && (
                    <span className="saved-meta">
                      {describeOsmCategory(place.rawCategory, locale)}
                    </span>
                  )}
                </div>
                <div className="saved-actions">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => onShowOnMap(place)}
                    title={t('saved.showOnMap')}
                    aria-label={t('saved.showOnMap')}
                  >
                    <Icon name="map" />
                  </button>
                  <button
                    type="button"
                    className="mini-btn danger"
                    onClick={() => remove(place.id)}
                    title={t('saved.remove')}
                    aria-label={t('saved.remove')}
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
