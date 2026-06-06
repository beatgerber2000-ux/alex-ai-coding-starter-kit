'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { type TaskStatus, STATUS_LABELS, TASK_STATUS } from '@/lib/tasks/validation'
import { updateTaskStatus } from '@/app/tasks/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EditTaskDialog } from './edit-task-dialog'
import { DeleteTaskDialog } from './delete-task-dialog'

interface Task {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: TaskStatus
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleStatusChange(newStatus: TaskStatus) {
    const previous = status
    setStatus(newStatus) // Optimistic update
    setStatusError(null)

    const result = await updateTaskStatus(task.id, task.project_id, { status: newStatus })
    if (result?.error) {
      setStatus(previous) // Rollback
      setStatusError(result.error)
    }
  }

  return (
    <>
      <Card className="group">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{task.title}</p>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {task.description}
                </p>
              )}
              {statusError && (
                <p className="text-xs text-destructive mt-1">{statusError}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`${task.title} bearbeiten`}
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label={`${task.title} löschen`}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Select value={status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
            <SelectTrigger className="h-7 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <EditTaskDialog
        taskId={task.id}
        projectId={task.project_id}
        currentTitle={task.title}
        currentDescription={task.description}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteTaskDialog
        taskId={task.id}
        projectId={task.project_id}
        taskTitle={task.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
