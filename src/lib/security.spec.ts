import { describe, it, expect } from 'vitest'
import {
  sanitizeErrorMessage,
  decodeJwt,
  isTokenExpired,
  validateDocumentFile,
  clampNumericInput,
  sanitizeSubmitPayload,
} from './security'

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

describe('validateDocumentFile', () => {
  it('accepts a pdf within the size limit', () => {
    const result = validateDocumentFile(new File(['data'], 'doc.pdf', { type: 'application/pdf' }))
    expect(result.valid).toBe(true)
  })

  it('accepts png/jpg when the browser reports an empty MIME type', () => {
    expect(validateDocumentFile(new File(['d'], 'photo.JPG', { type: '' })).valid).toBe(true)
    expect(validateDocumentFile(new File(['d'], 'photo.jpeg', { type: '' })).valid).toBe(true)
  })

  it('rejects oversized files', () => {
    const file = new File([new Uint8Array(1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf',
    })
    const result = validateDocumentFile(file, 1)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/size/i)
  })

  it('rejects a disallowed extension even with a valid MIME type', () => {
    const result = validateDocumentFile(new File(['d'], 'evil.exe', { type: 'image/png' }))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/pdf/i)
  })

  it('rejects a disallowed MIME type on an allowed extension', () => {
    const result = validateDocumentFile(
      new File(['d'], 'doc.pdf', { type: 'application/x-msdownload' }),
    )
    expect(result.valid).toBe(false)
  })

  it('rejects files with no extension', () => {
    expect(validateDocumentFile(new File(['d'], 'scan', { type: 'application/pdf' })).valid).toBe(
      false,
    )
  })
})

describe('clampNumericInput', () => {
  it('leaves empty and non-numeric strings alone', () => {
    expect(clampNumericInput('')).toBe('')
    expect(clampNumericInput('  ')).toBe('  ')
    expect(clampNumericInput('abc')).toBe('abc')
  })

  it('clamps negatives to zero', () => {
    expect(clampNumericInput('-500')).toBe('0')
  })

  it('clamps oversized values to the max', () => {
    expect(clampNumericInput('99999999999999')).toBe('999999999.99')
  })

  it('keeps in-range values', () => {
    expect(clampNumericInput('2500.5')).toBe('2500.5')
    expect(clampNumericInput('0')).toBe('0')
  })
})

describe('sanitizeSubmitPayload', () => {
  it('trims and caps strings', () => {
    const result = sanitizeSubmitPayload({
      name: '  John  ',
      long: 'x'.repeat(3000),
    })
    expect(result).toEqual({ name: 'John', long: 'x'.repeat(2000) })
  })

  it('slices arrays using the provided limits', () => {
    const result = sanitizeSubmitPayload(
      { schemeNumbers: Array(20).fill('SN'), products: ['a', 'b'] },
      { arrayLimits: { schemeNumbers: 3 } },
    ) as Record<string, unknown>
    expect(result.schemeNumbers).toHaveLength(3)
    expect(result.products).toHaveLength(2)
  })

  it('recurses into nested objects', () => {
    const result = sanitizeSubmitPayload(
      { signatories: [{ fullName: '  A  ', address: ' '.padEnd(100, 'b') }] },
      { arrayLimits: { signatories: 5 } },
    ) as { signatories: Array<{ fullName: string; address: string }> }
    expect(result.signatories[0].fullName).toBe('A')
    expect(result.signatories[0].address.length).toBeLessThanOrEqual(2000)
  })

  it('passes files, numbers, booleans and null through untouched', () => {
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
    const result = sanitizeSubmitPayload({ file, count: 3, ok: true, none: null })
    expect(result).toEqual({ file, count: 3, ok: true, none: null })
  })
})
