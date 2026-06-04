'use server'

import type { LoginInput, RegisterInput } from '@/lib/auth/validation'

// Server Actions für PROJ-2 — SEAM zum Backend.
//
// Diese Frontend-Phase liefert die typisierten Signaturen und das Fehler-/
// Erfolgskontrakt. Die echte Supabase-Auth-Logik (signUp/signInWithPassword/
// signOut über @supabase/ssr), das Cookie-Handling und der serverseitige
// Redirect nach /dashboard werden in `/backend` ergänzt.
//
// Verbindliche Vorgaben für die Backend-Umsetzung (siehe Spec, Tech Design D):
// - Zod-Validierung serverseitig (loginSchema / registerSchema) als verbindliche Prüfung.
// - Keine Passwörter, Session-Tokens oder Auth-Cookies loggen.
// - Generische Fehlermeldungen bei Login und bereits registrierter E-Mail.
// - Bei Erfolg: redirect('/dashboard').

export type AuthActionState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

const NOT_WIRED: AuthActionState = {
  error: 'Anmeldedienst ist noch nicht verbunden. (Wird in /backend fertiggestellt.)',
}

export async function signIn(_values: LoginInput): Promise<AuthActionState> {
  // TODO(/backend): Zod-Prüfung + supabase.auth.signInWithPassword + redirect('/dashboard')
  return NOT_WIRED
}

export async function signUp(_values: RegisterInput): Promise<AuthActionState> {
  // TODO(/backend): Zod-Prüfung + supabase.auth.signUp + redirect('/dashboard')
  // Bereits registrierte E-Mail → neutrale Meldung (kein Enumeration-Leak).
  return NOT_WIRED
}

export async function signOut(): Promise<void> {
  // TODO(/backend): supabase.auth.signOut + redirect('/login')
}
