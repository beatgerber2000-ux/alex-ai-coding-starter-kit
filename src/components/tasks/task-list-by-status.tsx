'use client'

import { type TaskStatus, STATUS_LABELS, TASK_STATUS } from '@/lib/tasks/validation'
import { TaskCard } from './task-card'

interface Task {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: TaskStatus
}

interface TaskListByStatusProps {
  projectId: string
  tasks: Task[]
}

export function TaskListByStatus({ projectId, tasks }: TaskListByStatusProps) {
  // Gruppiere Tasks nach Status
  const groupedTasks = TASK_STATUS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  // Status-Reihenfolge für Anzeige
  const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'done']

  return (
    <div className="space-y-6">
      {statusOrder.map((status) => {
        const statusTasks = groupedTasks[status]
        const count = statusTasks.length

        return (
          <div key={status}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              {STATUS_LABELS[status]} ({count})
            </h2>

            {statusTasks.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 px-3 bg-muted/30 rounded border border-muted">
                Noch keine {STATUS_LABELS[status].toLowerCase()}-Aufgaben
              </div>
            ) : (
              <div className="space-y-2">
                {statusTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
