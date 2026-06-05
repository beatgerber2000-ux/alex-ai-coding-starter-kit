'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { projectNameSchema, type ProjectNameInput } from '@/lib/projects/validation'
import { renameProject } from '@/app/projects/actions'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RenameProjectDialogProps {
  projectId: string
  currentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenameProjectDialog({
  projectId,
  currentName,
  open,
  onOpenChange,
}: RenameProjectDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ProjectNameInput>({
    resolver: zodResolver(projectNameSchema),
    defaultValues: { name: currentName },
  })

  // Formular zurücksetzen wenn Dialog geöffnet wird (kein setState, nur form.reset)
  useEffect(() => {
    if (open) {
      form.reset({ name: currentName })
    }
  }, [open, currentName, form])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setFormError(null)
      onOpenChange(next)
    },
    [onOpenChange],
  )

  const { isSubmitting } = form.formState

  async function onSubmit(values: ProjectNameInput) {
    setFormError(null)
    const result = await renameProject(projectId, values)
    if (result?.error) {
      setFormError(result.error)
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Projekt umbenennen</DialogTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projektname</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
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
