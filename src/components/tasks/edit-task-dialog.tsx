'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { taskSchema, type TaskFormValues, type TaskInput } from '@/lib/tasks/validation'
import { updateTask } from '@/app/tasks/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EditTaskDialogProps {
  taskId: string
  projectId: string
  currentTitle: string
  currentDescription?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({
  taskId,
  projectId,
  currentTitle,
  currentDescription,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: currentTitle, description: currentDescription ?? '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({ title: currentTitle, description: currentDescription ?? '' })
    }
  }, [open, currentTitle, currentDescription, form])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setFormError(null)
      onOpenChange(next)
    },
    [onOpenChange],
  )

  const { isSubmitting } = form.formState

  async function onSubmit(values: TaskInput) {
    setFormError(null)
    const result = await updateTask(taskId, projectId, values)
    if (result?.error) {
      setFormError(result.error)
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert …' : 'Speichern'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
