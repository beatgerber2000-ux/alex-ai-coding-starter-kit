'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { projectNameSchema, type ProjectNameInput } from '@/lib/projects/validation'

// Server Actions für PROJ-3 (Projektverwaltung).
//
// Sicherheitsvorgaben (siehe Spec Tech Design C):
// - user_id NIEMALS vom Client; immer aus auth.uid() der aktuellen Session.
// - Eigentumscheck via .eq('user_id', userId) vor jeder Mutation.
// - Keine Projekt-IDs oder user_ids in Fehlermeldungen.
// - Serverseitige Zod-Validierung (trim + Längenkontrolle).
// - RLS als zweite Verteidigungslinie in der DB.

export type ProjectActionState = {
  error?: string
}

const GENERIC_ERROR = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
const AUTH_ERROR = 'Du musst eingeloggt sein.'

export async function createProject(input: ProjectNameInput): Promise<ProjectActionState> {
  const parsed = projectNameSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  const { error } = await supabase
    .from('projects')
    .insert({ name: parsed.data.name, user_id: user.id })

  if (error) return { error: GENERIC_ERROR }

  revalidatePath('/projects')
  return {}
}

export async function renameProject(
  projectId: string,
  input: ProjectNameInput,
): Promise<ProjectActionState> {
  const parsed = projectNameSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  // .eq('user_id', user.id) ist der Eigentumscheck + RLS-Absicherung.
  // Wenn keine Zeile betroffen → Projekt existiert nicht oder gehört nicht dem Nutzer.
  const { data, error } = await supabase
    .from('projects')
    .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select('id')

  if (error || !data?.length) return { error: GENERIC_ERROR }

  revalidatePath('/projects')
  return {}
}

export async function deleteProject(projectId: string): Promise<ProjectActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  // Eigentumscheck via .eq('user_id', user.id) — schlägt lautlos fehl wenn
  // das Projekt nicht dem Nutzer gehört (z. B. doppeltes Löschen aus zwei Tabs).
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) return { error: GENERIC_ERROR }

  revalidatePath('/projects')
  return {}
}
