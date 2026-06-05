import { describe, it, expect } from 'vitest'

import { loginSchema, registerSchema } from './validation'

describe('loginSchema', () => {
  it('akzeptiert gültige Eingaben', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(r.success).toBe(true)
  })

  it('lehnt leere E-Mail ab', () => {
    const r = loginSchema.safeParse({ email: '', password: 'x' })
    expect(r.success).toBe(false)
  })

  it('lehnt ungültiges E-Mail-Format ab', () => {
    const r = loginSchema.safeParse({ email: 'keine-mail', password: 'x' })
    expect(r.success).toBe(false)
  })

  it('lehnt leeres Passwort ab', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(r.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const base = { email: 'a@b.com', password: 'supersecret', confirmPassword: 'supersecret' }

  it('akzeptiert gültige Eingaben', () => {
    expect(registerSchema.safeParse(base).success).toBe(true)
  })

  it('lehnt Passwort mit weniger als 8 Zeichen ab', () => {
    const r = registerSchema.safeParse({ ...base, password: 'short', confirmPassword: 'short' })
    expect(r.success).toBe(false)
  })

  it('lehnt nicht übereinstimmende Passwörter ab (Fehler am confirmPassword-Feld)', () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: 'andersxx' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true)
    }
  })

  it('lehnt leere E-Mail ab', () => {
    expect(registerSchema.safeParse({ ...base, email: '' }).success).toBe(false)
  })
})
