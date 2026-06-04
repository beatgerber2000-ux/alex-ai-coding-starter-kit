import { test, expect } from '@playwright/test'

// PROJ-1: Supabase Infrastructure Setup
// E2E-Regressionstests für die Health-Check-Route.
// Die Playwright-Konfiguration startet `npm run dev` (Development-Modus) und lädt
// .env.local — bei korrekt gesetzten Werten ist der erwartete Status "connected".

const HEALTH_URL = '/api/health/supabase'

test.describe('PROJ-1 Supabase Health Check', () => {
  test('Angenommen Env gesetzt + Supabase erreichbar, wenn /api/health/supabase aufgerufen wird, dann antwortet sie mit "connected"', async ({ request }) => {
    const res = await request.get(HEALTH_URL)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('connected')
  })

  test('Angenommen die Route antwortet, wenn die Antwort inspiziert wird, dann enthält sie keine Schlüsselwerte oder Nutzerdaten', async ({ request }) => {
    const res = await request.get(HEALTH_URL)
    const body = await res.json()

    // Nur erwartete Felder dürfen vorkommen.
    const allowedKeys = ['status', 'message']
    expect(Object.keys(body).every((k) => allowedKeys.includes(k))).toBe(true)

    // Kein Anon-/Service-Key (lange Token-artige Strings) und keine Env-Werte.
    const serialized = JSON.stringify(body)
    expect(serialized).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/) // JWT-artige Tokens
    expect(serialized).not.toMatch(/sb_(secret|service)[A-Za-z0-9_-]+/i) // Secret-/Service-Keys
    expect(serialized.toLowerCase()).not.toContain('supabase.co') // keine Projekt-URL
  })

  test('Angenommen die Health-Route ist dynamisch, wenn sie mehrfach aufgerufen wird, dann antwortet sie konsistent mit 200', async ({ request }) => {
    const first = await request.get(HEALTH_URL)
    const second = await request.get(HEALTH_URL)
    expect(first.status()).toBe(200)
    expect(second.status()).toBe(200)
  })
})
