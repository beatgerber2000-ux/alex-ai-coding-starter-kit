'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/auth/validation'

// Server Actions für PROJ-2 (Auth).
//
// Sicherheitsvorgaben (siehe Spec, Tech Design D):
// - Validierung serverseitig (verbindlich), zusätzlich zur Client-Validierung.
// - Keine Passwörter, Session-Tokens oder Auth-Cookies loggen.
// - Generische Fehlermeldungen bei Login und bereits registrierter E-Mail
//   (Schutz vor User-Enumeration).
// - Cookie-/Session-Handling über @supabase/ssr (server.ts).

export type AuthActionState = {
  error?: string
}

const LOGIN_ERROR = 'E-Mail oder Passwort falsch.'
const REGISTER_ERROR =
  'Registrierung konnte nicht abgeschlossen werden. Bitte versuche es mit einer anderen E-Mail oder melde dich an.'

export async function signIn(values: LoginInput): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: LOGIN_ERROR }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Bewusst generisch — kein Hinweis, ob die E-Mail existiert.
    return { error: LOGIN_ERROR }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(values: RegisterInput): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(values)
  if (!parsed.success) {
    return { error: REGISTER_ERROR }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  // Bei deaktivierter E-Mail-Bestätigung liefert ein erfolgreiches Sign-up eine
  // Session. Fehlt sie (Fehler oder bereits registrierte E-Mail), antworten wir
  // neutral — ohne offenzulegen, ob das Konto existiert.
  if (error || !data.session) {
    return { error: REGISTER_ERROR }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
