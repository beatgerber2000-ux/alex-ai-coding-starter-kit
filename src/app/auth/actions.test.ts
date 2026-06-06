import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase-Server-Client, redirect und revalidatePath mocken.
const signInWithPassword = vi.fn()
const signUp = vi.fn()
const authSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword,
      signUp,
      signOut: authSignOut,
    },
  })),
}))

const redirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
}))

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}))

import { signIn, signUp as signUpAction, signOut } from './actions'

const LOGIN_ERROR = 'E-Mail oder Passwort falsch.'
const REGISTER_ERROR =
  'Registrierung konnte nicht abgeschlossen werden. Bitte versuche es mit einer anderen E-Mail oder melde dich an.'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signIn', () => {
  it('loggt bei korrekten Daten ein und leitet nach /projects weiter', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    await signIn({ email: 'a@b.com', password: 'secret123' })
    expect(signInWithPassword).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith('/projects')
  })

  it('gibt generischen Fehler bei falscher Kombination zurück, kein Redirect', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const result = await signIn({ email: 'a@b.com', password: 'wrongpass' })
    expect(result).toEqual({ error: LOGIN_ERROR })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('lehnt ungültige Eingabe vor dem Supabase-Aufruf ab', async () => {
    const result = await signIn({ email: 'keine-mail', password: '' })
    expect(result).toEqual({ error: LOGIN_ERROR })
    expect(signInWithPassword).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('signUp', () => {
  const valid = { email: 'a@b.com', password: 'supersecret', confirmPassword: 'supersecret' }

  it('registriert bei Erfolg (Session vorhanden) und leitet nach /projects weiter', async () => {
    signUp.mockResolvedValue({ data: { session: { access_token: 'x' }, user: { id: '1' } }, error: null })
    await signUpAction(valid)
    expect(signUp).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith('/projects')
  })

  it('gibt neutrale Meldung bei bereits registrierter E-Mail (Fehler) zurück', async () => {
    signUp.mockResolvedValue({ data: { session: null, user: null }, error: { message: 'User already registered' } })
    const result = await signUpAction(valid)
    expect(result).toEqual({ error: REGISTER_ERROR })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('gibt neutrale Meldung zurück, wenn keine Session erstellt wurde', async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null })
    const result = await signUpAction(valid)
    expect(result).toEqual({ error: REGISTER_ERROR })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('lehnt nicht übereinstimmende Passwörter vor dem Supabase-Aufruf ab', async () => {
    const result = await signUpAction({ ...valid, confirmPassword: 'anders123' })
    expect(result).toEqual({ error: REGISTER_ERROR })
    expect(signUp).not.toHaveBeenCalled()
  })
})

describe('signOut', () => {
  it('beendet die Session und leitet nach /login weiter', async () => {
    authSignOut.mockResolvedValue({ error: null })
    await signOut()
    expect(authSignOut).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
