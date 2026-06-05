import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Platzhalterseite für die Aufgabenansicht eines Projekts (kommt mit PROJ-4/5).
export default async function ProjectDetailPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl p-4">
        <p className="text-muted-foreground text-sm">
          Aufgaben für dieses Projekt werden in PROJ-4 implementiert.
        </p>
      </div>
    </main>
  )
}
