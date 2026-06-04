import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Supabase-Server-Client mocken — kein echter Netzwerk-/Cookie-Zugriff im Test.
const getSessionMock = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getSession: getSessionMock },
  })),
}))

import { GET } from './route'

// Hinweis: NODE_ENV ist im Test 'test' (≠ 'production'), die Route läuft also
// im Development-Verhalten und liefert konkrete Meldungen.
describe('GET /api/health/supabase', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null })
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('liefert "connected" wenn Env gesetzt ist und Supabase erreichbar ist', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('connected')
  })

  it('liefert 500 + benennt die fehlende Variable, wenn eine Env-Variable fehlt', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.status).toBe('error')
    expect(body.message).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })

  it('gibt niemals den Wert des Anon-Keys in der Antwort aus', async () => {
    const res = await GET()
    const body = await res.json()
    expect(JSON.stringify(body)).not.toContain('test-anon-key')
  })

  it('liefert 503, wenn Supabase nicht erreichbar ist', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch
    const res = await GET()
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.status).toBe('error')
  })

  it('liefert 503, wenn der Client einen Session-Fehler zurückgibt', async () => {
    getSessionMock.mockResolvedValue({ data: null, error: new Error('boom') })
    const res = await GET()
    expect(res.status).toBe(503)
  })
})
