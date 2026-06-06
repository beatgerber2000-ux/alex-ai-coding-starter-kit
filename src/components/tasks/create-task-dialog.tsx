'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { taskSchema, type TaskFormValues, type TaskInput } from '@/lib/tasks/validation'
import { createTask } from '@/app/tasks/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface CreateTaskDialogProps {
  projectId: string
  trigger?: React.ReactNode
}

export function CreateTaskDialog({ projectId, trigger }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: TaskInput) {
    setFormError(null)
    const result = await createTask(projectId, values)
    if (result?.error) {
      setFormError(result.error)
      return
    }
    form.reset()
    setOpen(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset()
      setFormError(null)
    }
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Neue Aufgabe</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Aufgabe</DialogTitle>
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
                    <Input placeholder="Was soll erledigt werden?" autoFocus {...field} />
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
                    <Textarea
                      placeholder="Details zur Aufgabe …"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
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
                {isSubmitting ? 'Wird erstellt …' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
