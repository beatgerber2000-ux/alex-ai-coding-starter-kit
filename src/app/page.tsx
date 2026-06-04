import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Startseite: leitet je nach Session weiter.
// Eingeloggt → /dashboard, sonst → /login. (Middleware aus /backend übernimmt
// denselben Schutz zentral; diese Seite ist der Einstiegspunkt.)
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? '/dashboard' : '/login')
}
