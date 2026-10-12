import { describe, expect, it } from 'vitest'
import { formatDistance, formatDuration } from './format'

describe('formatDistance', () => {
  it('formats meters under 1 km', () => {
    expect(formatDistance(950, 'ar')).toBe('950 م')
    expect(formatDistance(950, 'en')).toBe('950 m')
  })

  it('formats kilometers with one decimal', () => {
    expect(formatDistance(1500, 'ar')).toBe('1.5 كم')
  })

  it('rejects invalid values', () => {
    expect(formatDistance(-5, 'ar')).toBe('—')
    expect(formatDistance(Number.NaN, 'ar')).toBe('—')
  })
})

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(45, 'ar')).toBe('45 ثانية')
    expect(formatDuration(45, 'en')).toBe('45 sec')
  })

  it('formats minutes', () => {
    expect(formatDuration(300, 'ar')).toBe('5 دقيقة')
    expect(formatDuration(300, 'en')).toBe('5 min')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(7500, 'ar')).toBe('2 س 5 د')
    expect(formatDuration(7500, 'en')).toBe('2 h 5 min')
    expect(formatDuration(7200, 'ar')).toBe('2 س')
  })
})