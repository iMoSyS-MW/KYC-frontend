import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('lets later tailwind utilities win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
