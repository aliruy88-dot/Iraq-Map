import { useI18n } from '../../i18n/I18nContext'
import { CATEGORIES } from '../../services/overpass'
import { Icon } from '../common/Icon'

interface CategoryChipsProps {
  activeId: string | null
  onSelect: (id: string) => void
}

export function CategoryChips({ activeId, onSelect }: CategoryChipsProps) {
  const { t, locale } = useI18n()

  return (
    <div className="category-chips" role="tablist" aria-label={t('categories.title')}>
      {CATEGORIES.map((category) => {
        const isActive = category.id === activeId
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`chip${isActive ? ' is-active' : ''}`}
            onClick={() => onSelect(category.id)}
          >
            <Icon name={category.icon} filled={isActive} />
            <span>{locale === 'ar' ? category.labelAr : category.labelEn}</span>
          </button>
        )
      })}
    </div>
  )
}
