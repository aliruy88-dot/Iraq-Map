import { beforeEach, describe, expect, it } from 'vitest'
import {
  addFavorite,
  isFavorite,
  loadFavorites,
  removeFavorite,
  saveFavorites,
} from './favorites'
import type { Place } from '../../types/place'

const cafe = {
  id: 'nominatim:node:1',
  name: 'مقهى',
  location: { lat: 33.3, lng: 44.3 },
  source: 'nominatim',
} as Place

const restaurant = {
  id: 'overpass:node:2',
  name: 'مطعم',
  location: { lat: 33.4, lng: 44.4 },
  source: 'overpass',
} as Place

beforeEach(() => {
  localStorage.clear()
})

describe('favorites storage', () => {
  it('adds a unique place to the front', () => {
    const list = addFavorite([restaurant], cafe)
    expect(list).toHaveLength(2)
    expect(list[0].id).toBe(cafe.id)
  })

  it('does not duplicate a place', () => {
    const list = addFavorite([cafe], cafe)
    expect(list).toHaveLength(1)
  })

  it('removes a place by id', () => {
    const list = removeFavorite([cafe, restaurant], cafe.id)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(restaurant.id)
  })

  it('reports membership', () => {
    expect(isFavorite([cafe], cafe.id)).toBe(true)
    expect(isFavorite([cafe], restaurant.id)).toBe(false)
  })

  it('persists and reloads from localStorage', () => {
    saveFavorites([cafe, restaurant])
    expect(loadFavorites()).toEqual([cafe, restaurant])
  })

  it('rejects invalid entries on load', () => {
    localStorage.setItem('iraqmap.favorites.v1', JSON.stringify([{ id: 1 }]))
    expect(loadFavorites()).toEqual([])
  })
})