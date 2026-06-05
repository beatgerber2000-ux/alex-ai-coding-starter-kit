import { z } from 'zod'

// Geteiltes Validierungsschema für Projektnamen (PROJ-3).
// Wird clientseitig (react-hook-form) und serverseitig (Server Actions) verwendet.
export const projectNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Projektname ist erforderlich.')
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, 'Projektname darf nicht leer sein.')
    .refine((v) => v.length <= 100, 'Projektname darf maximal 100 Zeichen lang sein.'),
})

export type ProjectNameInput = z.infer<typeof projectNameSchema>
