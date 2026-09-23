import { describe, it, expect } from 'vitest'
import { sanitizeErrorMessage, decodeJwt, isTokenExpired } from './security'

describe('sanitizeErrorMessage', () => {
  it('returns a generic message for non-strings', () => {
    expect(sanitizeErrorMessage(undefined)).toBe(
      'An unexpected error occurred. Please try again.',
    )
  })

  it('passes through a normal message', () => {
    expect(sanitizeErrorMessage('Name is required')).toBe('Name is required')
  })

  it('redacts SQL keywords', () => {
    expect(sanitizeErrorMessage('SELECT * FROM users')).toMatch(/unexpected error/)
  })

  it('redacts stack-trace frames (`at fn:line:col`)', () => {
    expect(sanitizeErrorMessage('oops\n    at handler:12:5')).toMatch(/unexpected error/)
  })

  it('redacts unix file paths', () => {
    // The upstream CRA regex was `([\w\s.-]+\\|\/)+`, which parses as
    // `(chars + backslash) OR (slash)` because `|` binds loosest, so only
    // Windows paths were caught. Fixed here to `[\\/]`.
    expect(sanitizeErrorMessage('failed reading /srv/app/config.json')).toMatch(/unexpected error/)
  })

  it('redacts windows file paths', () => {
    expect(sanitizeErrorMessage('failed reading C:\\work\\app\\server.js')).toMatch(
      /unexpected error/,
    )
  })

  it('caps very long messages', () => {
    expect(sanitizeErrorMessage('x'.repeat(400))).toHaveLength(301)
  })
})

describe('decodeJwt', () => {
  it('returns null for unparseable input', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull()
    expect(decodeJwt('')).toBeNull()
  })

  it('decodes a payload', () => {
    const payload = { exp: 1 }
    const token = `h.${btoa(JSON.stringify(payload))}.s`
    expect(decodeJwt(token)).toEqual(payload)
  })
})

describe('isTokenExpired', () => {
  it('treats unparseable tokens as expired', () => {
    expect(isTokenExpired('nope')).toBe(true)
  })

  it('detects an expired exp claim', () => {
    const token = `h.${btoa(JSON.stringify({ exp: 1 }))}.s`
    expect(isTokenExpired(token)).toBe(true)
  })

  it('accepts a future exp claim', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `h.${btoa(JSON.stringify({ exp }))}.s`
    expect(isTokenExpired(token)).toBe(false)
  })
})
