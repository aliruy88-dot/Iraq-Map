import { useI18n } from '../../i18n/I18nContext'
import { Icon } from '../common/Icon'
import { Spinner } from '../common/Spinner'

interface SearchBarProps {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
}

export function SearchBar({ value, loading, onChange, onSubmit, onClear }: SearchBarProps) {
  const { t } = useI18n()

  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Icon name="search" className="search-leading" />
      <input
        className="search-input"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="search-clear"
          onClick={onClear}
          aria-label={t('search.clear')}
        >
          <Icon name="close" />
        </button>
      )}
      <button type="submit" className="search-submit" aria-label={t('search.action')}>
        {loading ? <Spinner /> : <Icon name="arrow_forward" />}
      </button>
    </form>
  )
}
