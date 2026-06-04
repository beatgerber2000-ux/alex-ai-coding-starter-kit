import { z } from 'zod'

// Geteilte Validierungsregeln für Login & Registrierung (PROJ-2).
// Werden sowohl clientseitig (react-hook-form, sofortiges UX-Feedback) als auch
// serverseitig (Server Actions, verbindlich) verwendet.

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich.')
    .email('Bitte eine gültige E-Mail-Adresse eingeben.'),
  // Beim Login bewusst keine Mindestlängenprüfung — nur "erforderlich".
  password: z.string().min(1, 'Passwort ist erforderlich.'),
})

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'E-Mail ist erforderlich.')
      .email('Bitte eine gültige E-Mail-Adresse eingeben.'),
    password: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
    confirmPassword: z.string().min(1, 'Bitte das Passwort bestätigen.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein.',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
