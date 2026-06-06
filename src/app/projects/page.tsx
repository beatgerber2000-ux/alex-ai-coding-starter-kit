import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { ProjectList } from '@/components/projects/project-list'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // RLS stellt sicher, dass nur eigene Projekte zurückgegeben werden.
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <span className="font-semibold">Meine Projekte</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Projekte</h1>
          {(projects?.length ?? 0) > 0 && <CreateProjectDialog />}
        </div>

        <ProjectList projects={projects ?? []} />
      </div>
    </main>
  )
}
