import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAppSettings } from '../state/AppSettingsContext'
import { config, providerStatuses } from '../config/env'
import { Icon } from '../components/common/Icon'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function SettingsScreen() {
  const { t, locale } = useI18n()
  const { settings, setLocale, setDefaultMode, resetLocalData } = useAppSettings()
  const online = useOnlineStatus()
  const [resetMessage, setResetMessage] = useState(false)
  const providers = providerStatuses()

  return (
    <div className="screen settings-screen">
      <div className="settings-panel">
        <header className="panel-header">
          <h2>{t('settings.title')}</h2>
        </header>

        <section className="settings-group">
          <h3>{t('settings.language')}</h3>
          <div className="segmented">
            <button
              type="button"
              className={settings.locale === 'ar' ? 'is-active' : ''}
              onClick={() => setLocale('ar')}
            >
              {t('settings.arabic')}
            </button>
            <button
              type="button"
              className={settings.locale === 'en' ? 'is-active' : ''}
              onClick={() => setLocale('en')}
            >
              {t('settings.english')}
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.defaultMode')}</h3>
          <div className="segmented">
            <button
              type="button"
              className={settings.defaultMode === 'car' ? 'is-active' : ''}
              onClick={() => setDefaultMode('car')}
            >
              <Icon name="directions_car" />
              {t('routes.car')}
            </button>
            <button
              type="button"
              className={settings.defaultMode === 'walk' ? 'is-active' : ''}
              onClick={() => setDefaultMode('walk')}
            >
              <Icon name="directions_walk" />
              {t('routes.walk')}
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.providers')}</h3>
          <ul className="provider-list">
            {providers.map((provider) => (
              <li key={provider.id} className="provider-item">
                <div className="provider-info">
                  <span className="provider-name">
                    {locale === 'ar' ? provider.labelAr : provider.labelEn}
                  </span>
                  <span className="provider-detail">{provider.detail}</span>
                </div>
                <span
                  className={`provider-status ${
                    provider.ready ? (provider.requiresKey ? 'warn' : 'ok') : 'bad'
                  }`}
                >
                  {provider.ready
                    ? provider.requiresKey
                      ? t('settings.providerNeedsKey')
                      : t('settings.providerReady')
                    : t('settings.providerNotReady')}
                </span>
                <a className="provider-doc" href={provider.docsUrl} target="_blank" rel="noreferrer">
                  {t('settings.docs')}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="settings-group">
          <h3>{t('settings.connection')}</h3>
          <p className="settings-line">
            <Icon name={online ? 'wifi' : 'wifi_off'} />
            {online ? t('header.online') : t('header.offline')}
          </p>
        </section>

        <section className="settings-group">
          <h3>{t('settings.about')}</h3>
          <p className="settings-text">{t('settings.aboutText')}</p>
          <p className="settings-line">
            <Icon name="info" />
            {t('settings.version')}: {config.appVersion}
          </p>
          <p className="settings-line">
            <Icon name="copyright" />
            {t('settings.attribution')}: OpenStreetMap contributors
          </p>
        </section>

        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            resetLocalData()
            setResetMessage(true)
            window.setTimeout(() => setResetMessage(false), 2600)
          }}
        >
          <Icon name="restart_alt" />
          {t('settings.resetData')}
        </button>
        {resetMessage && (
          <p className="settings-line ok" role="status">
            {t('settings.resetDone')}
          </p>
        )}
      </div>
    </div>
  )
}
