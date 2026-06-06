import { ListTodo } from 'lucide-react'

import { type TaskStatus } from '@/lib/tasks/validation'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: TaskStatus
}

interface TaskListProps {
  projectId: string
  tasks: Task[]
}

export function TaskList({ projectId, tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <ListTodo className="h-12 w-12 opacity-40" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Noch keine Aufgaben</p>
          <p className="text-sm">Erstelle deine erste Aufgabe für dieses Projekt.</p>
        </div>
        <CreateTaskDialog
          projectId={projectId}
          trigger={<Button>Erste Aufgabe anlegen</Button>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
