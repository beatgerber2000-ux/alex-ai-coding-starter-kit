import { describe, it, expect } from 'vitest'
import { projectNameSchema } from './validation'

describe('projectNameSchema', () => {
  it('akzeptiert gültigen Namen', () => {
    expect(projectNameSchema.safeParse({ name: 'Mein Projekt' }).success).toBe(true)
  })

  it('trimmt Leerzeichen', () => {
    const r = projectNameSchema.safeParse({ name: '  Test  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Test')
  })

  it('lehnt leeren Namen ab', () => {
    expect(projectNameSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('lehnt Nur-Leerzeichen-Namen ab', () => {
    expect(projectNameSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('akzeptiert Namen mit genau 100 Zeichen', () => {
    expect(projectNameSchema.safeParse({ name: 'a'.repeat(100) }).success).toBe(true)
  })

  it('lehnt Namen mit mehr als 100 Zeichen ab', () => {
    expect(projectNameSchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false)
  })
})
