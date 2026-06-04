import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  // Server-seitiger Schutz (Defense-in-Depth zusätzlich zur Middleware aus /backend):
  // Ohne gültige Session geht es zurück zum Login.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <span className="font-semibold">Dashboard</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
          {/* Logout via Server Action (signOut) — beendet Session + Redirect (/backend). */}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-2xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Willkommen 👋</CardTitle>
            <CardDescription>
              Du bist eingeloggt. Hier entstehen ab PROJ-3 deine Projekte und ab
              PROJ-4 deine Aufgaben.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dies ist eine geschützte Platzhalterseite für den MVP.
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
