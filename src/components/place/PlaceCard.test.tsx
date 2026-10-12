import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppSettingsProvider } from '../../state/AppSettingsContext'
import { FavoritesProvider } from '../../state/FavoritesContext'
import { PlaceCard } from './PlaceCard'
import type { Place } from '../../types/place'

const place = {
  id: 'nominatim:node:1',
  name: 'مقهى النهر',
  address: 'بغداد، العراق',
  rawCategory: 'amenity=cafe',
  location: { lat: 33.3, lng: 44.3 },
  source: 'nominatim',
} as Place

function renderCard(custom: Partial<Place> = {}) {
  return render(
    <AppSettingsProvider>
      <FavoritesProvider>
        <PlaceCard
          place={{ ...place, ...custom }}
          userLocation={null}
          onClose={() => undefined}
          onDirections={() => undefined}
        />
      </FavoritesProvider>
    </AppSettingsProvider>,
  )
}

describe('PlaceCard', () => {
  it('shows opening hours when present in the source data', () => {
    renderCard({ openingHours: 'السبت - الخميس 08:00-22:00' })
    expect(screen.getByText('السبت - الخميس 08:00-22:00')).toBeInTheDocument()
    expect(screen.getByText('أوقات العمل')).toBeInTheDocument()
  })

  it('hides opening hours when the source has none', () => {
    renderCard()
    expect(screen.queryByText('أوقات العمل')).not.toBeInTheDocument()
  })

  it('shows a demo badge only for demo records', () => {
    renderCard()
    expect(screen.queryByText('بيانات تجريبية')).not.toBeInTheDocument()

    renderCard({ demo: true, source: 'demo' })
    expect(screen.getAllByText('بيانات تجريبية').length).toBeGreaterThan(0)
  })

  it('toggles the saved state through favorites', () => {
    renderCard()
    const saveButton = screen.getByRole('button', { name: 'حفظ' })
    expect(saveButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(saveButton)
    const savedButton = screen.getByRole('button', { name: 'محفوظ' })
    expect(savedButton).toHaveAttribute('aria-pressed', 'true')
  })
})