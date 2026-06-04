// Supabase Server Client (PROJ-1)
// Läuft ausschließlich serverseitig und verwaltet Auth-Sessions über Cookies.
// Verwendet nur den öffentlichen Anon-Key; ein Service-Role-Key wird hier
// bewusst NICHT genutzt (siehe PROJ-1 Decision Log).
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Aufruf aus einer Server Component — kann ignoriert werden, wenn
            // eine Middleware die Session aktualisiert (kommt mit PROJ-2).
          }
        },
      },
    },
  )
}
