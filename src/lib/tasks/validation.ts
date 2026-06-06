import { z } from 'zod'

// Geteiltes Validierungsschema für Aufgaben (PROJ-4).
// Wird clientseitig (react-hook-form) und serverseitig (Server Actions) verwendet.

export const TASK_STATUS = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUS)[number]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Arbeit',
  done: 'Erledigt',
}

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Titel ist erforderlich.')
    .max(200, 'Titel darf maximal 200 Zeichen lang sein.')
    .refine((v) => v.trim().length > 0, 'Titel darf nicht leer sein.'),
  description: z.string().max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein.').optional(),
})

export const taskStatusSchema = z.object({
  status: z.enum(TASK_STATUS, { error: 'Ungültiger Status.' }),
})

// Form-Typ (vor Transforms) — für react-hook-form
export type TaskFormValues = z.input<typeof taskSchema>
// Output-Typ (nach Transforms) — für Server Actions
export type TaskInput = z.infer<typeof taskSchema>
export type TaskStatusInput = z.infer<typeof taskStatusSchema>
