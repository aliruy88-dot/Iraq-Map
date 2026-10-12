import { useI18n } from '../../i18n/I18nContext'
import type { AppScreen } from '../../types/navigation'
import { Icon } from '../common/Icon'

interface BottomNavProps {
  active: AppScreen
  onChange: (screen: AppScreen) => void
}

const TABS: Array<{ id: AppScreen; icon: string; labelKey: 'nav.explore' | 'nav.routes' | 'nav.saved' | 'nav.settings' }> = [
  { id: 'explore', icon: 'explore', labelKey: 'nav.explore' },
  { id: 'routes', icon: 'alt_route', labelKey: 'nav.routes' },
  { id: 'saved', icon: 'bookmark', labelKey: 'nav.saved' },
  { id: 'settings', icon: 'settings', labelKey: 'nav.settings' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useI18n()

  return (
    <nav className="bottom-nav" aria-label={t('nav.explore')}>
      <div className="bottom-nav-pill">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(tab.id)}
            >
              <Icon name={tab.icon} filled={isActive} />
              <span>{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
