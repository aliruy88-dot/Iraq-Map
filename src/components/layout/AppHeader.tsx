import { config } from '../../config/env'
import { useI18n } from '../../i18n/I18nContext'
import { Icon } from '../common/Icon'

interface AppHeaderProps {
  regionLabel: string
  online: boolean
}

export function AppHeader({ regionLabel, online }: AppHeaderProps) {
  const { t } = useI18n()

  return (
    <header className="app-header">
      <div className="header-card">
        <div className="header-brand">
          <span className="brand-mark">
            <Icon name="explore" filled />
          </span>
          <div className="brand-text">
            <span className="brand-tagline">{t('app.tagline')}</span>
            <h1 className="brand-title">{config.appName}</h1>
          </div>
        </div>
        <div className="header-region" title={online ? t('header.online') : t('header.offline')}>
          <span className={`status-dot ${online ? 'is-online' : 'is-offline'}`} />
          <div className="region-text">
            <span className="region-label">{regionLabel}</span>
            <span className="status-text">{online ? t('header.online') : t('header.offline')}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
