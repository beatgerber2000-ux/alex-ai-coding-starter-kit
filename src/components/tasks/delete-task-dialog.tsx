'use client'

import { useState } from 'react'

import { deleteTask } from '@/app/tasks/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DeleteTaskDialogProps {
  taskId: string
  projectId: string
  taskTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTaskDialog({
  taskId,
  projectId,
  taskTitle,
  open,
  onOpenChange,
}: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    const result = await deleteTask(taskId, projectId)
    setIsDeleting(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aufgabe löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Die Aufgabe <strong>&ldquo;{taskTitle}&rdquo;</strong> wird dauerhaft gelöscht.
            Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
