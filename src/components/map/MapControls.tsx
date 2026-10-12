import { useState } from 'react'
import { BASE_LAYERS } from '../../config/mapLayers'
import { useI18n } from '../../i18n/I18nContext'
import { useCompass } from '../../hooks/useCompass'
import { useMapController } from './MapContext'
import { Icon } from '../common/Icon'

interface MapControlsProps {
  locating: boolean
  onLocate: () => void
}

export function MapControls({ locating, onLocate }: MapControlsProps) {
  const { t, locale } = useI18n()
  const map = useMapController()
  const [layersOpen, setLayersOpen] = useState(false)
  const [activeLayer, setActiveLayer] = useState(() => map.getBaseLayer())
  const compass = useCompass()

  const compassTitle = compass.available ? t('controls.compass') : t('controls.compassUnavailable')

  return (
    <div className="map-controls">
      <div className="control-group">
        <button
          type="button"
          className="map-btn"
          onClick={() => map.zoomBy(1)}
          aria-label={t('controls.zoomIn')}
          title={t('controls.zoomIn')}
        >
          <Icon name="add" />
        </button>
        <button
          type="button"
          className="map-btn"
          onClick={() => map.zoomBy(-1)}
          aria-label={t('controls.zoomOut')}
          title={t('controls.zoomOut')}
        >
          <Icon name="remove" />
        </button>

        <div className="control-layers">
          <button
            type="button"
            className={`map-btn${layersOpen ? ' is-active' : ''}`}
            onClick={() => setLayersOpen((open) => !open)}
            aria-label={t('controls.layers')}
            aria-expanded={layersOpen}
            title={t('controls.layers')}
          >
            <Icon name="layers" />
          </button>
          {layersOpen && (
            <div className="layers-menu" role="menu" aria-label={t('controls.baseLayer')}>
              <span className="layers-title">{t('controls.baseLayer')}</span>
              {BASE_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={layer.id === activeLayer}
                  className={`layers-item${layer.id === activeLayer ? ' is-active' : ''}`}
                  onClick={() => {
                    map.setBaseLayer(layer.id)
                    setActiveLayer(layer.id)
                    setLayersOpen(false)
                  }}
                >
                  <Icon name={layer.id === activeLayer ? 'radio_button_checked' : 'radio_button_unchecked'} />
                  <span>{locale === 'ar' ? layer.labelAr : layer.labelEn}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`map-btn${compass.active ? ' is-active' : ''}`}
          onClick={() => {
            if (compass.active) compass.stop()
            else void compass.start()
          }}
          disabled={!compass.available}
          aria-label={compassTitle}
          title={compassTitle}
        >
          <Icon name="explore" filled={compass.active} />
          {compass.active && compass.heading !== null && (
            <span className="compass-value">{Math.round(compass.heading)}°</span>
          )}
        </button>

        <button
          type="button"
          className="map-btn"
          disabled
          aria-disabled="true"
          aria-label={t('controls.traffic')}
          title={t('controls.trafficUnavailable')}
        >
          <Icon name="traffic" />
        </button>
      </div>

      <button
        type="button"
        className={`map-btn map-btn-locate${locating ? ' is-busy' : ''}`}
        onClick={onLocate}
        disabled={locating}
        aria-label={t('controls.locate')}
        title={t('controls.locate')}
      >
        <Icon name={locating ? 'progress_activity' : 'my_location'} />
      </button>
    </div>
  )
}
