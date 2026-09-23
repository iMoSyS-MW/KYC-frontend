import { describe, it, expect } from 'vitest'
import { parsePgArray, mapUser } from './apiMappers'

describe('parsePgArray', () => {
  it('passes through real arrays', () => {
    expect(parsePgArray(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('parses a postgres enum-array literal', () => {
    expect(parsePgArray('{admin,reviewer}')).toEqual(['admin', 'reviewer'])
  })

  it('strips quotes around entries', () => {
    expect(parsePgArray('{"a b",c}')).toEqual(['a b', 'c'])
  })

  it('returns an empty array for blanks and non-strings', () => {
    expect(parsePgArray('{}')).toEqual([])
    expect(parsePgArray('')).toEqual([])
    expect(parsePgArray(null)).toEqual([])
    expect(parsePgArray(42)).toEqual([])
  })
})

describe('mapUser', () => {
  it('translates snake_case columns and enum-array strings', () => {
    const mapped = mapUser({
      id: 'u1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      is_active: true,
      last_login: '2026-01-01',
      created_at: '2025-01-01',
      updated_at: '2025-06-01',
      password_changed_at: '2025-02-01',
      must_change_password: false,
      roles: '{admin}',
      access_types: '{individual,group}',
    })

    expect(mapped._id).toBe('u1')
    expect(mapped.firstName).toBe('Ada')
    expect(mapped.lastName).toBe('Lovelace')
    expect(mapped.isActive).toBe(true)
    expect(mapped.mustChangePassword).toBe(false)
    expect(mapped.roles).toEqual(['admin'])
    expect(mapped.accessTypes).toEqual(['individual', 'group'])
  })
})
