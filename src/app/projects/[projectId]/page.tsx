import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { type TaskStatus } from '@/lib/tasks/validation'
import { Button } from '@/components/ui/button'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { TaskList } from '@/components/tasks/task-list'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Projekt laden — RLS stellt sicher nur eigene Projekte sind zugänglich.
  // Wenn nicht gefunden oder fremdes Projekt → notFound() (kein Datenleck).
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single()

  if (!project) notFound()

  // Aufgaben laden (Platzhalter-Array bis /backend die Tabelle anlegt).
  const tasks: { id: string; project_id: string; title: string; description?: string | null; status: TaskStatus }[] = []

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-semibold truncate max-w-xs">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">Logout</Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Aufgaben</h1>
          {tasks.length > 0 && <CreateTaskDialog projectId={projectId} />}
        </div>

        <TaskList projectId={projectId} tasks={tasks} />
      </div>
    </main>
  )
}
