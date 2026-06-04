// Supabase Browser Client (PROJ-1)
// Verwendet ausschließlich den öffentlichen Anon-Key — unkritisch im Frontend.
// Für serverseitige Logik / Auth-Sessions siehe ./server.ts.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
