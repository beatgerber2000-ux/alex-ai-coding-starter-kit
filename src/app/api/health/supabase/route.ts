// Health-Check für die Supabase-Grundverbindung (PROJ-1)
//
// Temporäres Setup-/QA-Hilfsmittel. Prüft:
//   1. Sind die benötigten Env-Variablen gesetzt?
//   2. Lässt sich der Supabase-Client initialisieren?
//   3. Antwortet Supabase grundsätzlich?
//
// Sicherheits-Regeln:
//   - Gibt NIEMALS Schlüsselwerte oder Nutzerdaten aus.
//   - Development: konkrete Setup-Hinweise (welche Variable fehlt, Fehlertext).
//   - Production: nur minimaler Status ("connected" / "disconnected"),
//     keine Env-Namen, keine Details, keine Stacktraces.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Health-Check darf nicht statisch gecacht werden — er prüft Laufzeit-Status.
export const dynamic = 'force-dynamic'

const isDev = process.env.NODE_ENV !== 'production'

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export async function GET() {
  // 1. Env-Variablen prüfen (ohne Werte preiszugeben)
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  if (missing.length > 0) {
    return NextResponse.json(
      isDev
        ? {
            status: 'error',
            message: `Fehlende Environment-Variable(n): ${missing.join(', ')}`,
          }
        : { status: 'disconnected' },
      { status: 500 },
    )
  }

  // 2. + 3. Client initialisieren und Verbindung verifizieren
  try {
    const supabase = await createClient()

    // Lokale Prüfung, dass der Client samt Cookie-Handling funktioniert.
    const { error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    // Erreichbarkeit von Supabase bestätigen — öffentlicher Auth-Health-Endpoint,
    // keine Tabellen, keine Nutzerdaten.
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        cache: 'no-store',
      },
    )
    if (!res.ok) {
      throw new Error(`Auth-Health-Endpoint antwortete mit Status ${res.status}`)
    }

    return NextResponse.json(
      isDev ? { status: 'connected', message: 'Supabase verbunden' } : { status: 'connected' },
    )
  } catch (err) {
    return NextResponse.json(
      isDev
        ? {
            status: 'error',
            message: `Verbindung fehlgeschlagen: ${
              err instanceof Error ? err.message : 'Unbekannter Fehler'
            }`,
          }
        : { status: 'disconnected' },
      { status: 503 },
    )
  }
}
