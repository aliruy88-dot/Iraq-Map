import { describe, expect, it } from 'vitest'
import { readBool, readString } from './env'

describe('env helpers', () => {
  it('readString trims and falls back on empty values', () => {
    expect(readString('  ', 'fallback')).toBe('fallback')
    expect(readString(' value ', 'fallback')).toBe('value')
    expect(readString(undefined, 'fallback')).toBe('fallback')
  })

  it('readBool accepts common truthy and falsy strings', () => {
    expect(readBool('true', false)).toBe(true)
    expect(readBool('1', false)).toBe(true)
    expect(readBool('yes', false)).toBe(true)
    expect(readBool('false', true)).toBe(false)
    expect(readBool('0', true)).toBe(false)
    expect(readBool(undefined, true)).toBe(true)
  })
})