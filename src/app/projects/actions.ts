'use server'

import type { ProjectNameInput } from '@/lib/projects/validation'

// Server Actions für PROJ-3 — Seam zum Backend.
// Die echte Supabase-Logik (INSERT/UPDATE/DELETE, user_id aus Session,
// Eigentumscheck, RLS) wird in /backend ergänzt.
//
// Sicherheitsvorgaben für /backend (siehe Spec Tech Design C):
// - user_id NIEMALS vom Client; immer aus auth.uid() der Session.
// - Eigentumscheck vor jeder Mutation (rename, delete).
// - Keine Projekt-IDs oder user_ids in Fehlermeldungen.
// - Serverseitige Zod-Validierung (trim + Längenkontrolle).

export type ProjectActionState = {
  error?: string
}

const NOT_WIRED: ProjectActionState = {
  error: 'Projektdienst noch nicht verbunden. (Wird in /backend fertiggestellt.)',
}

export async function createProject(_input: ProjectNameInput): Promise<ProjectActionState> {
  // TODO(/backend): Zod trim+validate → supabase.from('projects').insert({ name, user_id: session.user.id })
  //                revalidatePath('/projects')
  return NOT_WIRED
}

export async function renameProject(
  _projectId: string,
  _input: ProjectNameInput,
): Promise<ProjectActionState> {
  // TODO(/backend): Eigentumscheck + Zod + supabase.from('projects').update({ name }).eq('id', id).eq('user_id', uid)
  //                revalidatePath('/projects')
  return NOT_WIRED
}

export async function deleteProject(_projectId: string): Promise<ProjectActionState> {
  // TODO(/backend): Eigentumscheck + supabase.from('projects').delete().eq('id', id).eq('user_id', uid)
  //                revalidatePath('/projects')
  return NOT_WIRED
}
